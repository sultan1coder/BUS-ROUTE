import prisma from "../config/database";
import { CustomError } from "../middleware/errorHandler";

export interface CreateBusData {
  plateNumber: string;
  capacity: number;
  model: string;
  year: number;
  color: string;
  schoolId: string;
  gpsDeviceId?: string;
}

export interface UpdateBusData {
  plateNumber?: string;
  capacity?: number;
  model?: string;
  year?: number;
  color?: string;
  isActive?: boolean;
  gpsDeviceId?: string;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
}

export interface BusFilters {
  schoolId?: string;
  isActive?: boolean;
  driverId?: string;
  search?: string;
}

export class BusService {
  // Create a new bus
  static async createBus(busData: CreateBusData): Promise<any> {
    // Check if plate number already exists
    const existingBus = await prisma.bus.findUnique({
      where: { plateNumber: busData.plateNumber },
    });

    if (existingBus) {
      throw new CustomError("Bus with this plate number already exists", 409);
    }

    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { id: busData.schoolId },
    });

    if (!school) {
      throw new CustomError("School not found", 404);
    }

    // Check if GPS device ID is already in use
    if (busData.gpsDeviceId) {
      const existingGPS = await prisma.bus.findUnique({
        where: { gpsDeviceId: busData.gpsDeviceId },
      });

      if (existingGPS) {
        throw new CustomError("GPS device ID is already in use", 409);
      }
    }

    return await prisma.bus.create({
      data: busData,
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
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
    });
  }

  // Get bus by ID
  static async getBusById(busId: string): Promise<any> {
    return await prisma.bus.findUnique({
      where: { id: busId },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
          },
        },
        driver: {
          select: {
            id: true,
            licenseNumber: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        routes: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
        geofences: {
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            radius: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            trips: true,
            trackingData: true,
          },
        },
      },
    });
  }

  // Get all buses with filtering and pagination
  static async getBuses(
    filters: BusFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{
    buses: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { schoolId, isActive, driverId, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (schoolId) {
      where.schoolId = schoolId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (driverId) {
      where.driverId = driverId;
    }

    if (search) {
      where.OR = [
        { plateNumber: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { color: { contains: search, mode: "insensitive" } },
      ];
    }

    const [buses, total] = await Promise.all([
      prisma.bus.findMany({
        where,
        include: {
          school: {
            select: {
              id: true,
              name: true,
            },
          },
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
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.bus.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      buses,
      total,
      page,
      limit,
      totalPages,
    };
  }

  // Update bus
  static async updateBus(
    busId: string,
    updateData: UpdateBusData
  ): Promise<any> {
    // Check if bus exists
    const existingBus = await prisma.bus.findUnique({
      where: { id: busId },
    });

    if (!existingBus) {
      throw new CustomError("Bus not found", 404);
    }

    // Check plate number uniqueness if being updated
    if (
      updateData.plateNumber &&
      updateData.plateNumber !== existingBus.plateNumber
    ) {
      const plateCheck = await prisma.bus.findUnique({
        where: { plateNumber: updateData.plateNumber },
      });

      if (plateCheck) {
        throw new CustomError("Bus with this plate number already exists", 409);
      }
    }

    // Check GPS device ID uniqueness if being updated
    if (
      updateData.gpsDeviceId &&
      updateData.gpsDeviceId !== existingBus.gpsDeviceId
    ) {
      const gpsCheck = await prisma.bus.findUnique({
        where: { gpsDeviceId: updateData.gpsDeviceId },
      });

      if (gpsCheck) {
        throw new CustomError("GPS device ID is already in use", 409);
      }
    }

    return await prisma.bus.update({
      where: { id: busId },
      data: updateData,
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
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
    });
  }

  // Delete bus (soft delete by setting isActive to false)
  static async deleteBus(busId: string): Promise<void> {
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
    });

    if (!bus) {
      throw new CustomError("Bus not found", 404);
    }

    // Check if bus has active trips
    const activeTrips = await prisma.trip.findMany({
      where: {
        busId,
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      },
    });

    if (activeTrips.length > 0) {
      throw new CustomError("Cannot delete bus with active trips", 400);
    }

    await prisma.bus.update({
      where: { id: busId },
      data: { isActive: false },
    });
  }

  // Assign driver to bus
  static async assignDriver(busId: string, driverId: string): Promise<any> {
    // Check if bus exists
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
    });

    if (!bus) {
      throw new CustomError("Bus not found", 404);
    }

    // Check if driver exists and is active
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: { user: true, bus: true },
    });

    if (!driver || !driver.isActive) {
      throw new CustomError("Driver not found or inactive", 404);
    }

    // Check if driver is already assigned to another bus
    if (driver.bus && driver.bus.id !== busId) {
      throw new CustomError("Driver is already assigned to another bus", 400);
    }

    return await prisma.bus.update({
      where: { id: busId },
      data: { driverId },
      include: {
        driver: {
          select: {
            id: true,
            licenseNumber: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  }

  // Unassign driver from bus
  static async unassignDriver(busId: string): Promise<any> {
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
    });

    if (!bus) {
      throw new CustomError("Bus not found", 404);
    }

    return await prisma.bus.update({
      where: { id: busId },
      data: { driverId: null },
      include: {
        driver: true,
      },
    });
  }

  // Get bus statistics
  static async getBusStats(busId: string): Promise<{
    totalTrips: number;
    completedTrips: number;
    activeTrips: number;
    totalDistance: number;
    lastLocation?: any;
    currentDriver?: any;
  }> {
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      include: {
        trips: {
          select: {
            id: true,
            status: true,
            distance: true,
          },
        },
        driver: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!bus) {
      throw new CustomError("Bus not found", 404);
    }

    const totalTrips = bus.trips.length;
    const completedTrips = bus.trips.filter(
      (trip: any) => trip.status === "COMPLETED"
    ).length;
    const activeTrips = bus.trips.filter(
      (trip: any) => trip.status === "IN_PROGRESS"
    ).length;
    const totalDistance = bus.trips.reduce(
      (sum: number, trip: any) => sum + (trip.distance || 0),
      0
    );

    // Get last location from tracking data
    const lastTracking = await prisma.gPSTracking.findFirst({
      where: { busId },
      orderBy: { timestamp: "desc" },
    });

    return {
      totalTrips,
      completedTrips,
      activeTrips,
      totalDistance,
      lastLocation: lastTracking
        ? {
            latitude: lastTracking.latitude,
            longitude: lastTracking.longitude,
            timestamp: lastTracking.timestamp,
          }
        : undefined,
      currentDriver: bus.driver
        ? {
            id: bus.driver.id,
            firstName: bus.driver.user.firstName,
            lastName: bus.driver.user.lastName,
            phone: bus.driver.user.phone,
          }
        : undefined,
    };
  }

  // Get buses by school
  static async getBusesBySchool(schoolId: string): Promise<any[]> {
    return await prisma.bus.findMany({
      where: {
        schoolId,
        isActive: true,
      },
      include: {
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
      orderBy: { plateNumber: "asc" },
    });
  }
}
