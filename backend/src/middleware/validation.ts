import {
  body,
  param,
  query,
  validationResult,
  ValidationError,
} from "express-validator";
import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types";

// Handle validation errors
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err: any) => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value,
      })),
    });
    return;
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("role").isIn(Object.values(UserRole)).withMessage("Invalid user role"),
  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),
];

export const validateUserLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const validatePasswordReset = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
];

export const validatePasswordChange = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
];

// Bus validation rules
export const validateBusCreation = [
  body("plateNumber").trim().notEmpty().withMessage("Plate number is required"),
  body("capacity")
    .isInt({ min: 1, max: 100 })
    .withMessage("Capacity must be between 1 and 100"),
  body("model").trim().notEmpty().withMessage("Model is required"),
  body("year")
    .isInt({ min: 2000, max: new Date().getFullYear() + 1 })
    .withMessage("Please provide a valid year"),
  body("color").trim().notEmpty().withMessage("Color is required"),
  body("schoolId")
    .isLength({ min: 1 })
    .withMessage("Valid school ID is required"),
];

// School validation rules
export const validateSchoolCreation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("School name must be between 2 and 100 characters"),
  body("address")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Address must be between 5 and 200 characters"),
  body("city")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),
  body("state")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("State must be between 2 and 50 characters"),
  body("zipCode")
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage("Zip code must be in format 12345 or 12345-6789"),
  body("country")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters"),
  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage("Please provide a valid phone number"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  body("timezone")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Timezone must be between 3 and 50 characters"),
];

export const validateSchoolUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("School name must be between 2 and 100 characters"),
  body("address")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Address must be between 5 and 200 characters"),
  body("city")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),
  body("state")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("State must be between 2 and 50 characters"),
  body("zipCode")
    .optional()
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage("Zip code must be in format 12345 or 12345-6789"),
  body("country")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters"),
  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage("Please provide a valid phone number"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  body("timezone")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Timezone must be between 3 and 50 characters"),
];

export const validateBusUpdate = [
  body("plateNumber")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Plate number cannot be empty"),
  body("capacity")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Capacity must be between 1 and 100"),
  body("model")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Model cannot be empty"),
  body("year")
    .optional()
    .isInt({ min: 2000, max: new Date().getFullYear() + 1 })
    .withMessage("Please provide a valid year"),
  body("color")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Color cannot be empty"),
];

// Driver validation rules
export const validateDriverCreation = [
  body("licenseNumber")
    .trim()
    .notEmpty()
    .withMessage("License number is required"),
  body("licenseExpiry")
    .isISO8601()
    .withMessage("Please provide a valid license expiry date")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("License expiry date must be in the future");
      }
      return true;
    }),
  body("licenseType").trim().notEmpty().withMessage("License type is required"),
  body("experienceYears")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("Experience years must be between 0 and 50"),
  body("emergencyContact")
    .trim()
    .notEmpty()
    .withMessage("Emergency contact is required"),
  body("emergencyPhone")
    .isMobilePhone("any")
    .withMessage("Please provide a valid emergency phone number"),
];

export const validateDriverUpdate = [
  body("licenseNumber")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("License number cannot be empty"),
  body("licenseExpiry")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid license expiry date")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("License expiry date must be in the future");
      }
      return true;
    }),
  body("licenseType")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("License type cannot be empty"),
  body("experienceYears")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("Experience years must be between 0 and 50"),
  body("emergencyContact")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Emergency contact cannot be empty"),
  body("emergencyPhone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Please provide a valid emergency phone number"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

// Route validation rules
export const validateRouteCreation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Route name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  body("schoolId").isUUID().withMessage("Valid school ID is required"),
];

export const validateRouteUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Route name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  body("busId")
    .optional()
    .custom((value) => {
      if (value && typeof value !== "string") {
        throw new Error("Bus ID must be a string");
      }
      return true;
    }),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

