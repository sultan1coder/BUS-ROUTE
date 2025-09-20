"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDriverStatusUpdate = exports.validateDriverEmergency = exports.validateNavigationRequest = exports.validateLocationUpdate = exports.validateStudentDrop = exports.validateStudentPickup = exports.validateTripUpdate = exports.validateTripStart = exports.validateEmergencySMS = exports.validateAlertResolution = exports.validateGeofenceCheck = exports.validateSpeedViolation = exports.validateGeofence = exports.validateSOSAlert = exports.validateSearchMessages = exports.validateBulkMessage = exports.validateSendMessage = exports.validatePagination = exports.validateSchoolId = exports.validateUUID = exports.validateGeofenceCreation = exports.validateEmergencyAlert = exports.validateTripCreation = exports.validateGPSData = exports.validateBulkTagAssignment = exports.validateManualAttendance = exports.validateNFCAttendance = exports.validateRFIDAttendance = exports.validateAttendanceData = exports.validateRouteAssignment = exports.validateStudentCreation = exports.validateStudentData = exports.validateRouteStopUpdate = exports.validateRouteStopCreation = exports.validateRouteUpdate = exports.validateRouteCreation = exports.validateDriverUpdate = exports.validateDriverCreation = exports.validateBusUpdate = exports.validateSchoolUpdate = exports.validateSchoolCreation = exports.validateBusCreation = exports.validatePasswordChange = exports.validatePasswordReset = exports.validateUserLogin = exports.validateUserRegistration = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const types_1 = require("../types");
// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map((err) => ({
                field: err.path || err.param,
                message: err.msg,
                value: err.value,
            })),
        });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
