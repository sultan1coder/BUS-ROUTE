import prisma from "../config/database";
import { CustomError } from "../middleware/errorHandler";
import { setBusLocation, getBusLocation } from "../config/redis";
import { io } from "../server";

export interface GPSData {
  busId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  altitude?: number;
  timestamp?: Date;
  tripId?: string;
}

export interface LocationHistoryFilters {
  busId?: string;
  startDate?: Date;
  endDate?: Date;
  tripId?: string;
}

export interface SpeedAnalysis {
  averageSpeed: number;
  maxSpeed: number;
  minSpeed: number;
  speedViolations: number;
  totalDistance: number;
}

export interface RouteDeviation {
  isOnRoute: boolean;
  deviationDistance: number;
  nearestStop?: any;
  estimatedArrival?: Date;
}

export class GPSTrackingService {
  // Record GPS location data
  static async recordLocation(gpsData: GPSData): Promise<any> {
    const {
      busId,
      latitude,
      longitude,
      speed,
      heading,
      accuracy,
      altitude,
      timestamp = new Date(),
      tripId,
    } = gpsData;

    // Validate bus exists and is active
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      include: {
        school: true,
        driver: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!bus || !bus.isActive) {
      throw new CustomError("Bus not found or inactive", 404);
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90) {
      throw new CustomError("Invalid latitude", 400);
    }

    if (longitude < -180 || longitude > 180) {
      throw new CustomError("Invalid longitude", 400);
    }

    // Create GPS tracking record
    const trackingRecord = await prisma.gPSTracking.create({
      data: {
        busId,
        latitude,
        longitude,
        speed,
        heading,
        accuracy,
        timestamp,
        tripId,
        isValid: true,
      },
    });

    // Cache current location in Redis for real-time access
    const locationData = {
      busId,
      latitude,
      longitude,
      speed,
      heading,
      accuracy,
      altitude,
      timestamp,
      bus: {
        id: bus.id,
        plateNumber: bus.plateNumber,
        model: bus.model,
        driver: bus.driver
          ? {
              id: bus.driver.id,
              firstName: bus.driver.user.firstName,
              lastName: bus.driver.user.lastName,
            }
          : null,
      },
    };

    await setBusLocation(busId, locationData);

    // Emit real-time location update via Socket.IO
    io.to(`parent:all`).emit("bus_location", locationData);
    io.to(`school_${bus.schoolId}`).emit("bus_location", locationData);
    io.to("admin_dashboard").emit("bus_location", locationData);

    // If bus has a driver, emit to driver's room
    if (bus.driver) {
      io.to(`driver_${bus.driver.id}`).emit("bus_location", locationData);
    }

    return trackingRecord;
  }

