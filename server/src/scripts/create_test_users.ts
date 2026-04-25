import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { UserRole, UserStatus } from '../types/enums';
import dotenv from 'dotenv';

dotenv.config();

const createTestUsers = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found');
    return;
  }

  await mongoose.connect(MONGODB_URI);
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  const testUsers = [
    { fullName: 'Test Admin', email: 'admin@test.com', passwordHash, role: UserRole.ADMIN, status: UserStatus.ACTIVE },
    { fullName: 'Test Manager', email: 'manager@test.com', passwordHash, role: UserRole.MANAGER, status: UserStatus.ACTIVE },
    { fullName: 'Test Receptionist', email: 'receptionist@test.com', passwordHash, role: UserRole.RECEPTIONIST, status: UserStatus.ACTIVE },
    { fullName: 'Test Housekeeping', email: 'hk@test.com', passwordHash, role: UserRole.HOUSEKEEPING, status: UserStatus.ACTIVE },
    { fullName: 'Test Guest', email: 'guest@test.com', passwordHash, role: UserRole.GUEST, status: UserStatus.ACTIVE },
  ];

  for (const userData of testUsers) {
    const existing = await User.findOne({ email: userData.email });
    if (!existing) {
      await User.create(userData);
      console.log(`Created user: ${userData.email}`);
    } else {
      console.log(`User already exists: ${userData.email}`);
    }
  }

  await mongoose.disconnect();
};

createTestUsers();
