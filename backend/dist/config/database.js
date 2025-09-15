"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDatabaseHealth = exports.disconnectDB = exports.connectDB = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: ["query", "info", "warn", "error"],
    });
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = exports.prisma;
// Connect to database
const connectDB = async () => {
    try {
        await exports.prisma.$connect();
        console.log("✅ Database connected successfully");
    }
    catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
// Disconnect from database
const disconnectDB = async () => {
    try {
        await exports.prisma.$disconnect();
        console.log("✅ Database disconnected successfully");
    }
    catch (error) {
        console.error("❌ Database disconnection failed:", error);
    }
};
exports.disconnectDB = disconnectDB;
// Health check
const checkDatabaseHealth = async () => {
    try {
        await exports.prisma.$queryRaw `SELECT 1`;
        return true;
    }
    catch (error) {
        console.error("Database health check failed:", error);
        return false;
    }
};
exports.checkDatabaseHealth = checkDatabaseHealth;
exports.default = exports.prisma;
//# sourceMappingURL=database.js.map