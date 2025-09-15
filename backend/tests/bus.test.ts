import request from "supertest";
import { app } from "../src/server";
import { prisma } from "../src/config/database";

describe("Bus Management API", () => {
  let adminToken: string;
  let schoolId: string;
  let testBusId: string;

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

    // Create admin user and get token
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@test.com",
        password: "$2a$10$hashedpassword", // Pre-hashed password
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN",
        phone: "+1234567890",
      },
    });

    // Get admin token (mock login)
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "password123", // This should match the hashed password
    });

    adminToken = loginResponse.body?.data?.token;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.bus.deleteMany({
      where: { schoolId },
    });
    await prisma.school.delete({
      where: { id: schoolId },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ["admin@test.com", "driver@test.com"],
        },
      },
    });
  });

  describe("POST /api/buses", () => {
    it("should create a new bus successfully", async () => {
      const busData = {
        plateNumber: "TEST-123",
        model: "Mercedes-Benz Sprinter",
        capacity: 25,
        schoolId,
      };

      const response = await request(app)
        .post("/api/buses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(busData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.plateNumber).toBe(busData.plateNumber);
      expect(response.body.data.model).toBe(busData.model);
      expect(response.body.data.capacity).toBe(busData.capacity);
      expect(response.body.data.schoolId).toBe(schoolId);

      testBusId = response.body.data.id;
    });

    it("should return validation error for invalid data", async () => {
      const invalidBusData = {
        plateNumber: "", // Empty plate number
        model: "Mercedes-Benz Sprinter",
        capacity: -5, // Invalid capacity
        schoolId: "invalid-school-id",
      };

      const response = await request(app)
        .post("/api/buses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidBusData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Validation failed");
    });

    it("should return unauthorized without token", async () => {
      const busData = {
        plateNumber: "TEST-456",
        model: "Mercedes-Benz Sprinter",
        capacity: 25,
        schoolId,
      };

      const response = await request(app)
        .post("/api/buses")
        .send(busData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Access token is required");
    });
  });

  describe("GET /api/buses", () => {
    it("should return list of buses with pagination", async () => {
      const response = await request(app)
        .get("/api/buses")
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(10);
    });

    it("should filter buses by school", async () => {
      const response = await request(app)
        .get("/api/buses")
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ schoolId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      // All returned buses should belong to the test school
      response.body.data.forEach((bus: any) => {
        expect(bus.schoolId).toBe(schoolId);
      });
    });

    it("should filter buses by active status", async () => {
      const response = await request(app)
        .get("/api/buses")
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ isActive: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      // All returned buses should be active
      response.body.data.forEach((bus: any) => {
        expect(bus.isActive).toBe(true);
      });
    });
  });

  describe("GET /api/buses/:busId", () => {
    it("should return specific bus details", async () => {
      const response = await request(app)
        .get(`/api/buses/${testBusId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testBusId);
      expect(response.body.data.plateNumber).toBe("TEST-123");
      expect(response.body.data.school).toBeDefined();
    });

    it("should return 404 for non-existent bus", async () => {
      const response = await request(app)
        .get("/api/buses/non-existent-bus-id")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Bus not found");
    });
  });

  describe("PUT /api/buses/:busId", () => {
    it("should update bus information successfully", async () => {
      const updateData = {
        model: "Updated Model",
        capacity: 30,
      };

      const response = await request(app)
        .put(`/api/buses/${testBusId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.model).toBe(updateData.model);
      expect(response.body.data.capacity).toBe(updateData.capacity);
    });

    it("should return 404 for non-existent bus", async () => {
      const updateData = {
        model: "Updated Model",
      };

      const response = await request(app)
        .put("/api/buses/non-existent-bus-id")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Bus not found");
    });
  });

  describe("PUT /api/buses/:busId/assign-driver", () => {
    let driverId: string;

    beforeAll(async () => {
      // Create test driver
      const driverUser = await prisma.user.create({
        data: {
          email: "driver@test.com",
          password: "$2a$10$hashedpassword",
          firstName: "Test",
          lastName: "Driver",
          role: "DRIVER",
          phone: "+1234567890",
        },
      });

      const driver = await prisma.driver.create({
        data: {
          userId: driverUser.id,
          licenseNumber: "DL123456",
          licenseExpiry: new Date("2025-12-31"),
          experience: 3,
        },
      });

      driverId = driver.id;
    });

    it("should assign driver to bus successfully", async () => {
      const response = await request(app)
        .put(`/api/buses/${testBusId}/assign-driver`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ driverId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.driverId).toBe(driverId);
    });

    it("should return validation error for invalid driver ID", async () => {
      const response = await request(app)
        .put(`/api/buses/${testBusId}/assign-driver`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ driverId: "invalid-driver-id" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Driver not found");
    });
  });

  describe("DELETE /api/buses/:busId", () => {
    it("should deactivate bus successfully", async () => {
      const response = await request(app)
        .delete(`/api/buses/${testBusId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("deactivated");

      // Verify bus is deactivated
      const busResponse = await request(app)
        .get(`/api/buses/${testBusId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(busResponse.body.data.isActive).toBe(false);
    });

    it("should return 404 for non-existent bus", async () => {
      const response = await request(app)
        .delete("/api/buses/non-existent-bus-id")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Bus not found");
    });
  });
});
