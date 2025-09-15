import request from "supertest";
import { app } from "../src/server";
import { prisma } from "../src/config/database";

describe("GPS Tracking API", () => {
  let adminToken: string;
  let schoolId: string;
  let busId: string;

  beforeAll(async () => {
    // Create test school
    const school = await prisma.school.create({
      data: {
        name: "Test School",
        address: "123 Test Street",
        phone: "+1234567890",
        email: "school@test.com",
      },
    });
    schoolId = school.id;

    // Create test bus
    const bus = await prisma.bus.create({
      data: {
        plateNumber: "TRACK-001",
        model: "Test Bus",
        capacity: 25,
        schoolId,
      },
    });
    busId = bus.id;

    // Create admin user and get token
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@test.com",
        password: "$2a$10$hashedpassword",
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN",
        phone: "+1234567890",
      },
    });

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "password123",
    });

    adminToken = loginResponse.body?.data?.token;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.gPSTracking.deleteMany({
      where: { busId },
    });
    await prisma.bus.delete({ where: { id: busId } });
    await prisma.school.delete({ where: { id: schoolId } });
    await prisma.user.deleteMany({
      where: { email: "admin@test.com" },
    });
  });

  describe("POST /api/tracking/record", () => {
    it("should record GPS location successfully", async () => {
      const locationData = {
        busId,
        latitude: 40.7128,
        longitude: -74.006,
        speed: 35.5,
        heading: 90,
        accuracy: 5,
      };

      const response = await request(app)
        .post("/api/tracking/record")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(locationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.busId).toBe(busId);
      expect(response.body.data.latitude).toBe(locationData.latitude);
      expect(response.body.data.longitude).toBe(locationData.longitude);
      expect(response.body.data.speed).toBe(locationData.speed);
    });

    it("should return validation error for invalid coordinates", async () => {
      const invalidLocationData = {
        busId,
        latitude: 91, // Invalid latitude (>90)
        longitude: -74.006,
        speed: 35.5,
      };

      const response = await request(app)
        .post("/api/tracking/record")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidLocationData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Validation failed");
    });

    it("should return error for non-existent bus", async () => {
      const locationData = {
        busId: "non-existent-bus-id",
        latitude: 40.7128,
        longitude: -74.006,
        speed: 35.5,
      };

      const response = await request(app)
        .post("/api/tracking/record")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(locationData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Bus not found");
    });
  });

  describe("GET /api/tracking/current/:busId", () => {
    beforeAll(async () => {
      // Record a location for testing
      await request(app)
        .post("/api/tracking/record")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          busId,
          latitude: 40.7128,
          longitude: -74.006,
          speed: 25.0,
          heading: 45,
          accuracy: 3,
        });
    });

    it("should return current bus location", async () => {
      const response = await request(app)
        .get(`/api/tracking/current/${busId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.busId).toBe(busId);
      expect(response.body.data.latitude).toBe(40.7128);
      expect(response.body.data.longitude).toBe(-74.006);
      expect(response.body.data.speed).toBe(25.0);
      expect(response.body.data.timestamp).toBeDefined();
    });

    it("should return 404 for bus with no location data", async () => {
      const newBus = await prisma.bus.create({
        data: {
          plateNumber: "NO-LOCATION-001",
          model: "Test Bus",
          capacity: 25,
          schoolId,
        },
      });

      const response = await request(app)
        .get(`/api/tracking/current/${newBus.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("No location data found");

      // Clean up
      await prisma.bus.delete({ where: { id: newBus.id } });
    });
  });

  describe("GET /api/tracking/history/:busId", () => {
    beforeAll(async () => {
      // Record multiple locations for history testing
      const locations = [
        { latitude: 40.7128, longitude: -74.006, speed: 20.0 },
        { latitude: 40.713, longitude: -74.0058, speed: 25.0 },
        { latitude: 40.7132, longitude: -74.0056, speed: 30.0 },
      ];

      for (const location of locations) {
        await request(app)
          .post("/api/tracking/record")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            busId,
            ...location,
            heading: 90,
            accuracy: 5,
          });

        // Small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    });

    it("should return location history with pagination", async () => {
      const response = await request(app)
        .get(`/api/tracking/history/${busId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(10);
    });

    it("should filter by date range", async () => {
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - 1);

      const endDate = new Date();
      endDate.setHours(endDate.getHours() + 1);

      const response = await request(app)
        .get(`/api/tracking/history/${busId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      // All returned locations should be within the date range
      response.body.data.forEach((location: any) => {
        const locationDate = new Date(location.timestamp);
        expect(locationDate >= startDate).toBe(true);
        expect(locationDate <= endDate).toBe(true);
      });
    });

    it("should return empty array for bus with no history", async () => {
      const newBus = await prisma.bus.create({
        data: {
          plateNumber: "NO-HISTORY-001",
          model: "Test Bus",
          capacity: 25,
          schoolId,
        },
      });

      const response = await request(app)
        .get(`/api/tracking/history/${newBus.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);

      // Clean up
      await prisma.bus.delete({ where: { id: newBus.id } });
    });
  });

  describe("GET /api/tracking/multiple", () => {
    let busId2: string;

    beforeAll(async () => {
      // Create second bus and record its location
      const bus2 = await prisma.bus.create({
        data: {
          plateNumber: "TRACK-002",
          model: "Test Bus 2",
          capacity: 25,
          schoolId,
        },
      });
      busId2 = bus2.id;

      await request(app)
        .post("/api/tracking/record")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          busId: busId2,
          latitude: 40.7589,
          longitude: -73.9851,
          speed: 15.0,
          heading: 180,
          accuracy: 4,
        });
    });

    afterAll(async () => {
      await prisma.gPSTracking.deleteMany({
        where: { busId: busId2 },
      });
      await prisma.bus.delete({ where: { id: busId2 } });
    });

    it("should return current locations for multiple buses", async () => {
      const response = await request(app)
        .get("/api/tracking/multiple")
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ busIds: `${busId},${busId2}` })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);

      // Check that both buses are included
      const busIds = response.body.data.map((location: any) => location.busId);
      expect(busIds).toContain(busId);
      expect(busIds).toContain(busId2);
    });

    it("should return empty array when no buses specified", async () => {
      const response = await request(app)
        .get("/api/tracking/multiple")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe("POST /api/tracking/analyze-speed", () => {
    it("should analyze speed patterns", async () => {
      const analysisData = {
        busId,
        timeRange: "1h",
      };

      const response = await request(app)
        .post("/api/tracking/analyze-speed")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(analysisData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.busId).toBe(busId);
      expect(response.body.data.averageSpeed).toBeDefined();
      expect(response.body.data.maxSpeed).toBeDefined();
    });

    it("should return error for bus with no tracking data", async () => {
      const newBus = await prisma.bus.create({
        data: {
          plateNumber: "NO-DATA-001",
          model: "Test Bus",
          capacity: 25,
          schoolId,
        },
      });

      const analysisData = {
        busId: newBus.id,
        timeRange: "1h",
      };

      const response = await request(app)
        .post("/api/tracking/analyze-speed")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(analysisData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("No tracking data found");

      // Clean up
      await prisma.bus.delete({ where: { id: newBus.id } });
    });
  });

  describe("GET /api/tracking/stats/:busId", () => {
    it("should return tracking statistics for bus", async () => {
      const response = await request(app)
        .get(`/api/tracking/stats/${busId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ days: 7 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.busId).toBe(busId);
      expect(response.body.data.totalRecords).toBeDefined();
      expect(response.body.data.averageSpeed).toBeDefined();
      expect(response.body.data.totalDistance).toBeDefined();
    });

    it("should return zero stats for bus with no data", async () => {
      const newBus = await prisma.bus.create({
        data: {
          plateNumber: "NO-STATS-001",
          model: "Test Bus",
          capacity: 25,
          schoolId,
        },
      });

      const response = await request(app)
        .get(`/api/tracking/stats/${newBus.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.busId).toBe(newBus.id);
      expect(response.body.data.totalRecords).toBe(0);

      // Clean up
      await prisma.bus.delete({ where: { id: newBus.id } });
    });
  });
});
