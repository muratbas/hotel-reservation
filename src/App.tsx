/**
 * ========================================
 * OTEL REZERVASYON YÖNETİM SİSTEMİ - ANA UYGULAMA
 * ========================================
 * 
 * Bu dosya uygulamanın ana bileşenidir (App.tsx)
 * 
 * BAŞLICA ÖZELLİKLER:
 * - Kullanıcı girişi ve kimlik doğrulama
 * - Oda yönetimi (ekleme, silme, durum kontrolü)
 * - Rezervasyon oluşturma ve güncelleme
 * - Kat planı görselleştirme
 * - Filtreleme (durum ve oda tipi)
 * - Sayfalama sistemi
 * - CSV dışa aktarma
 * 
 * TEKNOLOJİLER:
 * - React (kullanıcı arayüzü)
 * - TypeScript (tip güvenliği)
 * - Tailwind CSS (stil)
 * - Electron (masaüstü uygulama)
 * - MySQL (veritabanı)
 * 
 * YAPISI:
 * 1. State Yönetimi - Uygulama durumları
 * 2. Fonksiyonlar - İşlevler ve event handler'lar
 * 3. Yaşam Döngüsü - useEffect hook'ları
 * 4. Veri İşleme - Filtreleme ve sayfalama
 * 5. Render Mantığı - Sayfa görüntüleme
 */

// React kütüphanesinden state ve yaşam döngüsü hook'larını içe aktarıyoruz
import { useState, useEffect } from 'react';
// Veritabanı tiplerimizi içe aktarıyoruz (Room ve Manager)
import type { Room, Manager } from './types/database';
// Modallar (açılır pencereler) ve sayfaları içe aktarıyoruz
import RoomDetailsModal from './components/RoomDetailsModal';
import NewReservationModal from './components/NewReservationModal';
import RoomManagementModal from './components/RoomManagementModal';
import GuestsPage from './pages/GuestsPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import TitleBar from './components/TitleBar';
import { downloadCSV } from './utils/csvExport';