  // Get current location of a bus
  static async getCurrentLocation(busId: string): Promise<any> {
    // Try Redis cache first
    const cachedLocation = await getBusLocation(busId);
    if (cachedLocation) {
      return {
        ...cachedLocation,
        source: "cache",
      };
    }

    // Fallback to database
    const latestTracking = await prisma.gPSTracking.findFirst({
      where: { busId },
      orderBy: { timestamp: "desc" },
      include: {
        bus: {
          select: {
            id: true,
            plateNumber: true,
            model: true,
            driver: {
              select: {
                id: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!latestTracking) {
      throw new CustomError("No location data found for this bus", 404);
    }

    const locationData = {
      busId,
      latitude: latestTracking.latitude,
      longitude: latestTracking.longitude,
      speed: latestTracking.speed,
      heading: latestTracking.heading,
      accuracy: latestTracking.accuracy,
      timestamp: latestTracking.timestamp,
      source: "database",
      bus: latestTracking.bus,
    };

    // Cache for future requests
    await setBusLocation(busId, locationData);

    return locationData;
  }

  // Get location history for a bus
  static async getLocationHistory(
    filters: LocationHistoryFilters,
    page: number = 1,
    limit: number = 100
  ): Promise<{
    locations: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { busId, startDate, endDate, tripId } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      isValid: true,
    };

    if (busId) {
      where.busId = busId;
    }

    if (tripId) {
      where.tripId = tripId;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const [locations, total] = await Promise.all([
      prisma.gPSTracking.findMany({
        where,
        include: {
          bus: {
            select: {
              id: true,
              plateNumber: true,
              model: true,
            },
          },
          trip: {
            select: {
              id: true,
              route: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { timestamp: "desc" },
        skip,
        take: limit,
      }),
      prisma.gPSTracking.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      locations,
      total,
      page,
      limit,
      totalPages,
    };
  }

  // Get multiple buses' current locations
  static async getMultipleBusLocations(busIds: string[]): Promise<any[]> {
    const locations = [];

    for (const busId of busIds) {
      try {
        const location = await this.getCurrentLocation(busId);
        locations.push(location);
      } catch (error) {
        // Skip buses without location data
        console.warn(`No location data for bus ${busId}`);
      }
    }

    return locations;
  }

  // Analyze speed patterns for a bus
  static async analyzeSpeed(
    busId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<SpeedAnalysis> {
    const where: any = {
      busId,
      isValid: true,
    };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const trackingData = await prisma.gPSTracking.findMany({
      where,
      select: {
        speed: true,
        timestamp: true,
      },
      orderBy: { timestamp: "asc" },
    });

    if (trackingData.length === 0) {
      return {
        averageSpeed: 0,
        maxSpeed: 0,
        minSpeed: 0,
        speedViolations: 0,
        totalDistance: 0,
      };
    }

    const speeds = trackingData
      .map((data) => data.speed)
      .filter((speed) => speed !== null) as number[];

    const averageSpeed =
      speeds.length > 0
        ? speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length
        : 0;

    const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
    const minSpeed = speeds.length > 0 ? Math.min(...speeds) : 0;

    // Count speed violations (assuming speed limit of 50 km/h for school buses)
    const speedLimit = 50;
    const speedViolations = speeds.filter((speed) => speed > speedLimit).length;

    // Calculate approximate distance traveled
    let totalDistance = 0;
    for (let i = 1; i < trackingData.length; i++) {
      const prev = trackingData[i - 1];
      const curr = trackingData[i];

      if (prev.speed && curr.speed) {
        // Simple distance calculation: speed * time
        const timeDiff =
          (curr.timestamp.getTime() - prev.timestamp.getTime()) /
          (1000 * 60 * 60); // hours
        totalDistance += ((prev.speed + curr.speed) / 2) * timeDiff; // average speed * time
      }
    }

    return {
      averageSpeed: Math.round(averageSpeed * 10) / 10,
      maxSpeed: Math.round(maxSpeed * 10) / 10,
      minSpeed: Math.round(minSpeed * 10) / 10,
      speedViolations,
      totalDistance: Math.round(totalDistance * 10) / 10,
    };
  }

  // Check if bus is within geofence
  static async checkGeofenceStatus(busId: string): Promise<{
    inGeofence: boolean;
    geofence?: any;
    distance?: number;
  }> {
    const location = await this.getCurrentLocation(busId);

    const geofences = await prisma.geofence.findMany({
      where: {
        busId,
        isActive: true,
      },
    });

    for (const geofence of geofences) {
      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        geofence.latitude,
        geofence.longitude
      );

      if (distance <= geofence.radius) {
        return {
          inGeofence: true,
          geofence,
          distance,
        };
      }
    }

    return {
      inGeofence: false,
    };
  }

  // Calculate distance between two GPS coordinates (Haversine formula)
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Convert to meters
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Clean up old tracking data (older than specified days)
  static async cleanupOldData(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.gPSTracking.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }

  // Get bus route for ETA calculations
  static async getBusRoute(busId: string): Promise<any> {
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      include: {
        routes: {
          where: { isActive: true },
          include: {
            stops: {
              where: { isActive: true },
              orderBy: { sequence: "asc" },
            },
          },
        },
      },
    });

    if (!bus || !bus.routes.length) {
      throw new CustomError("No active route found for this bus", 404);
    }

    return bus.routes[0]; // Return the first active route
  }

  // Calculate ETA to next stop
  static async calculateETA(busId: string): Promise<{
    nextStop?: any;
    eta?: Date;
    distance?: number;
    estimatedDuration?: number;
  }> {
    try {
      const currentLocation = await this.getCurrentLocation(busId);
      const route = await this.getBusRoute(busId);

      if (!route.stops.length) {
        return {};
      }

      // Find the next stop (simplified - in a real system, you'd track current stop)
      const nextStop = route.stops[0]; // For demo, assume first stop

      const distance = this.calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        nextStop.latitude,
        nextStop.longitude
      );

      // Estimate time based on average speed (assume 30 km/h for school zones)
      const averageSpeed = 30; // km/h
      const estimatedDuration =
        (distance / 1000 / averageSpeed) * 60 * 60 * 1000; // milliseconds

      const eta = new Date(Date.now() + estimatedDuration);

      return {
        nextStop,
        eta,
        distance: Math.round(distance),
        estimatedDuration: Math.round(estimatedDuration / 1000 / 60), // minutes
      };
    } catch (error) {
      // Return empty object if calculation fails
      return {};
    }
  }

  // Get tracking statistics for a bus
  static async getTrackingStats(
    busId: string,
    days: number = 30
  ): Promise<{
    totalRecords: number;
    averageSpeed: number;
    totalDistance: number;
    lastUpdate?: Date;
    isActive: boolean;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [stats, latestRecord] = await Promise.all([
      prisma.gPSTracking.aggregate({
        where: {
          busId,
          timestamp: { gte: startDate },
          isValid: true,
        },
        _count: { id: true },
        _avg: { speed: true },
      }),
      prisma.gPSTracking.findFirst({
        where: { busId },
        orderBy: { timestamp: "desc" },
        select: { timestamp: true },
      }),
    ]);

    // Calculate approximate distance
    const trackingData = await prisma.gPSTracking.findMany({
      where: {
        busId,
        timestamp: { gte: startDate },
        isValid: true,
      },
      select: {
        latitude: true,
        longitude: true,
        timestamp: true,
        speed: true,
      },
      orderBy: { timestamp: "asc" },
    });

    let totalDistance = 0;
    for (let i = 1; i < trackingData.length; i++) {
      const prev = trackingData[i - 1];
      const curr = trackingData[i];

      if (prev.speed && curr.speed) {
        const timeDiff =
          (curr.timestamp.getTime() - prev.timestamp.getTime()) /
          (1000 * 60 * 60);
        totalDistance += ((prev.speed + curr.speed) / 2) * timeDiff;
      }
    }

    return {
      totalRecords: stats._count.id,
      averageSpeed: stats._avg.speed
        ? Math.round(stats._avg.speed * 10) / 10
        : 0,
      totalDistance: Math.round(totalDistance * 10) / 10,
      lastUpdate: latestRecord?.timestamp,
      isActive:
        !!latestRecord &&
        Date.now() - latestRecord.timestamp.getTime() < 30 * 60 * 1000, // Active if updated within 30 minutes
    };
  }
}
