// User types
export interface User {
  _id: string;
  fullName: string;
  name?: string; // backward compat alias
  email: string;
  phone?: string;
  profileImage?: string;
  role: 'admin' | 'manager' | 'receptionist' | 'housekeeping' | 'guest';
  createdAt?: string;
}

export interface IReservedRoom {
  roomId: string | Room;
  pricePerNight: number;
  nights: number;
  subtotal: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'receptionist' | 'housekeeping' | 'guest';
}

// Room types
export interface Amenity {
  _id: string;
  name: string;
  icon?: string;
  createdAt: string;
}

export interface RoomType {
  _id: string;
  typeName: string;
  description: string;
  basePrice: number;
  maxAdults: number;
  maxChildren: number;
  maxGuests: number;
  bedType: string;
  sizeSqm?: number;
  images: string[];
  amenities: string[] | Amenity[];
  rating?: number;
  numReviews?: number;
  discount?: number;
  isActive: boolean;
  isFeatured: boolean;
  availability?: {
    total: number;
    available: number;
    reserved: number;
    occupied: number;
    maintenance: number;
  };
  createdAt: string;
}

export interface RoomTypeResponse {
  roomTypes: RoomType[];
  total: number;
  page: number;
  pages: number;
}


export interface Room {
  _id: string;
  roomNumber: string;
  roomType: string | RoomType;
  floor: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'cleaning';
  createdAt: string;
}

// Reservation types
export interface Reservation {
  _id: string;
  reservationCode: string;
  user: string | User;
  roomType: string | RoomType;
  checkInDate: string;
  checkOutDate: string;
  adultsCount: number;
  childrenCount: number;
  guests?: number; // legacy/derived
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  expiresAt: string;
  reservedRooms: IReservedRoom[];
  createdAt: string;
}

export interface CreateReservationRequest {
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  adultsCount: number;
  childrenCount: number;
}

// Booking types
export interface IBookedRoom {
  roomId: string | Room;
  pricePerNight: number;
  nights: number;
  subtotal: number;
}

export interface Booking {
  _id: string;
  bookingCode: string;
  user: string | User;
  room: string | Room;
  guestId?: string | User;
  reservation?: string | Reservation;
  checkInDate: string;
  checkOutDate: string;
  adultsCount: number;
  childrenCount: number;
  guests: number;
  bookedRooms: IBookedRoom[];
  subtotalAmount: number;
  taxAmount: number;
  totalPrice: number;
  status: 'pending_payment' | 'confirmed' | 'confirmed_unpaid' | 'checked_in' | 'checked_out' | 'cancelled';
  createdAt: string;
}

export interface Payment {
  _id: string;
  bookingId: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: string;
}

export interface CreateBookingRequest {
  reservationId: string;
  checkInDate: string;
  checkOutDate: string;
  adultsCount: number;
  childrenCount: number;
  bookedRooms: any[];
  totalPrice: number;
  paymentMethod?: string;
  status?: string;
}

// Housekeeping types
export interface HousekeepingLog {
  _id: string;
  room: string | Room;
  assignedTo: string | User;
  task: string;
  status: 'dirty' | 'cleaning' | 'clean' | 'out_of_service';
  note?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CreateHousekeepingRequest {
  room: string;
  assignedTo: string;
  task: string;
  note?: string;
}

// API Error type
export interface ApiError {
  message: string;
  status?: number;
}

export interface Pool {
  _id: string;
  name: string;
  status: 'open' | 'closed' | 'cleaning' | 'maintenance';
  currentOccupancy: number;
  maxCapacity: number;
  temperature: number;
  openingTime: string;
  closingTime: string;
  notes?: string;
  updatedBy?: string | User;
  updatedAt: string;
}

export interface UpdatePoolRequest {
  notes?: string;
}

export interface PoolSlot {
  _id: string;
  startTime: string;
  endTime: string;
  maxPeople: number;
  currentReserved: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface PoolReservationData {
  _id: string;
  userId: string | User;
  roomId?: string | Room;
  slotId: string | PoolSlot;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CreatePoolReservationRequest {
  slotId: string;
  roomId?: string;
}

export interface Notification {
  _id: string;
  recipient: string | User;
  message: string;
  type: 'assignment' | 'status_update' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: string;
  updatedAt: string;
}
