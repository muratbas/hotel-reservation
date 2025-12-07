import { useState, useEffect } from 'react';
import type { Room } from '../types/database';

interface RoomManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomsUpdated?: () => void;
}

export default function RoomManagementModal({ 
  isOpen, 
  onClose, 
  onRoomsUpdated 
}: RoomManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'add' | 'remove'>('add');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  
  const [startRoomNumber, setStartRoomNumber] = useState('');
  const [roomCount, setRoomCount] = useState(1);
  const [floorNumber, setFloorNumber] = useState(1);
  const [roomType, setRoomType] = useState<'Standard' | 'Deluxe' | 'Suite'>('Standard');
  const [pricePerNight, setPricePerNight] = useState('500');
  const [maxGuests, setMaxGuests] = useState(2);

  
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadRooms();
    } else {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setStartRoomNumber('');
    setRoomCount(1);
    setFloorNumber(1);
    setRoomType('Standard');
    setPricePerNight('500');
    setMaxGuests(2);
    setSelectedRooms([]);
    setError('');
    setSuccess('');
  };

  const loadRooms = async () => {
    try {
      const roomsData = await window.electronAPI.getRooms();
      setRooms(roomsData);
    } catch (err: any) {
      console.error('Failed to load rooms:', err);
    }
  };

  const handleAddRooms = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      
      if (!startRoomNumber || roomCount < 1) {
        throw new Error('Lütfen geçerli oda bilgileri girin');
      }

      const startNum = parseInt(startRoomNumber);
      if (isNaN(startNum)) {
        throw new Error('Oda numarası sayı olmalıdır');
      }

      
      const roomsToAdd = [];
      for (let i = 0; i < roomCount; i++) {
        const roomNumber = (startNum + i).toString();
        roomsToAdd.push({
          roomNumber,
          floorNumber,
          type: roomType,
          pricePerNight: parseFloat(pricePerNight),
          maxGuests,
        });
      }

      
      const result = await window.electronAPI.addRooms(roomsToAdd);

      if (result.success) {
        setSuccess(`${roomCount} oda başarıyla eklendi!`);
        await loadRooms();
        if (onRoomsUpdated) onRoomsUpdated();
        
        
        setTimeout(() => {
          setStartRoomNumber((startNum + roomCount).toString());
          setSuccess('');
        }, 2000);
      } else {
        throw new Error(result.message || 'Odalar eklenemedi');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRooms = async () => {
    if (selectedRooms.length === 0) {
      setError('Lütfen çıkarmak için en az bir oda seçin');
      return;
    }

    if (!window.confirm(`${selectedRooms.length} odayı çıkarmak istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await window.electronAPI.removeRooms(selectedRooms);

      if (result.success) {
        setSuccess(`${selectedRooms.length} oda başarıyla çıkarıldı!`);
        setSelectedRooms([]);
        await loadRooms();
        if (onRoomsUpdated) onRoomsUpdated();
        
        setTimeout(() => {
          setSuccess('');
        }, 2000);
      } else {
        throw new Error(result.message || 'Odalar çıkarılamadı');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleRoomSelection = (roomId: number) => {
    setSelectedRooms(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const selectAllRooms = () => {
    setSelectedRooms(rooms.map(r => r.RoomId));
  };

  const deselectAllRooms = () => {
    setSelectedRooms([]);
  };

  if (!isOpen) return null;

  
  const roomsByFloor = rooms.reduce((acc, room) => {
    const floor = room.FloorNumber;
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {} as Record<number, Room[]>);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-sidebar-dark rounded-xl border border-border-color w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {}
        <div className="flex items-center justify-between p-6 border-b border-border-color">
          <h2 className="text-text-primary text-2xl font-bold">Oda Yönetimi</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {}
        <div className="flex border-b border-border-color">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'add'
                ? 'text-text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">add_circle</span>
              Oda Ekle
            </span>
          </button>
          <button
            onClick={() => setActiveTab('remove')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'remove'
                ? 'text-text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">remove_circle</span>
              Oda Çıkar
            </span>
          </button>
        </div>

        {}
        <div className="p-6">
          {}
          {error && (
            <div className="mb-4 bg-red-900/20 border border-red-500 rounded-lg p-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-900/20 border border-green-500 rounded-lg p-4">
              <p className="text-green-300 text-sm">✅ {success}</p>
            </div>
          )}

          {}
          {activeTab === 'add' && (
            <form onSubmit={handleAddRooms} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">
                    Başlangıç Oda Numarası *
                  </label>
                  <input
                    type="text"
                    value={startRoomNumber}
                    onChange={(e) => setStartRoomNumber(e.target.value)}
                    className="w-full bg-card-dark text-text-primary border border-border-color rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary placeholder-text-secondary/50"
                    placeholder="101"
                    required
                    autoComplete="off"
                  />
                  <p className="text-text-secondary text-xs">
                    Odalar bu numaradan başlayarak sırayla numaralandırılacak
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">
                    Oda Sayısı *
                  </label>
                  <input
                    type="number"
                    value={roomCount}
                    onChange={(e) => setRoomCount(Number(e.target.value))}
                    min="1"
                    max="50"
                    className="w-full bg-card-dark text-text-primary border border-border-color rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <p className="text-text-secondary text-xs">
                    Bir seferde en fazla 50 oda ekleyin
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">
                    Kat Numarası *
                  </label>
                  <input
                    type="number"
                    value={floorNumber}
                    onChange={(e) => setFloorNumber(Number(e.target.value))}
                    min="1"
                    max="50"
                    className="w-full bg-card-dark text-text-primary border border-border-color rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">
                    Oda Tipi *
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value as any)}
                    className="w-full bg-card-dark text-text-primary border border-border-color rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
                    required
                  >
                    <option value="Standard">Standart</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suit</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">
                    Gecelik Fiyat (₺) *
                  </label>
                  <input
                    type="number"
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full bg-card-dark text-text-primary border border-border-color rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">
                    Maksimum Misafir *
                  </label>
                  <input
                    type="number"
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(Number(e.target.value))}
                    min="1"
                    max="10"
                    className="w-full bg-card-dark text-text-primary border border-border-color rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              {}
              {startRoomNumber && roomCount > 0 && (
                <div className="bg-card-dark rounded-lg p-4 border border-border-color">
                  <p className="text-text-secondary text-sm mb-2">Önizleme:</p>
                  <p className="text-text-primary text-sm">
                    Oluşturulacak odalar: <span className="font-bold">
                      {startRoomNumber} - {parseInt(startRoomNumber) + roomCount - 1}
                    </span> ({roomCount} oda)
                  </p>
                  <p className="text-text-primary text-sm">
                    Kat: <span className="font-bold">{floorNumber}</span> | 
                    Tip: <span className="font-bold">{roomType === 'Standard' ? 'Standart' : roomType === 'Deluxe' ? 'Deluxe' : 'Suit'}</span> | 
                    Fiyat: <span className="font-bold">₺{pricePerNight}/gece</span> | 
                    Maks: <span className="font-bold">{maxGuests} misafir</span>
                  </p>
                </div>
              )}

              <div className="flex gap-4">
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
                  disabled={loading}
                >
                  {loading ? 'Ekleniyor...' : `${roomCount} Oda Ekle`}
                </button>
              </div>
            </form>
          )}

          {}
          {activeTab === 'remove' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-text-secondary text-sm">
                  Çıkarmak için odaları seçin ({selectedRooms.length} seçili)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllRooms}
                    className="text-xs px-3 py-1 bg-card-dark text-text-primary rounded hover:bg-hover-dark transition-colors"
                  >
                    Tümünü Seç
                  </button>
                  <button
                    onClick={deselectAllRooms}
                    className="text-xs px-3 py-1 bg-card-dark text-text-primary rounded hover:bg-hover-dark transition-colors"
                  >
                    Seçimi Kaldır
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-4">
                {Object.keys(roomsByFloor).sort((a, b) => Number(a) - Number(b)).map(floorNum => (
                  <div key={floorNum}>
                    <h3 className="text-text-primary font-bold text-sm mb-2">
                      Kat {floorNum}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {roomsByFloor[Number(floorNum)].map(room => (
                        <button
                          key={room.RoomId}
                          onClick={() => toggleRoomSelection(room.RoomId)}
                          disabled={room.Status === 'Occupied'}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            selectedRooms.includes(room.RoomId)
                              ? 'bg-red-900/30 border-red-500'
                              : room.Status === 'Occupied'
                              ? 'bg-card-dark/50 border-border-color opacity-50 cursor-not-allowed'
                              : 'bg-card-dark border-border-color hover:border-red-500'
                          }`}
                        >
                          <p className="text-text-primary font-bold text-sm">
                            {room.RoomNumber}
                          </p>
                          <p className="text-text-secondary text-xs">{room.Type === 'Standard' ? 'Standart' : room.Type === 'Deluxe' ? 'Deluxe' : 'Suit'}</p>
                          {room.Status === 'Occupied' && (
                            <p className="text-yellow-400 text-xs mt-1">Dolu</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-card-dark text-text-primary rounded-lg hover:bg-hover-dark transition-colors"
                  disabled={loading}
                >
                  İptal
                </button>
                <button
                  onClick={handleRemoveRooms}
                  className="flex-1 px-4 py-2 bg-red-600 text-text-primary rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                  disabled={loading || selectedRooms.length === 0}
                >
                  {loading ? 'Çıkarılıyor...' : `${selectedRooms.length} Oda Çıkar`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
