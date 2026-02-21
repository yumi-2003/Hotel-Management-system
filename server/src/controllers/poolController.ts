import { Request, Response } from 'express';
import Pool from '../models/Pool';
import { AuthRequest } from '../middleware/auth';

export const getPoolStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const pool = await Pool.findOne().populate('updatedBy', 'fullName');
    if (!pool) {
      res.status(404).json({ message: 'Pool status not found' });
      return;
    }
    res.json(pool);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pool status', error });
  }
};

export const updatePoolStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, currentOccupancy, maxCapacity, temperature, openingTime, closingTime, notes } = req.body;
    const userId = req.user?.id;

    let pool = await Pool.findOne();
    
    if (pool) {
      pool.status = status !== undefined ? status : pool.status;
      pool.currentOccupancy = currentOccupancy !== undefined ? currentOccupancy : pool.currentOccupancy;
      pool.maxCapacity = maxCapacity !== undefined ? maxCapacity : pool.maxCapacity;
      pool.temperature = temperature !== undefined ? temperature : pool.temperature;
      pool.openingTime = openingTime !== undefined ? openingTime : pool.openingTime;
      pool.closingTime = closingTime !== undefined ? closingTime : pool.closingTime;
      pool.notes = notes !== undefined ? notes : pool.notes;
      pool.updatedBy = userId as any;
      await pool.save();
    } else {
      pool = await Pool.create({
        status,
        currentOccupancy,
        maxCapacity,
        temperature,
        openingTime,
        closingTime,
        notes,
        updatedBy: userId
      });
    }

    res.json(pool);
  } catch (error) {
    res.status(500).json({ message: 'Error updating pool status', error });
  }
};
