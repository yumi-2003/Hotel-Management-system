import request from 'supertest';
import express from 'express';
import { UserRole } from '../models/User';

// MOCK MIDDLEWARES BEFORE IMPORTING ROUTES
jest.mock('../middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    const role = req.headers['x-test-role'];
    if (role) {
      req.user = { id: 'test-user-id', role };
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  }
}));

jest.mock('../middleware/roles', () => ({
  authorize: (roles: string[]) => (req: any, res: any, next: any) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden' });
    }
  }
}));

// NOW IMPORT ROUTES
import roomRoutes from '../routes/roomRoutes';
import userRoutes from '../routes/userRoutes';
import housekeepingRoutes from '../routes/housekeepingRoutes';

const app = express();
app.use(express.json());

app.use('/api/rooms', roomRoutes);
app.use('/api/users', userRoutes);
app.use('/api/housekeeping', housekeepingRoutes);

// Mock the models to avoid DB errors
jest.mock('../models/User', () => ({
  find: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([])
  })
}));

jest.mock('../models/Room', () => ({
  find: jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([])
  }),
  findByIdAndUpdate: jest.fn().mockResolvedValue({})
}));

jest.mock('../models/HousekeepingLog', () => ({
  create: jest.fn().mockResolvedValue({ 
    _id: 'log1', 
    toObject: () => ({ _id: 'log1', roomId: 'room1', staffId: 'staff1' }) 
  }),
  findById: jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue({ _id: 'log1', toObject: () => ({ _id: 'log1' }) })
  })
}));

describe('Final API & RBAC Integration Tests', () => {
  
  it('should ALLOW Admin to access User list', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('x-test-role', UserRole.ADMIN);
    expect(response.status).toBe(200);
  });

  it('should BLOCK Housekeeping from accessing User list', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('x-test-role', UserRole.HOUSEKEEPING);
    expect(response.status).toBe(403);
  });

  it('should ALLOW Housekeeping to create logs', async () => {
    const response = await request(app)
      .post('/api/housekeeping')
      .set('x-test-role', UserRole.HOUSEKEEPING)
      .send({ roomId: 'room1', status: 'dirty', task: 'Cleaning' });
    expect(response.status).toBe(201);
  });

  it('should BLOCK Guest from creating housekeeping logs', async () => {
    const response = await request(app)
      .post('/api/housekeeping')
      .set('x-test-role', UserRole.GUEST)
      .send({ roomId: 'room1', status: 'dirty' });
    expect(response.status).toBe(403);
  });

  it('should ALLOW Guests to view rooms', async () => {
    const response = await request(app)
      .get('/api/rooms')
      .set('x-test-role', UserRole.GUEST);
    expect(response.status).toBe(200);
  });

  it('should BLOCK unauthenticated access (no role header)', async () => {
    const response = await request(app).get('/api/rooms');
    expect(response.status).toBe(401);
  });
});
