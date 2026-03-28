import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authorize } from '../middleware/roles';

jest.mock('jsonwebtoken');

describe('Authentication Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      header: jest.fn().mockReturnValue('Bearer test-token'),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should call next if token is valid', () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: '123', role: 'admin' });
    authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should return 401 if no token is provided', () => {
    mockRequest.header = jest.fn().mockReturnValue(undefined);
    authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
  });

  it('should return 401 if token is invalid', () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });
    authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
  });
});

describe('Authorization Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should call next if user has correct role', () => {
    mockRequest = {
      user: { id: '123', role: 'admin' }
    };
    const adminMiddleware = authorize(['admin']);
    adminMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should return 403 if user has insufficient permissions', () => {
    mockRequest = {
      user: { id: '123', role: 'housekeeping' }
    };
    const adminMiddleware = authorize(['admin']);
    adminMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Forbidden: Insufficient permissions' });
  });

  it('should return 401 if user is not identificed', () => {
    mockRequest = {};
    const adminMiddleware = authorize(['admin']);
    adminMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized: User not identified' });
  });
});
