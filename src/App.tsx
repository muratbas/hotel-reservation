import { useState, useEffect } from 'react';
import type { Room, Manager } from './types/database';
import RoomDetailsModal from './components/RoomDetailsModal';
import NewReservationModal from './components/NewReservationModal';
import RoomManagementModal from './components/RoomManagementModal';
import GuestsPage from './pages/GuestsPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import TitleBar from './components/TitleBar';
import { downloadCSV } from './utils/csvExport';

function App() {
  
  // Authentication state
  const [currentManager, setCurrentManager] = useState<Manager | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'rooms' | 'guests' | 'settings'>('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewReservationModalOpen, setIsNewReservationModalOpen] = useState(false);
  const [isRoomManagementModalOpen, setIsRoomManagementModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 12; // Show 12 rooms per page (4 rooms x 3 floors)

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedRoom(null), 300); // Delay to allow animation
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReservationCreated = () => {
    // Reload rooms to reflect new reservation
    loadRooms();
  };

  const loadRooms = async () => {
    try {
      const roomsData = await window.electronAPI.getRooms();
      setRooms(roomsData);
    } catch (error: any) {
      console.error('Failed to load rooms:', error);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const managerId = localStorage.getItem('managerId');
      if (managerId) {
        try {
          const result = await window.electronAPI.getCurrentManager(parseInt(managerId));
          if (result.success && result.manager) {
            setCurrentManager(result.manager);
          } else {
            localStorage.removeItem('managerId');
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('managerId');
        }
      }
      setAuthLoading(false);
    };
    checkSession();
  }, []);

  useEffect(() => {
    // Only load data if authenticated
    if (!currentManager) return;
    
    // Test database connection and load rooms
    const init = async () => {
      try {
        const result = await window.electronAPI.testConnection();
        setConnected(result.success);
        
        if (result.success) {
          const roomsData = await window.electronAPI.getRooms();
          setRooms(roomsData);
        } else {
          setErrorMessage(result.message || 'Unknown error');
        }
      } catch (error: any) {
        console.error('Failed to connect:', error);
        setErrorMessage(error.message || 'Connection failed');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [currentManager]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter]);

  const handleLogin = (manager: Manager) => {
    setCurrentManager(manager);
  };

  const handleLogout = () => {
    localStorage.removeItem('managerId');
    setCurrentManager(null);
    setRooms([]);
    setCurrentView('rooms');
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-dark">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!currentManager) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Filter rooms by status and type
  const filteredRooms = rooms.filter(room => {
    const matchesStatus = statusFilter === 'All' || room.Status === statusFilter;
    const matchesType = typeFilter === 'All' || room.Type === typeFilter;
    return matchesStatus && matchesType;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
  const startIndex = (currentPage - 1) * roomsPerPage;
  const endIndex = startIndex + roomsPerPage;
  const paginatedRooms = filteredRooms.slice(startIndex, endIndex);

  // Group paginated rooms by floor
  const roomsByFloor = paginatedRooms.reduce((acc, room) => {
    const floor = room.FloorNumber;
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {} as Record<number, Room[]>);

  // Get status counts
  const statusCounts = {
    Available: rooms.filter(r => r.Status === 'Available').length,
    Occupied: rooms.filter(r => r.Status === 'Occupied').length,
    Maintenance: rooms.filter(r => r.Status === 'Maintenance').length,
  };

  // Get type counts
  const typeCounts = {
    Standard: rooms.filter(r => r.Type === 'Standard').length,
    Deluxe: rooms.filter(r => r.Type === 'Deluxe').length,
    Suite: rooms.filter(r => r.Type === 'Suite').length,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  // If we're on the settings page, render it
  if (currentView === 'settings') {
    return <SettingsPage currentManager={currentManager} onNavigate={setCurrentView} />;
  }

  // If we're on the dashboard page (placeholder for now)
  if (currentView === 'dashboard') {
    return (
      <div className="flex flex-col min-h-screen bg-background-dark font-display">
        <TitleBar title="Hotel Reservation - Dashboard" />
        <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-sidebar-dark p-4 flex flex-col justify-between">
          <div>
            {/* Logo and Admin Info */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center bg-primary rounded-full size-10">
                <span className="text-text-primary font-bold text-lg">{currentManager.FullName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-text-primary text-base font-medium">{currentManager.FullName}</h1>
                <p className="text-text-secondary text-sm">{currentManager.Email}</p>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-hover-dark text-text-primary"
              >
                <span className="material-symbols-outlined">dashboard</span>
                <p className="text-sm font-medium">Dashboard</p>
              </button>

              <button 
                onClick={() => setCurrentView('rooms')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-hover-dark transition-colors"
              >
                <span className="material-symbols-outlined">bed</span>
                <p className="text-sm font-medium">Rooms</p>
              </button>

              <button 
                onClick={() => setCurrentView('guests')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-hover-dark transition-colors"
              >
                <span className="material-symbols-outlined">group</span>
                <p className="text-sm font-medium">Guests</p>
              </button>
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setCurrentView('settings')}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-hover-dark transition-colors"
            >
              <span className="material-symbols-outlined">settings</span>
              <p className="text-sm font-medium">Settings</p>
            </button>

            <button 
              onClick={handleLogout}
              className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-blue-600 text-text-primary text-sm font-bold transition-colors"
            >
              <span className="truncate">Logout</span>
            </button>
          </div>
        </aside>

        {/* Dashboard Content */}
        <DashboardPage />
        </div>
      </div>
    );
  }

  // If we're on the guests page, render it instead
  if (currentView === 'guests') {
    return (
      <div className="flex flex-col min-h-screen bg-background-dark font-display">
        <TitleBar title="Hotel Reservation - Guests" />
        <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-sidebar-dark p-4 flex flex-col justify-between">
          <div>
            {/* Logo and Admin Info */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center bg-primary rounded-full size-10">
                <span className="text-text-primary font-bold text-lg">{currentManager.FullName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-text-primary text-base font-medium">{currentManager.FullName}</h1>
                <p className="text-text-secondary text-sm">{currentManager.Email}</p>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-hover-dark transition-colors"
              >
                <span className="material-symbols-outlined">dashboard</span>
                <p className="text-sm font-medium">Dashboard</p>
              </button>

              <button 
                onClick={() => setCurrentView('rooms')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-hover-dark transition-colors"
              >
                <span className="material-symbols-outlined">bed</span>
                <p className="text-sm font-medium">Rooms</p>
              </button>

              <button 
                onClick={() => setCurrentView('guests')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-hover-dark text-text-primary"
              >
                <span className="material-symbols-outlined">group</span>
                <p className="text-sm font-medium">Guests</p>
              </button>
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setCurrentView('settings')}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-hover-dark transition-colors"
            >
              <span className="material-symbols-outlined">settings</span>
              <p className="text-sm font-medium">Settings</p>
            </button>

            <button 
              onClick={handleLogout}
              className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-blue-600 text-text-primary text-sm font-bold transition-colors"
            >
              <span className="truncate">Logout</span>
            </button>
          </div>
        </aside>

        <GuestsPage onNavigate={setCurrentView} />
        </div>
      </div>
    );
  }

  // Rooms view (main floor plan)
  return (
    <div className="flex flex-col min-h-screen bg-background-dark font-display">
      <TitleBar title="Hotel Reservation - Rooms" />
      <div className="flex flex-1">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar-dark p-4 flex flex-col justify-between">
      <div>
          {/* Logo and Admin Info */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center bg-primary rounded-full size-10">
              <span className="text-text-primary font-bold text-lg">{currentManager.FullName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-text-primary text-base font-medium">{currentManager.FullName}</h1>
              <p className="text-text-secondary text-sm">{currentManager.Email}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-hover-dark transition-colors"
            >
              <span className="material-symbols-outlined">dashboard</span>
              <p className="text-sm font-medium">Dashboard</p>
            </button>

            <button 
              onClick={() => setCurrentView('rooms')}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-hover-dark text-text-primary"
            >
              <span className="material-symbols-outlined">bed</span>
              <p className="text-sm font-medium">Rooms</p>
            </button>

            <button 
              onClick={() => setCurrentView('guests')}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-hover-dark transition-colors"
            >
              <span className="material-symbols-outlined">group</span>
              <p className="text-sm font-medium">Guests</p>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => setCurrentView('settings')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-hover-dark transition-colors"
          >
            <span className="material-symbols-outlined">settings</span>
            <p className="text-sm font-medium">Settings</p>
          </button>

          <button 
            onClick={handleLogout}
            className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-blue-600 text-text-primary text-sm font-bold transition-colors"
          >
            <span className="truncate">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-text-primary text-4xl font-black tracking-tight">Floor Plan</h1>
            <p className="text-text-secondary text-base">Visualize room statuses and availability.</p>
          </div>

          <button 
            onClick={() => setIsRoomManagementModalOpen(true)}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-text-primary text-sm font-bold hover:bg-primary/80 transition-colors"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span className="material-symbols-outlined text-base">remove_circle</span>
            <span className="truncate">Rooms</span>
          </button>
        </div>

        {/* Action Buttons Row */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <button 
            onClick={() => setIsNewReservationModalOpen(true)}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-4 bg-green-600 hover:bg-green-700 text-text-primary text-sm font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span className="truncate">New Reservation</span>
          </button>
          <button 
            onClick={() => downloadCSV('rooms')}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-4 bg-blue-600 hover:bg-blue-700 text-text-primary text-sm font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span className="truncate">Export Rooms</span>
          </button>
          <button 
            onClick={() => downloadCSV('reservations')}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-4 bg-purple-600 hover:bg-purple-700 text-text-primary text-sm font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span className="truncate">Export Reservations</span>
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <button 
            onClick={() => setStatusFilter('All')}
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-all ${
              statusFilter === 'All' ? 'bg-primary' : 'bg-hover-dark hover:bg-hover-dark/70'
            }`}
          >
            <p className="text-text-primary text-sm font-medium">All ({rooms.length})</p>
          </button>

          <button 
            onClick={() => setStatusFilter('Available')}
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-all ${
              statusFilter === 'Available' ? 'bg-[#1C4B41]' : 'bg-[#1C4B41]/50 hover:bg-[#1C4B41]/70'
            }`}
          >
            <div className="size-2 rounded-full bg-status-available"></div>
            <p className="text-green-200 text-sm font-medium">Available ({statusCounts.Available})</p>
          </button>

          <button 
            onClick={() => setStatusFilter('Occupied')}
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-all ${
              statusFilter === 'Occupied' ? 'bg-[#4A3A23]' : 'bg-[#4A3A23]/50 hover:bg-[#4A3A23]/70'
            }`}
          >
            <div className="size-2 rounded-full bg-status-occupied"></div>
            <p className="text-yellow-200 text-sm font-medium">Occupied ({statusCounts.Occupied})</p>
          </button>

          <button 
            onClick={() => setStatusFilter('Maintenance')}
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-all ${
              statusFilter === 'Maintenance' ? 'bg-[#4D273A]' : 'bg-[#4D273A]/50 hover:bg-[#4D273A]/70'
            }`}
          >
            <div className="size-2 rounded-full bg-status-maintenance"></div>
            <p className="text-red-200 text-sm font-medium">Maintenance ({statusCounts.Maintenance})</p>
          </button>
        </div>

        {/* Room Type Filters */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <button 
            onClick={() => setTypeFilter('All')}
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-all ${
              typeFilter === 'All' ? 'bg-primary' : 'bg-hover-dark hover:bg-hover-dark/70'
            }`}
          >
            <p className="text-text-primary text-sm font-medium">All Types</p>
          </button>

          <button 
            onClick={() => setTypeFilter('Standard')}
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-all ${
              typeFilter === 'Standard' ? 'bg-blue-600' : 'bg-blue-600/50 hover:bg-blue-600/70'
            }`}
          >
            <span className="material-symbols-outlined text-sm text-blue-200">bed</span>
            <p className="text-blue-200 text-sm font-medium">Standard ({typeCounts.Standard})</p>
          </button>

          <button 
            onClick={() => setTypeFilter('Deluxe')}
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-all ${
              typeFilter === 'Deluxe' ? 'bg-amber-600' : 'bg-amber-600/50 hover:bg-amber-600/70'
            }`}
          >
            <span className="material-symbols-outlined text-sm text-amber-200">star</span>
            <p className="text-amber-200 text-sm font-medium">Deluxe ({typeCounts.Deluxe})</p>
          </button>

          <button 
            onClick={() => setTypeFilter('Suite')}
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-all ${
              typeFilter === 'Suite' ? 'bg-purple-600' : 'bg-purple-600/50 hover:bg-purple-600/70'
            }`}
          >
            <span className="material-symbols-outlined text-sm text-purple-200">workspace_premium</span>
            <p className="text-purple-200 text-sm font-medium">Suite ({typeCounts.Suite})</p>
          </button>
        </div>

        {/* Room Grid */}
        <div className="bg-sidebar-dark p-8 rounded-lg border border-border-color">
          {!connected ? (
            <div className="text-center py-12">
              <p className="text-red-400 text-lg mb-2">❌ Database not connected</p>
              <p className="text-text-secondary">Please check your MySQL connection</p>
              {errorMessage && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500 rounded-lg max-w-md mx-auto">
                  <p className="text-red-300 text-sm font-mono">{errorMessage}</p>
                </div>
              )}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary text-lg">No rooms found for this filter</p>
              <p className="text-text-secondary text-sm mt-2">Try selecting a different status</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.keys(roomsByFloor).sort((a, b) => Number(a) - Number(b)).map(floorNum => (
                <div key={floorNum}>
                  {/* Floor Header */}
                  <h3 className="text-text-primary font-bold text-lg mb-4">
                    Floor {floorNum}
                  </h3>
                  
                  {/* Room Grid for this floor */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {roomsByFloor[Number(floorNum)].map((room) => {
                const statusColor = 
                  room.Status === 'Available' ? 'bg-green-800/20 border-green-500' :
                  room.Status === 'Occupied' ? 'bg-yellow-800/20 border-yellow-500' :
                  'bg-red-800/20 border-red-500';
                
                const dotColor =
                  room.Status === 'Available' ? 'bg-status-available' :
                  room.Status === 'Occupied' ? 'bg-status-occupied' :
                  'bg-status-maintenance';

                const textColor =
                  room.Status === 'Available' ? 'text-green-300' :
                  room.Status === 'Occupied' ? 'text-yellow-300' :
                  'text-red-300';

                return (
                  <div
                    key={room.RoomId}
                    onClick={() => handleRoomClick(room)}
                    className={`group relative p-4 rounded-lg ${statusColor} border cursor-pointer transition-all hover:scale-105`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-text-primary font-bold">{room.RoomNumber}</span>
                      <div className={`size-3 rounded-full ${dotColor}`}></div>
                    </div>
                    <p className={`${textColor} text-sm`}>{room.Status}</p>

                    {/* Hover Details */}
                    <div className="absolute left-0 bottom-full mb-2 w-full bg-card-dark p-3 rounded-lg shadow-lg z-10 hidden group-hover:block">
                      <p className="text-text-primary font-bold">Room {room.RoomNumber}</p>
                      <p className="text-text-secondary">{room.Type}</p>
                      {room.Status === 'Occupied' && (
                        <p className="text-text-primary text-sm mt-1">Guest: Loading...</p>
                      )}
                      </div>
                    </div>
                  );
                })}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 gap-4">
            <p className="text-text-secondary text-sm">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredRooms.length)} of {filteredRooms.length} rooms
            </p>
            <nav className="flex items-center gap-2">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center h-8 w-8 rounded-lg bg-card-dark text-text-primary hover:bg-hover-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                // Show first page, last page, current page, and pages around current
                const showPage = page === 1 || 
                                page === totalPages || 
                                (page >= currentPage - 1 && page <= currentPage + 1);
                
                const showEllipsis = (page === currentPage - 2 && currentPage > 3) ||
                                    (page === currentPage + 2 && currentPage < totalPages - 2);
                
                if (showEllipsis) {
                  return <span key={page} className="text-text-secondary px-2">...</span>;
                }
                
                if (!showPage) return null;
                
                return (
                  <button 
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`flex items-center justify-center h-8 w-8 rounded-lg transition-colors ${
                      currentPage === page 
                        ? 'bg-primary text-text-primary' 
                        : 'bg-card-dark text-text-primary hover:bg-hover-dark'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center h-8 w-8 rounded-lg bg-card-dark text-text-primary hover:bg-hover-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-base">chevron_right</span>
        </button>
            </nav>
          </div>
        )}
      </main>

      {/* Room Details Modal */}
      <RoomDetailsModal 
        room={selectedRoom}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onReservationUpdated={handleReservationCreated}
      />

      {/* New Reservation Modal */}
      <NewReservationModal
        isOpen={isNewReservationModalOpen}
        onClose={() => setIsNewReservationModalOpen(false)}
        onReservationCreated={handleReservationCreated}
      />

      {/* Room Management Modal */}
      <RoomManagementModal
        isOpen={isRoomManagementModalOpen}
        onClose={() => setIsRoomManagementModalOpen(false)}
        onRoomsUpdated={handleReservationCreated}
      />
      </div>
      </div>
  );
}

export default App;
