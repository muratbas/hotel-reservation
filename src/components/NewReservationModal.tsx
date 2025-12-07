import { useState, useEffect } from 'react';
import type { Room } from '../types/database';

interface Guest {
  GuestId: number;
  FullName: string;
  PhoneNumber: string;
  Email: string | null;
}

interface NewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedRoom?: Room | null;
  onReservationCreated?: () => void;
}

export default function NewReservationModal({ 
  isOpen, 
  onClose, 
  preselectedRoom,
  onReservationCreated 
}: NewReservationModalProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [isNewGuest, setIsNewGuest] = useState(true);
  const [selectedGuestId, setSelectedGuestId] = useState<number | null>(null);
  
  
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestGender, setGuestGender] = useState('');
  
  
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [staffNotes, setStaffNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadRoomsAndGuests();
      
      if (preselectedRoom) {
        setSelectedRoomId(preselectedRoom.RoomId);
      }
    } else {
      
      resetForm();
    }
  }, [isOpen, preselectedRoom]);

  const resetForm = () => {
    setSelectedRoomId(null);
    setIsNewGuest(true);
    setSelectedGuestId(null);
    setGuestName('');
    setGuestPhone('');
    setGuestEmail('');
    setGuestGender('');
    setCheckInDate('');
    setCheckOutDate('');
    setNumberOfGuests(1);
    setStaffNotes('');
    setError('');
    setSuccess(false);
  };

  const loadRoomsAndGuests = async () => {
    try {
      const [roomsData, guestsData] = await Promise.all([
        window.electronAPI.getRooms(),
        window.electronAPI.getGuests()
      ]);
      
      
      const availableRooms = roomsData.filter((r: Room) => r.Status === 'Available');
      setRooms(availableRooms);
      setGuests(guestsData);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError('Failed to load rooms and guests');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      
      if (!selectedRoomId) {
        throw new Error('Please select a room');
      }
      if (isNewGuest) {
        if (!guestName || !guestPhone) {
          throw new Error('Guest name and phone are required');
        }
      } else {
        if (!selectedGuestId) {
          throw new Error('Please select a guest');
        }
      }
      if (!checkInDate || !checkOutDate) {
        throw new Error('Check-in and check-out dates are required');
      }
      
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      
      if (checkOut <= checkIn) {
        throw new Error('Check-out must be after check-in');
      }

      
      const hasConflict = await window.electronAPI.checkDateConflict(
        selectedRoomId,
        checkInDate,
        checkOutDate
      );

      if (hasConflict) {
        throw new Error('This room is already booked for these dates');
      }

      
      const result = await window.electronAPI.createReservation({
        roomId: selectedRoomId,
        isNewGuest,
        guestId: selectedGuestId,
        guestName,
        guestPhone,
        guestEmail: guestEmail || null,
        guestGender: guestGender || null,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        staffNotes: staffNotes || null,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          if (onReservationCreated) {
            onReservationCreated();
          }
        }, 1500);
      } else {
        throw new Error(result.message || 'Failed to create reservation');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedRoom = rooms.find(r => r.RoomId === selectedRoomId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-sidebar-dark rounded-xl border border-border-color w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {}
        <div className="flex items-center justify-between p-6 border-b border-border-color">
          <h2 className="text-text-primary text-2xl font-bold">Yeni Rezervasyon</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {}
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {}
          {success && (
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
              <p className="text-green-300 text-sm">✅ Rezervasyon başarıyla oluşturuldu!</p>
            </div>
          )}

          {}
          <div className="space-y-2">
            <label className="text-text-primary text-sm font-medium">Oda *</label>
            <select
              value={selectedRoomId || ''}
              onChange={(e) => setSelectedRoomId(Number(e.target.value))}
              className="w-full bg-card-dark text-text-primary border border-border-color rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
              disabled={!!preselectedRoom}
              required
            >
              <option value="">Oda seçin</option>
              {rooms.map((room) => (
                <option key={room.RoomId} value={room.RoomId}>
                  Oda {room.RoomNumber} - {room.Type} (₺{Number(room.PricePerNight).toFixed(2)}/gece)
                </option>
              ))}
            </select>
            {selectedRoom && (
              <p className="text-text-secondary text-xs">
                Kat {selectedRoom.FloorNumber} • Maks {selectedRoom.MaxGuests} misafir
              </p>
            )}
          </div>

          {}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsNewGuest(true)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isNewGuest 
                  ? 'bg-primary text-text-primary' 
                  : 'bg-card-dark text-text-secondary hover:bg-hover-dark'
              }`}
            >
              Yeni Misafir
            </button>
            <button
              type="button"
              onClick={() => setIsNewGuest(false)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !isNewGuest 
                  ? 'bg-primary text-text-primary' 
                  : 'bg-card-dark text-text-secondary hover:bg-hover-dark'
              }`}
            >
              Mevcut Misafir
            </button>
          </div>

          {}
          {isNewGuest ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-text-primary text-sm font-medium">Misafir Adı *</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-card-dark text-text-primary border border-border-color rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary placeholder-text-secondary/50"
                  placeholder="John Doe"
                  required
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <label className="text-text-primary text-sm font-medium">Telefon Numarası *</label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full bg-card-dark text-text-primary border border-border-color rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary placeholder-text-secondary/50"
                  placeholder="+1 234 567 8900"
                  required
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <label className="text-text-primary text-sm font-medium">E-posta (Opsiyonel)</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full bg-card-dark text-text-primary border border-border-color rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary placeholder-text-secondary/50"
                  placeholder="john@example.com"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <label className="text-text-primary text-sm font-medium">Cinsiyet (Opsiyonel)</label>
                <select
                  value={guestGender}
                  onChange={(e) => setGuestGender(e.target.value)}
                  className="w-full bg-card-dark text-text-primary border border-border-color rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
                >
                  <option value="">Belirtmek istemiyorum</option>
                  <option value="Male">Erkek</option>
                  <option value="Female">Kadın</option>
                  <option value="Other">Diğer</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-text-primary text-sm font-medium">Misafir Seçin *</label>
              <select
                value={selectedGuestId || ''}
                onChange={(e) => setSelectedGuestId(Number(e.target.value))}
                className="w-full bg-card-dark text-text-primary border border-border-color rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
                required
              >
                <option value="">Misafir seçin</option>
                {guests.map((guest) => (
                  <option key={guest.GuestId} value={guest.GuestId}>
                    {guest.FullName} - {guest.PhoneNumber}
                  </option>
                ))}
              </select>
            </div>
          )}

          {}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-text-primary text-sm font-medium">Giriş Tarihi *</label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-card-dark text-text-primary border border-border-color rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-text-primary text-sm font-medium">Çıkış Tarihi *</label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={checkInDate || new Date().toISOString().split('T')[0]}
                className="w-full bg-card-dark text-text-primary border border-border-color rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
                required
              />
            </div>
          </div>

          {}
          <div className="space-y-2">
            <label className="text-text-primary text-sm font-medium">Misafir Sayısı</label>
            <input
              type="number"
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(Number(e.target.value))}
              min="1"
              max={selectedRoom?.MaxGuests || 10}
              className="w-full bg-card-dark text-text-primary border border-border-color rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            {selectedRoom && numberOfGuests > selectedRoom.MaxGuests && (
              <p className="text-red-400 text-xs">
                ⚠️ Bu oda maksimum {selectedRoom.MaxGuests} misafir alabilir
              </p>
            )}
          </div>

          {}
          <div className="space-y-2">
            <label className="text-text-primary text-sm font-medium">Personel Notları (Opsiyonel)</label>
            <textarea
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
              className="w-full bg-card-dark text-text-primary border border-border-color rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder-text-secondary/50"
              rows={3}
              placeholder="Özel istekler veya notlar..."
              autoComplete="off"
            />
          </div>

          {}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-card-dark text-text-primary rounded-lg hover:bg-hover-dark transition-colors"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-text-primary rounded-lg hover:bg-primary/80 transition-colors font-medium disabled:opacity-50"
              disabled={loading || success}
            >
              {loading ? 'Oluşturuluyor...' : 'Rezervasyon Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
