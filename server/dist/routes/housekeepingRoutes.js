"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const housekeepingController_1 = require("../controllers/housekeepingController");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.post('/', auth_1.authenticate, (0, roles_1.authorize)([User_1.UserRole.ADMIN, User_1.UserRole.MANAGER, User_1.UserRole.HOUSEKEEPING]), housekeepingController_1.createHousekeepingLog);
router.get('/', auth_1.authenticate, (0, roles_1.authorize)([User_1.UserRole.ADMIN, User_1.UserRole.MANAGER, User_1.UserRole.RECEPTIONIST, User_1.UserRole.HOUSEKEEPING]), housekeepingController_1.getHousekeepingLogs);
router.patch('/:id/assign', auth_1.authenticate, (0, roles_1.authorize)([User_1.UserRole.ADMIN, User_1.UserRole.MANAGER]), housekeepingController_1.assignHousekeepingTask);
router.patch('/:id/status', auth_1.authenticate, (0, roles_1.authorize)([User_1.UserRole.ADMIN, User_1.UserRole.MANAGER, User_1.UserRole.HOUSEKEEPING]), housekeepingController_1.updateHousekeepingStatus);
exports.default = router;
