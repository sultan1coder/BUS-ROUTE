"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
// Import configurations
const database_1 = require("./config/database");
// Import middleware
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const bus_1 = __importDefault(require("./routes/bus"));
const driver_1 = __importDefault(require("./routes/driver"));
const route_1 = __importDefault(require("./routes/route"));
const tracking_1 = __importDefault(require("./routes/tracking"));
const student_1 = __importDefault(require("./routes/student"));
const etaSpeed_1 = __importDefault(require("./routes/etaSpeed"));
const notification_1 = __importDefault(require("./routes/notification"));
const communication_1 = __importDefault(require("./routes/communication"));
const safety_1 = __importDefault(require("./routes/safety"));
const admin_1 = __importDefault(require("./routes/admin"));
const driverApp_1 = __importDefault(require("./routes/driverApp"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});
exports.io = io;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("combined"));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// API Routes
app.use("/api/auth", auth_1.default);
app.use("/api/buses", bus_1.default);
app.use("/api/drivers", driver_1.default);
app.use("/api/routes", route_1.default);
app.use("/api/tracking", tracking_1.default);
app.use("/api/students", student_1.default);
app.use("/api/eta-speed", etaSpeed_1.default);
app.use("/api/notifications", notification_1.default);
app.use("/api/messages", communication_1.default);
app.use("/api/safety", safety_1.default);
app.use("/api/admin", admin_1.default);
app.use("/api/driver", driverApp_1.default);
// Socket.IO connection handling
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    // Join room based on user type and ID
    socket.on("join", (data) => {
        socket.join(`${data.userType}_${data.userId}`);
        console.log(`${data.userType} ${data.userId} joined room`);
    });
    // Handle real-time location updates
    socket.on("location_update", (data) => {
        // Broadcast location to parents and admin
        io.to(`parent_${data.studentId}`).emit("bus_location", data);
        io.to("admin_dashboard").emit("bus_location", data);
    });
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});
// Error handling middleware
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 4000;
// Initialize connections and start server
const startServer = async () => {
    try {
        // Connect to database
        await (0, database_1.connectDB)();
        // Connect to Redis
        // await connectRedis();
        // Start server
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📱 Socket.IO server initialized`);
            console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map