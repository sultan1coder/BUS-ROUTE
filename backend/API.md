# School Bus Tracking & Management System - API Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [Bus Management](#bus-management)
   - [Driver Management](#driver-management)
   - [Route Management](#route-management)
   - [GPS Tracking](#gps-tracking)
   - [Student Management](#student-management)
   - [ETA & Speed Monitoring](#eta-speed-monitoring)
   - [Notifications](#notifications)
   - [Communication](#communication)
   - [Safety & Security](#safety-security)
   - [Admin Dashboard](#admin-dashboard)
   - [Driver Mobile App](#driver-mobile-app)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [WebSocket Events](#websocket-events)

## 📖 Overview

This API provides comprehensive school bus tracking and management capabilities including real-time GPS tracking, student attendance, emergency alerts, communication systems, and administrative controls.

### Base URL

```
http://localhost:3000/api
```

### Response Format

All responses follow this structure:

```json
{
  "success": boolean,
  "message": string,
  "data": object|array,
  "meta": object // pagination info
}
```

### Authentication

All endpoints except authentication require JWT token in header:

```
Authorization: Bearer <token>
```

---

## 🔐 Authentication

### POST /auth/login

Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "DRIVER"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

### POST /auth/register

Register new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "DRIVER",
  "phone": "+1234567890"
}
```

### POST /auth/refresh

Refresh JWT token.

**Request Body:**

```json
{
  "refreshToken": "refresh_token_here"
}
```

### GET /auth/me

Get current user profile.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "DRIVER",
    "phone": "+1234567890",
    "isActive": true
  }
}
```

---

## 🚌 Bus Management

### GET /buses

Get all buses with filtering and pagination.

**Query Parameters:**

- `schoolId` (string): Filter by school
- `isActive` (boolean): Filter by active status
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "plateNumber": "ABC-123",
      "model": "Mercedes-Benz Sprinter",
      "capacity": 30,
      "isActive": true,
      "school": {
        "id": "uuid",
        "name": "Springfield Elementary"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

### POST /buses

Create new bus.

**Request Body:**

```json
{
  "plateNumber": "ABC-123",
  "model": "Mercedes-Benz Sprinter",
  "capacity": 30,
  "schoolId": "school_uuid"
}
```

### GET /buses/:busId

Get specific bus details.

### PUT /buses/:busId

Update bus information.

### DELETE /buses/:busId

Deactivate bus.

### PUT /buses/:busId/assign-driver

Assign driver to bus.

**Request Body:**

```json
{
  "driverId": "driver_uuid"
}
```

---

## 👨‍🚗 Driver Management

### GET /drivers

Get all drivers with pagination.

### POST /drivers

Create new driver profile.

**Request Body:**

```json
{
  "userId": "user_uuid",
  "licenseNumber": "DL123456",
  "licenseExpiry": "2025-12-31",
  "experience": 5
}
```

### GET /drivers/:driverId

Get driver details.

### PUT /drivers/:driverId

Update driver information.

### DELETE /drivers/:driverId

Deactivate driver.

### GET /drivers/:driverId/performance

Get driver performance metrics.

---

## 🛣️ Route Management

### GET /routes

Get all routes with filtering.

**Query Parameters:**

- `schoolId` (string): Filter by school
- `isActive` (boolean): Filter by active status

### POST /routes

Create new route.

**Request Body:**

```json
{
  "name": "Morning Route A",
  "description": "Morning pickup route",
  "schoolId": "school_uuid",
  "totalDistance": 25.5,
  "estimatedDuration": 45
}
```

### GET /routes/:routeId

Get route details with stops.

### PUT /routes/:routeId

Update route information.

### DELETE /routes/:routeId

Deactivate route.

### POST /routes/:routeId/stops

Add stop to route.

**Request Body:**

```json
{
  "name": "Oak Street Stop",
  "address": "123 Oak Street",
  "latitude": 40.7128,
  "longitude": -74.006,
  "pickupTime": "08:00",
  "dropTime": "15:30"
}
```

### PUT /routes/:routeId/stops/:stopId

Update route stop.

### DELETE /routes/:routeId/stops/:stopId

Remove stop from route.

---

## 📍 GPS Tracking

### POST /tracking/record

Record GPS location for bus.

**Request Body:**

```json
{
  "busId": "bus_uuid",
  "latitude": 40.7128,
  "longitude": -74.006,
  "speed": 35.5,
  "heading": 90,
  "accuracy": 5
}
```

### GET /tracking/current/:busId

Get current bus location.

**Response:**

```json
{
  "success": true,
  "data": {
    "busId": "bus_uuid",
    "latitude": 40.7128,
    "longitude": -74.006,
    "speed": 35.5,
    "timestamp": "2024-01-15T08:30:00Z",
    "address": "123 Main St, New York, NY"
  }
}
```

### GET /tracking/history/:busId

Get bus location history.

**Query Parameters:**

- `startDate` (string): Start date (ISO format)
- `endDate` (string): End date (ISO format)
- `page` (number): Page number
- `limit` (number): Items per page

### GET /tracking/multiple

Get current locations for multiple buses.

### POST /tracking/analyze-speed

Analyze bus speed patterns.

### POST /tracking/check-geofence

Check geofence violations.

### GET /tracking/stats/:busId

Get tracking statistics for bus.

---

## 👨‍🎓 Student Management

### GET /students

Get all students with filtering.

**Query Parameters:**

- `schoolId` (string): Filter by school
- `grade` (string): Filter by grade
- `parentId` (string): Filter by parent

### POST /students

Create new student profile.

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "2015-05-15",
  "grade": "3rd Grade",
  "schoolId": "school_uuid",
  "parentId": "parent_uuid",
  "emergencyContact": "Jane Doe - 555-0123",
  "medicalInfo": "No known allergies"
}
```

### GET /students/:studentId

Get student details.

### PUT /students/:studentId

Update student information.

### DELETE /students/:studentId

Deactivate student.

### POST /students/:studentId/assign-route

Assign student to route stop.

**Request Body:**

```json
{
  "routeId": "route_uuid",
  "stopId": "stop_uuid"
}
```

### DELETE /students/:studentId/unassign-route

Remove student from route.

### POST /students/:studentId/attendance/rfid

Record RFID attendance.

**Request Body:**

```json
{
  "rfidTag": "ABC123",
  "busId": "bus_uuid",
  "action": "pickup"
}
```

### POST /students/:studentId/attendance/manual

Record manual attendance.

**Request Body:**

```json
{
  "busId": "bus_uuid",
  "action": "pickup",
  "stopId": "stop_uuid"
}
```

### GET /students/:studentId/attendance

Get student attendance history.

### GET /students/attendance/stats

Get attendance statistics.

### GET /students/without-tags

Get students without RFID/NFC tags.

### POST /students/bulk-assign-tags

Bulk assign RFID/NFC tags.

### GET /students/manifest/:busId

Get student manifest for bus.

### GET /students/attendance/report

Get attendance report.

---

## ⏱️ ETA & Speed Monitoring

### GET /eta-speed/calculate/:busId

Calculate ETA to next stop.

**Query Parameters:**

- `nextStopId` (string): Next stop ID

### POST /eta-speed/monitor-speed

Monitor bus speed.

**Request Body:**

```json
{
  "busId": "bus_uuid",
  "currentSpeed": 45.5,
  "speedLimit": 35,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.006
  }
}
```

### GET /eta-speed/analytics/:busId

Get ETA analytics for bus.

### GET /eta-speed/fleet-stats

Get fleet speed statistics.

### GET /eta-speed/predict/:busId

Predict ETA based on historical data.

### GET /eta-speed/violations

Get speed violations.

### GET /eta-speed/violations/stats

Get speed violation statistics.

---

## 🔔 Notifications

### GET /notifications

Get user notifications.

**Query Parameters:**

- `page` (number): Page number
- `limit` (number): Items per page
- `unreadOnly` (boolean): Show only unread

### PUT /notifications/:notificationId/read

Mark notification as read.

### PUT /notifications/read-all

Mark all notifications as read.

### GET /notifications/preferences

Get notification preferences.

### PUT /notifications/preferences

Update notification preferences.

**Request Body:**

```json
{
  "busLocationUpdates": true,
  "studentPickupAlerts": true,
  "studentDropAlerts": true,
  "delayAlerts": true,
  "emergencyAlerts": true,
  "speedViolationAlerts": false,
  "quietHoursStart": "22:00",
  "quietHoursEnd": "07:00"
}
```

### POST /notifications/test

Send test notification.

### POST /notifications/bulk-send

Send bulk notifications.

### GET /notifications/bus/:busId

Get notifications for specific bus.

### DELETE /notifications/cleanup

Clean up old notifications.

### GET /notifications/stats

Get notification statistics.

---

## 💬 Communication

### POST /messages

Send message.

**Request Body:**

```json
{
  "receiverId": "user_uuid",
  "type": "TEXT",
  "content": "Message content",
  "attachment": "optional_file_url"
}
```

### GET /messages/conversations

Get user conversations.

### GET /messages/conversation/:otherUserId

Get conversation with specific user.

### PUT /messages/conversation/:otherUserId/read

Mark conversation as read.

### PUT /messages/message/:messageId/read

Mark specific message as read.

### DELETE /messages/message/:messageId

Delete message.

### GET /messages/contacts

Get allowed communication contacts.

### GET /messages/emergency-contacts

Get emergency contacts.

### GET /messages/search

Search messages.

**Query Parameters:**

- `query` (string): Search term
- `page` (number): Page number
- `limit` (number): Items per page

### GET /messages/stats

Get message statistics.

### GET /messages/unread-count

Get unread message count.

### POST /messages/emergency

Send emergency message.

### POST /messages/bulk

Send bulk messages (admin/school staff only).

### DELETE /messages/cleanup

Clean up old messages (admin only).

---

## 🛡️ Safety & Security

### POST /safety/sos

Trigger SOS emergency alert.

**Request Body:**

```json
{
  "type": "ACCIDENT",
  "description": "Bus accident on Main Street",
  "busId": "bus_uuid",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.006
  }
}
```

### POST /safety/emergency-sms

Send emergency SMS.

**Request Body:**

```json
{
  "phoneNumber": "+1234567890",
  "message": "Emergency alert message"
}
```

### POST /safety/geofences

Create geofence.

**Request Body:**

```json
{
  "busId": "bus_uuid",
  "name": "School Zone",
  "latitude": 40.7128,
  "longitude": -74.006,
  "radius": 500,
  "alertOnEnter": false,
  "alertOnExit": true
}
```

### GET /safety/geofences/bus/:busId

Get geofences for bus.

### PUT /safety/geofences/:geofenceId

Update geofence.

### DELETE /safety/geofences/:geofenceId

Delete geofence.

### POST /safety/geofences/check-violation

Check geofence violations.

**Request Body:**

```json
{
  "busId": "bus_uuid",
  "latitude": 40.7128,
  "longitude": -74.006
}
```

### POST /safety/speed-violation

Report speed violation.

**Request Body:**

```json
{
  "busId": "bus_uuid",
  "currentSpeed": 50,
  "speedLimit": 35,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.006
  }
}
```

### GET /safety/alerts/active

Get active emergency alerts.

### GET /safety/alerts/history

Get alert history.

### PUT /safety/alerts/:alertId/resolve

Resolve emergency alert.

**Request Body:**

```json
{
  "resolutionNotes": "Issue resolved, bus back in service"
}
```

### POST /safety/alerts/bulk-resolve

Bulk resolve alerts.

### GET /safety/reports/safety

Get comprehensive safety report.

### GET /safety/reports/geofence-stats

Get geofence violation statistics.

### GET /safety/reports/speed-stats

Get speed violation statistics.

### GET /safety/emergency-contacts

Get emergency contact list.

### GET /safety/status

Get real-time safety status.

### DELETE /safety/cleanup

Clean up old alerts (admin only).

---

## 📊 Admin Dashboard

### GET /admin/overview

Get system overview statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalBuses": 25,
    "totalDrivers": 30,
    "totalStudents": 1200,
    "totalSchools": 5,
    "activeTrips": 18,
    "activeAlerts": 2,
    "systemHealth": "GOOD",
    "uptime": 86400,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

### GET /admin/dashboard

Get complete dashboard data.

### GET /admin/analytics/users

Get user analytics.

### GET /admin/analytics/fleet

Get fleet analytics.

### GET /admin/analytics/safety

Get safety analytics.

### GET /admin/analytics/communication

Get communication analytics.

### GET /admin/analytics/performance

Get system performance metrics.

### GET /admin/reports/:reportType

Get detailed reports.

**Report Types:**

- `users` - User management report
- `fleet` - Fleet utilization report
- `safety` - Safety incidents report
- `communication` - Communication analytics
- `financial` - Financial performance report

### GET /admin/export

Export system data.

**Query Parameters:**

- `dataType` (string): users|buses|students|trips|alerts
- `format` (string): csv|json|xlsx
- `schoolId` (string): Filter by school
- `startDate` (string): Start date filter
- `endDate` (string): End date filter

### POST /admin/maintenance

Run system maintenance.

### GET /admin/settings

Get system settings.

### PUT /admin/settings

Update system settings.

### GET /admin/logs

Get system logs.

### GET /admin/users

Get all users with advanced filtering.

**Query Parameters:**

- `page`, `limit` - Pagination
- `role` - Filter by role
- `isActive` - Filter by status
- `search` - Search by name/email
- `schoolId` - Filter by school

### PUT /admin/users/:userId

Update user information.

### PUT /admin/users/:userId/deactivate

Deactivate user account.

### PUT /admin/users/:userId/reactivate

Reactivate user account.

### GET /admin/buses

Get all buses with advanced filtering.

### GET /admin/schools

Get all schools.

### GET /admin/activities

Get recent system activities.

---

## 📱 Driver Mobile App

### GET /driver/dashboard

Get driver dashboard overview.

**Response:**

```json
{
  "success": true,
  "data": {
    "driverInfo": {
      /* driver details */
    },
    "currentTrip": {
      /* current trip info */
    },
    "todaysTrips": [
      /* today's trips */
    ],
    "upcomingTrips": [
      /* upcoming trips */
    ],
    "recentActivity": [
      /* recent activities */
    ],
    "statistics": {
      "totalTripsToday": 3,
      "totalStudentsTransported": 85,
      "totalDistance": 45.5,
      "onTimePerformance": 92
    }
  }
}
```

### POST /driver/trips/start

Start a new trip.

**Request Body:**

```json
{
  "routeId": "route_uuid",
  "scheduledStartTime": "2024-01-15T08:00:00Z",
  "notes": "Morning route"
}
```

### PUT /driver/trips/:tripId

Update trip status.

**Request Body:**

```json
{
  "status": "COMPLETED",
  "notes": "Trip completed successfully"
}
```

### GET /driver/trips/current

Get current active trip.

### GET /driver/trips/history

Get trip history.

### GET /driver/trips/:tripId/summary

Get detailed trip summary.

### GET /driver/routes

Get driver's assigned routes.

### GET /driver/routes/:routeId

Get route details.

### POST /driver/navigation

Get navigation data for current trip.

**Request Body:**

```json
{
  "routeId": "route_uuid",
  "currentLocation": {
    "latitude": 40.7128,
    "longitude": -74.006
  }
}
```

### POST /driver/trips/:tripId/pickup

Record student pickup.

**Request Body:**

```json
{
  "studentId": "student_uuid",
  "stopId": "stop_uuid",
  "pickupTime": "2024-01-15T08:15:00Z",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.006
  }
}
```

### POST /driver/trips/:tripId/drop

Record student drop-off.

**Request Body:**

```json
{
  "studentId": "student_uuid",
  "stopId": "stop_uuid",
  "dropTime": "2024-01-15T15:45:00Z",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.006
  }
}
```

### GET /driver/trips/:tripId/manifest

Get student manifest for trip.

### POST /driver/location

Update driver location.

**Request Body:**

```json
{
  "latitude": 40.7128,
  "longitude": -74.006,
  "speed": 35.5,
  "heading": 90,
  "accuracy": 5
}
```

### PUT /driver/status

Update driver status.

**Request Body:**

```json
{
  "isOnline": true,
  "status": "ON_TRIP",
  "currentLocation": {
    "latitude": 40.7128,
    "longitude": -74.006
  }
}
```

### POST /driver/emergency

Trigger emergency alert.

**Request Body:**

```json
{
  "type": "ACCIDENT",
  "description": "Bus accident",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.006
  }
}
```

### GET /driver/notifications

Get driver notifications.

### PUT /driver/notifications/:notificationId/read

Mark notification as read.

### GET /driver/reports

Get driver performance reports.

**Query Parameters:**

- `period` (string): daily|weekly|monthly

### GET /driver/settings

Get driver app settings.

### PUT /driver/settings

Update driver app settings.

---

## 📊 Data Models

### User

```typescript
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'ADMIN' | 'SCHOOL_STAFF' | 'DRIVER' | 'PARENT';
  isActive: boolean;
  avatar?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Bus

```typescript
{
  id: string;
  plateNumber: string;
  model: string;
  capacity: number;
  schoolId: string;
  driverId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Student

```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  grade: string;
  schoolId: string;
  parentId: string;
  rfidTag?: string;
  nfcTag?: string;
  emergencyContact?: string;
  medicalInfo?: string;
  photo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Trip

```typescript
{
  id: string;
  routeId: string;
  busId: string;
  driverId: string;
  scheduledStart: Date;
  actualStart?: Date;
  scheduledEnd: Date;
  actualEnd?: Date;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DELAYED';
  distance?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### EmergencyAlert

```typescript
{
  id: string;
  busId?: string;
  driverId?: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  location?: string; // JSON string
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Notification

```typescript
{
  id: string;
  type: string;
  title: string;
  message: string;
  recipientId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isRead: boolean;
  readAt?: Date;
  sentAt: Date;
  data?: any;
}
```

---

## ❌ Error Handling

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error information"
  }
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

### Validation Errors

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "email",
      "message": "Email is required"
    }
  }
}
```

---

## 🚦 Rate Limiting

API endpoints are protected by rate limiting:

- **General endpoints**: 100 requests per minute per IP
- **Authentication endpoints**: 5 requests per minute per IP
- **Emergency endpoints**: Unlimited (prioritized)
- **Admin endpoints**: 500 requests per minute per user

Rate limit headers included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 🔌 WebSocket Events

Real-time communication via Socket.IO:

### Connection

```javascript
const socket = io("http://localhost:3000", {
  auth: { token: "jwt_token" },
});
```

### Bus Tracking Events

```javascript
// Listen for location updates
socket.on("location_update", (data) => {
  console.log("Bus location:", data);
});

