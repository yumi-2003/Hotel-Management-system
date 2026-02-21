import { Request, Response } from 'express';
import RoomType from '../models/RoomType';
import Room from '../models/Room';

export const createRoomType = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = { ...req.body };
    
    // Handle amenities array from FormData
    if (req.body['amenities[]']) {
      data.amenities = Array.isArray(req.body['amenities[]']) 
        ? req.body['amenities[]'] 
        : [req.body['amenities[]']];
      delete data['amenities[]'];
    }

    const images: string[] = [];
    
    // Add existing images if any (from URL list)
    if (req.body.images) {
      try {
        if (typeof req.body.images === 'string') {
          const parsedImages = JSON.parse(req.body.images);
          const existing = Array.isArray(parsedImages) ? parsedImages : [parsedImages];
          // Filter out empty objects (which fail casting to string)
          images.push(...existing.filter((img: any) => typeof img === 'string' && img.trim() !== ''));
        } else {
          const existing = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
          images.push(...existing.filter((img: any) => typeof img === 'string' && img.trim() !== ''));
        }
      } catch (e) {
        const existing = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        images.push(...existing.filter((img: any) => typeof img === 'string' && img.trim() !== ''));
      }
    }

    // Add newly uploaded images from Cloudinary
    if (req.files && Array.isArray(req.files)) {
      const newImages = (req.files as any[]).map(file => file.path);
      images.push(...newImages);
    }

    data.images = images;

    const roomType = await RoomType.create(data);
    res.status(201).json(roomType);
  } catch (error) {
    res.status(500).json({ message: 'Error creating room type', error });
  }
};

export const getRoomTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const search = req.query.search as string;
    const minPrice = parseInt(req.query.minPrice as string);
    const maxPrice = parseInt(req.query.maxPrice as string);
    const adults = parseInt(req.query.adults as string);
    const children = parseInt(req.query.children as string);
    const amenities = req.query.amenities as string; // Comma separated string of IDs

    const query: any = { isActive: true };

    if (search) {
      query.$or = [
        { typeName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      query.basePrice = {};
      if (!isNaN(minPrice)) query.basePrice.$gte = minPrice;
      if (!isNaN(maxPrice)) query.basePrice.$lte = maxPrice;
    }

    if (!isNaN(adults)) query.maxAdults = { $gte: adults };
    if (!isNaN(children)) query.maxChildren = { $gte: children };

    if (amenities) {
      const amenityIds = amenities.split(',');
      query.amenities = { $all: amenityIds };
    }

    const [roomTypes, total] = await Promise.all([
      RoomType.find(query)
        .populate('amenities')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      RoomType.countDocuments(query)
    ]);

    // Add availability breakdown
    const roomTypesWithAvailability = await Promise.all(roomTypes.map(async (rt) => {
      const rooms = await Room.find({ roomTypeId: rt._id });
      const availability = {
        total: rooms.length,
        available: rooms.filter((r: any) => r.status === 'available').length,
        reserved: rooms.filter((r: any) => r.status === 'reserved').length,
        occupied: rooms.filter((r: any) => r.status === 'occupied').length,
        maintenance: rooms.filter((r: any) => r.status === 'maintenance').length,
      };
      return { ...rt.toObject(), availability };
    }));

    res.json({
      roomTypes: roomTypesWithAvailability,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room types', error });
  }
};

export const getRoomTypeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const roomType = await RoomType.findById(id).populate('amenities');
    
    if (!roomType) {
      res.status(404).json({ message: 'Room type not found' });
      return;
    }

    const rooms = await Room.find({ roomTypeId: id });
    const availability = {
      total: rooms.length,
      available: rooms.filter((r: any) => r.status === 'available').length,
      reserved: rooms.filter((r: any) => r.status === 'reserved').length,
      occupied: rooms.filter((r: any) => r.status === 'occupied').length,
      maintenance: rooms.filter((r: any) => r.status === 'maintenance').length,
    };
    
    res.json({ ...roomType.toObject(), availability });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room type details', error });
  }
};

export const updateRoomType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    // Handle amenities array from FormData
    if (req.body['amenities[]']) {
      data.amenities = Array.isArray(req.body['amenities[]']) 
        ? req.body['amenities[]'] 
        : [req.body['amenities[]']];
      delete data['amenities[]'];
    } else {
      // If amenities[] is not present in FormData during a PUT request, it means empty array
      data.amenities = [];
    }

    const images: string[] = [];

    // Handle existing images passed back from frontend
    if (req.body['existingImages[]']) {
      const existing = Array.isArray(req.body['existingImages[]']) 
        ? req.body['existingImages[]'] 
        : [req.body['existingImages[]']];
      images.push(...existing);
      delete data['existingImages[]'];
    }

    // Add newly uploaded images
    if (req.files && Array.isArray(req.files)) {
      const newImages = (req.files as any[]).map(file => file.path);
      images.push(...newImages);
    }

    // If we have any images (new or existing), update the images field
    if (images.length > 0) {
      data.images = images;
    } else if (req.body.images) {
      // If no new/existing images parsed above, but 'images' field exists in body (might be stringified or simple array)
      try {
        if (typeof req.body.images === 'string') {
          // It could be a stringified array like '["url1", "url2"]' or '[{}]'
          const parsedImages = JSON.parse(req.body.images);
          const arr = Array.isArray(parsedImages) ? parsedImages : [parsedImages];
          data.images = arr.filter((img: any) => typeof img === 'string' && img.trim() !== '');
        } else {
          const arr = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
          data.images = arr.filter((img: any) => typeof img === 'string' && img.trim() !== '');
        }
      } catch (e) {
        // If parsing fails, just use it as is (Mongoose will cast if possible)
        const arr = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        data.images = arr.filter((img: any) => typeof img === 'string' && img.trim() !== '');
      }
    } else {
      // If no images provided at all, set to empty array
      data.images = [];
    }

    const roomType = await RoomType.findByIdAndUpdate(id, data, { returnDocument: 'after' });
    
    if (!roomType) {
      res.status(404).json({ message: 'Room type not found' });
      return;
    }
    
    res.json(roomType);
  } catch (error) {
    res.status(500).json({ message: 'Error updating room type', error });
  }
};

export const deleteRoomType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // We'll do a soft delete by setting isActive to false
    const roomType = await RoomType.findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' });
    
    if (!roomType) {
      res.status(404).json({ message: 'Room type not found' });
      return;
    }
    
    res.json({ message: 'Room type deleted successfully (soft delete)' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting room type', error });
  }
};