export const validateRouteStopCreation = [
  body("routeId").isUUID().withMessage("Valid route ID is required"),
  body("name").trim().notEmpty().withMessage("Stop name is required"),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  body("sequence")
    .isInt({ min: 0 })
    .withMessage("Sequence must be a non-negative integer"),
  body("pickupTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Pickup time must be in HH:MM format"),
  body("dropTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Drop time must be in HH:MM format"),
];

export const validateRouteStopUpdate = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Stop name cannot be empty"),
  body("address")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Address cannot be empty"),
  body("latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  body("sequence")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sequence must be a non-negative integer"),
  body("pickupTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Pickup time must be in HH:MM format"),
  body("dropTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Drop time must be in HH:MM format"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

// Student validation rules
export const validateStudentData = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date of birth")
    .custom((value) => {
      if (!value) return true; // Optional field
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 3 || age > 18) {
        throw new Error("Student age must be between 3 and 18 years");
      }
      return true;
    }),
  body("grade").optional().trim().notEmpty().withMessage("Grade is required"),
  body("studentId")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Student ID is required"),
  body("schoolId")
    .optional()
    .isUUID()
    .withMessage("Valid school ID is required"),
  body("parentId")
    .optional()
    .isUUID()
    .withMessage("Valid parent ID is required"),
  body("rfidTag")
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage("RFID tag must be between 8 and 20 characters"),
  body("nfcTag")
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage("NFC tag must be between 8 and 20 characters"),
  body("photo").optional().isURL().withMessage("Photo must be a valid URL"),
  body("medicalInfo")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Medical info must be less than 1000 characters"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

export const validateStudentCreation = [
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("dateOfBirth")
    .isISO8601()
    .withMessage("Please provide a valid date of birth")
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 3 || age > 18) {
        throw new Error("Student age must be between 3 and 18 years");
      }
      return true;
    }),
  body("grade").trim().notEmpty().withMessage("Grade is required"),
  body("studentId").trim().notEmpty().withMessage("Student ID is required"),
  body("schoolId").trim().notEmpty().withMessage("Valid school ID is required"),
  body("parentId")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Valid parent ID is required"),
  body("rfidTag")
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage("RFID tag must be between 8 and 20 characters"),
  body("nfcTag")
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage("NFC tag must be between 8 and 20 characters"),
  body("photo").optional().isURL().withMessage("Photo must be a valid URL"),
  body("medicalInfo")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Medical info must be less than 1000 characters"),
];

export const validateRouteAssignment = [
  body("studentId").isUUID().withMessage("Valid student ID is required"),
  body("routeId").isUUID().withMessage("Valid route ID is required"),
  body("stopId").isUUID().withMessage("Valid stop ID is required"),
];

export const validateAttendanceData = [
  body("busId").isUUID().withMessage("Valid bus ID is required"),
  body("action")
    .isIn(["pickup", "drop"])
    .withMessage("Action must be 'pickup' or 'drop'"),
  body("timestamp")
    .optional()
    .isISO8601()
    .withMessage("Timestamp must be a valid ISO date"),
  body("tripId").optional().isUUID().withMessage("Valid trip ID is required"),
];

export const validateRFIDAttendance = [
  ...validateAttendanceData,
  body("rfidTag").notEmpty().withMessage("RFID tag is required"),
];

export const validateNFCAttendance = [
  ...validateAttendanceData,
  body("nfcTag").notEmpty().withMessage("NFC tag is required"),
];

export const validateManualAttendance = [
  body("studentId").isUUID().withMessage("Valid student ID is required"),
  body("tripId").isUUID().withMessage("Valid trip ID is required"),
  body("status")
    .isIn(["PRESENT", "ABSENT"])
    .withMessage("Status must be 'PRESENT' or 'ABSENT'"),
  body("pickupTime")
    .optional()
    .isISO8601()
    .withMessage("Pickup time must be a valid ISO date"),
  body("dropTime")
    .optional()
    .isISO8601()
    .withMessage("Drop time must be a valid ISO date"),
  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes must be less than 500 characters"),
];