// Listen for bus status changes
socket.on("bus_status_change", (data) => {
  console.log("Bus status:", data);
});
```

### Trip Events

```javascript
// Listen for trip starts
socket.on("trip_started", (data) => {
  console.log("Trip started:", data);
});

// Listen for student pickups/drops
socket.on("student_pickup", (data) => {
  console.log("Student picked up:", data);
});

socket.on("student_drop", (data) => {
  console.log("Student dropped off:", data);
});
```

### Emergency Events

```javascript
// Listen for emergency alerts
socket.on("sos_alert", (data) => {
  console.log("Emergency alert:", data);
});

// Listen for geofence violations
socket.on("geofence_violation", (data) => {
  console.log("Geofence violation:", data);
});

// Listen for speed violations
socket.on("speed_violation", (data) => {
  console.log("Speed violation:", data);
});
```

### Communication Events

```javascript
// Listen for new messages
socket.on("new_message", (data) => {
  console.log("New message:", data);
});

// Listen for notifications
socket.on("notification", (data) => {
  console.log("New notification:", data);
});
```

### Joining Rooms

```javascript
// Join user-specific room
socket.emit("join", { userId: "user_uuid" });

// Join bus-specific room
socket.emit("join_bus", { busId: "bus_uuid" });

// Join trip-specific room
socket.emit("join_trip", { tripId: "trip_uuid" });
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "Authentication"

