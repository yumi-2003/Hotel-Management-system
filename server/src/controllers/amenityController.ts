import { Request, Response } from 'express';
import Amenity from '../models/Amenity';

export const createAmenity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, icon } = req.body;
    const amenity = await Amenity.create({ name, icon });
    res.status(201).json(amenity);
  } catch (error) {
    res.status(500).json({ message: 'Error creating amenity', error });
  }
};

export const getAmenities = async (req: Request, res: Response): Promise<void> => {
  try {
    const amenities = await Amenity.find({ isActive: true });
    res.json(amenities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching amenities', error });
  }
};

export const updateAmenity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const amenity = await Amenity.findByIdAndUpdate(id, req.body, { returnDocument: 'after' });
    
    if (!amenity) {
      res.status(404).json({ message: 'Amenity not found' });
      return;
    }
    
    res.json(amenity);
  } catch (error) {
    res.status(500).json({ message: 'Error updating amenity', error });
  }
};

export const deleteAmenity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const amenity = await Amenity.findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' });
    
    if (!amenity) {
      res.status(404).json({ message: 'Amenity not found' });
      return;
    }
    
    res.json({ message: 'Amenity deleted successfully (soft delete)' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting amenity', error });
  }
};