export const validateBulkTagAssignment = [
  body("assignments")
    .isArray({ min: 1, max: 100 })
    .withMessage("Assignments must be an array of 1-100 items"),
  body("assignments.*.studentId")
    .isUUID()
    .withMessage("Valid student ID is required"),
  body("assignments.*.rfidTag")
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage("RFID tag must be between 8 and 20 characters"),
  body("assignments.*.nfcTag")
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage("NFC tag must be between 8 and 20 characters"),
];

// GPS tracking validation
export const validateGPSData = [
  body("busId").isUUID().withMessage("Valid bus ID is required"),
  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  body("speed")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Speed must be a non-negative number"),
  body("heading")
    .optional()
    .isFloat({ min: 0, max: 360 })
    .withMessage("Heading must be between 0 and 360 degrees"),
  body("accuracy")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Accuracy must be a non-negative number"),
];

// Trip validation
export const validateTripCreation = [
  body("routeId").isUUID().withMessage("Valid route ID is required"),
  body("busId").isUUID().withMessage("Valid bus ID is required"),
  body("driverId").isUUID().withMessage("Valid driver ID is required"),
  body("scheduledStart")
    .isISO8601()
    .withMessage("Please provide a valid scheduled start time"),
  body("scheduledEnd")
    .isISO8601()
    .withMessage("Please provide a valid scheduled end time"),
];

// Emergency alert validation
export const validateEmergencyAlert = [
  body("type").trim().notEmpty().withMessage("Alert type is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("severity")
    .isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
    .withMessage("Invalid severity level"),
  body("location.latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("location.longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
];

// Geofence validation
export const validateGeofenceCreation = [
  body("busId").isUUID().withMessage("Valid bus ID is required"),
  body("name").trim().notEmpty().withMessage("Geofence name is required"),
  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  body("radius")
    .isFloat({ min: 10, max: 5000 })
    .withMessage("Radius must be between 10 and 5000 meters"),
];

// Parameter validation
export const validateUUID = [
  param("id").isLength({ min: 1 }).withMessage("Valid ID is required"),
];

export const validateSchoolId = [
  param("schoolId")
    .isLength({ min: 1 })
    .withMessage("Valid school ID is required"),
];

// Query parameter validation
export const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),
];

// Message validation rules
export const validateSendMessage = [
  body("receiverId").isUUID().withMessage("Valid receiver ID is required"),
  body("type")
    .isIn(["TEXT", "IMAGE", "EMERGENCY"])
    .withMessage("Message type must be TEXT, IMAGE, or EMERGENCY"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Message content is required")
    .isLength({ max: 1000 })
    .withMessage("Message content must be less than 1000 characters"),
  body("attachment")
    .optional()
    .isURL()
    .withMessage("Attachment must be a valid URL"),
];

export const validateBulkMessage = [
  body("receiverIds")
    .isArray({ min: 1, max: 50 })
    .withMessage("Receiver IDs must be an array of 1-50 items"),
  body("receiverIds.*").isUUID().withMessage("Valid receiver ID is required"),
  body("type")
    .isIn(["TEXT", "IMAGE", "EMERGENCY"])
    .withMessage("Message type must be TEXT, IMAGE, or EMERGENCY"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Message content is required")
    .isLength({ max: 1000 })
    .withMessage("Message content must be less than 1000 characters"),
  body("attachment")
    .optional()
    .isURL()
    .withMessage("Attachment must be a valid URL"),
];

export const validateSearchMessages = [
  query("query")
    .trim()
    .notEmpty()
    .withMessage("Search query is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Search query must be between 2 and 100 characters"),
];

// Safety validation rules
export const validateSOSAlert = [
  body("type")
    .isIn([
      "SOS",
      "ACCIDENT",
      "BREAKDOWN",
      "MEDICAL_EMERGENCY",
      "THEFT",
      "OTHER",
    ])
    .withMessage("Invalid alert type"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 500 })
    .withMessage("Description must be less than 500 characters"),
  body("busId").optional().isUUID().withMessage("Valid bus ID is required"),
  body("driverId")
    .optional()
    .isUUID()
    .withMessage("Valid driver ID is required"),
  body("severity")
    .optional()
    .isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
    .withMessage("Invalid severity level"),
  body("location.latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),
  body("location.longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),
];

export const validateGeofence = [
  body("busId").isUUID().withMessage("Valid bus ID is required"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Geofence name is required")
    .isLength({ max: 100 })
    .withMessage("Name must be less than 100 characters"),
  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),
  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),
  body("radius")
    .isFloat({ min: 10, max: 10000 })
    .withMessage("Radius must be between 10 and 10000 meters"),
  body("alertOnEnter")
    .optional()
    .isBoolean()
    .withMessage("alertOnEnter must be a boolean"),
  body("alertOnExit")
    .optional()
    .isBoolean()
    .withMessage("alertOnExit must be a boolean"),
];

export const validateSpeedViolation = [
  body("busId").isUUID().withMessage("Valid bus ID is required"),
  body("currentSpeed")
    .isFloat({ min: 0 })
    .withMessage("Current speed must be a positive number"),
  body("speedLimit")
    .isFloat({ min: 0 })
    .withMessage("Speed limit must be a positive number"),
  body("location.latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),
  body("location.longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),
];

export const validateGeofenceCheck = [
  body("busId").isUUID().withMessage("Valid bus ID is required"),
  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),
  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),
];

export const validateAlertResolution = [
  body("resolutionNotes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Resolution notes must be less than 1000 characters"),
];

export const validateEmergencySMS = [
  body("phoneNumber")
    .isMobilePhone("any")
    .withMessage("Valid phone number is required"),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ max: 160 })
    .withMessage("SMS message must be less than 160 characters"),
];

