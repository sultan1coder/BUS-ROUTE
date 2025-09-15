"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const driverController_1 = require("../controllers/driverController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Create driver profile (admin and school staff only)
router.post("/", auth_1.requireSchoolStaff, validation_1.validateDriverCreation, validation_1.handleValidationErrors, driverController_1.DriverController.createDriver);
// Get all drivers with filtering and pagination
router.get("/", validation_1.validatePagination, validation_1.handleValidationErrors, driverController_1.DriverController.getDrivers);
// Get driver by ID
router.get("/:id", validation_1.validateUUID, validation_1.handleValidationErrors, driverController_1.DriverController.getDriverById);
// Get current driver's profile (for drivers)
router.get("/profile/me", auth_1.requireDriver, driverController_1.DriverController.getMyProfile);
// Update driver (admin and school staff only)
router.put("/:id", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.validateDriverUpdate, validation_1.handleValidationErrors, driverController_1.DriverController.updateDriver);
// Update current driver's profile (for drivers)
router.put("/profile/me", auth_1.requireDriver, validation_1.validateDriverUpdate, validation_1.handleValidationErrors, driverController_1.DriverController.updateMyProfile);
// Delete driver (admin and school staff only)
router.delete("/:id", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.handleValidationErrors, driverController_1.DriverController.deleteDriver);
// Assign driver to bus (admin and school staff only)
router.post("/:id/assign-bus", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.handleValidationErrors, driverController_1.DriverController.assignToBus);
// Unassign driver from bus (admin and school staff only)
router.post("/:id/unassign-bus", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.handleValidationErrors, driverController_1.DriverController.unassignFromBus);
// Get driver statistics
router.get("/:id/stats", validation_1.validateUUID, validation_1.handleValidationErrors, driverController_1.DriverController.getDriverStats);
// Get current driver's statistics (for drivers)
router.get("/stats/me", auth_1.requireDriver, driverController_1.DriverController.getMyStats);
// Get available drivers (not assigned to any bus)
router.get("/available", driverController_1.DriverController.getAvailableDrivers);
// Get drivers with expiring licenses (admin and school staff only)
router.get("/expiring-licenses", auth_1.requireSchoolStaff, driverController_1.DriverController.getDriversWithExpiringLicenses);
exports.default = router;
//# sourceMappingURL=driver.js.map