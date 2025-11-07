/// <reference types="vite/client" />

// Electron API types
interface ElectronAPI {
  // Database operations
  getRooms: () => Promise<any[]>;
  getRoom: (roomId: number) => Promise<any>;
  getGuests: () => Promise<any[]>;
  getReservations: () => Promise<any[]>;
  getRoomReservation: (roomId: number) => Promise<any>;
  testConnection: () => Promise<{ success: boolean; message: string }>;
  
  // Reservation management
  checkDateConflict: (roomId: number, checkInDate: string, checkOutDate: string) => Promise<boolean>;
  createReservation: (data: any) => Promise<{ success: boolean; message: string }>;
  updateReservation: (reservationId: number, data: any) => Promise<{ success: boolean; message: string }>;
  checkoutReservation: (roomId: number) => Promise<{ success: boolean; message: string }>;
  
  // Room management
  addRooms: (roomsData: any[]) => Promise<{ success: boolean; message: string }>;
  removeRooms: (roomIds: number[]) => Promise<{ success: boolean; message: string }>;
  
  // Guest management
  getGuestsWithStats: () => Promise<any[]>;
  getGuestReservations: (guestId: number) => Promise<any[]>;
  updateGuest: (guestId: number, data: any) => Promise<{ success: boolean; message: string }>;
  
  // Room status management
  updateRoomStatus: (roomId: number, status: string) => Promise<{ success: boolean; message: string }>;
  
  // Export data
  exportCSV: (type: string) => Promise<{ success: boolean; data?: any[]; filename?: string; message?: string }>;
  
  // Authentication
  login: (email: string, password: string) => Promise<{ success: boolean; manager?: any; message?: string }>;
  getCurrentManager: (managerId: number) => Promise<{ success: boolean; manager?: any; message?: string }>;
  getManagers: () => Promise<{ success: boolean; managers?: any[]; message?: string }>;
  createManager: (email: string, password: string, fullName: string) => Promise<{ success: boolean; managerId?: number; message?: string }>;
  deleteManager: (managerId: number, currentManagerId: number) => Promise<{ success: boolean; message?: string }>;
  
  // Window controls
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  isWindowMaximized: () => Promise<boolean>;
  
  // Dashboard statistics
  getDashboardStats: (timeFilter: string) => Promise<any>;
}

interface Window {
  electronAPI: ElectronAPI;
}

