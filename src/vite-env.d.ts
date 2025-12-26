


interface ElectronAPI {
  
  getRooms: () => Promise<any[]>;
  getRoom: (roomId: number) => Promise<any>;
  getGuests: () => Promise<any[]>;
  getReservations: () => Promise<any[]>;
  getRoomReservation: (roomId: number) => Promise<any>;
  testConnection: () => Promise<{ success: boolean; message: string }>;
  
  
  checkDateConflict: (roomId: number, checkInDate: string, checkOutDate: string) => Promise<boolean>;
  createReservation: (data: any) => Promise<{ success: boolean; message: string }>;
  updateReservation: (reservationId: number, data: any) => Promise<{ success: boolean; message: string }>;
  checkoutReservation: (roomId: number) => Promise<{ success: boolean; message: string }>;
  
  
  addRooms: (roomsData: any[]) => Promise<{ success: boolean; message: string }>;
  removeRooms: (roomIds: number[]) => Promise<{ success: boolean; message: string }>;
  
  
  getGuestsWithStats: () => Promise<any[]>;
  getGuestReservations: (guestId: number) => Promise<any[]>;
  updateGuest: (guestId: number, data: any) => Promise<{ success: boolean; message: string }>;
  
  
  updateRoomStatus: (roomId: number, status: string) => Promise<{ success: boolean; message: string }>;
  
  
  exportCSV: (type: string) => Promise<{ success: boolean; data?: any[]; filename?: string; message?: string }>;
  
  
  login: (email: string, password: string) => Promise<{ success: boolean; manager?: any; message?: string }>;
  getCurrentManager: (managerId: number) => Promise<{ success: boolean; manager?: any; message?: string }>;
  getManagers: () => Promise<{ success: boolean; managers?: any[]; message?: string }>;
  createManager: (email: string, password: string, fullName: string, role: string) => Promise<{ success: boolean; managerId?: number; message?: string }>;
  deleteManager: (managerId: number, currentManagerId: number) => Promise<{ success: boolean; message?: string }>;
  
  
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  isWindowMaximized: () => Promise<boolean>;
  
  
  getDashboardStats: (timeFilter: string) => Promise<any>;
}

interface Window {
  electronAPI: ElectronAPI;
}