# Run with coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
├── fixtures/      # Test data
└── helpers/       # Test utilities
```

### Test Categories

- **Authentication Tests**: Login, registration, token validation
- **API Endpoint Tests**: CRUD operations for all resources
- **Business Logic Tests**: Trip management, attendance tracking
- **Real-time Tests**: WebSocket event handling
- **Security Tests**: Authorization, rate limiting
- **Performance Tests**: Load testing, response times

### Test Data

Test database is automatically seeded with:

- Sample schools, users, buses, drivers
- Test routes and stops
- Sample students and parents
- Historical trip and attendance data

---

## 🔧 Development

### Environment Setup

```bash
# Clone repository
git clone <repository-url>
cd school-bus-tracking-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and API keys

# Run database migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start development server
npm run dev
```

### Database Schema Updates

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name <migration-name>

# Reset database (development only)
npx prisma migrate reset
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Run type checking
npm run type-check

# Run tests
npm test
```

### API Documentation Updates

```bash
# Generate API docs
npm run docs:generate

# Serve docs locally
npm run docs:serve
```

---

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/school_bus_prod
JWT_SECRET=your-super-secret-jwt-key
REDIS_URL=redis://localhost:6379
EMAIL_SERVICE_API_KEY=your-email-service-key
SMS_SERVICE_API_KEY=your-sms-service-key
GOOGLE_MAPS_API_KEY=your-maps-api-key
```

### Docker Deployment

```bash
# Build Docker image
docker build -t school-bus-api .

# Run with Docker Compose
docker-compose up -d
```

### Health Checks

```bash
# Health check endpoint
GET /api/health

# Database connectivity check
GET /api/health/database

# External services check
GET /api/health/services
```

---

## 📞 Support

For API support and questions:

- **Documentation**: [API Documentation](API.md)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

### API Versioning

- Current version: `v1`
- Base URL: `http://localhost:3000/api/v1/`
- Breaking changes will be released as new versions

### Changelog

See [CHANGELOG.md](CHANGELOG.md) for version updates and breaking changes.

---

**🎉 Complete School Bus Tracking & Management System API**

This comprehensive API provides all the tools needed for modern school transportation management, from real-time tracking to emergency response, communication, and administrative oversight.