// Ana uygulama komponenti - tüm uygulamayı yöneten merkezi bileşen
function App() {
  
  // ========== STATE YÖNETİMİ (Uygulama Durumları) ==========
  
  // Kimlik doğrulama durumu - şu an giriş yapmış yönetici bilgisi
  const [currentManager, setCurrentManager] = useState<Manager | null>(null);
  // Kimlik doğrulama yüklenme durumu - giriş kontrolü yapılırken true
  const [authLoading, setAuthLoading] = useState(true);
  
  // Hangi sayfada olduğumuzu tutan değişken (rooms = odalar sayfası başlangıç)
  const [currentView, setCurrentView] = useState<'dashboard' | 'rooms' | 'guests' | 'settings'>('rooms');
  // Tüm odaların listesini tutan dizi
  const [rooms, setRooms] = useState<Room[]>([]);
  // Veriler yüklenirken gösterilen yükleme durumu
  const [loading, setLoading] = useState(true);
  // Veritabanı bağlantı durumu - bağlıysa true
  const [connected, setConnected] = useState(false);
  // Hata mesajlarını göstermek için kullanılan değişken
  const [errorMessage, setErrorMessage] = useState('');
  // Oda durumu filtresi (Available/Occupied/Maintenance/All)
  const [statusFilter, setStatusFilter] = useState<string>('All');
  // Oda tipi filtresi (Standard/Deluxe/Suite/All)
  const [typeFilter, setTypeFilter] = useState<string>('All');
  // Üzerine tıklanan oda bilgisini tutan değişken
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  // Oda detay modalının açık/kapalı durumu
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Yeni rezervasyon modalının açık/kapalı durumu
  const [isNewReservationModalOpen, setIsNewReservationModalOpen] = useState(false);
  // Oda yönetim modalının açık/kapalı durumu
  const [isRoomManagementModalOpen, setIsRoomManagementModalOpen] = useState(false);
  // Sayfalama için mevcut sayfa numarası
  const [currentPage, setCurrentPage] = useState(1);
  // Her sayfada gösterilecek oda sayısı (4 oda x 3 kat = 12 oda)
  const roomsPerPage = 12;

  // ========== FONKSİYONLAR (İşlevler) ==========
  
  // Bir odaya tıklandığında çalışır - oda detay penceresini açar
  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);  // Tıklanan odayı seç
    setIsModalOpen(true);   // Modal penceresini aç
  };

  // Modal penceresini kapatma fonksiyonu
  const handleCloseModal = () => {
    setIsModalOpen(false);  // Önce modalı kapat
    setTimeout(() => setSelectedRoom(null), 300); // Animasyon için 300ms bekle, sonra seçili odayı temizle
  };

  // Sayfa değiştirme fonksiyonu (sayfalama için)
  const handlePageChange = (page: number) => {
    setCurrentPage(page);  // Yeni sayfa numarasını kaydet
    window.scrollTo({ top: 0, behavior: 'smooth' });  // Sayfanın en üstüne kaydır
  };

  // Yeni rezervasyon oluşturulduğunda çalışır - odaları yeniden yükler
  const handleReservationCreated = () => {
    loadRooms();  // Odaları tekrar yükle (güncel durumları görmek için)
  };

  // Veritabanından tüm odaları yükleyen fonksiyon
  const loadRooms = async () => {
    try {
      // Electron API üzerinden odaları getir
      const roomsData = await window.electronAPI.getRooms();
      setRooms(roomsData);  // Odaları state'e kaydet
    } catch (error: any) {
      console.error('Failed to load rooms:', error);
    }
  };

  // ========== YAŞAM DÖNGÜSÜ HOOK'LARI (useEffect) ==========
  
  // Uygulama ilk açıldığında (mount) çalışır - oturum kontrolü yapar
  useEffect(() => {
    const checkSession = async () => {
      // LocalStorage'dan önceki oturum bilgisini al
      const managerId = localStorage.getItem('managerId');
      if (managerId) {
        try {
          // Yönetici bilgilerini veritabanından kontrol et
          const result = await window.electronAPI.getCurrentManager(parseInt(managerId));
          if (result.success && result.manager) {
            setCurrentManager(result.manager);  // Oturum geçerli, giriş yap
          } else {
            localStorage.removeItem('managerId');  // Geçersiz oturum, temizle
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('managerId');
        }
      }
      setAuthLoading(false);  // Kontrol tamamlandı
    };
    checkSession();
  }, []);  // Boş dizi = sadece ilk açılışta çalış

  // Yönetici giriş yaptığında çalışır - veritabanı bağlantısını test eder ve odaları yükler
  useEffect(() => {
    // Sadece giriş yapılmışsa çalış
    if (!currentManager) return;
    
    // Veritabanı bağlantısını test et ve odaları yükle
    const init = async () => {
      try {
        // Veritabanı bağlantısını test et
        const result = await window.electronAPI.testConnection();
        setConnected(result.success);
        
        if (result.success) {
          // Bağlantı başarılı, odaları yükle
          const roomsData = await window.electronAPI.getRooms();
          setRooms(roomsData);
        } else {
          // Bağlantı başarısız, hata mesajını göster
          setErrorMessage(result.message || 'Unknown error');
        }
      } catch (error: any) {
        console.error('Failed to connect:', error);
        setErrorMessage(error.message || 'Connection failed');
      } finally {
        setLoading(false);  // Yükleme tamamlandı
      }
    };

    init();
  }, [currentManager]);  // currentManager değiştiğinde tekrar çalış

  // Filtre değiştiğinde sayfa numarasını 1'e sıfırla
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter]);  // statusFilter veya typeFilter değişince çalış

  // Giriş yapma fonksiyonu - LoginPage tarafından çağrılır
  const handleLogin = (manager: Manager) => {
    setCurrentManager(manager);  // Yönetici bilgisini kaydet
  };

  // Çıkış yapma fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem('managerId');  // Oturum bilgisini sil
    setCurrentManager(null);  // Yönetici bilgisini temizle
    setRooms([]);  // Odaları temizle
    setCurrentView('rooms');  // Odalar sayfasına dön
  };

  // ========== RENDER MANTIĞI (Ekran Görüntüleme) ==========
  
  // Kimlik doğrulama kontrolü yapılırken dönen animasyon göster
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

  // Giriş yapılmamışsa login sayfasını göster
  if (!currentManager) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // ========== VERİ İŞLEME (Filtreleme ve Sayfalama) ==========
  
  // Odaları duruma ve tipe göre filtrele
  const filteredRooms = rooms.filter(room => {
    const matchesStatus = statusFilter === 'All' || room.Status === statusFilter;
    const matchesType = typeFilter === 'All' || room.Type === typeFilter;
    return matchesStatus && matchesType;  // Her iki koşul da sağlanmalı
  });

  // Sayfalama hesaplamaları
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);  // Toplam sayfa sayısı
  const startIndex = (currentPage - 1) * roomsPerPage;  // Başlangıç indeksi
  const endIndex = startIndex + roomsPerPage;  // Bitiş indeksi
  const paginatedRooms = filteredRooms.slice(startIndex, endIndex);  // Mevcut sayfadaki odalar

  // Odaları kata göre grupla (ör: {1: [oda101, oda102], 2: [oda201, oda202]})
  const roomsByFloor = paginatedRooms.reduce((acc, room) => {
    const floor = room.FloorNumber;
    if (!acc[floor]) acc[floor] = [];  // Eğer bu kat yoksa oluştur
    acc[floor].push(room);  // Odayı ilgili kata ekle
    return acc;
  }, {} as Record<number, Room[]>);

  // Her durumdaki oda sayısını hesapla (filtre butonlarında göstermek için)
  const statusCounts = {
    Available: rooms.filter(r => r.Status === 'Available').length,
    Occupied: rooms.filter(r => r.Status === 'Occupied').length,
    Maintenance: rooms.filter(r => r.Status === 'Maintenance').length,
  };

  // Her tipteki oda sayısını hesapla (filtre butonlarında göstermek için)
  const typeCounts = {
    Standard: rooms.filter(r => r.Type === 'Standard').length,
    Deluxe: rooms.filter(r => r.Type === 'Deluxe').length,
    Suite: rooms.filter(r => r.Type === 'Suite').length,
  };

  // Veriler yüklenirken göster
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="text-text-secondary">Yükleniyor...</div>
      </div>
    );
  }

  // ========== SAYFA RENDERING (Hangi sayfa gösterilecek?) ==========
  
  // Ayarlar sayfasındaysak onu göster
  if (currentView === 'settings') {
    return <SettingsPage currentManager={currentManager} onNavigate={setCurrentView} />;
  }

  // Dashboard sayfasındaysak onu göster (OKUL PROJESİ İÇİN GİZLENDİ)
  if (currentView === 'dashboard') {
    return (
      <div className="flex flex-col min-h-screen bg-background-dark font-display">
        <TitleBar title="Otel Rezervasyon Sistemi - Panel" />
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
              {currentManager.Role === 'Yönetici' && (
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-hover-dark text-text-primary"
                >
                  <span className="material-symbols-outlined">dashboard</span>
                  <p className="text-sm font-medium">Panel</p>
                </button>
              )}

              <button 
                onClick={() => setCurrentView('rooms')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-hover-dark transition-colors"
              >
                <span className="material-symbols-outlined">bed</span>
                <p className="text-sm font-medium">Odalar</p>
              </button>

              <button 
                onClick={() => setCurrentView('guests')}
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
              onClick={() => setCurrentView('settings')}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-hover-dark transition-colors"
            >
              <span className="material-symbols-outlined">settings</span>
              <p className="text-sm font-medium">Ayarlar</p>
            </button>

            <button 
              onClick={handleLogout}
              className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-blue-600 text-text-primary text-sm font-bold transition-colors"
            >
              <span className="truncate">Çıkış Yap</span>
            </button>
          </div>
        </aside>

        {/* Dashboard Content */}
        <DashboardPage />
        </div>
      </div>
    );
  }

  // Misafirler sayfasındaysak onu göster (OKUL PROJESİ İÇİN GİZLENDİ)
  if (currentView === 'guests') {
    return (
      <div className="flex flex-col min-h-screen bg-background-dark font-display">
        <TitleBar title="Otel Rezervasyon Sistemi - Misafirler" />
        <div className="flex flex-1">
        {/* Yan Menü (Sidebar) */}
        <aside className="w-64 bg-sidebar-dark p-4 flex flex-col justify-between">
          <div>
            {/* Logo ve Yönetici Bilgileri */}
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
              {currentManager.Role === 'Yönetici' && (
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-hover-dark transition-colors"
                >
                  <span className="material-symbols-outlined">dashboard</span>
                  <p className="text-sm font-medium">Panel</p>
                </button>
              )}

              <button 
                onClick={() => setCurrentView('rooms')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-hover-dark transition-colors"
              >
                <span className="material-symbols-outlined">bed</span>
                <p className="text-sm font-medium">Odalar</p>
              </button>

              <button 
                onClick={() => setCurrentView('guests')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-hover-dark text-text-primary"
              >
                <span className="material-symbols-outlined">group</span>
                <p className="text-sm font-medium">Misafirler</p>
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
              <p className="text-sm font-medium">Ayarlar</p>
            </button>

            <button 
              onClick={handleLogout}
              className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-blue-600 text-text-primary text-sm font-bold transition-colors"
            >
              <span className="truncate">Çıkış Yap</span>
            </button>
          </div>
        </aside>

        <GuestsPage onNavigate={setCurrentView} />
        </div>
      </div>
    );
  }

  // ========== ANA ODALAR SAYFASI (Floor Plan - Kat Planı) ==========
  // Bu bölüm otel odalarını kat kat gösterir ve yönetir
  return (
    <div className="flex flex-col min-h-screen bg-background-dark font-display">
      <TitleBar title="Otel Rezervasyon Sistemi - Odalar" />
      <div className="flex flex-1">
      {/* Yan Menü (Sidebar) - Sol tarafta sabit duran navigasyon menüsü */}
      <aside className="w-64 bg-sidebar-dark p-4 flex flex-col justify-between">
      <div>
          {/* Logo ve Yönetici Bilgileri - Üst kısımda yönetici ismi ve emaili */}
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
            {currentManager.Role === 'Yönetici' && (
              <button 
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-hover-dark transition-colors"
              >
                <span className="material-symbols-outlined">dashboard</span>
                <p className="text-sm font-medium">Panel</p>
              </button>
            )}

            <button 
              onClick={() => setCurrentView('rooms')}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-hover-dark text-text-primary"
            >
              <span className="material-symbols-outlined">bed</span>
              <p className="text-sm font-medium">Odalar</p>
            </button>

            <button 
              onClick={() => setCurrentView('guests')}
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
            onClick={() => setCurrentView('settings')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-hover-dark transition-colors"
          >
            <span className="material-symbols-outlined">settings</span>
            <p className="text-sm font-medium">Ayarlar</p>
          </button>

          <button 
            onClick={handleLogout}
            className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-blue-600 text-text-primary text-sm font-bold transition-colors"
          >
            <span className="truncate">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Ana İçerik Alanı - Sağ tarafta odaları ve filtreleri gösterir */}
      <main className="flex-1 p-8">
        {/* Başlık ve Oda Yönetim Butonu */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-text-primary text-4xl font-black tracking-tight">Kat Planı</h1>
            <p className="text-text-secondary text-base">Oda durumlarını ve müsaitliği görselleştirin.</p>
          </div>

          {/* Oda Ekleme/Çıkarma Butonu */}
          <button 
            onClick={() => setIsRoomManagementModalOpen(true)}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-text-primary text-sm font-bold hover:bg-primary/80 transition-colors"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span className="material-symbols-outlined text-base">remove_circle</span>
            <span className="truncate">Odalar</span>
          </button>
        </div>

        {/* Aksiyon Butonları Satırı - Rezervasyon oluşturma ve dışa aktarma */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {/* Yeni Rezervasyon Oluştur */}
          <button 
            onClick={() => setIsNewReservationModalOpen(true)}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-4 bg-green-600 hover:bg-green-700 text-text-primary text-sm font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span className="truncate">Yeni Rezervasyon</span>
          </button>
          {/* Odaları CSV olarak İndir */}
          <button 
            onClick={() => downloadCSV('rooms')}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-4 bg-blue-600 hover:bg-blue-700 text-text-primary text-sm font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span className="truncate">Odaları Dışa Aktar</span>
          </button>
          {/* Rezervasyonları CSV olarak İndir */}
          <button 
            onClick={() => downloadCSV('reservations')}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-4 bg-purple-600 hover:bg-purple-700 text-text-primary text-sm font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span className="truncate">Rezervasyonları Dışa Aktar</span>
          </button>
        </div>

        {/* Durum Filtreleri - Odaları durumlarına göre filtrele (Müsait/Dolu/Bakımda) */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <button 
            onClick={() => setStatusFilter('All')}
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-all ${
              statusFilter === 'All' ? 'bg-primary' : 'bg-hover-dark hover:bg-hover-dark/70'
            }`}
          >
            <p className="text-text-primary text-sm font-medium">Tümü ({rooms.length})</p>
          </button>

          <button 
            onClick={() => setStatusFilter('Available')}
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-all ${
              statusFilter === 'Available' ? 'bg-[#1C4B41]' : 'bg-[#1C4B41]/50 hover:bg-[#1C4B41]/70'
            }`}
          >
            <div className="size-2 rounded-full bg-status-available"></div>
            <p className="text-green-200 text-sm font-medium">Müsait ({statusCounts.Available})</p>
          </button>

          <button 
            onClick={() => setStatusFilter('Occupied')}
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-all ${
              statusFilter === 'Occupied' ? 'bg-[#4A3A23]' : 'bg-[#4A3A23]/50 hover:bg-[#4A3A23]/70'
            }`}
          >
            <div className="size-2 rounded-full bg-status-occupied"></div>
            <p className="text-yellow-200 text-sm font-medium">Dolu ({statusCounts.Occupied})</p>
          </button>

          <button 
            onClick={() => setStatusFilter('Maintenance')}
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-all ${
              statusFilter === 'Maintenance' ? 'bg-[#4D273A]' : 'bg-[#4D273A]/50 hover:bg-[#4D273A]/70'
            }`}
          >
            <div className="size-2 rounded-full bg-status-maintenance"></div>
            <p className="text-red-200 text-sm font-medium">Bakımda ({statusCounts.Maintenance})</p>
          </button>
        </div>

        {/* Oda Tipi Filtreleri - Odaları tiplerine göre filtrele (Standard/Deluxe/Suite) */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <button 
            onClick={() => setTypeFilter('All')}
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-all ${
              typeFilter === 'All' ? 'bg-primary' : 'bg-hover-dark hover:bg-hover-dark/70'
            }`}
          >
            <p className="text-text-primary text-sm font-medium">Tüm Tipler</p>
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

        {/* Oda Tablosu - Odaları kat kat gösteren ana grid yapısı */}
        <div className="bg-sidebar-dark p-8 rounded-lg border border-border-color">
          {/* Veritabanı bağlı değilse hata mesajı göster */}
          {!connected ? (
            <div className="text-center py-12">
              <p className="text-red-400 text-lg mb-2">❌ Veritabanı bağlı değil</p>
              <p className="text-text-secondary">Lütfen MySQL bağlantınızı kontrol edin</p>
              {errorMessage && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500 rounded-lg max-w-md mx-auto">
                  <p className="text-red-300 text-sm font-mono">{errorMessage}</p>
                </div>
              )}
            </div>
          ) : filteredRooms.length === 0 ? (
            // Filtre sonucu oda bulunamadıysa mesaj göster
            <div className="text-center py-12">
              <p className="text-text-secondary text-lg">Bu filtre için oda bulunamadı</p>
              <p className="text-text-secondary text-sm mt-2">Farklı bir durum seçmeyi deneyin</p>
            </div>
          ) : (
            // Odalar var, kat kat göster
            <div className="space-y-8">
              {/* Her kat için döngü (1. kat, 2. kat, 3. kat...) */}
              {Object.keys(roomsByFloor).sort((a, b) => Number(a) - Number(b)).map(floorNum => (
                <div key={floorNum}>
                  {/* Kat Başlığı */}
                  <h3 className="text-text-primary font-bold text-lg mb-4">
                    Kat {floorNum}
                  </h3>
                  
                  {/* Bu kattaki odaların grid'i - 4 sütun halinde göster */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Bu kattaki her oda için kart oluştur */}
                    {roomsByFloor[Number(floorNum)].map((room) => {
                // Oda durumuna göre renk belirle (Müsait=yeşil, Dolu=sarı, Bakım=kırmızı)
                const statusColor = 
                  room.Status === 'Available' ? 'bg-green-800/20 border-green-500' :
                  room.Status === 'Occupied' ? 'bg-yellow-800/20 border-yellow-500' :
                  'bg-red-800/20 border-red-500';
                
                // Durum noktası rengi
                const dotColor =
                  room.Status === 'Available' ? 'bg-status-available' :
                  room.Status === 'Occupied' ? 'bg-status-occupied' :
                  'bg-status-maintenance';

                // Durum yazısı rengi
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
                    <p className={`${textColor} text-sm`}>
                      {room.Status === 'Available' ? 'Müsait' : room.Status === 'Occupied' ? 'Dolu' : 'Bakımda'}
                    </p>

                    {/* Hover Details */}
                    <div className="absolute left-0 bottom-full mb-2 w-full bg-card-dark p-3 rounded-lg shadow-lg z-10 hidden group-hover:block">
                      <p className="text-text-primary font-bold">Oda {room.RoomNumber}</p>
                      <p className="text-text-secondary">
                        {room.Type === 'Standard' ? 'Standart' : room.Type === 'Deluxe' ? 'Deluxe' : 'Suit'}
                      </p>
                      {room.Status === 'Occupied' && (
                        <p className="text-text-primary text-sm mt-1">Misafir: Yükleniyor...</p>
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
              {filteredRooms.length} odadan {startIndex + 1}-{Math.min(endIndex, filteredRooms.length)} arası gösteriliyor
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

      {/* ========== MODALLAR (Açılır Pencereler) ========== */}
      
      {/* Oda Detay Modalı - Bir odaya tıklandığında açılır, oda bilgilerini ve rezervasyon detaylarını gösterir */}
      <RoomDetailsModal 
        room={selectedRoom}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onReservationUpdated={handleReservationCreated}
      />

      {/* Yeni Rezervasyon Modalı - Yeni rezervasyon oluşturmak için form içerir */}
      <NewReservationModal
        isOpen={isNewReservationModalOpen}
        onClose={() => setIsNewReservationModalOpen(false)}
        onReservationCreated={handleReservationCreated}
      />

      {/* Oda Yönetim Modalı - Oda ekleme veya silme işlemleri için */}
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
