import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User, { UserRole, UserStatus } from "../models/User";
import { AuthRequest } from "../middleware/auth";

// Roles a Manager is allowed to create/manage (not admin or manager themselves)
const MANAGER_ALLOWED_ROLES = [UserRole.RECEPTIONIST, UserRole.HOUSEKEEPING];
// Roles an Admin is allowed to create as staff
const ADMIN_STAFF_ROLES = [
  UserRole.MANAGER,
  UserRole.RECEPTIONIST,
  UserRole.HOUSEKEEPING,
];

export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const role = req.query.role as string;
    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (role) query.role = role;
    if (status) query.status = status;

    // Managers can only see staff under them (not admin/manager/guest accounts)
    if (req.user?.role === UserRole.MANAGER) {
      query.role =
        role && MANAGER_ALLOWED_ROLES.includes(role as UserRole)
          ? role
          : { $in: MANAGER_ALLOWED_ROLES };
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: page * limit < totalUsers,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

export const createStaffUser = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { fullName, email, phone, password, role } = req.body;
    const requestingRole = req.user?.role;

    // Validate required fields
    if (!fullName || !email || !password || !role) {
      res
        .status(400)
        .json({ message: "Full name, email, password, and role are required" });
      return;
    }

    // Validate role permissions
    if (
      requestingRole === UserRole.MANAGER &&
      !MANAGER_ALLOWED_ROLES.includes(role as UserRole)
    ) {
      res
        .status(403)
        .json({
          message:
            "Managers can only create Receptionist or Housekeeping accounts",
        });
      return;
    }
    if (
      requestingRole === UserRole.ADMIN &&
      !ADMIN_STAFF_ROLES.includes(role as UserRole)
    ) {
      res.status(403).json({ message: "Invalid role for staff creation" });
      return;
    }

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      res
        .status(409)
        .json({ message: "A user with this email already exists" });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      phone,
      passwordHash,
      role,
      status: UserStatus.ACTIVE,
    });

    const userObj = user.toObject() as any;
    delete userObj.passwordHash;
    res.status(201).json(userObj);
  } catch (error) {
    res.status(500).json({ message: "Error creating staff user", error });
  }
};

export const updateUserStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(UserStatus).includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    // Managers can only update status for receptionist/housekeeping
    const targetUser = await User.findById(id);
    if (!targetUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (
      req.user?.role === UserRole.MANAGER &&
      !MANAGER_ALLOWED_ROLES.includes(targetUser.role as UserRole)
    ) {
      res
        .status(403)
        .json({ message: "Insufficient permissions to modify this user" });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    ).select("-passwordHash");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating user status", error });
  }
};

export const updateUserRole = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!Object.values(UserRole).includes(role)) {
      res.status(400).json({ message: "Invalid role" });
      return;
    }

    // Managers can only change roles within their allowed set
    if (
      req.user?.role === UserRole.MANAGER &&
      !MANAGER_ALLOWED_ROLES.includes(role as UserRole)
    ) {
      res
        .status(403)
        .json({
          message:
            "Managers can only assign Receptionist or Housekeeping roles",
        });
      return;
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    // Managers cannot change roles of admin/manager accounts
    if (
      req.user?.role === UserRole.MANAGER &&
      !MANAGER_ALLOWED_ROLES.includes(targetUser.role as UserRole)
    ) {
      res
        .status(403)
        .json({ message: "Insufficient permissions to modify this user" });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { returnDocument: "after" },
    ).select("-passwordHash");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating user role", error });
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Managers can only delete receptionist/housekeeping
    if (
      req.user?.role === UserRole.MANAGER &&
      !MANAGER_ALLOWED_ROLES.includes(user.role as UserRole)
    ) {
      res
        .status(403)
        .json({ message: "Insufficient permissions to delete this user" });
      return;
    }

    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};
