import prisma from "../config/database";
import { CustomError } from "../middleware/errorHandler";

export interface CreateDriverData {
  userId: string;
  licenseNumber: string;
  licenseExpiry: Date;
  licenseType: string;
  experienceYears?: number;
  emergencyContact: string;
  emergencyPhone: string;
  medicalInfo?: string;
}

export interface UpdateDriverData {
  licenseNumber?: string;
  licenseExpiry?: Date;
  licenseType?: string;
  experienceYears?: number;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalInfo?: string;
  isActive?: boolean;
}

export interface DriverFilters {
  isActive?: boolean;
  hasBus?: boolean;
  search?: string;
}

export class DriverService {
  // Create a new driver profile
  static async createDriver(driverData: CreateDriverData): Promise<any> {
    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: driverData.userId },
    });

    if (!user || !user.isActive) {
      throw new CustomError("User not found or inactive", 404);
    }

    if (user.role !== "DRIVER") {
      throw new CustomError("User must have DRIVER role", 400);
    }

    // Check if driver profile already exists for this user
    const existingDriver = await prisma.driver.findUnique({
      where: { userId: driverData.userId },
    });

    if (existingDriver) {
      throw new CustomError("Driver profile already exists for this user", 409);
    }

    // Check if license number is already in use
    const existingLicense = await prisma.driver.findUnique({
      where: { licenseNumber: driverData.licenseNumber },
    });

    if (existingLicense) {
      throw new CustomError("License number is already registered", 409);
    }

    // Validate license expiry date
    if (driverData.licenseExpiry <= new Date()) {
      throw new CustomError("License expiry date must be in the future", 400);
    }

    return await prisma.driver.create({
      data: driverData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        bus: {
          select: {
            id: true,
            plateNumber: true,
            model: true,
          },
        },
      },
    });
  }

  // Get driver by ID
  static async getDriverById(driverId: string): Promise<any> {
    return await prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
          },
        },
        bus: {
          select: {
            id: true,
            plateNumber: true,
            model: true,
            capacity: true,
            school: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        trips: {
          where: {
            status: "COMPLETED",
          },
          select: {
            id: true,
            distance: true,
            scheduledStart: true,
            actualStart: true,
            scheduledEnd: true,
            actualEnd: true,
          },
          orderBy: {
            scheduledStart: "desc",
          },
          take: 5, // Last 5 trips
        },
        performance: {
          select: {
            date: true,
            rating: true,
            incidents: true,
            distanceDriven: true,
            hoursDriven: true,
          },
          orderBy: {
            date: "desc",
          },
          take: 30, // Last 30 days
        },
        _count: {
          select: {
            trips: true,
          },
        },
      },
    });
  }

  // Get driver by user ID
  static async getDriverByUserId(userId: string): Promise<any> {
    return await prisma.driver.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
          },
        },
        bus: {
          select: {
            id: true,
            plateNumber: true,
            model: true,
            capacity: true,
            school: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  // Get all drivers with filtering and pagination
  static async getDrivers(
    filters: DriverFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{
    drivers: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { isActive, hasBus, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (hasBus !== undefined) {
      if (hasBus) {
        where.busId = { not: null };
      } else {
        where.busId = null;
      }
    }

    if (search) {
      where.OR = [
        {
          user: {
            firstName: { contains: search, mode: "insensitive" },
          },
        },
        {
          user: {
            lastName: { contains: search, mode: "insensitive" },
          },
        },
        {
          user: {
            email: { contains: search, mode: "insensitive" },
          },
        },
        { licenseNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          bus: {
            select: {
              id: true,
              plateNumber: true,
              model: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.driver.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      drivers,
      total,
      page,
      limit,
      totalPages,
    };
  }

  // Update driver
  static async updateDriver(
    driverId: string,
    updateData: UpdateDriverData
  ): Promise<any> {
    // Check if driver exists
    const existingDriver = await prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!existingDriver) {
      throw new CustomError("Driver not found", 404);
    }

    // Check license number uniqueness if being updated
    if (
      updateData.licenseNumber &&
      updateData.licenseNumber !== existingDriver.licenseNumber
    ) {
      const licenseCheck = await prisma.driver.findUnique({
        where: { licenseNumber: updateData.licenseNumber },
      });

      if (licenseCheck) {
        throw new CustomError("License number is already registered", 409);
      }
    }

    // Validate license expiry date if being updated
    if (updateData.licenseExpiry && updateData.licenseExpiry <= new Date()) {
      throw new CustomError("License expiry date must be in the future", 400);
    }

    return await prisma.driver.update({
      where: { id: driverId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        bus: {
          select: {
            id: true,
            plateNumber: true,
            model: true,
          },
        },
      },
    });
  }

  // Delete driver (soft delete)
  static async deleteDriver(driverId: string): Promise<void> {
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: { bus: true },
    });

    if (!driver) {
      throw new CustomError("Driver not found", 404);
    }

    // Check if driver is currently assigned to a bus
    if (driver.bus) {
      throw new CustomError(
        "Cannot delete driver currently assigned to a bus",
        400
      );
    }

    // Check if driver has active trips
    const activeTrips = await prisma.trip.findMany({
      where: {
        driverId,
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      },
    });

    if (activeTrips.length > 0) {
      throw new CustomError("Cannot delete driver with active trips", 400);
    }

    await prisma.driver.update({
      where: { id: driverId },
      data: { isActive: false },
    });
  }

  // Assign driver to bus (update bus assignment)
  static async assignToBus(driverId: string, busId: string): Promise<any> {
    // Check if driver exists and is active
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: { bus: true },
    });

    if (!driver || !driver.isActive) {
      throw new CustomError("Driver not found or inactive", 404);
    }

    // Check if bus exists and is active
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
    });

    if (!bus || !bus.isActive) {
      throw new CustomError("Bus not found or inactive", 404);
    }

    // Check if bus already has a driver
    if (bus.driverId && bus.driverId !== driverId) {
      throw new CustomError("Bus is already assigned to another driver", 400);
    }

    // Check if driver is already assigned to another bus
    if (driver.bus && driver.bus.id !== busId) {
      throw new CustomError("Driver is already assigned to another bus", 400);
    }

    return await prisma.driver.update({
      where: { id: driverId },
      data: { bus: { connect: { id: busId } } },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        bus: {
          select: {
            id: true,
            plateNumber: true,
            model: true,
            capacity: true,
            school: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  // Unassign driver from bus
  static async unassignFromBus(driverId: string): Promise<any> {
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new CustomError("Driver not found", 404);
    }

    // Check if driver has active trips
    const activeTrips = await prisma.trip.findMany({
      where: {
        driverId,
        status: "IN_PROGRESS",
      },
    });

    if (activeTrips.length > 0) {
      throw new CustomError("Cannot unassign driver with active trips", 400);
    }

    return await prisma.driver.update({
      where: { id: driverId },
      data: { bus: { disconnect: true } },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        bus: true,
      },
    });
  }

  // Get driver statistics
  static async getDriverStats(driverId: string): Promise<{
    totalTrips: number;
    completedTrips: number;
    activeTrips: number;
    totalDistance: number;
    totalHours: number;
    averageRating: number;
    totalIncidents: number;
    currentBus?: any;
    recentTrips: any[];
  }> {
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        trips: {
          select: {
            id: true,
            status: true,
            distance: true,
            scheduledStart: true,
            actualStart: true,
            scheduledEnd: true,
            actualEnd: true,
          },
        },
        bus: {
          select: {
            id: true,
            plateNumber: true,
            model: true,
          },
        },
        performance: {
          select: {
            rating: true,
            incidents: true,
            distanceDriven: true,
            hoursDriven: true,
          },
        },
      },
    });

    if (!driver) {
      throw new CustomError("Driver not found", 404);
    }

    const totalTrips = driver.trips.length;
    const completedTrips = driver.trips.filter(
      (trip: any) => trip.status === "COMPLETED"
    ).length;
    const activeTrips = driver.trips.filter(
      (trip: any) => trip.status === "IN_PROGRESS"
    ).length;

    const totalDistance = driver.trips.reduce(
      (sum: number, trip: any) => sum + (trip.distance || 0),
      0
    );

    // Calculate total hours from performance data
    const totalHours = driver.performance.reduce(
      (sum: number, perf: any) => sum + (perf.hoursDriven || 0),
      0
    );

    // Calculate average rating
    const ratings = driver.performance
      .map((perf: any) => perf.rating)
      .filter((rating: any) => rating !== null) as number[];

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) /
          ratings.length
        : 0;

    const totalIncidents = driver.performance.reduce(
      (sum: number, perf: any) => sum + (perf.incidents || 0),
      0
    );

    // Get recent trips (last 5)
    const recentTrips = driver.trips
      .sort(
        (a: any, b: any) =>
          new Date(b.scheduledStart).getTime() -
          new Date(a.scheduledStart).getTime()
      )
      .slice(0, 5);

    return {
      totalTrips,
      completedTrips,
      activeTrips,
      totalDistance,
      totalHours,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalIncidents,
      currentBus: driver.bus,
      recentTrips,
    };
  }

  // Get available drivers (not assigned to any bus)
  static async getAvailableDrivers(): Promise<any[]> {
    return await prisma.driver.findMany({
      where: {
        isActive: true,
        bus: null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: {
        user: {
          firstName: "asc",
        },
      },
    });
  }

  // Check if license is expiring soon (within 30 days)
  static async getDriversWithExpiringLicenses(
    daysAhead: number = 30
  ): Promise<any[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return await prisma.driver.findMany({
      where: {
        isActive: true,
        licenseExpiry: {
          lte: futureDate,
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        licenseExpiry: "asc",
      },
    });
  }
}
