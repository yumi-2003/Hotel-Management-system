"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookingController_1 = require("../controllers/bookingController");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.post('/', auth_1.authenticate, bookingController_1.createBooking);
router.get('/', auth_1.authenticate, (0, roles_1.authorize)([User_1.UserRole.ADMIN, User_1.UserRole.MANAGER, User_1.UserRole.RECEPTIONIST]), bookingController_1.getBookings);
exports.default = router;
