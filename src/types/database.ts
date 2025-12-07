// Database types matching MySQL schema

export type RoomType = 'Standard' | 'Deluxe' | 'Suite';
export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance';
export type ReservationStatus = 'Active' | 'CheckedOut' | 'Cancelled';
export type UserRole = 'Yönetici' | 'Personel' | 'Manager' | 'Staff'; // Manager | Staff (supports both Turkish and English)

export interface Room {
  RoomId: number;
  RoomNumber: string;
  Type: RoomType;
  Status: RoomStatus;
  CurrentReservationId?: number;
  PricePerNight: number;
  FloorNumber: number;
  MaxGuests: number;
  CreatedAt: Date;
}

export interface Guest {
  GuestId: number;
  FullName: string;
  PhoneNumber: string;
  Email?: string;
  Gender?: string;
  CreatedAt: Date;
}

export interface Reservation {
  ReservationId: number;
  RoomId: number;
  GuestId: number;
  CheckInDate: Date;
  CheckOutDate: Date;
  NumberOfGuests: number;
  StaffNotes?: string;
  Status: ReservationStatus;
  CreatedAt: Date;
  CreatedByManagerId: number;
  // Joined fields
  RoomNumber?: string;
  RoomType?: RoomType;
  GuestName?: string;
  PhoneNumber?: string;
  Email?: string;
  Gender?: string;
}

export interface Manager {
  ManagerId: number;
  Email: string;
  PasswordHash: string;
  FullName: string;
  Role: UserRole;
  CreatedAt: Date;
  LastLoginAt?: Date;
}

