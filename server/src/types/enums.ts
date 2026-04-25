export enum UserRole {
  GUEST = 'guest',
  RECEPTIONIST = 'receptionist',
  HOUSEKEEPING = 'housekeeping',
  MANAGER = 'manager',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked'
}

export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  DIRTY = 'dirty',
  MAINTENANCE = 'maintenance',
  CLEANING = 'cleaning'
}

export enum BookingStatus {
  PENDING_PAYMENT = 'pending_payment',
  CONFIRMED = 'confirmed',
  CONFIRMED_UNPAID = 'confirmed_unpaid',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled'
}

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum HousekeepingStatus {
  DIRTY = 'dirty',
  CLEANING = 'cleaning',
  CLEAN = 'clean',
  OUT_OF_SERVICE = 'out_of_service'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum NotificationType {
  SYSTEM = 'system',
  BOOKING_CONFIRMATION = 'booking_confirmation',
  STATUS_UPDATE = 'status_update',
  REMINDER = 'reminder',
  ASSIGNMENT = 'assignment',
  CHECK_IN = 'check_in',
  CHECK_OUT = 'check_out'
}