// User validation rules
exports.validateUserRegistration = [
    (0, express_validator_1.body)("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
    (0, express_validator_1.body)("firstName")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("First name must be between 2 and 50 characters"),
    (0, express_validator_1.body)("lastName")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Last name must be between 2 and 50 characters"),
    (0, express_validator_1.body)("role").isIn(Object.values(types_1.UserRole)).withMessage("Invalid user role"),
    (0, express_validator_1.body)("phone")
        .optional()
        .isMobilePhone("any")
        .withMessage("Please provide a valid phone number"),
];
exports.validateUserLogin = [
    (0, express_validator_1.body)("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
];
exports.validatePasswordReset = [
    (0, express_validator_1.body)("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
];
exports.validatePasswordChange = [
    (0, express_validator_1.body)("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),
    (0, express_validator_1.body)("newPassword")
        .isLength({ min: 8 })
        .withMessage("New password must be at least 8 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage("New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
];
// Bus validation rules
exports.validateBusCreation = [
    (0, express_validator_1.body)("plateNumber").trim().notEmpty().withMessage("Plate number is required"),
    (0, express_validator_1.body)("capacity")
        .isInt({ min: 1, max: 100 })
        .withMessage("Capacity must be between 1 and 100"),
    (0, express_validator_1.body)("model").trim().notEmpty().withMessage("Model is required"),
    (0, express_validator_1.body)("year")
        .isInt({ min: 2000, max: new Date().getFullYear() + 1 })
        .withMessage("Please provide a valid year"),
    (0, express_validator_1.body)("color").trim().notEmpty().withMessage("Color is required"),
    (0, express_validator_1.body)("schoolId")
        .isLength({ min: 1 })
        .withMessage("Valid school ID is required"),
];
// School validation rules
exports.validateSchoolCreation = [
    (0, express_validator_1.body)("name")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("School name must be between 2 and 100 characters"),
    (0, express_validator_1.body)("address")
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage("Address must be between 5 and 200 characters"),
    (0, express_validator_1.body)("city")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("City must be between 2 and 50 characters"),
    (0, express_validator_1.body)("state")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("State must be between 2 and 50 characters"),
    (0, express_validator_1.body)("zipCode")
        .trim()
        .matches(/^\d{5}(-\d{4})?$/)
        .withMessage("Zip code must be in format 12345 or 12345-6789"),
    (0, express_validator_1.body)("country")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Country must be between 2 and 50 characters"),
    (0, express_validator_1.body)("phone")
        .optional()
        .trim()
        .matches(/^\+?[\d\s\-\(\)]+$/)
        .withMessage("Please provide a valid phone number"),
    (0, express_validator_1.body)("email")
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email address"),
    (0, express_validator_1.body)("latitude")
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude must be between -90 and 90"),
    (0, express_validator_1.body)("longitude")
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude must be between -180 and 180"),
    (0, express_validator_1.body)("timezone")
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage("Timezone must be between 3 and 50 characters"),
];
exports.validateSchoolUpdate = [
    (0, express_validator_1.body)("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("School name must be between 2 and 100 characters"),
    (0, express_validator_1.body)("address")
        .optional()
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage("Address must be between 5 and 200 characters"),
    (0, express_validator_1.body)("city")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("City must be between 2 and 50 characters"),
    (0, express_validator_1.body)("state")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("State must be between 2 and 50 characters"),
    (0, express_validator_1.body)("zipCode")
        .optional()
        .trim()
        .matches(/^\d{5}(-\d{4})?$/)
        .withMessage("Zip code must be in format 12345 or 12345-6789"),
    (0, express_validator_1.body)("country")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Country must be between 2 and 50 characters"),
    (0, express_validator_1.body)("phone")
        .optional()
        .trim()
        .matches(/^\+?[\d\s\-\(\)]+$/)
        .withMessage("Please provide a valid phone number"),
    (0, express_validator_1.body)("email")
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email address"),
    (0, express_validator_1.body)("latitude")
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude must be between -90 and 90"),
    (0, express_validator_1.body)("longitude")
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude must be between -180 and 180"),
    (0, express_validator_1.body)("timezone")
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage("Timezone must be between 3 and 50 characters"),
];
exports.validateBusUpdate = [
    (0, express_validator_1.body)("plateNumber")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Plate number cannot be empty"),
    (0, express_validator_1.body)("capacity")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Capacity must be between 1 and 100"),
    (0, express_validator_1.body)("model")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Model cannot be empty"),
    (0, express_validator_1.body)("year")
        .optional()
        .isInt({ min: 2000, max: new Date().getFullYear() + 1 })
        .withMessage("Please provide a valid year"),
    (0, express_validator_1.body)("color")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Color cannot be empty"),
];
// Driver validation rules
exports.validateDriverCreation = [
    (0, express_validator_1.body)("licenseNumber")
        .trim()
        .notEmpty()
        .withMessage("License number is required"),
    (0, express_validator_1.body)("licenseExpiry")
        .isISO8601()
        .withMessage("Please provide a valid license expiry date")
        .custom((value) => {
        if (new Date(value) <= new Date()) {
            throw new Error("License expiry date must be in the future");
        }
        return true;
    }),
    (0, express_validator_1.body)("licenseType").trim().notEmpty().withMessage("License type is required"),
    (0, express_validator_1.body)("experienceYears")
        .optional()
        .isInt({ min: 0, max: 50 })
        .withMessage("Experience years must be between 0 and 50"),
    (0, express_validator_1.body)("emergencyContact")
        .trim()
        .notEmpty()
        .withMessage("Emergency contact is required"),
    (0, express_validator_1.body)("emergencyPhone")
        .isMobilePhone("any")
        .withMessage("Please provide a valid emergency phone number"),
];
exports.validateDriverUpdate = [
    (0, express_validator_1.body)("licenseNumber")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("License number cannot be empty"),
    (0, express_validator_1.body)("licenseExpiry")
        .optional()
        .isISO8601()
        .withMessage("Please provide a valid license expiry date")
        .custom((value) => {
        if (new Date(value) <= new Date()) {
            throw new Error("License expiry date must be in the future");
        }
        return true;
    }),
    (0, express_validator_1.body)("licenseType")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("License type cannot be empty"),
    (0, express_validator_1.body)("experienceYears")
        .optional()
        .isInt({ min: 0, max: 50 })
        .withMessage("Experience years must be between 0 and 50"),
    (0, express_validator_1.body)("emergencyContact")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Emergency contact cannot be empty"),
    (0, express_validator_1.body)("emergencyPhone")
        .optional()
        .isMobilePhone("any")
        .withMessage("Please provide a valid emergency phone number"),
    (0, express_validator_1.body)("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean"),
];
// Route validation rules
exports.validateRouteCreation = [
    (0, express_validator_1.body)("name")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Route name must be between 2 and 100 characters"),
    (0, express_validator_1.body)("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters"),
    (0, express_validator_1.body)("schoolId").isUUID().withMessage("Valid school ID is required"),
];
exports.validateRouteUpdate = [
    (0, express_validator_1.body)("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Route name must be between 2 and 100 characters"),
    (0, express_validator_1.body)("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters"),
    (0, express_validator_1.body)("busId")
        .optional()
        .custom((value) => {
        if (value && typeof value !== "string") {
            throw new Error("Bus ID must be a string");
        }
        return true;
    }),
    (0, express_validator_1.body)("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean"),
];
exports.validateRouteStopCreation = [
    (0, express_validator_1.body)("routeId").isUUID().withMessage("Valid route ID is required"),
    (0, express_validator_1.body)("name").trim().notEmpty().withMessage("Stop name is required"),
    (0, express_validator_1.body)("address").trim().notEmpty().withMessage("Address is required"),
    (0, express_validator_1.body)("latitude")
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude must be between -90 and 90"),
    (0, express_validator_1.body)("longitude")
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude must be between -180 and 180"),
    (0, express_validator_1.body)("sequence")
        .isInt({ min: 0 })
        .withMessage("Sequence must be a non-negative integer"),
    (0, express_validator_1.body)("pickupTime")
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage("Pickup time must be in HH:MM format"),
    (0, express_validator_1.body)("dropTime")
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage("Drop time must be in HH:MM format"),
];
exports.validateRouteStopUpdate = [
    (0, express_validator_1.body)("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Stop name cannot be empty"),
    (0, express_validator_1.body)("address")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Address cannot be empty"),
    (0, express_validator_1.body)("latitude")
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude must be between -90 and 90"),
    (0, express_validator_1.body)("longitude")
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude must be between -180 and 180"),
    (0, express_validator_1.body)("sequence")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Sequence must be a non-negative integer"),
    (0, express_validator_1.body)("pickupTime")
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage("Pickup time must be in HH:MM format"),
    (0, express_validator_1.body)("dropTime")
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage("Drop time must be in HH:MM format"),
    (0, express_validator_1.body)("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean"),
];
// Student validation rules
exports.validateStudentData = [
    (0, express_validator_1.body)("firstName")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("First name must be between 2 and 50 characters"),
    (0, express_validator_1.body)("lastName")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Last name must be between 2 and 50 characters"),
    (0, express_validator_1.body)("dateOfBirth")
        .optional()
        .isISO8601()
        .withMessage("Please provide a valid date of birth")
        .custom((value) => {
        if (!value)
            return true; // Optional field
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 3 || age > 18) {
            throw new Error("Student age must be between 3 and 18 years");
        }
        return true;
    }),
    (0, express_validator_1.body)("grade").optional().trim().notEmpty().withMessage("Grade is required"),
    (0, express_validator_1.body)("studentId")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Student ID is required"),
    (0, express_validator_1.body)("schoolId")
        .optional()
        .isUUID()
        .withMessage("Valid school ID is required"),
    (0, express_validator_1.body)("parentId")
        .optional()
        .isUUID()
        .withMessage("Valid parent ID is required"),
    (0, express_validator_1.body)("rfidTag")
        .optional()
        .isLength({ min: 8, max: 20 })
        .withMessage("RFID tag must be between 8 and 20 characters"),
    (0, express_validator_1.body)("nfcTag")
        .optional()
        .isLength({ min: 8, max: 20 })
        .withMessage("NFC tag must be between 8 and 20 characters"),
    (0, express_validator_1.body)("photo").optional().isURL().withMessage("Photo must be a valid URL"),
    (0, express_validator_1.body)("medicalInfo")
        .optional()
        .isLength({ max: 1000 })
        .withMessage("Medical info must be less than 1000 characters"),
    (0, express_validator_1.body)("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean"),
];
exports.validateStudentCreation = [
    (0, express_validator_1.body)("firstName")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("First name must be between 2 and 50 characters"),
    (0, express_validator_1.body)("lastName")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Last name must be between 2 and 50 characters"),
    (0, express_validator_1.body)("dateOfBirth")
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
    (0, express_validator_1.body)("grade").trim().notEmpty().withMessage("Grade is required"),
    (0, express_validator_1.body)("studentId").trim().notEmpty().withMessage("Student ID is required"),
    (0, express_validator_1.body)("schoolId").isUUID().withMessage("Valid school ID is required"),
    (0, express_validator_1.body)("parentId")
        .optional()
        .isUUID()
        .withMessage("Valid parent ID is required"),
    (0, express_validator_1.body)("rfidTag")
        .optional()
        .isLength({ min: 8, max: 20 })
        .withMessage("RFID tag must be between 8 and 20 characters"),
    (0, express_validator_1.body)("nfcTag")
        .optional()
        .isLength({ min: 8, max: 20 })
        .withMessage("NFC tag must be between 8 and 20 characters"),
    (0, express_validator_1.body)("photo").optional().isURL().withMessage("Photo must be a valid URL"),
    (0, express_validator_1.body)("medicalInfo")
        .optional()
        .isLength({ max: 1000 })
        .withMessage("Medical info must be less than 1000 characters"),
];
exports.validateRouteAssignment = [
    (0, express_validator_1.body)("studentId").isUUID().withMessage("Valid student ID is required"),
    (0, express_validator_1.body)("routeId").isUUID().withMessage("Valid route ID is required"),
    (0, express_validator_1.body)("stopId").isUUID().withMessage("Valid stop ID is required"),
];
exports.validateAttendanceData = [
    (0, express_validator_1.body)("busId").isUUID().withMessage("Valid bus ID is required"),
    (0, express_validator_1.body)("action")
        .isIn(["pickup", "drop"])
        .withMessage("Action must be 'pickup' or 'drop'"),
    (0, express_validator_1.body)("timestamp")
        .optional()
        .isISO8601()
        .withMessage("Timestamp must be a valid ISO date"),
    (0, express_validator_1.body)("tripId").optional().isUUID().withMessage("Valid trip ID is required"),
];
exports.validateRFIDAttendance = [
    ...exports.validateAttendanceData,
    (0, express_validator_1.body)("rfidTag").notEmpty().withMessage("RFID tag is required"),
];
exports.validateNFCAttendance = [
    ...exports.validateAttendanceData,
    (0, express_validator_1.body)("nfcTag").notEmpty().withMessage("NFC tag is required"),
];
exports.validateManualAttendance = [
    (0, express_validator_1.body)("studentId").isUUID().withMessage("Valid student ID is required"),
    (0, express_validator_1.body)("tripId").isUUID().withMessage("Valid trip ID is required"),
    (0, express_validator_1.body)("status")
        .isIn(["PRESENT", "ABSENT"])
        .withMessage("Status must be 'PRESENT' or 'ABSENT'"),
    (0, express_validator_1.body)("pickupTime")
        .optional()
        .isISO8601()
        .withMessage("Pickup time must be a valid ISO date"),
    (0, express_validator_1.body)("dropTime")
        .optional()
        .isISO8601()
        .withMessage("Drop time must be a valid ISO date"),
    (0, express_validator_1.body)("notes")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Notes must be less than 500 characters"),
];
exports.validateBulkTagAssignment = [
    (0, express_validator_1.body)("assignments")
        .isArray({ min: 1, max: 100 })
        .withMessage("Assignments must be an array of 1-100 items"),
    (0, express_validator_1.body)("assignments.*.studentId")
        .isUUID()
        .withMessage("Valid student ID is required"),
    (0, express_validator_1.body)("assignments.*.rfidTag")
        .optional()
        .isLength({ min: 8, max: 20 })
        .withMessage("RFID tag must be between 8 and 20 characters"),
    (0, express_validator_1.body)("assignments.*.nfcTag")
        .optional()
        .isLength({ min: 8, max: 20 })
        .withMessage("NFC tag must be between 8 and 20 characters"),
];
// GPS tracking validation
exports.validateGPSData = [
    (0, express_validator_1.body)("busId").isUUID().withMessage("Valid bus ID is required"),
    (0, express_validator_1.body)("latitude")
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude must be between -90 and 90"),
    (0, express_validator_1.body)("longitude")
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude must be between -180 and 180"),
    (0, express_validator_1.body)("speed")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Speed must be a non-negative number"),
    (0, express_validator_1.body)("heading")
        .optional()
        .isFloat({ min: 0, max: 360 })
        .withMessage("Heading must be between 0 and 360 degrees"),
    (0, express_validator_1.body)("accuracy")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Accuracy must be a non-negative number"),
];
// Trip validation
exports.validateTripCreation = [
    (0, express_validator_1.body)("routeId").isUUID().withMessage("Valid route ID is required"),
    (0, express_validator_1.body)("busId").isUUID().withMessage("Valid bus ID is required"),
    (0, express_validator_1.body)("driverId").isUUID().withMessage("Valid driver ID is required"),
    (0, express_validator_1.body)("scheduledStart")
        .isISO8601()
        .withMessage("Please provide a valid scheduled start time"),
    (0, express_validator_1.body)("scheduledEnd")
        .isISO8601()
        .withMessage("Please provide a valid scheduled end time"),
];
// Emergency alert validation
exports.validateEmergencyAlert = [
    (0, express_validator_1.body)("type").trim().notEmpty().withMessage("Alert type is required"),
    (0, express_validator_1.body)("description").trim().notEmpty().withMessage("Description is required"),
    (0, express_validator_1.body)("severity")
        .isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
        .withMessage("Invalid severity level"),
    (0, express_validator_1.body)("location.latitude")
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude must be between -90 and 90"),
    (0, express_validator_1.body)("location.longitude")
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude must be between -180 and 180"),
];
// Geofence validation
exports.validateGeofenceCreation = [
    (0, express_validator_1.body)("busId").isUUID().withMessage("Valid bus ID is required"),
    (0, express_validator_1.body)("name").trim().notEmpty().withMessage("Geofence name is required"),
    (0, express_validator_1.body)("latitude")
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude must be between -90 and 90"),
    (0, express_validator_1.body)("longitude")
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude must be between -180 and 180"),
    (0, express_validator_1.body)("radius")
        .isFloat({ min: 10, max: 5000 })
        .withMessage("Radius must be between 10 and 5000 meters"),
];
// Parameter validation
exports.validateUUID = [
    (0, express_validator_1.param)("id").isLength({ min: 1 }).withMessage("Valid ID is required"),
];
exports.validateSchoolId = [
    (0, express_validator_1.param)("schoolId").isLength({ min: 1 }).withMessage("Valid school ID is required"),
];
// Query parameter validation
exports.validatePagination = [
    (0, express_validator_1.query)("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer")
        .toInt(),
    (0, express_validator_1.query)("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100")
        .toInt(),
];
// Message validation rules
exports.validateSendMessage = [
    (0, express_validator_1.body)("receiverId").isUUID().withMessage("Valid receiver ID is required"),
    (0, express_validator_1.body)("type")
        .isIn(["TEXT", "IMAGE", "EMERGENCY"])
        .withMessage("Message type must be TEXT, IMAGE, or EMERGENCY"),
    (0, express_validator_1.body)("content")
        .trim()
        .notEmpty()
        .withMessage("Message content is required")
        .isLength({ max: 1000 })
        .withMessage("Message content must be less than 1000 characters"),
    (0, express_validator_1.body)("attachment")
        .optional()
        .isURL()
        .withMessage("Attachment must be a valid URL"),
];
exports.validateBulkMessage = [
    (0, express_validator_1.body)("receiverIds")
        .isArray({ min: 1, max: 50 })
        .withMessage("Receiver IDs must be an array of 1-50 items"),
    (0, express_validator_1.body)("receiverIds.*").isUUID().withMessage("Valid receiver ID is required"),
    (0, express_validator_1.body)("type")
        .isIn(["TEXT", "IMAGE", "EMERGENCY"])
        .withMessage("Message type must be TEXT, IMAGE, or EMERGENCY"),
    (0, express_validator_1.body)("content")
        .trim()
        .notEmpty()
        .withMessage("Message content is required")
        .isLength({ max: 1000 })
        .withMessage("Message content must be less than 1000 characters"),
    (0, express_validator_1.body)("attachment")
        .optional()
        .isURL()
        .withMessage("Attachment must be a valid URL"),
];
exports.validateSearchMessages = [
    (0, express_validator_1.query)("query")
        .trim()
        .notEmpty()
        .withMessage("Search query is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Search query must be between 2 and 100 characters"),
];
// Safety validation rules
exports.validateSOSAlert = [
    (0, express_validator_1.body)("type")
        .isIn([
        "SOS",
        "ACCIDENT",
        "BREAKDOWN",
        "MEDICAL_EMERGENCY",
        "THEFT",
        "OTHER",
    ])
        .withMessage("Invalid alert type"),
    (0, express_validator_1.body)("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required")
        .isLength({ max: 500 })
        .withMessage("Description must be less than 500 characters"),
    (0, express_validator_1.body)("busId").optional().isUUID().withMessage("Valid bus ID is required"),
    (0, express_validator_1.body)("driverId")
        .optional()
        .isUUID()
        .withMessage("Valid driver ID is required"),
    (0, express_validator_1.body)("severity")
        .optional()
        .isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
        .withMessage("Invalid severity level"),
    (0, express_validator_1.body)("location.latitude")
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage("Invalid latitude"),
    (0, express_validator_1.body)("location.longitude")
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage("Invalid longitude"),
];
exports.validateGeofence = [
    (0, express_validator_1.body)("busId").isUUID().withMessage("Valid bus ID is required"),
    (0, express_validator_1.body)("name")
        .trim()
        .notEmpty()
        .withMessage("Geofence name is required")
        .isLength({ max: 100 })
        .withMessage("Name must be less than 100 characters"),
    (0, express_validator_1.body)("latitude")
        .isFloat({ min: -90, max: 90 })
        .withMessage("Invalid latitude"),
    (0, express_validator_1.body)("longitude")
        .isFloat({ min: -180, max: 180 })
        .withMessage("Invalid longitude"),
    (0, express_validator_1.body)("radius")
        .isFloat({ min: 10, max: 10000 })
        .withMessage("Radius must be between 10 and 10000 meters"),
    (0, express_validator_1.body)("alertOnEnter")
        .optional()
        .isBoolean()
        .withMessage("alertOnEnter must be a boolean"),
    (0, express_validator_1.body)("alertOnExit")
        .optional()
        .isBoolean()
        .withMessage("alertOnExit must be a boolean"),
];
exports.validateSpeedViolation = [
    (0, express_validator_1.body)("busId").isUUID().withMessage("Valid bus ID is required"),
    (0, express_validator_1.body)("currentSpeed")
        .isFloat({ min: 0 })
        .withMessage("Current speed must be a positive number"),
    (0, express_validator_1.body)("speedLimit")
        .isFloat({ min: 0 })
        .withMessage("Speed limit must be a positive number"),
    (0, express_validator_1.body)("location.latitude")
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage("Invalid latitude"),
    (0, express_validator_1.body)("location.longitude")
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage("Invalid longitude"),
];
exports.validateGeofenceCheck = [
    (0, express_validator_1.body)("busId").isUUID().withMessage("Valid bus ID is required"),
    (0, express_validator_1.body)("latitude")
        .isFloat({ min: -90, max: 90 })
        .withMessage("Invalid latitude"),
    (0, express_validator_1.body)("longitude")
        .isFloat({ min: -180, max: 180 })
        .withMessage("Invalid longitude"),
];
exports.validateAlertResolution = [
    (0, express_validator_1.body)("resolutionNotes")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Resolution notes must be less than 1000 characters"),
];
exports.validateEmergencySMS = [
    (0, express_validator_1.body)("phoneNumber")
        .isMobilePhone("any")
        .withMessage("Valid phone number is required"),
    (0, express_validator_1.body)("message")
        .trim()
        .notEmpty()
        .withMessage("Message is required")
        .isLength({ max: 160 })
        .withMessage("SMS message must be less than 160 characters"),
];
// Driver app validation rules
exports.validateTripStart = [
    (0, express_validator_1.body)("routeId").isUUID().withMessage("Valid route ID is required"),
    (0, express_validator_1.body)("scheduledStartTime")
        .optional()
        .isISO8601()
        .withMessage("Invalid start time format"),
    (0, express_validator_1.body)("notes")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Notes must be less than 500 characters"),
];
exports.validateTripUpdate = [
    (0, express_validator_1.body)("status")
        .optional()
        .isIn(["IN_PROGRESS", "COMPLETED", "CANCELLED", "DELAYED"])
        .withMessage("Invalid trip status"),
    (0, express_validator_1.body)("notes")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Notes must be less than 500 characters"),
    (0, express_validator_1.body)("currentLocation.latitude")
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage("Invalid latitude"),
    (0, express_validator_1.body)("currentLocation.longitude")
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage("Invalid longitude"),
];
exports.validateStudentPickup = [
    (0, express_validator_1.body)("studentId").isUUID().withMessage("Valid student ID is required"),
    (0, express_validator_1.body)("stopId").isUUID().withMessage("Valid stop ID is required"),
    (0, express_validator_1.body)("pickupTime")
        .optional()
        .isISO8601()
        .withMessage("Invalid pickup time format"),
    (0, express_validator_1.body)("location.latitude")
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage("Invalid latitude"),
    (0, express_validator_1.body)("location.longitude")
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage("Invalid longitude"),
];
exports.validateStudentDrop = [
    (0, express_validator_1.body)("studentId").isUUID().withMessage("Valid student ID is required"),
    (0, express_validator_1.body)("stopId").isUUID().withMessage("Valid stop ID is required"),
    (0, express_validator_1.body)("dropTime")
        .optional()
        .isISO8601()
        .withMessage("Invalid drop time format"),
    (0, express_validator_1.body)("location.latitude")
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage("Invalid latitude"),
    (0, express_validator_1.body)("location.longitude")
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage("Invalid longitude"),
];
exports.validateLocationUpdate = [
    (0, express_validator_1.body)("latitude")
        .isFloat({ min: -90, max: 90 })
        .withMessage("Invalid latitude"),
    (0, express_validator_1.body)("longitude")
        .isFloat({ min: -180, max: 180 })
        .withMessage("Invalid longitude"),
    (0, express_validator_1.body)("speed")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Speed must be a positive number"),
    (0, express_validator_1.body)("heading")
        .optional()
        .isFloat({ min: 0, max: 360 })
        .withMessage("Heading must be between 0 and 360"),
    (0, express_validator_1.body)("accuracy")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Accuracy must be a positive number"),
];
exports.validateNavigationRequest = [
    (0, express_validator_1.body)("routeId").isUUID().withMessage("Valid route ID is required"),
    (0, express_validator_1.body)("currentLocation.latitude")
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage("Invalid latitude"),
    (0, express_validator_1.body)("currentLocation.longitude")
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage("Invalid longitude"),
];
exports.validateDriverEmergency = [
    (0, express_validator_1.body)("type")
        .isIn(["SOS", "ACCIDENT", "BREAKDOWN", "MEDICAL_EMERGENCY", "OTHER"])
        .withMessage("Invalid emergency type"),
    (0, express_validator_1.body)("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required")
        .isLength({ max: 500 })
        .withMessage("Description must be less than 500 characters"),
    (0, express_validator_1.body)("location.latitude")
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage("Invalid latitude"),
    (0, express_validator_1.body)("location.longitude")
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage("Invalid longitude"),
];
exports.validateDriverStatusUpdate = [
    (0, express_validator_1.body)("isOnline")
        .optional()
        .isBoolean()
        .withMessage("isOnline must be a boolean"),
    (0, express_validator_1.body)("status")
        .optional()
        .isIn(["AVAILABLE", "ON_TRIP", "BREAK", "OFFLINE"])
        .withMessage("Invalid status"),
];
//# sourceMappingURL=validation.js.map