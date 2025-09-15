"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const busController_1 = require("../controllers/busController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Create bus (school staff and admin only)
router.post("/", auth_1.requireSchoolStaff, validation_1.validateBusCreation, validation_1.handleValidationErrors, busController_1.BusController.createBus);
// Get all buses with filtering and pagination
router.get("/", validation_1.validatePagination, validation_1.handleValidationErrors, busController_1.BusController.getBuses);
// Get bus by ID
router.get("/:id", validation_1.validateUUID, validation_1.handleValidationErrors, busController_1.BusController.getBusById);
// Update bus (school staff and admin only)
router.put("/:id", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.validateBusUpdate, validation_1.handleValidationErrors, busController_1.BusController.updateBus);
// Delete bus (school staff and admin only)
router.delete("/:id", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.handleValidationErrors, busController_1.BusController.deleteBus);
// Assign driver to bus (school staff and admin only)
router.post("/:id/assign-driver", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.handleValidationErrors, busController_1.BusController.assignDriver);
// Unassign driver from bus (school staff and admin only)
router.post("/:id/unassign-driver", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.handleValidationErrors, busController_1.BusController.unassignDriver);
// Get bus statistics
router.get("/:id/stats", validation_1.validateUUID, validation_1.handleValidationErrors, busController_1.BusController.getBusStats);
// Get buses by school
router.get("/school/:schoolId", validation_1.validateSchoolId, auth_1.authorizeSchoolAccess, validation_1.handleValidationErrors, busController_1.BusController.getBusesBySchool);
exports.default = router;
//# sourceMappingURL=bus.js.map