import { useState, useEffect } from 'react';
import { downloadCSV } from '../utils/csvExport';

interface Guest {
  GuestId: number;
  FullName: string;
  PhoneNumber: string;
  Email: string | null;
  CreatedAt: string;
  TotalStays?: number;
  LastStayDate?: string | null;
}

interface GuestWithStats extends Guest {
  TotalStays: number;
  TotalRevenue: number;
  LastStayDate: string | null;
}

interface GuestsPageProps {
  onNavigate: (page: 'dashboard' | 'rooms' | 'guests') => void;
}

export default function GuestsPage({ onNavigate: _onNavigate }: GuestsPageProps) {
  const [guests, setGuests] = useState<GuestWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<GuestWithStats | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    console.log('Loading guests...');
    setLoading(true);
    setError('');
    try {
      const guestsData = await window.electronAPI.getGuestsWithStats();
      console.log('Guests loaded:', guestsData);
      setGuests(guestsData || []);
    } catch (err: any) {
      console.error('Failed to load guests:', err);
      setError(err.message || 'Failed to load guests');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestClick = (guest: GuestWithStats) => {
    setSelectedGuest(guest);
    setIsDetailModalOpen(true);
  };

  
  const filteredGuests = guests.filter(guest => 
    guest.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.PhoneNumber.includes(searchTerm) ||
    (guest.Email && guest.Email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('tr-TR', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-text-secondary text-lg">Misafirler yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">Misafirler yüklenirken hata oluştu</p>
          <p className="text-text-secondary text-sm mb-4">{error}</p>
          <button 
            onClick={loadGuests}
            className="px-4 py-2 bg-primary text-text-primary rounded-lg hover:bg-primary/80"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  console.log('Rendering guests page with', guests.length, 'guests');

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      {}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-text-primary text-4xl font-black tracking-tight">Misafirler</h1>
          <p className="text-text-secondary text-base">
            Otel misafirlerinizi yönetin ve rezervasyon geçmişlerini görüntüleyin.
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => downloadCSV('guests')}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-4 bg-green-600 hover:bg-green-700 text-text-primary text-sm font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span className="truncate">Misafirleri Dışa Aktar</span>
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-sidebar-dark p-4 rounded-lg border border-border-color">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-lg">
              <span className="material-symbols-outlined text-primary text-2xl">group</span>
            </div>
            <div>
              <p className="text-text-secondary text-sm">Toplam Misafir</p>
              <p className="text-text-primary text-2xl font-bold">{guests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-sidebar-dark p-4 rounded-lg border border-border-color">
          <div className="flex items-center gap-3">
            <div className="bg-green-600/20 p-3 rounded-lg">
              <span className="material-symbols-outlined text-green-500 text-2xl">hotel</span>
            </div>
            <div>
              <p className="text-text-secondary text-sm">Toplam Konaklama</p>
              <p className="text-text-primary text-2xl font-bold">
                {guests.reduce((sum, g) => sum + Number(g.TotalStays || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-sidebar-dark p-4 rounded-lg border border-border-color">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-600/20 p-3 rounded-lg">
              <span className="material-symbols-outlined text-yellow-500 text-2xl">payments</span>
            </div>
            <div>
              <p className="text-text-secondary text-sm">Toplam Gelir</p>
              <p className="text-text-primary text-2xl font-bold">
                ₺{guests.reduce((sum, g) => sum + Number(g.TotalRevenue || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="mb-6">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            
            className="w-full bg-sidebar-dark text-text-primary border border-border-color rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary placeholder-text-secondary/50"
            autoComplete="off"
          />
        </div>
      </div>

      {}
      <div className="bg-sidebar-dark rounded-lg border border-border-color overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-card-dark border-b border-border-color">
              <tr>
                <th className="text-left px-6 py-4 text-text-secondary text-sm font-medium">Misafir Adı</th>
                <th className="text-left px-6 py-4 text-text-secondary text-sm font-medium">İletişim</th>
                <th className="text-left px-6 py-4 text-text-secondary text-sm font-medium">E-posta</th>
                <th className="text-left px-6 py-4 text-text-secondary text-sm font-medium">Toplam Konaklama</th>
                <th className="text-left px-6 py-4 text-text-secondary text-sm font-medium">Son Konaklama</th>
                <th className="text-left px-6 py-4 text-text-secondary text-sm font-medium">Toplam Harcama</th>
                <th className="text-left px-6 py-4 text-text-secondary text-sm font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <p className="text-text-secondary">
                      {searchTerm ? 'Aramanızla eşleşen misafir bulunamadı' : 'Henüz misafir yok'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => (
                  <tr 
                    key={guest.GuestId}
                    className="border-b border-border-color hover:bg-hover-dark transition-colors cursor-pointer"
                    onClick={() => handleGuestClick(guest)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-2 rounded-full">
                          <span className="material-symbols-outlined text-primary text-sm">person</span>
                        </div>
                        <span className="text-text-primary font-medium">{guest.FullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-primary">{guest.PhoneNumber}</td>
                    <td className="px-6 py-4 text-text-secondary">
                      {guest.Email || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/20 text-green-400 rounded text-sm">
                        <span className="material-symbols-outlined text-xs">hotel</span>
                        {Number(guest.TotalStays || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {formatDate(guest.LastStayDate)}
                    </td>
                    <td className="px-6 py-4 text-text-primary font-semibold">
                      ₺{Number(guest.TotalRevenue || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGuestClick(guest);
                        }}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {}
      {isDetailModalOpen && selectedGuest && (
        <GuestDetailsModal
          guest={selectedGuest}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedGuest(null);
          }}
          onUpdate={loadGuests}
        />
      )}
    </div>
  );
}


interface GuestDetailsModalProps {
  guest: GuestWithStats;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

function GuestDetailsModal({ guest, isOpen, onClose, onUpdate }: GuestDetailsModalProps) {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(guest.FullName);
  const [editPhone, setEditPhone] = useState(guest.PhoneNumber);
  const [editEmail, setEditEmail] = useState(guest.Email || '');

  useEffect(() => {
    if (isOpen) {
      loadGuestReservations();
    }
  }, [isOpen, guest.GuestId]);

  const loadGuestReservations = async () => {
    setLoading(true);
    try {
      const data = await window.electronAPI.getGuestReservations(guest.GuestId);
      setReservations(data);
    } catch (error) {
      console.error('Failed to load reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const result = await window.electronAPI.updateGuest(guest.GuestId, {
        fullName: editName,
        phoneNumber: editPhone,
        email: editEmail || null,
      });

      if (result.success) {
        setIsEditing(false);
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Failed to update guest:', error);
    }
  };

  if (!isOpen) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={onClose} />
      
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div 
          className="bg-sidebar-dark rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-border-color"
          onClick={(e) => e.stopPropagation()}
        >
          {}
          <div className="p-6 border-b border-border-color">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-4 rounded-full">
                  <span className="material-symbols-outlined text-primary text-3xl">person</span>
                </div>
                <div>
                  <h2 className="text-text-primary text-2xl font-bold">{guest.FullName}</h2>
                  <p className="text-text-secondary text-sm">Misafir No: #{guest.GuestId}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-text-primary rounded-lg hover:bg-primary/80 transition-colors text-sm font-medium"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                Bilgileri Düzenle
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-card-dark text-text-primary rounded-lg hover:bg-hover-dark transition-colors text-sm"
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-green-600 text-text-primary rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            )}
          </div>

          {}
          <div className="p-6 space-y-6">
            {}
            <div className="bg-card-dark p-6 rounded-lg">
                        <h3 className="text-text-primary text-lg font-bold mb-4">İletişim Bilgileri</h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-text-secondary text-sm mb-1 block">Ad Soyad</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-sidebar-dark text-text-primary border border-border-color rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-text-secondary text-sm mb-1 block">Telefon Numarası</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-sidebar-dark text-text-primary border border-border-color rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-text-secondary text-sm mb-1 block">E-posta (Opsiyonel)</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-sidebar-dark text-text-primary border border-border-color rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-text-secondary">phone</span>
                    <span className="text-text-primary">{guest.PhoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-text-secondary">email</span>
                    <span className="text-text-primary">{guest.Email || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-text-secondary">calendar_today</span>
                    <span className="text-text-secondary text-sm">
                      Üyelik tarihi {formatDate(guest.CreatedAt)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card-dark p-4 rounded-lg text-center">
                <p className="text-text-secondary text-sm mb-1">Toplam Konaklama</p>
                <p className="text-text-primary text-3xl font-bold">{Number(guest.TotalStays || 0)}</p>
              </div>
              <div className="bg-card-dark p-4 rounded-lg text-center">
                <p className="text-text-secondary text-sm mb-1">Toplam Gelir</p>
                <p className="text-text-primary text-3xl font-bold">₺{Number(guest.TotalRevenue || 0).toFixed(2)}</p>
              </div>
              <div className="bg-card-dark p-4 rounded-lg text-center">
                <p className="text-text-secondary text-sm mb-1">Son Konaklama</p>
                <p className="text-text-primary text-lg font-semibold">
                  {guest.LastStayDate ? formatDate(guest.LastStayDate) : 'Hiç'}
                </p>
              </div>
            </div>

            {}
            <div>
              <h3 className="text-text-primary text-lg font-bold mb-4">Rezervasyon Geçmişi</h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-text-secondary">Rezervasyonlar yükleniyor...</p>
                </div>
              ) : reservations.length === 0 ? (
                <div className="text-center py-8 bg-card-dark rounded-lg">
                  <p className="text-text-secondary">Rezervasyon geçmişi yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reservations.map((reservation) => (
                    <div 
                      key={reservation.ReservationId}
                      className="bg-card-dark p-4 rounded-lg border border-border-color"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-text-primary font-semibold mb-1">
                            Oda {reservation.RoomNumber} - {reservation.RoomType === 'Standard' ? 'Standart' : reservation.RoomType === 'Deluxe' ? 'Deluxe' : 'Suit'}
                          </p>
                          <p className="text-text-secondary text-sm">
                            {formatDate(reservation.CheckInDate)} → {formatDate(reservation.CheckOutDate)}
                          </p>
                          {reservation.StaffNotes && (
                            <p className="text-text-secondary text-sm mt-2">
                              Not: {reservation.StaffNotes}
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          reservation.Status === 'Active' 
                            ? 'bg-green-900/20 text-green-400'
                            : 'bg-gray-900/20 text-gray-400'
                        }`}>
                          {reservation.Status === 'Active' ? 'Aktif' : reservation.Status === 'CheckedOut' ? 'Tamamlandı' : 'İptal'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
