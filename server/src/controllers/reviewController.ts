import { Request, Response } from 'express';
import Review from '../models/Review';
import RoomType from '../models/RoomType';
import { AuthRequest } from '../middleware/auth';

const updateRoomTypeRating = async (roomTypeId: string) => {
  const reviews = await Review.find({ roomTypeId });
  const numReviews = reviews.length;
  const rating = numReviews > 0 
    ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews 
    : 0;

  await RoomType.findByIdAndUpdate(roomTypeId, {
    rating,
    numReviews
  });
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomTypeId, rating, comment } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const review = await Review.create({
      userId,
      roomTypeId,
      rating,
      comment
    });

    await updateRoomTypeRating(roomTypeId);

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error });
  }
};

export const getReviewsByRoomType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomTypeId } = req.params;
    const reviews = await Review.find({ roomTypeId }).populate('userId', 'fullName profileImage');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error });
  }
};

export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.id;

    const review = await Review.findById(id);
    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    if (review.userId.toString() !== userId) {
      res.status(403).json({ message: 'Unauthorized to update this review' });
      return;
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    await updateRoomTypeRating(review.roomTypeId.toString());

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const review = await Review.findById(id);
    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    if (review.userId.toString() !== userId && userRole !== 'admin') {
      res.status(403).json({ message: 'Unauthorized to delete this review' });
      return;
    }

    const roomTypeId = review.roomTypeId.toString();
    await review.deleteOne();

    await updateRoomTypeRating(roomTypeId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error });
  }
};

export const getAllReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'fullName profileImage')
      .populate('roomTypeId', 'typeName')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all reviews', error });
  }
};
