"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reservationController_1 = require("../controllers/reservationController");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.post('/', auth_1.authenticate, reservationController_1.createReservation);
router.get('/my', auth_1.authenticate, reservationController_1.getMyReservations);
router.get('/', auth_1.authenticate, (0, roles_1.authorize)([User_1.UserRole.ADMIN, User_1.UserRole.MANAGER, User_1.UserRole.RECEPTIONIST]), reservationController_1.getReservations);
router.patch('/:id/status', auth_1.authenticate, (0, roles_1.authorize)([User_1.UserRole.ADMIN, User_1.UserRole.MANAGER, User_1.UserRole.RECEPTIONIST]), reservationController_1.updateReservationStatus);
exports.default = router;
