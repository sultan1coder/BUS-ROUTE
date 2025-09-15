import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

// Import configurations
import { connectDB } from "./config/database";
import { connectRedis } from "./config/redis";

// Import middleware
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

// Import routes
import authRoutes from "./routes/auth";
import busRoutes from "./routes/bus";
import driverRoutes from "./routes/driver";
import routeRoutes from "./routes/route";
import trackingRoutes from "./routes/tracking";
import studentRoutes from "./routes/student";
import etaSpeedRoutes from "./routes/etaSpeed";
import notificationRoutes from "./routes/notification";
import communicationRoutes from "./routes/communication";
import safetyRoutes from "./routes/safety";
import adminRoutes from "./routes/admin";
import driverAppRoutes from "./routes/driverApp";

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/eta-speed", etaSpeedRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", communicationRoutes);
app.use("/api/safety", safetyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/driver", driverAppRoutes);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join room based on user type and ID
  socket.on("join", (data: { userType: string; userId: string }) => {
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
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Initialize connections and start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Connect to Redis
    // await connectRedis();

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Socket.IO server initialized`);
      console.log(
        `🏥 Health check available at http://localhost:${PORT}/health`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export { io };
