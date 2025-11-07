import { useEffect, useState } from 'react';
import type { Room, Reservation } from '../types/database';
import { printInvoice } from '../utils/csvExport';

interface RoomDetailsModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onReservationUpdated?: () => void;
}

export default function RoomDetailsModal({ room, isOpen, onClose, onReservationUpdated }: RoomDetailsModalProps) {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit form state
  const [editCheckInDate, setEditCheckInDate] = useState('');
  const [editCheckOutDate, setEditCheckOutDate] = useState('');
  const [editNumberOfGuests, setEditNumberOfGuests] = useState(1);
  const [editStaffNotes, setEditStaffNotes] = useState('');
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (isOpen && room && room.Status === 'Occupied') {
      loadReservation();
    } else {
      setReservation(null);
      setIsEditing(false);
    }
  }, [isOpen, room]);

  const loadReservation = async () => {
    if (!room) return;
    
    setLoading(true);
    try {
      const res = await window.electronAPI.getRoomReservation(room.RoomId);
      setReservation(res);
      
      // Populate edit form
      if (res) {
        setEditCheckInDate(new Date(res.CheckInDate).toISOString().split('T')[0]);
        setEditCheckOutDate(new Date(res.CheckOutDate).toISOString().split('T')[0]);
        setEditNumberOfGuests(Number(res.NumberOfGuests));
        setEditStaffNotes(res.StaffNotes || '');
      }
    } catch (error) {
      console.error('Failed to load reservation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!room || !window.confirm('Are you sure you want to check out this guest?')) return;
    
    setLoading(true);
    try {
      const result = await window.electronAPI.checkoutReservation(room.RoomId);
      if (result.success) {
        if (onReservationUpdated) onReservationUpdated();
        onClose();
      } else {
        alert('Failed to check out: ' + result.message);
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!reservation) return;
    
    setEditError('');
    setLoading(true);
    
    try {
      // Validation
      const checkIn = new Date(editCheckInDate);
      const checkOut = new Date(editCheckOutDate);
      
      if (checkOut <= checkIn) {
        throw new Error('Check-out must be after check-in');
      }

      const result = await window.electronAPI.updateReservation(
        reservation.ReservationId,
        {
          checkInDate: editCheckInDate,
          checkOutDate: editCheckOutDate,
          numberOfGuests: editNumberOfGuests,
          staffNotes: editStaffNotes || null,
        }
      );

      if (result.success) {
        setIsEditing(false);
        await loadReservation();
        if (onReservationUpdated) onReservationUpdated();
      } else {
        throw new Error(result.message || 'Failed to update reservation');
      }
    } catch (error: any) {
      setEditError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetMaintenance = async () => {
    if (!room || !window.confirm('Set this room to maintenance mode?')) return;
    
    setLoading(true);
    try {
      const result = await window.electronAPI.updateRoomStatus(room.RoomId, 'Maintenance');
      if (result.success) {
        if (onReservationUpdated) onReservationUpdated();
        onClose();
      } else {
        alert('Failed to update room status: ' + result.message);
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetAvailable = async () => {
    if (!room || !window.confirm('Set this room to available?')) return;
    
    setLoading(true);
    try {
      const result = await window.electronAPI.updateRoomStatus(room.RoomId, 'Available');
      if (result.success) {
        if (onReservationUpdated) onReservationUpdated();
        onClose();
      } else {
        alert('Failed to update room status: ' + result.message);
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !room) return null;

  const statusColor = 
    room.Status === 'Available' ? 'bg-[#2ECC71]/20 text-[#2ECC71]' :
    room.Status === 'Occupied' ? 'bg-[#F39C12]/20 text-[#F39C12]' :
    'bg-[#E74C3C]/20 text-[#E74C3C]';

  // Calculate duration
  const getDuration = () => {
    if (!reservation) return 0;
    const checkIn = new Date(reservation.CheckInDate);
    const checkOut = new Date(reservation.CheckOutDate);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div 
          className="bg-[#1A1A2E] rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-white text-3xl font-black leading-tight">
                  Room {room.RoomNumber}
                </h2>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColor}`}>
                  {room.Status}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="text-[#EAEAEA]/70 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-3xl">close</span>
              </button>
            </div>

            {/* Action Buttons */}
            {room.Status === 'Occupied' && reservation && !isEditing && (
              <div className="flex gap-3 flex-wrap">
                <button 
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="flex items-center justify-center rounded-lg h-10 px-4 bg-[#E74C3C] hover:bg-[#C0392B] text-white text-sm font-bold transition-colors disabled:opacity-50"
                >
                  <span className="truncate">Check Out Guest</span>
                </button>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center rounded-lg h-10 px-4 bg-[#2C3E50] hover:bg-[#34495E] text-white text-sm font-bold transition-colors"
                >
                  <span className="truncate">Edit Information</span>
                </button>
                <button 
                  onClick={() => printInvoice(reservation, { FullName: reservation.GuestName, PhoneNumber: reservation.PhoneNumber, Email: reservation.Email, Gender: reservation.Gender }, room)}
                  className="flex items-center gap-2 justify-center rounded-lg h-10 px-4 bg-[#3498DB] hover:bg-[#2980B9] text-white text-sm font-bold transition-colors"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  <span className="truncate">Print Invoice</span>
                </button>
              </div>
            )}

            {/* Room Status Change for Available/Maintenance rooms */}
            {(room.Status === 'Available' || room.Status === 'Maintenance') && (
              <div className="flex gap-3">
                {room.Status === 'Available' && (
                  <button 
                    onClick={handleSetMaintenance}
                    disabled={loading}
                    className="flex items-center gap-2 justify-center rounded-lg h-10 px-4 bg-[#E67E22] hover:bg-[#D35400] text-white text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-base">build</span>
                    <span className="truncate">Set to Maintenance</span>
                  </button>
                )}
                {room.Status === 'Maintenance' && (
                  <button 
                    onClick={handleSetAvailable}
                    disabled={loading}
                    className="flex items-center gap-2 justify-center rounded-lg h-10 px-4 bg-[#27AE60] hover:bg-[#229954] text-white text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    <span className="truncate">Set to Available</span>
                  </button>
                )}
              </div>
            )}
            
            {isEditing && (
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="flex items-center justify-center rounded-lg h-10 px-4 bg-[#7F8C8D] hover:bg-[#95A5A6] text-white text-sm font-bold transition-colors disabled:opacity-50"
                >
                  <span className="truncate">Cancel</span>
                </button>
                <button 
                  onClick={handleSaveEdit}
                  disabled={loading}
                  className="flex items-center justify-center rounded-lg h-10 px-4 bg-[#27AE60] hover:bg-[#229954] text-white text-sm font-bold transition-colors disabled:opacity-50"
                >
                  <span className="truncate">{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Room Profile */}
              <div className="lg:col-span-1">
                <div className="bg-[#2C3E50] p-6 rounded-xl">
                  <h3 className="text-white text-xl font-bold mb-6">Room Details</h3>
                  
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-4xl text-primary">bed</span>
                    </div>
                    <h4 className="text-white text-lg font-bold">{room.Type}</h4>
                    <p className="text-[#EAEAEA]/70 text-sm">Floor {room.FloorNumber}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-[#EAEAEA]/70">payments</span>
                      <div>
                        <p className="text-xs text-[#EAEAEA]/70">Price per Night</p>
                        <p className="text-sm text-white font-semibold">₺{Number(room.PricePerNight).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-[#EAEAEA]/70">group</span>
                      <div>
                        <p className="text-xs text-[#EAEAEA]/70">Max Guests</p>
                        <p className="text-sm text-white font-semibold">{Number(room.MaxGuests)} guests</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Guest & Reservation Info */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {editError && (
                  <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                    <p className="text-red-300 text-sm">{editError}</p>
                  </div>
                )}
                
                {room.Status === 'Occupied' ? (
                  loading ? (
                    <div className="bg-[#2C3E50] p-6 rounded-xl">
                      <div className="text-center py-8">
                        <p className="text-[#EAEAEA]/70">Loading guest information...</p>
                      </div>
                    </div>
                  ) : reservation ? (
                    <>
                      {/* Guest Profile */}
                      <div className="bg-[#2C3E50] p-6 rounded-xl">
                        <h3 className="text-white text-xl font-bold mb-6">Guest Information</h3>
                        
                        <div className="flex items-center gap-4 mb-6">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            reservation.Gender === 'Female' 
                              ? 'bg-pink-500/20' 
                              : 'bg-primary/20'
                          }`}>
                            <span className={`material-symbols-outlined text-2xl ${
                              reservation.Gender === 'Female' 
                                ? 'text-pink-500' 
                                : 'text-primary'
                            }`}>
                              {reservation.Gender === 'Female' ? 'woman' : 'person'}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-white text-lg font-bold">{reservation.GuestName}</h4>
                            <p className="text-[#EAEAEA]/70 text-sm">Guest</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {reservation.Email && (
                            <div className="flex items-center gap-4">
                              <span className="material-symbols-outlined text-[#EAEAEA]/70">email</span>
                              <p className="text-sm text-white">{reservation.Email}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-[#EAEAEA]/70">phone</span>
                            <p className="text-sm text-white">{reservation.PhoneNumber}</p>
                          </div>
                          {reservation.Gender && (
                            <div className="flex items-center gap-4">
                              <span className="material-symbols-outlined text-[#EAEAEA]/70">person</span>
                              <p className="text-sm text-white">{reservation.Gender}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reservation Details */}
                      <div className="bg-[#2C3E50] p-6 rounded-xl">
                        <h3 className="text-white text-xl font-bold mb-6">Reservation Details</h3>
                        
                        {isEditing ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm text-[#EAEAEA]/70 mb-1 block">Check-In Date</label>
                                <input
                                  type="date"
                                  value={editCheckInDate}
                                  onChange={(e) => setEditCheckInDate(e.target.value)}
                                  className="w-full bg-[#1A1A2E] text-white border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>
                              <div>
                                <label className="text-sm text-[#EAEAEA]/70 mb-1 block">Check-Out Date</label>
                                <input
                                  type="date"
                                  value={editCheckOutDate}
                                  onChange={(e) => setEditCheckOutDate(e.target.value)}
                                  className="w-full bg-[#1A1A2E] text-white border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm text-[#EAEAEA]/70 mb-1 block">Number of Guests</label>
                              <input
                                type="number"
                                value={editNumberOfGuests}
                                onChange={(e) => setEditNumberOfGuests(Number(e.target.value))}
                                min="1"
                                max={Number(room.MaxGuests)}
                                className="w-full bg-[#1A1A2E] text-white border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                            
                            <div>
                              <label className="text-sm text-[#EAEAEA]/70 mb-1 block">Staff Notes</label>
                              <textarea
                                value={editStaffNotes}
                                onChange={(e) => setEditStaffNotes(e.target.value)}
                                className="w-full bg-[#1A1A2E] text-white border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                rows={4}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm text-[#EAEAEA]/70 mb-1">Check-In</p>
                              <p className="text-white font-semibold">{formatDate(new Date(reservation.CheckInDate))}</p>
                            </div>
                            <div>
                              <p className="text-sm text-[#EAEAEA]/70 mb-1">Check-Out</p>
                              <p className="text-white font-semibold">{formatDate(new Date(reservation.CheckOutDate))}</p>
                            </div>
                            <div>
                              <p className="text-sm text-[#EAEAEA]/70 mb-1">Room</p>
                              <p className="text-white font-semibold">#{room.RoomNumber} - {room.Type}</p>
                            </div>
                            <div>
                              <p className="text-sm text-[#EAEAEA]/70 mb-1">Duration of Stay</p>
                              <p className="text-white font-semibold">{getDuration()} Nights</p>
                            </div>
                            <div>
                              <p className="text-sm text-[#EAEAEA]/70 mb-1">Number of Guests</p>
                              <p className="text-white font-semibold">{Number(reservation.NumberOfGuests)} guests</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Staff Notes */}
                      {!isEditing && reservation.StaffNotes && (
                        <div className="bg-[#2C3E50] p-6 rounded-xl">
                          <h3 className="text-white text-xl font-bold mb-4">Staff Notes</h3>
                          <div className="space-y-2">
                            {reservation.StaffNotes.split('\n').map((note, idx) => (
                              <p key={idx} className="text-sm text-[#EAEAEA]/90">- {note}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-[#2C3E50] p-6 rounded-xl">
                      <div className="text-center py-8">
                        <p className="text-[#EAEAEA]/70">No reservation found</p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="bg-[#2C3E50] p-6 rounded-xl">
                    <h3 className="text-white text-xl font-bold mb-4">Room Status</h3>
                    <div className="text-center py-8">
                      <p className="text-[#EAEAEA]/70">
                        {room.Status === 'Available' && 'This room is available for booking'}
                        {room.Status === 'Maintenance' && 'This room is currently under maintenance'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
