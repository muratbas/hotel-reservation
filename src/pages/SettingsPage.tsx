import React, { useState, useEffect } from 'react';
import type { Manager } from '../types/database';
import TitleBar from '../components/TitleBar';
import { isManagerRole } from '../utils/roleHelper';

interface SettingsPageProps {
  currentManager: Manager;
  onNavigate: (view: 'dashboard' | 'rooms' | 'guests' | 'settings') => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ currentManager, onNavigate }) => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newManagerData, setNewManagerData] = useState({ email: '', password: '', fullName: '', role: 'Personel' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Check if current user is a Manager (handles encoding issues)
  const isManager = isManagerRole(currentManager.Role);

  const loadManagers = async () => {
    setLoading(true);
    try {
      const result = await window.electronAPI.getManagers();
      if (result.success && result.managers) {
        setManagers(result.managers);
      }
    } catch (err) {
      console.error('Failed to load managers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagers();
  }, []);

  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const result = await window.electronAPI.createManager(
        newManagerData.email,
        newManagerData.password,
        newManagerData.fullName,
        newManagerData.role
      );

      if (result.success) {
        setSuccess('Hesap başarıyla oluşturuldu');
        setNewManagerData({ email: '', password: '', fullName: '', role: 'Personel' });
        setIsAddModalOpen(false);
        loadManagers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Hesap eklenemedi');
      }
    } catch (err: any) {
      setError('Hesap eklenirken bir hata oluştu');
      console.error('Add manager error:', err);
    }
  };

  const handleDeleteManager = async (managerId: number, _managerName: string) => {
    if (!confirm('Are you sure you want to delete this manager?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const result = await window.electronAPI.deleteManager(managerId, currentManager.ManagerId);

      if (result.success) {
        setSuccess('Manager deleted successfully');
        loadManagers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Cannot delete the last manager');
      }
    } catch (err: any) {
      setError('An error occurred while deleting manager');
      console.error('Delete manager error:', err);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark font-display">
      <TitleBar title="Otel Rezervasyon Sistemi - Ayarlar" />
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
            {/* Only show Dashboard for Yönetici (Manager) */}
            {isManager && (
              <button 
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-hover-dark transition-colors"
              >
                <span className="material-symbols-outlined">dashboard</span>
                <p className="text-sm font-medium">Panel</p>
              </button>
            )}

            <button 
              onClick={() => onNavigate('rooms')}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-hover-dark transition-colors"
            >
              <span className="material-symbols-outlined">bed</span>
              <p className="text-sm font-medium">Odalar</p>
            </button>

            <button 
              onClick={() => onNavigate('guests')}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-hover-dark transition-colors"
            >
              <span className="material-symbols-outlined">group</span>
              <p className="text-sm font-medium">Misafirler</p>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-hover-dark text-text-primary"
          >
            <span className="material-symbols-outlined">settings</span>
            <p className="text-sm font-medium">Ayarlar</p>
          </button>

          <button 
            onClick={() => {
              localStorage.removeItem('managerId');
              window.location.reload();
            }}
            className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-blue-600 text-text-primary text-sm font-bold transition-colors"
          >
            <span className="truncate">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-text-primary text-4xl font-black tracking-tight mb-2">Ayarlar</h1>
          <p className="text-text-secondary text-base">
            {isManager ? 'Yönetici hesaplarını ve sistem tercihlerini yönetin.' : 'Hesap bilgilerinizi görüntüleyin.'}
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <span className="material-symbols-outlined text-green-500">check_circle</span>
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <span className="material-symbols-outlined text-red-500">error</span>
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Content: Show different view for Manager vs Staff */}
        {isManager ? (
          /* Manager View - Full Access */
          <div className="bg-card-dark border border-border-color rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-text-primary text-2xl font-bold mb-1">Yönetici Hesapları</h2>
                <p className="text-text-secondary text-sm">Sisteme kimlerin erişebileceğini yönetin</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-text-primary rounded-lg font-semibold transition-colors"
              >
                <span className="material-symbols-outlined">add</span>
                <span>Hesap Ekle</span>
              </button>
            </div>

            {/* Managers List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-text-secondary">Hesaplar yükleniyor...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {managers.map((manager) => (
                  <div
                    key={manager.ManagerId}
                    className="flex items-center justify-between p-4 bg-hover-dark border border-border-color rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full">
                        <span className="text-text-primary font-bold text-xl">
                          {manager.FullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-text-primary font-semibold">{manager.FullName}</p>
                          {manager.ManagerId === currentManager.ManagerId && (
                            <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-semibold rounded-full">
                              Siz
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isManagerRole(manager.Role) 
                              ? 'bg-blue-500/20 text-blue-300' 
                              : 'bg-green-500/20 text-green-300'
                          }`}>
                            {isManagerRole(manager.Role) ? 'Yönetici' : 'Personel'}
                          </span>
                        </div>
                        <p className="text-text-secondary text-sm">{manager.Email}</p>
                        <p className="text-text-secondary text-xs mt-1">
                          Oluşturulma: {formatDate(manager.CreatedAt)}
                          {manager.LastLoginAt && ` • Son giriş: ${formatDate(manager.LastLoginAt)}`}
                        </p>
                      </div>
                    </div>

                    {manager.ManagerId !== currentManager.ManagerId && (
                      <button
                        onClick={() => handleDeleteManager(manager.ManagerId, manager.FullName)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-semibold transition-colors"
                      >
                        <span className="material-symbols-outlined">delete</span>
                        <span>Sil</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Staff View - View Only */
          <div className="bg-card-dark border border-border-color rounded-2xl p-6 mb-6">
            <h2 className="text-text-primary text-2xl font-bold mb-6">Hesap Bilgilerim</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-20 h-20 bg-primary rounded-full">
                  <span className="text-text-primary font-bold text-3xl">
                    {currentManager.FullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-text-primary text-xl font-bold">{currentManager.FullName}</p>
                  <p className="text-text-secondary">{currentManager.Email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-hover-dark rounded-lg">
                  <label className="text-text-secondary text-sm block mb-1">Ad Soyad</label>
                  <p className="text-text-primary font-medium">{currentManager.FullName}</p>
                </div>
                <div className="p-4 bg-hover-dark rounded-lg">
                  <label className="text-text-secondary text-sm block mb-1">E-posta</label>
                  <p className="text-text-primary font-medium">{currentManager.Email}</p>
                </div>
                <div className="p-4 bg-hover-dark rounded-lg">
                  <label className="text-text-secondary text-sm block mb-1">Rol</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isManager ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                  }`}>
                    {isManager ? 'Yönetici' : 'Personel'}
                  </span>
                </div>
                <div className="p-4 bg-hover-dark rounded-lg">
                  <label className="text-text-secondary text-sm block mb-1">Hesap Oluşturulma</label>
                  <p className="text-text-primary font-medium">{formatDate(currentManager.CreatedAt)}</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-blue-400 mt-0.5">info</span>
                  <div>
                    <p className="text-blue-300 text-sm font-medium mb-1">Personel Hesabı</p>
                    <p className="text-blue-300/80 text-sm">
                      Hesap yönetimi ve sistem ayarlarını değiştirmek için bir yöneticiye başvurun.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Info */}
        <div className="bg-card-dark border border-border-color rounded-2xl p-6">
          <h2 className="text-text-primary text-2xl font-bold mb-4">Sistem Bilgileri</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-hover-dark rounded-lg">
              <p className="text-text-secondary text-sm mb-1">Sürüm</p>
              <p className="text-text-primary font-semibold">1.0.0</p>
            </div>
            <div className="p-4 bg-hover-dark rounded-lg">
              <p className="text-text-secondary text-sm mb-1">Veritabanı</p>
              <p className="text-text-primary font-semibold">MySQL 8.0</p>
            </div>
            <div className="p-4 bg-hover-dark rounded-lg">
              <p className="text-text-secondary text-sm mb-1">Toplam Yönetici</p>
              <p className="text-text-primary font-semibold">{managers.length}</p>
            </div>
            <div className="p-4 bg-hover-dark rounded-lg">
              <p className="text-text-secondary text-sm mb-1">Mevcut Kullanıcı</p>
              <p className="text-text-primary font-semibold">{currentManager.FullName}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Add Manager Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-card-dark border border-border-color rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-text-primary text-2xl font-bold">Yeni Hesap Ekle</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-text-secondary hover:text-text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddManager} className="space-y-4">
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={newManagerData.fullName}
                  onChange={(e) => setNewManagerData({ ...newManagerData, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-hover-dark border border-border-color rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
                  placeholder="John Doe"
                  required
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">E-posta Adresi</label>
                <input
                  type="email"
                  value={newManagerData.email}
                  onChange={(e) => setNewManagerData({ ...newManagerData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-hover-dark border border-border-color rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
                  placeholder="manager@hotel.com"
                  required
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">Şifre</label>
                <input
                  type="password"
                  value={newManagerData.password}
                  onChange={(e) => setNewManagerData({ ...newManagerData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-hover-dark border border-border-color rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
                  placeholder="Şifre girin"
                  required
                  minLength={6}
                  autoComplete="off"
                />
                <p className="text-text-secondary text-xs mt-1">Minimum 6 karakter</p>
              </div>

              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">Rol *</label>
                <select
                  value={newManagerData.role}
                  onChange={(e) => setNewManagerData({ ...newManagerData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-hover-dark border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
                  required
                >
                  <option value="Yönetici">Yönetici (Tam Yetki)</option>
                  <option value="Personel">Personel (Sınırlı Yetki)</option>
                </select>
                <p className="text-text-secondary text-xs mt-1">
                  Yöneticiler tüm özelliklere erişebilir. Personel panel ve hesap yönetimine erişemez.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-hover-dark text-text-primary rounded-lg font-semibold hover:bg-border-color transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary hover:bg-blue-600 text-text-primary rounded-lg font-semibold transition-colors"
                >
                  Hesap Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default SettingsPage;

