import express from "express";
import {
  createAmenity,
  getAmenities,
  updateAmenity,
  deleteAmenity,
} from "../controllers/amenityController";
import {
  createRoomType,
  getRoomTypes,
  getRoomTypeById,
  updateRoomType,
  deleteRoomType,
} from "../controllers/roomTypeController";
import {
  createRoom,
  getRooms,
  updateRoomStatus,
  createMultipleRooms,
  getRoomCountByType,
} from "../controllers/roomController";
import {
  createReview,
  getReviewsByRoomType,
  updateReview,
  deleteReview,
  getAllReviews,
} from "../controllers/reviewController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/roles";
import { UserRole } from "../models/User";
import { upload } from "../middleware/uploadMiddleware";

const router = express.Router();

// Amenities
router.post(
  "/amenities",
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  createAmenity,
);
router.get("/amenities", getAmenities);
router.put(
  "/amenities/:id",
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  updateAmenity,
);
router.delete(
  "/amenities/:id",
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  deleteAmenity,
);

// Room Types
router.post(
  "/types",
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  upload.array("images", 5),
  createRoomType,
);
router.get("/types", getRoomTypes);
router.get("/types/:id", getRoomTypeById);
router.put(
  "/types/:id",
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  upload.array("images", 5),
  updateRoomType,
);
router.delete(
  "/types/:id",
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  deleteRoomType,
);

// Reviews
router.post("/reviews", authenticate, createReview as any);
router.get("/reviews", getAllReviews);
router.get("/reviews/:roomTypeId", getReviewsByRoomType);
router.put("/reviews/:id", authenticate, updateReview as any);
router.delete("/reviews/:id", authenticate, deleteReview as any);

// Rooms
router.post(
  "/",
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  createRoom,
);
router.post(
  "/bulk",
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  createMultipleRooms,
);
router.get("/count-by-type", getRoomCountByType);
router.get("/", getRooms);
router.patch(
  "/:id/status",
  authenticate,
  authorize([
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.RECEPTIONIST,
    UserRole.HOUSEKEEPING,
  ]),
  updateRoomStatus,
);

export default router;
