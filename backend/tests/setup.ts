import { prisma } from "../src/config/database";

// Global test setup
beforeAll(async () => {
  // Ensure database connection
  await prisma.$connect();
});

afterAll(async () => {
  // Clean up database connection
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Start transaction for each test
  await prisma.$transaction(async (tx) => {
    // This ensures test isolation
    // Each test runs in its own transaction that gets rolled back
  });
});

afterEach(async () => {
  // Clean up any test data that might have been created
  // This is handled by the beforeAll/afterAll in individual test files
});

// Mock external services for testing
jest.mock("../src/config/redis", () => ({
  connectRedis: jest.fn(),
  getRedisClient: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    expire: jest.fn(),
    exists: jest.fn(),
    hget: jest.fn(),
    hset: jest.fn(),
    hdel: jest.fn(),
    lpush: jest.fn(),
    lrange: jest.fn(),
    lrem: jest.fn(),
    sadd: jest.fn(),
    srem: jest.fn(),
    smembers: jest.fn(),
    sismember: jest.fn(),
    zadd: jest.fn(),
    zrange: jest.fn(),
    zrem: jest.fn(),
    incr: jest.fn(),
    decr: jest.fn(),
    publish: jest.fn(),
    subscribe: jest.fn(),
    psubscribe: jest.fn(),
    punsubscribe: jest.fn(),
    ttl: jest.fn(),
    pexpire: jest.fn(),
  })),
  disconnectRedis: jest.fn(),
}));

// Mock Socket.IO
jest.mock("../src/server", () => ({
  io: {
    emit: jest.fn(),
    to: jest.fn(() => ({
      emit: jest.fn(),
    })),
    on: jest.fn(),
    off: jest.fn(),
  },
}));

// Mock JWT utilities
jest.mock("../src/utils/jwt", () => ({
  generateToken: jest.fn(() => "mock_jwt_token"),
  generateRefreshToken: jest.fn(() => "mock_refresh_token"),
  verifyToken: jest.fn(() => ({ id: "test_user_id", role: "ADMIN" })),
  extractTokenFromHeader: jest.fn((authHeader) => {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.substring(7);
  }),
}));

// Helper function to create authenticated request headers
export const getAuthHeaders = (userId = "test_user_id", role = "ADMIN") => {
  return {
    Authorization: `Bearer mock_jwt_token`,
  };
};

// Helper function to create test user
export const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    email: `test_${Date.now()}@example.com`,
    password: "$2a$10$test.hashed.password",
    firstName: "Test",
    lastName: "User",
    role: "ADMIN",
    phone: "+1234567890",
    isActive: true,
  };

  return await prisma.user.create({
    data: { ...defaultUser, ...overrides },
  });
};

// Helper function to create test school
export const createTestSchool = async (overrides = {}) => {
  const defaultSchool = {
    name: `Test School ${Date.now()}`,
    address: "123 Test Street",
    phone: "+1234567890",
    email: `school_${Date.now()}@test.com`,
  };

  return await prisma.school.create({
    data: { ...defaultSchool, ...overrides },
  });
};

// Helper function to create test bus
export const createTestBus = async (schoolId: string, overrides = {}) => {
  const defaultBus = {
    plateNumber: `TEST-${Date.now()}`,
    model: "Test Bus Model",
    capacity: 25,
    schoolId,
    isActive: true,
  };

  return await prisma.bus.create({
    data: { ...defaultBus, ...overrides },
  });
};

// Helper function to create test student
export const createTestStudent = async (
  schoolId: string,
  parentId: string,
  overrides = {}
) => {
  const defaultStudent = {
    firstName: `Test${Date.now()}`,
    lastName: "Student",
    dateOfBirth: new Date("2015-01-01"),
    grade: "3rd Grade",
    schoolId,
    parentId,
    isActive: true,
  };

  return await prisma.student.create({
    data: { ...defaultStudent, ...overrides },
  });
};

// Helper function to clean up test data
export const cleanupTestData = async () => {
  await prisma.notification.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.studentRouteAssignment.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.routeStop.deleteMany();
  await prisma.route.deleteMany();
  await prisma.geofence.deleteMany();
  await prisma.gPSTracking.deleteMany();
  await prisma.emergencyAlert.deleteMany();
  await prisma.message.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.schoolStaff.deleteMany();
  await prisma.school.deleteMany();
  await prisma.user.deleteMany();
};