// Driver app validation rules
export const validateTripStart = [
  body("routeId").isUUID().withMessage("Valid route ID is required"),
  body("scheduledStartTime")
    .optional()
    .isISO8601()
    .withMessage("Invalid start time format"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must be less than 500 characters"),
];

export const validateTripUpdate = [
  body("status")
    .optional()
    .isIn(["IN_PROGRESS", "COMPLETED", "CANCELLED", "DELAYED"])
    .withMessage("Invalid trip status"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must be less than 500 characters"),
  body("currentLocation.latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),
  body("currentLocation.longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),
];

export const validateStudentPickup = [
  body("studentId").isUUID().withMessage("Valid student ID is required"),
  body("stopId").isUUID().withMessage("Valid stop ID is required"),
  body("pickupTime")
    .optional()
    .isISO8601()
    .withMessage("Invalid pickup time format"),
  body("location.latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),
  body("location.longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),
];

export const validateStudentDrop = [
  body("studentId").isUUID().withMessage("Valid student ID is required"),
  body("stopId").isUUID().withMessage("Valid stop ID is required"),
  body("dropTime")
    .optional()
    .isISO8601()
    .withMessage("Invalid drop time format"),
  body("location.latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),
  body("location.longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),
];

export const validateLocationUpdate = [
  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),
  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),
  body("speed")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Speed must be a positive number"),
  body("heading")
    .optional()
    .isFloat({ min: 0, max: 360 })
    .withMessage("Heading must be between 0 and 360"),
  body("accuracy")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Accuracy must be a positive number"),
];

export const validateNavigationRequest = [
  body("routeId").isUUID().withMessage("Valid route ID is required"),
  body("currentLocation.latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),
  body("currentLocation.longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),
];

export const validateDriverEmergency = [
  body("type")
    .isIn(["SOS", "ACCIDENT", "BREAKDOWN", "MEDICAL_EMERGENCY", "OTHER"])
    .withMessage("Invalid emergency type"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 500 })
    .withMessage("Description must be less than 500 characters"),
  body("location.latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),
  body("location.longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),
];

export const validateDriverStatusUpdate = [
  body("isOnline")
    .optional()
    .isBoolean()
    .withMessage("isOnline must be a boolean"),
  body("status")
    .optional()
    .isIn(["AVAILABLE", "ON_TRIP", "BREAK", "OFFLINE"])
    .withMessage("Invalid status"),
];
