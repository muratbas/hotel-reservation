import { contextBridge, ipcRenderer } from 'electron';

console.log('🔧 Preload script loaded');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  getRooms: () => ipcRenderer.invoke('db:get-rooms'),
  getRoom: (roomId: number) => ipcRenderer.invoke('db:get-room', roomId),
  getGuests: () => ipcRenderer.invoke('db:get-guests'),
  getReservations: () => ipcRenderer.invoke('db:get-reservations'),
  getRoomReservation: (roomId: number) => ipcRenderer.invoke('db:get-room-reservation', roomId),
  testConnection: () => ipcRenderer.invoke('db:test-connection'),
  
  // Reservation management
  checkDateConflict: (roomId: number, checkInDate: string, checkOutDate: string) => 
    ipcRenderer.invoke('db:check-date-conflict', roomId, checkInDate, checkOutDate),
  createReservation: (data: any) => ipcRenderer.invoke('db:create-reservation', data),
  updateReservation: (reservationId: number, data: any) => 
    ipcRenderer.invoke('db:update-reservation', reservationId, data),
  checkoutReservation: (roomId: number) => ipcRenderer.invoke('db:checkout-reservation', roomId),
  
  // Room management
  addRooms: (roomsData: any[]) => ipcRenderer.invoke('db:add-rooms', roomsData),
  removeRooms: (roomIds: number[]) => ipcRenderer.invoke('db:remove-rooms', roomIds),
  
  // Guest management
  getGuestsWithStats: () => ipcRenderer.invoke('db:get-guests-with-stats'),
  getGuestReservations: (guestId: number) => ipcRenderer.invoke('db:get-guest-reservations', guestId),
  updateGuest: (guestId: number, data: any) => ipcRenderer.invoke('db:update-guest', guestId, data),
  
  // Room status management
  updateRoomStatus: (roomId: number, status: string) => ipcRenderer.invoke('db:update-room-status', roomId, status),
  
  // Export data
  exportCSV: (type: string) => ipcRenderer.invoke('db:export-csv', type),
  
  // Authentication
  login: (email: string, password: string) => ipcRenderer.invoke('auth:login', email, password),
  getCurrentManager: (managerId: number) => ipcRenderer.invoke('auth:get-current-manager', managerId),
  getManagers: () => ipcRenderer.invoke('auth:get-managers'),
  createManager: (email: string, password: string, fullName: string, role: string) => 
    ipcRenderer.invoke('auth:create-manager', email, password, fullName, role),
  deleteManager: (managerId: number, currentManagerId: number) => 
    ipcRenderer.invoke('auth:delete-manager', managerId, currentManagerId),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  isWindowMaximized: () => ipcRenderer.invoke('window:is-maximized'),

  // Dashboard stats
  getDashboardStats: (timeFilter: string) => ipcRenderer.invoke('db:get-dashboard-stats', timeFilter),
});

console.log('✅ electronAPI exposed to window');

// TypeScript type definitions for the API
export interface ElectronAPI {
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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

