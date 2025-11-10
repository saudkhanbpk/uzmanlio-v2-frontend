import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { profileService } from "../services/ProfileServices";

// Dashboard Home Component
export const DashboardHome = () => {
  const [fetchedEvents, setFetchedEvents] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    const userId = '68c94094d011cdb0e5fa2caa'; // Mock user ID for development
    profileService.getProfile(userId)
      .then(data => {
        if (data && data.events && Array.isArray(data.events)) {
          console.log('Fetched profile:', data);

          // Sort events by date
          const sortedEvents = data.events.sort((a, b) => new Date(a.date) - new Date(b.date));

          // Upcoming appointments: events in future (max 7)
          const upcoming = sortedEvents
            .filter(evt => new Date(evt.date) >= new Date())
            .slice(0, 7)
            .map(evt => ({
              id: evt.id || evt._id,
              customerName: evt.selectedClients?.[0]?.name || "Belirtilmemiş",
              date: evt.date,
              time: evt.time || "",
              service: evt.serviceName || "Hizmet",
            }));
          setUpcomingAppointments(upcoming);

          // Recent events: last 3 past events
          const recent = sortedEvents
            .filter(evt => new Date(evt.date) < new Date())
            .slice(-3)
            .map(evt => ({
              name: evt.title,
              date: new Date(evt.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }),
              attendees: evt.selectedClients?.length || 0,
              status: evt.status === 'approved' ? 'Tamamlandı' : 'Yaklaşan',
            }));
          setRecentEvents(recent);

          // Save all fetched events if needed
          setFetchedEvents(sortedEvents);
        }
      })
      .catch(console.error);
  }, []);

  const stats = [
    { name: 'Toplam Gelir', value: '₺42,890', change: '+12.5%', trend: 'up' },
    { name: 'Aktif Müşteriler', value: '1,247', change: '+8.2%', trend: 'up' },
    { name: 'Bu Ay Satış', value: '156', change: '+23.1%', trend: 'up' },
    { name: 'Tamamlanan Etkinlikler', value: '23', change: '+5.4%', trend: 'up' },
  ];

  const [showVacationModal, setShowVacationModal] = useState(false);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Hoş geldiniz, Ahmet!</h1>
        <p className="text-primary-100 text-lg">İşiniz harika gözüküyor. İşte son durumunuz.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${stat.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Yaklaşan Randevular</h3>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{appointment.customerName}</p>
                  <p className="text-sm text-gray-600">{appointment.service}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(appointment.date).toLocaleDateString('tr-TR')}
                  </p>
                  <p className="text-sm text-gray-600">{appointment.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="etkinlikler/olustur"
              className="p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors text-left block"
            >
              <div className="text-2xl mb-2">📅</div>
              <p className="font-medium text-gray-900">Yeni Etkinlik</p>
              <p className="text-sm text-gray-600">Etkinlik oluştur</p>
            </Link>
            <Link
              to="customers"
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left block"
            >
              <div className="text-2xl mb-2">👤</div>
              <p className="font-medium text-gray-900">Yeni Danışan</p>
              <p className="text-sm text-gray-600">Danışan ekle</p>
            </Link>
            <button
              onClick={() => setShowVacationModal(true)}
              className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-left"
            >
              <div className="text-2xl mb-2">🌴</div>
              <p className="font-medium text-gray-900">Tatil Moduna Al</p>
              <p className="text-sm text-gray-600">Takvimi kapat</p>
            </button>
            <Link
              to="calendar"
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left block"
            >
              <div className="text-2xl mb-2">📅</div>
              <p className="font-medium text-gray-900">Takvim</p>
              <p className="text-sm text-gray-600">Takvimi görüntüle</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Events Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Etkinlikler</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentEvents.map((event, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{event.name}</p>
                <p className="text-sm text-gray-600">{event.date} • {event.attendees} katılımcı</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${event.status === 'Tamamlandı' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                {event.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Vacation Mode Modal */}
      {showVacationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tatil Moduna Al</h3>
              <button
                onClick={() => setShowVacationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Information Box */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-blue-500 text-xl">ℹ️</span>
                </div>
                <p className="text-sm text-blue-800">
                  Bu özellik mevcut randevularınızı etkilemez ancak takviminizi yeni randevulara kapatır.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-6">
              <button
                onClick={() => setShowVacationModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  console.log('Tatil modu etkinleştirildi');
                  setShowVacationModal(false);
                }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Etkinleştir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
