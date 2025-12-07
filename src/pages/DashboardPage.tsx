import { useState, useEffect } from 'react';

interface DashboardStats {
  occupancyRate: number;
  occupancyChange: number;
  todayCheckIns: number;
  checkInsChange: number;
  todayCheckOuts: number;
  checkOutsChange: number;
  bookingTrends: { date: string; count: number }[];
  totalBookings: number;
  bookingsChange: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  color: 'primary' | 'warning' | 'success';
  icon: string;
}

type TimeFilter = 'today' | '7days' | '30days';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7days');
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    description: '',
    date: '',
    color: 'primary',
    icon: 'calendar_month'
  });

  useEffect(() => {
    loadDashboardStats();
    loadEvents();
  }, [timeFilter]);

  const loadDashboardStats = async () => {
    try {
      console.log('Loading dashboard stats for filter:', timeFilter);
      const data = await window.electronAPI.getDashboardStats(timeFilter);
      console.log('Dashboard stats loaded:', data);
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      
      setStats({
        occupancyRate: 0,
        occupancyChange: 0,
        todayCheckIns: 0,
        checkInsChange: 0,
        todayCheckOuts: 0,
        checkOutsChange: 0,
        bookingTrends: [],
        totalBookings: 0,
        bookingsChange: 0
      });
    }
  };

  const loadEvents = () => {
    const stored = localStorage.getItem('hotel-events');
    if (stored) {
      setEvents(JSON.parse(stored));
    }
  };

  const saveEvents = (updatedEvents: Event[]) => {
    localStorage.setItem('hotel-events', JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
  };

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date) {
      alert('Please fill in title and date');
      return;
    }

    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title!,
      description: newEvent.description || '',
      date: newEvent.date!,
      color: newEvent.color || 'primary',
      icon: newEvent.icon || 'calendar_month'
    };

    saveEvents([...events, event]);
    setShowEventModal(false);
    setNewEvent({
      title: '',
      description: '',
      date: '',
      color: 'primary',
      icon: 'calendar_month'
    });
  };

  const handleDeleteEvent = (id: string) => {
    saveEvents(events.filter(e => e.id !== id));
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'primary': return 'bg-[#137fec]';
      case 'warning': return 'bg-[#fa6238]';
      case 'success': return 'bg-[#0bda5b]';
      default: return 'bg-[#137fec]';
    }
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[#92adc9] text-lg">Panel yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 gap-6 p-6 md:p-8">
      {}
      <div className="flex-[0.6] flex flex-col gap-8 min-w-0">
        {}
        <header className="flex flex-wrap justify-between gap-4 items-center">
          <h2 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
            Otel Performans Paneli
          </h2>
        </header>

        {}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2 rounded-lg p-6 border border-[#324d67]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white">sell</span>
            <p className="text-white text-base font-medium leading-normal">Doluluk Oranı</p>
          </div>
          <p className="text-white tracking-light text-2xl font-bold leading-tight">
            {stats.occupancyRate}%
          </p>
          <p className={`text-base font-medium leading-normal ${stats.occupancyChange >= 0 ? 'text-[#0bda5b]' : 'text-[#fa6238]'}`}>
            {stats.occupancyChange >= 0 ? '+' : ''}{stats.occupancyChange}%
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-lg p-6 border border-[#324d67]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white">login</span>
            <p className="text-white text-base font-medium leading-normal">Bugünkü Giriş Sayısı</p>
          </div>
          <p className="text-white tracking-light text-2xl font-bold leading-tight">
            {stats.todayCheckIns}
          </p>
          <p className={`text-base font-medium leading-normal ${stats.checkInsChange >= 0 ? 'text-[#0bda5b]' : 'text-[#fa6238]'}`}>
            {stats.checkInsChange >= 0 ? '+' : ''}{stats.checkInsChange}%
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-lg p-6 border border-[#324d67]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white">logout</span>
            <p className="text-white text-base font-medium leading-normal">Bugünkü Çıkış Sayısı</p>
          </div>
          <p className="text-white tracking-light text-2xl font-bold leading-tight">
            {stats.todayCheckOuts}
          </p>
          <p className={`text-base font-medium leading-normal ${stats.checkOutsChange >= 0 ? 'text-[#0bda5b]' : 'text-[#fa6238]'}`}>
            {stats.checkOutsChange >= 0 ? '+' : ''}{stats.checkOutsChange}%
          </p>
        </div>
      </section>

      {}
      <section className="flex flex-col gap-6 rounded-lg border border-[#324d67] p-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-white">trending_up</span>
              <p className="text-white text-base font-medium leading-normal">Rezervasyon Trendleri</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-white tracking-light text-2xl font-bold leading-tight truncate">
                {stats.totalBookings}
              </p>
              <p className={`text-sm font-medium leading-normal ${stats.bookingsChange >= 0 ? 'text-[#0bda5b]' : 'text-[#fa6238]'}`}>
                {stats.bookingsChange >= 0 ? '+' : ''}{stats.bookingsChange}%
              </p>
            </div>
          </div>

          {}
          <div className="flex items-center bg-[#233648] rounded-lg p-1">
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-3 py-1 text-white text-sm font-medium rounded-md ${
                timeFilter === 'today' ? 'bg-[#324d67]' : ''
              }`}
            >
              Bugün
            </button>
            <button
              onClick={() => setTimeFilter('7days')}
              className={`px-3 py-1 text-white text-sm font-medium rounded-md ${
                timeFilter === '7days' ? 'bg-[#324d67]' : ''
              }`}
            >
              Son 7 Gün
            </button>
            <button
              onClick={() => setTimeFilter('30days')}
              className={`px-3 py-1 text-white text-sm font-medium rounded-md ${
                timeFilter === '30days' ? 'bg-[#324d67]' : ''
              }`}
            >
              Son 30 Gün
            </button>
          </div>
        </div>

        {}
        <div className="relative h-[350px] w-full">
          <BookingChart data={stats.bookingTrends} />
        </div>
      </section>

      </div>

      {}
      <aside className="flex-[0.4] flex flex-col gap-8 min-w-0">
        {}
        <header className="flex flex-wrap justify-between gap-4 items-center">
          <h2 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
            Yaklaşan Etkinlikler
          </h2>
          <button
            onClick={() => setShowEventModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            <span className="text-sm font-medium">Etkinlik Ekle</span>
          </button>
        </header>

        {}
        <section className="flex flex-col gap-6 rounded-lg border border-[#324d67] p-6 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-4">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-6xl text-[#324d67] mb-2">event</span>
                <p className="text-[#92adc9] text-sm">Yaklaşan etkinlik yok</p>
                <p className="text-[#92adc9] text-xs mt-1">Eklemek için + tıklayın</p>
              </div>
            ) : (
              events.map(event => (
                <div key={event.id} className="flex items-start gap-3 group">
                  <div className={`${getColorClass(event.color)} size-10 rounded-full flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-outlined text-white text-lg">{event.icon}</span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-white text-sm font-medium leading-normal">{event.title}</p>
                    <div className="max-h-12 overflow-y-auto event-description-scroll pr-2">
                      <p className="text-[#92adc9] text-xs font-normal leading-normal">{event.description}</p>
                    </div>
                    <p className="text-[#92adc9] text-xs font-normal leading-normal mt-1">{event.date}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[#fa6238] hover:text-[#ff4444] shrink-0"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </aside>

      {}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowEventModal(false)}>
          <div className="bg-[#192633] rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white text-xl font-bold mb-4">Etkinlik Oluştur</h3>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[#92adc9] text-sm mb-2 block">Başlık</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-2 bg-[#233648] text-white border border-[#324d67] rounded-lg focus:outline-none focus:border-[#137fec]"
                  placeholder="Etkinlik başlığı"
                />
              </div>

              <div>
                <label className="text-[#92adc9] text-sm mb-2 block">Açıklama</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-4 py-2 bg-[#233648] text-white border border-[#324d67] rounded-lg focus:outline-none focus:border-[#137fec] resize-none"
                  rows={3}
                  placeholder="Etkinlik açıklaması"
                />
              </div>

              <div>
                <label className="text-[#92adc9] text-sm mb-2 block">Tarih</label>
                <input
                  type="text"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-4 py-2 bg-[#233648] text-white border border-[#324d67] rounded-lg focus:outline-none focus:border-[#137fec]"
                  placeholder="Örn: 24-26 Aralık veya 10-12 Ocak"
                />
              </div>

              <div>
                <label className="text-[#92adc9] text-sm mb-2 block">Renk</label>
                <div className="flex gap-2">
                  {(['primary', 'warning', 'success'] as const).map(color => (
                    <button
                      key={color}
                      onClick={() => setNewEvent({ ...newEvent, color })}
                      className={`w-10 h-10 rounded-full ${getColorClass(color)} ${
                        newEvent.color === color ? 'ring-2 ring-white' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[#92adc9] text-sm mb-2 block">İkon</label>
                <select
                  value={newEvent.icon}
                  onChange={(e) => setNewEvent({ ...newEvent, icon: e.target.value })}
                  className="w-full px-4 py-2 bg-[#233648] text-white border border-[#324d67] rounded-lg focus:outline-none focus:border-[#137fec]"
                >
                  <option value="calendar_month">Takvim</option>
                  <option value="group">Grup</option>
                  <option value="construction">İnşaat</option>
                  <option value="celebration">Kutlama</option>
                  <option value="warning">Uyarı</option>
                  <option value="event">Etkinlik</option>
                </select>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCreateEvent}
                  className="flex-1 px-4 py-2 bg-[#137fec] text-white rounded-lg hover:bg-[#1068c9] transition-colors"
                >
                  Etkinlik Oluştur
                </button>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 px-4 py-2 bg-[#233648] text-white rounded-lg hover:bg-[#324d67] transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function BookingChart({ data }: { data: { date: string; count: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-[#324d67] mb-2">trending_up</span>
          <p className="text-[#92adc9] text-lg">Henüz rezervasyon verisi yok</p>
          <p className="text-[#92adc9] text-sm mt-1">Trend görmek için rezervasyon oluşturun!</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 350;
    const y = 150 - ((d.count / maxCount) * 120);
    return `${x},${y}`;
  }).join(' ');

  return (
    <>
      <svg className="absolute inset-0 w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 350 150">
        <polyline points={points} stroke="#137fec" strokeWidth="2" fill="none" />
        <polyline points={`0,150 ${points} 350,150`} fill="url(#paint0_linear)" />
        <defs>
          <linearGradient id="paint0_linear" x1="175" x2="175" y1="0" y2="150" gradientUnits="userSpaceOnUse">
            <stop stopColor="#137fec" stopOpacity="0.2" />
            <stop offset="1" stopColor="#137fec" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-end justify-between px-4 pb-2 text-[#92adc9] text-xs">
        {data.map((d, i) => (
          <span key={i} className="text-center">
            {typeof d.date === 'string' ? d.date : new Date(d.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
          </span>
        ))}
      </div>
    </>
  );
}
