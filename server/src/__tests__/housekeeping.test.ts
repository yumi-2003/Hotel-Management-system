import { Response } from 'express';
import { createHousekeepingLog, updateHousekeepingStatus } from '../controllers/housekeepingController';
import HousekeepingLog from '../models/HousekeepingLog';
import Room from '../models/Room';
import { AuthRequest } from '../middleware/auth';

jest.mock('../models/HousekeepingLog');
jest.mock('../models/Room');
jest.mock('../models/Notification');
jest.mock('../models/User');

describe('Housekeeping Controller', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      user: { id: 'staff123', role: 'housekeeping' }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('createHousekeepingLog', () => {
    it('should create a log and update room status', async () => {
      mockRequest.body = { roomId: 'room1', status: 'dirty', task: 'Cleaning' };
      const mockLog = { _id: 'log1', toObject: () => ({ _id: 'log1', roomId: 'room1', status: 'dirty' }) };
      
      (HousekeepingLog.create as jest.Mock).mockResolvedValue(mockLog);
      (HousekeepingLog.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockLog)
      });

      await createHousekeepingLog(mockRequest as AuthRequest, mockResponse as Response);

      expect(HousekeepingLog.create).toHaveBeenCalledWith(expect.objectContaining({ roomId: 'room1' }));
      expect(Room.findByIdAndUpdate).toHaveBeenCalledWith('room1', { status: 'dirty' });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should return 400 if roomId is missing', async () => {
      mockRequest.body = { status: 'dirty' };
      await createHousekeepingLog(mockRequest as AuthRequest, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateHousekeepingStatus', () => {
    it('should update log status and sync room status', async () => {
      mockRequest.params = { id: 'log1' };
      mockRequest.body = { status: 'clean' };
      const mockLog = { 
        _id: 'log1', 
        roomId: 'room1', 
        save: jest.fn().mockResolvedValue(true),
        toObject: () => ({ _id: 'log1', roomId: 'room1' }) 
      };

      (HousekeepingLog.findById as jest.Mock).mockReturnValue(mockLog);
      (HousekeepingLog.findById as jest.Mock).mockReturnValueOnce(mockLog) // for finding log
                                           .mockReturnValueOnce({ // for population
                                              populate: jest.fn().mockReturnThis(),
                                              exec: jest.fn().mockResolvedValue(mockLog)
                                           });

      await updateHousekeepingStatus(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockLog.save).toHaveBeenCalled();
      expect(Room.findByIdAndUpdate).toHaveBeenCalledWith('room1', { status: 'available' });
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });
});
