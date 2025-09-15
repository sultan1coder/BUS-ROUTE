# 🚐 School Bus Tracking & Management System

A comprehensive backend API for school bus tracking and management system built with Node.js, Express.js, TypeScript, PostgreSQL, and Prisma.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.0-lightgrey.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0+-green.svg)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-7.0+-red.svg)](https://redis.io/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.0+-black.svg)](https://socket.io/)

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Database Schema](#database-schema)
- [Real-time Features](#real-time-features)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🚦 Core Functionality

- **Multi-role Authentication**: Admin, School Staff, Driver, Parent roles
- **Real-time GPS Tracking**: Live bus location monitoring with Redis caching
- **Student Management**: Profile management, attendance tracking, RFID/NFC support
- **Route Management**: Dynamic routes with stops and student assignments
- **ETA Calculations**: Predictive arrival times with traffic awareness

### 📱 Real-time Communication

- **In-app Messaging**: Secure communication between parents, staff, and drivers
- **Push Notifications**: Instant alerts for important events
- **Emergency Alerts**: Critical incident reporting with multi-channel notifications
- **Socket.IO Integration**: Real-time updates via WebSocket connections

### 🛡️ Safety & Security

- **SOS Emergency System**: One-tap emergency alerts with GPS coordinates
- **Geofencing**: Virtual boundaries with automatic violation detection
- **Speed Monitoring**: Real-time speed limit enforcement with alerts
- **Incident Management**: Comprehensive emergency response tracking

### 📊 Advanced Analytics

- **Admin Dashboard**: System overview with key performance indicators
- **Fleet Analytics**: Bus utilization, maintenance tracking, fuel efficiency
- **Safety Reports**: Incident analysis, compliance monitoring, trend analysis
- **Communication Insights**: Message analytics, response times, engagement metrics

### 🔧 System Management

- **Automated Maintenance**: Database cleanup, performance optimization
- **Data Export**: CSV/JSON/XLSX export capabilities for reporting
- **System Monitoring**: Health checks, performance metrics, error tracking
- **Configuration Management**: Flexible system settings and preferences

---

## 🏗️ Architecture

```
School Bus Tracking System
├── 🎯 API Layer (Express.js + TypeScript)
│   ├── Authentication & Authorization
│   ├── Route Handlers & Controllers
│   ├── Middleware (Validation, Error Handling, Rate Limiting)
│   └── Real-time WebSocket Integration
├── 💾 Data Layer (PostgreSQL + Prisma ORM)
│   ├── User Management (Multi-role support)
│   ├── Fleet Management (Buses, Drivers, Routes)
│   ├── Tracking Data (GPS, Attendance, Trips)
│   ├── Communication (Messages, Notifications)
│   └── Safety (Alerts, Geofences, Incidents)
├── 🚀 Caching Layer (Redis)
│   ├── Session Management
│   ├── Real-time Data Caching
│   ├── Location History
│   └── Performance Optimization
└── 📡 Real-time Layer (Socket.IO)
    ├── Live Location Updates
    ├── Emergency Alerts
    ├── Trip Status Changes
    └── Communication Events
```

### Technology Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for high-performance data storage
- **Real-time**: Socket.IO for WebSocket communication
- **Authentication**: JWT with refresh token support
- **Validation**: Express-validator with custom rules
- **Security**: Helmet, CORS, bcryptjs password hashing
- **Testing**: Jest with Supertest for API testing

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd school-bus-tracking-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your database and API configurations:

   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE_URL=postgresql://user:password@localhost:5432/school_bus_dev
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-refresh-token-secret
   REDIS_URL=redis://localhost:6379
   GOOGLE_MAPS_API_KEY=your-maps-api-key
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run database migrations
   npm run prisma:migrate

   # Seed database with test data
   npm run prisma:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

### 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test auth.test.ts

# Run tests in watch mode
npm run test:watch
```

### 📚 API Documentation

- **Complete API Documentation**: [API.md](API.md)
- **Interactive API Explorer**: `http://localhost:3000/api-docs` (when running)
- **Postman Collection**: Available in `/docs` folder

### 🔍 Key Endpoints

```typescript
// Authentication
POST /api/auth/login
GET  /api/auth/me

// Bus Management
GET  /api/buses
POST /api/buses

// GPS Tracking
POST /api/tracking/record
GET  /api/tracking/current/:busId

// Student Management
GET  /api/students
POST /api/students/:studentId/attendance/manual

// Emergency System
POST /api/safety/sos
GET  /api/safety/alerts/active

// Admin Dashboard
GET  /api/admin/dashboard
GET  /api/admin/analytics/users

// Driver App
GET  /api/driver/dashboard
POST /api/driver/trips/start
```

---

## 📊 Database Schema

The system uses a comprehensive PostgreSQL database with the following main entities:

### Core Entities

- **Users**: Multi-role user management (Admin, School Staff, Driver, Parent)
- **Schools**: Educational institution management
- **Buses**: Fleet management with driver assignments
- **Students**: Student profiles with attendance tracking
- **Routes**: Transportation routes with stops and schedules

### Tracking & Communication

- **GPSTracking**: Real-time location data with Redis caching
- **Trips**: Trip management with start/end times and status
- **Attendance**: Student pickup/drop-off tracking
- **Messages**: In-app communication between stakeholders
- **Notifications**: Push notifications and alerts

### Safety & Security

- **EmergencyAlerts**: Incident reporting and management
- **Geofences**: Virtual boundaries for safety monitoring
- **SpeedViolations**: Speed limit enforcement tracking

### Relationships

```
User (1) ──── (M) SchoolStaff/School
School (1) ──── (M) Bus/Student/Staff
Bus (1) ──── (1) Driver
Bus (1) ──── (M) Route/GPSTracking/Trip
Route (1) ──── (M) RouteStop
RouteStop (M) ──── (M) Student (via StudentRouteAssignment)
Trip (1) ──── (M) Attendance
```

---

## 🔌 Real-time Features

### Socket.IO Events

#### Bus Tracking

```javascript
// Listen for location updates
socket.on("location_update", (data) => {
  console.log("Bus moved:", data);
});

// Bus status changes
socket.on("bus_status_change", (data) => {
  console.log("Bus status:", data);
});
```

#### Trip Management

```javascript
// Trip lifecycle events
socket.on("trip_started", (data) => {
  console.log("Trip started:", data);
});

socket.on("trip_updated", (data) => {
  console.log("Trip updated:", data);
});

// Student attendance
socket.on("student_pickup", (data) => {
  console.log("Student picked up:", data);
});

socket.on("student_drop", (data) => {
  console.log("Student dropped off:", data);
});
```

#### Emergency System

```javascript
// Emergency alerts
socket.on("sos_alert", (data) => {
  console.log("EMERGENCY:", data);
});

socket.on("geofence_violation", (data) => {
  console.log("Geofence violation:", data);
});

socket.on("speed_violation", (data) => {
  console.log("Speed violation:", data);
});
```

#### Communication

```javascript
// Real-time messaging
socket.on("new_message", (data) => {
  console.log("New message:", data);
});

socket.on("notification", (data) => {
  console.log("New notification:", data);
});
```

### Connection Setup

```javascript
import io from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: { token: "your_jwt_token" },
});

// Join specific rooms
socket.emit("join_bus", { busId: "bus_123" });
socket.emit("join_trip", { tripId: "trip_456" });
```

---

## 🚢 Deployment

### Production Environment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Environment Variables**

   ```env
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://user:password@prod-db:5432/school_bus_prod
   REDIS_URL=redis://prod-redis:6379
   JWT_SECRET=your-production-jwt-secret
   ```

3. **Docker Deployment**

   ```bash
   # Build Docker image
   docker build -t school-bus-api .

   # Run with Docker Compose
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Process Management**

   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start dist/server.js --name "school-bus-api"

   # Or using systemd
   sudo cp deploy/school-bus-api.service /etc/systemd/system/
   sudo systemctl enable school-bus-api
   sudo systemctl start school-bus-api
   ```

### Monitoring & Health Checks

- **Health Check Endpoint**: `GET /api/health`
- **Database Connectivity**: `GET /api/health/database`
- **External Services**: `GET /api/health/services`
- **Metrics Endpoint**: `GET /api/admin/performance/metrics`

---

## 🧪 Testing Strategy

### Test Categories

- **Unit Tests**: Individual functions and utilities
- **Integration Tests**: API endpoints and database operations
- **End-to-End Tests**: Complete user workflows
- **Performance Tests**: Load testing and stress testing

### Test Structure

```
tests/
├── auth.test.ts         # Authentication & authorization
├── bus.test.ts          # Bus management APIs
├── tracking.test.ts     # GPS tracking functionality
├── student.test.ts      # Student management
├── safety.test.ts       # Emergency and safety features
├── communication.test.ts # Messaging system
├── admin.test.ts        # Admin dashboard
├── driver.test.ts       # Driver mobile app
├── setup.ts            # Test configuration
└── helpers/            # Test utilities
```

### Running Tests

```bash
# All tests
npm test

# With coverage report
npm run test:coverage

# Specific test file
npm test -- auth.test.ts

# Watch mode for development
npm run test:watch
```

### Test Coverage Goals

- **Statements**: 80%+
- **Branches**: 70%+
- **Functions**: 75%+
- **Lines**: 80%+

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update API documentation for endpoint changes
- Ensure all tests pass before submitting PR
- Follow conventional commit messages

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check

# Pre-commit checks
npm run pre-commit
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

- **API Documentation**: [API.md](API.md)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Email**: support@schoolbusapi.com

---

**🎓 Complete School Transportation Management Solution**

Built for safety, efficiency, and peace of mind in school transportation operations.

- **GPS Tracking**: Real-time bus location tracking with historical data
- **Student Integration**: Student profiles, RFID/NFC attendance tracking
- **Parent Notifications**: Push notifications for bus location and alerts
- **Safety & Security**: Emergency alerts, geofencing, speed monitoring
- **Real-time Communication**: Socket.IO for real-time updates

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **Caching**: Redis
- **Validation**: Express Validator

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database, Redis, and other configurations
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Authentication, validation, error handling
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions (JWT, password hashing)
│   └── models/         # (Future) Additional data models
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Database migrations
├── tests/              # Test files
├── .env.example        # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- Redis (optional, for caching)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run database migrations
   npm run prisma:migrate

   # (Optional) Seed the database
   npm run prisma:seed
   ```

5. **Build and run the application**

   ```bash
   # Development mode
   npm run dev

   # Production build
   npm run build
   npm start
   ```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bus_tracking_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"

# Redis (for caching and real-time features)
REDIS_URL="redis://localhost:6379"

# Email Configuration (for notifications)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# SMS Configuration (optional)
SMS_API_KEY="your-sms-api-key"
SMS_API_SECRET="your-sms-api-secret"

# Google Maps API (for route calculations and maps)
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Push Notification (Firebase)
FCM_SERVER_KEY="your-firebase-server-key"

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH="./uploads"
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `DELETE /api/auth/account` - Deactivate account

### Bus Management

- `POST /api/buses` - Create bus
- `GET /api/buses` - Get all buses (with filtering)
- `GET /api/buses/:id` - Get bus by ID
- `PUT /api/buses/:id` - Update bus
- `DELETE /api/buses/:id` - Delete bus
- `POST /api/buses/:id/assign-driver` - Assign driver to bus
- `POST /api/buses/:id/unassign-driver` - Unassign driver
- `GET /api/buses/:id/stats` - Get bus statistics

### Driver Management

- `POST /api/drivers` - Create driver profile
- `GET /api/drivers` - Get all drivers (with filtering)
- `GET /api/drivers/:id` - Get driver by ID
- `GET /api/drivers/profile/me` - Get current driver's profile
- `PUT /api/drivers/:id` - Update driver profile
- `PUT /api/drivers/profile/me` - Update current driver's profile
- `DELETE /api/drivers/:id` - Delete driver profile
- `POST /api/drivers/:id/assign-bus` - Assign driver to bus
- `POST /api/drivers/:id/unassign-bus` - Unassign driver from bus
- `GET /api/drivers/:id/stats` - Get driver statistics
- `GET /api/drivers/stats/me` - Get current driver's statistics
- `GET /api/drivers/available` - Get available drivers
- `GET /api/drivers/expiring-licenses` - Get drivers with expiring licenses

### Route Management

- `POST /api/routes` - Create route
- `GET /api/routes` - Get all routes (with filtering)
- `GET /api/routes/:id` - Get route by ID
- `PUT /api/routes/:id` - Update route
- `DELETE /api/routes/:id` - Delete route
- `GET /api/routes/:id/stats` - Get route statistics
- `GET /api/routes/school/:schoolId` - Get routes by school

### Route Stops Management

- `POST /api/routes/:id/stops` - Create route stop
- `PUT /api/routes/stops/:stopId` - Update route stop
- `DELETE /api/routes/stops/:stopId` - Delete route stop
- `GET /api/routes/:id/stops` - Get route stops
- `PUT /api/routes/:id/reorder-stops` - Reorder route stops

### Student Route Assignments

- `POST /api/routes/assign-student` - Assign student to route
- `DELETE /api/routes/unassign-student/:studentId/:routeId` - Unassign student from route
- `GET /api/routes/student/:studentId/assignments` - Get student's route assignments
- `GET /api/routes/:id/assignments` - Get route assignments

### GPS Tracking

- `POST /api/tracking` - Record GPS location data
- `POST /api/tracking/bulk` - Bulk record multiple GPS locations
- `GET /api/tracking/bus/:busId/current` - Get current bus location
- `GET /api/tracking/bus/:busId/history` - Get bus location history
- `GET /api/tracking/locations` - Get multiple buses' locations
- `GET /api/tracking/dashboard` - Get real-time dashboard data
- `GET /api/tracking/bus/:busId/speed-analysis` - Analyze bus speed patterns
- `GET /api/tracking/bus/:busId/geofence` - Check geofence status
- `GET /api/tracking/bus/:busId/eta` - Calculate ETA to next stop
- `GET /api/tracking/bus/:busId/stats` - Get tracking statistics
- `GET /api/tracking/bus/:busId/route` - Get bus route for navigation
- `DELETE /api/tracking/cleanup` - Clean up old tracking data

### Students

#### Student Management

- `POST /api/students` - Create a new student
- `GET /api/students` - Get students with filters and pagination
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student information
- `DELETE /api/students/:id` - Delete student (soft delete)

#### Route Assignments

- `POST /api/students/assign-route` - Assign student to route and stop
- `DELETE /api/students/:studentId/routes/:routeId` - Unassign student from route

#### Attendance Tracking

- `POST /api/students/attendance/rfid` - Record RFID attendance
- `POST /api/students/attendance/nfc` - Record NFC attendance
- `POST /api/students/attendance/manual` - Record manual attendance (school staff)
- `GET /api/students/:id/attendance` - Get student's attendance history
- `GET /api/students/attendance/stats/:schoolId` - Get attendance statistics for school
- `GET /api/students/attendance/report` - Get attendance report for date range

#### Tag Management

- `GET /api/students/without-tags` - Get students without RFID/NFC tags
- `POST /api/students/bulk-assign-tags` - Bulk assign RFID/NFC tags

#### Driver Features

- `GET /api/students/manifest/bus/:busId` - Get student manifest for bus/trip

### ETA & Speed Monitoring

#### ETA Calculations

- `GET /api/eta-speed/eta/bus/:busId` - Calculate ETA to next stop
- `GET /api/eta-speed/eta/analyze/:busId` - Analyze ETA performance and delays
- `GET /api/eta-speed/eta/predict/:busId` - Predict ETA based on historical data
- `GET /api/eta-speed/eta/alerts` - Get ETA alerts for delayed buses

#### Speed Monitoring

- `POST /api/eta-speed/speed/monitor/:busId` - Monitor speed and detect violations
- `POST /api/eta-speed/speed/bulk-monitor` - Bulk speed monitoring for multiple buses
- `GET /api/eta-speed/speed/analytics/:busId` - Get speed analytics for a bus
- `GET /api/eta-speed/speed/fleet-stats` - Get fleet-wide speed statistics

#### Speed Violations

- `GET /api/eta-speed/speed/violations/:busId` - Get speed violations for a bus
- `GET /api/eta-speed/speed/violation-stats` - Get speed violation statistics

### Notifications

#### User Notifications

- `GET /api/notifications` - Get user notifications with pagination
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/mark-all-read` - Mark all notifications as read
- `GET /api/notifications/stats` - Get notification statistics

#### Notification Preferences

- `GET /api/notifications/preferences` - Get notification preferences
- `PUT /api/notifications/preferences` - Update notification preferences

#### Administrative

- `POST /api/notifications/test` - Send test notification
- `POST /api/notifications/bulk-send` - Bulk send notifications
- `GET /api/notifications/bus/:busId` - Get notifications for a bus
- `DELETE /api/notifications/cleanup` - Clean up old notifications

### Communication System

#### Messaging

- `POST /api/messages` - Send a message
- `GET /api/messages/conversations` - Get user conversations
- `GET /api/messages/conversation/:otherUserId` - Get conversation with specific user
- `PUT /api/messages/conversation/:otherUserId/read` - Mark conversation as read
- `PUT /api/messages/message/:messageId/read` - Mark specific message as read
- `DELETE /api/messages/message/:messageId` - Delete a message

#### Communication Management

- `GET /api/messages/contacts` - Get allowed communication contacts
- `GET /api/messages/emergency-contacts` - Get emergency contacts
- `GET /api/messages/search` - Search messages
- `GET /api/messages/stats` - Get message statistics
- `GET /api/messages/unread-count` - Get unread message count

#### Emergency Communication

- `POST /api/messages/emergency` - Send emergency message

#### Administrative

- `POST /api/messages/bulk` - Send bulk messages
- `DELETE /api/messages/cleanup` - Clean up old messages

### Safety & Security System

#### Emergency Alerts

- `POST /api/safety/sos` - Trigger SOS or emergency alert
- `POST /api/safety/emergency-sms` - Send emergency SMS

#### Geofence Management

- `POST /api/safety/geofences` - Create geofence for a bus
- `GET /api/safety/geofences/bus/:busId` - Get geofences for a bus
- `PUT /api/safety/geofences/:geofenceId` - Update geofence
- `DELETE /api/safety/geofences/:geofenceId` - Delete geofence
- `POST /api/safety/geofences/check-violation` - Check geofence violations

#### Speed Monitoring

- `POST /api/safety/speed-violation` - Report speed violation

#### Alert Management

- `GET /api/safety/alerts/active` - Get active emergency alerts
- `GET /api/safety/alerts/history` - Get alert history
- `PUT /api/safety/alerts/:alertId/resolve` - Resolve an alert
- `POST /api/safety/alerts/bulk-resolve` - Bulk resolve alerts

#### Safety Reports & Statistics

- `GET /api/safety/reports/safety` - Get comprehensive safety report
- `GET /api/safety/reports/geofence-stats` - Get geofence violation statistics
- `GET /api/safety/reports/speed-stats` - Get speed violation statistics

#### Emergency Contacts & Status

- `GET /api/safety/emergency-contacts` - Get emergency contact list
- `GET /api/safety/status` - Get real-time safety status

#### Administrative

- `DELETE /api/safety/cleanup` - Clean up old alerts

### Driver Mobile App APIs

#### Dashboard & Settings

- `GET /api/driver/dashboard` - Get driver dashboard with current trip and stats
- `GET /api/driver/settings` - Get driver app settings and preferences
- `PUT /api/driver/settings` - Update driver app settings

#### Trip Management

- `POST /api/driver/trips/start` - Start a new trip
- `PUT /api/driver/trips/:tripId` - Update trip status and location
- `GET /api/driver/trips/current` - Get current active trip
- `GET /api/driver/trips/history` - Get trip history with pagination
- `GET /api/driver/trips/:tripId/summary` - Get detailed trip summary

#### Navigation & Routes

- `GET /api/driver/routes` - Get driver's assigned routes
- `GET /api/driver/routes/:routeId` - Get detailed route information
- `POST /api/driver/navigation` - Get navigation data for current trip

#### Student Management

- `POST /api/driver/trips/:tripId/pickup` - Record student pickup
- `POST /api/driver/trips/:tripId/drop` - Record student drop-off
- `GET /api/driver/trips/:tripId/manifest` - Get student manifest for trip
- `GET /api/driver/trips/:tripId/students/:studentId/attendance` - Quick attendance check

#### Stops & Locations

- `GET /api/driver/stops/:stopId` - Get stop details and student list
- `POST /api/driver/location` - Update driver location
- `PUT /api/driver/status` - Update driver availability status

#### Emergency & Safety

- `POST /api/driver/emergency` - Trigger emergency alert from driver

#### Notifications

- `GET /api/driver/notifications` - Get driver notifications
- `PUT /api/driver/notifications/:notificationId/read` - Mark notification as read

#### Reports & Analytics

- `GET /api/driver/reports` - Get driver performance reports

### Admin Dashboard & Management

#### Dashboard Overview

- `GET /api/admin/overview` - Get system overview statistics
- `GET /api/admin/dashboard` - Get complete dashboard data
- `GET /api/admin/activities` - Get recent system activities

#### Analytics & Reports

- `GET /api/admin/analytics/users` - User analytics and metrics
- `GET /api/admin/analytics/fleet` - Fleet analytics and utilization
- `GET /api/admin/analytics/safety` - Safety analytics and alerts
- `GET /api/admin/analytics/communication` - Communication analytics
- `GET /api/admin/analytics/performance` - System performance metrics
- `GET /api/admin/reports/:reportType` - Detailed reports (users, fleet, safety, communication, financial)

#### Data Export

- `GET /api/admin/export` - Export system data (users, buses, students, trips, alerts)

#### System Management

- `POST /api/admin/maintenance` - Run system maintenance
- `GET /api/admin/settings` - Get system settings
- `PUT /api/admin/settings` - Update system settings
- `GET /api/admin/logs` - Get system logs

#### User Management

- `GET /api/admin/users` - Get all users with filtering
- `PUT /api/admin/users/:userId` - Update user information
- `PUT /api/admin/users/:userId/deactivate` - Deactivate user account
- `PUT /api/admin/users/:userId/reactivate` - Reactivate user account

#### Fleet Management

- `GET /api/admin/buses` - Get all buses with filtering

#### School Management

- `GET /api/admin/schools` - Get all schools

### Schools

- `GET /api/schools/:schoolId/buses` - Get buses by school

## User Roles & Permissions

1. **Admin**: Full system access
2. **School Staff**: Manage buses, routes, students in their school
3. **Driver**: View assigned routes, report locations, manage trips
4. **Parent**: View children's bus locations, receive notifications

## Database Schema

The application uses a comprehensive PostgreSQL database with the following main entities:

- **Users**: Authentication and roles
- **Schools**: School information
- **Buses**: Bus details and assignments
- **Drivers**: Driver profiles and performance
- **Routes**: Bus routes and stops
- **Students**: Student profiles and assignments
- **Trips**: Bus trip records
- **GPS Tracking**: Real-time location data
- **Attendance**: Student attendance records
- **Notifications**: Push notifications
- **Messages**: In-app messaging
- **Emergency Alerts**: Safety and emergency features

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## API Documentation

API documentation is available at `/api-docs` when the server is running (if Swagger is implemented).

## Real-time Features

The application uses Socket.IO for real-time communication:

- **Bus Location Updates**: Real-time GPS tracking
- **Emergency Alerts**: Instant notifications
- **Trip Status Updates**: Live trip monitoring
- **Driver-Parent Communication**: Real-time messaging

## Deployment

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Docker (Future Implementation)

```bash
docker build -t bus-tracking-backend .
docker run -p 5000:5000 bus-tracking-backend
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## License

This project is licensed under the MIT License.
