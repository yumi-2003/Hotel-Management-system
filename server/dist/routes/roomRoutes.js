"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const amenityController_1 = require("../controllers/amenityController");
const roomTypeController_1 = require("../controllers/roomTypeController");
const roomController_1 = require("../controllers/roomController");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const User_1 = require("../models/User");
const router = express_1.default.Router();
// Amenities
router.post('/amenities', auth_1.authenticate, (0, roles_1.authorize)([User_1.UserRole.ADMIN, User_1.UserRole.MANAGER]), amenityController_1.createAmenity);
router.get('/amenities', amenityController_1.getAmenities);
// Room Types
router.post('/types', auth_1.authenticate, (0, roles_1.authorize)([User_1.UserRole.ADMIN, User_1.UserRole.MANAGER]), roomTypeController_1.createRoomType);
router.get('/types', roomTypeController_1.getRoomTypes);
// Rooms
router.post('/', auth_1.authenticate, (0, roles_1.authorize)([User_1.UserRole.ADMIN, User_1.UserRole.MANAGER]), roomController_1.createRoom);
router.get('/', roomController_1.getRooms);
router.patch('/:id/status', auth_1.authenticate, (0, roles_1.authorize)([User_1.UserRole.ADMIN, User_1.UserRole.MANAGER, User_1.UserRole.RECEPTIONIST, User_1.UserRole.HOUSEKEEPING]), roomController_1.updateRoomStatus);
exports.default = router;
