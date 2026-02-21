// User roles
export const UserRole = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  RECEPTIONIST: 'receptionist',
  HOUSEKEEPING: 'housekeeping',
  GUEST: 'guest'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// Role hierarchy and permissions
export const rolePermissions = {
  [UserRole.ADMIN]: ['manage_users', 'manage_rooms', 'manage_bookings', 'manage_housekeeping', 'view_reports'],
  [UserRole.MANAGER]: ['manage_rooms', 'manage_bookings', 'manage_housekeeping', 'view_reports'],
  [UserRole.RECEPTIONIST]: ['manage_bookings', 'view_rooms'],
  [UserRole.HOUSEKEEPING]: ['view_housekeeping', 'update_housekeeping'],
  [UserRole.GUEST]: ['create_reservation', 'view_my_reservations']
};

// Check if user has required role
export const hasRole = (userRole: string | undefined, allowedRoles: string[]): boolean => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};

// Check if user has specific permission
export const hasPermission = (userRole: string | undefined, permission: string): boolean => {
  if (!userRole) return false;
  const permissions = rolePermissions[userRole as UserRole] || [];
  return permissions.includes(permission);
};

// Get dashboard route based on role
export const getDashboardRoute = (role: string | undefined): string => {
  switch (role) {
    case UserRole.ADMIN:
      return '/admin/dashboard';
    case UserRole.MANAGER:
      return '/manager/dashboard';
    case UserRole.RECEPTIONIST:
      return '/receptionist/dashboard';
    case UserRole.HOUSEKEEPING:
      return '/housekeeping/dashboard';
    case UserRole.GUEST:
    default:
      return '/my-reservations';
  }
};
