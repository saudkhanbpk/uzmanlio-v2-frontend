import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { eventService } from "../services/eventService";
import { EventEditModal } from "./EventEditModal";
// Events Component
export const Events = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = '68c94094d011cdb0e5fa2caa'; // Mock user ID for development

  // Load events on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const eventsData = await eventService.getEvents(userId);
      setEvents(eventsData);
    } catch (err) {
      setError('Etkinlikler yüklenirken bir hata oluştu.');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock events for fallback (keeping original structure)
  const mockEvents = [
    {
      id: 1,
      title: 'WordPress ile Web Tasarım Masterclass',
      date: '2024-06-25',
      time: '19:00',
      duration: 180,
      attendees: 45,
      maxAttendees: 50,
      price: 299,
      status: 'completed', // tamamlandı
      eventType: 'online',
      meetingType: 'grup',
      platform: 'zoom',
      consultee: null
    },
    {
      id: 2,
      title: 'Dijital Pazarlama Stratejileri',
      date: '2024-06-28',
      time: '20:00',
      duration: 120,
      attendees: 32,
      maxAttendees: 60,
      price: 199,
      status: 'approved', // onaylandı (yaklaşan)
      eventType: 'online',
      meetingType: 'grup',
      platform: 'google-meet',
      consultee: null
    },
    {
      id: 3,
      title: 'React Geliştirme Bootcamp',
      date: '2024-07-02',
      time: '18:30',
      duration: 240,
      attendees: 78,
      maxAttendees: 100,
      price: 599,
      status: 'pending', // onay bekliyor
      eventType: 'hybrid',
      meetingType: 'grup',
      platform: 'microsoft-teams',
      location: 'İstanbul Teknik Park',
      consultee: null
    },
    {
      id: 4,
      title: 'Birebir SEO Danışmanlığı',
      date: '2024-06-30',
      time: '14:00',
      duration: 60,
      attendees: 1,
      maxAttendees: 1,
      price: 500,
      status: 'approved', // onaylandı (yaklaşan)
      eventType: 'online',
      meetingType: '1-1',
      platform: 'zoom',
      consultee: { name: 'Ayşe Demir' }
    },
    {
      id: 5,
      title: 'E-ticaret Workshop',
      date: '2024-06-20',
      time: '16:00',
      duration: 150,
      attendees: 25,
      maxAttendees: 30,
      price: 350,
      status: 'cancelled', // iptal edildi
      eventType: 'offline',
      meetingType: 'grup',
      location: 'Beşiktaş Konferans Salonu',
      consultee: null
    }
  ];

  // Use real events if available, otherwise use mock events
  const displayEvents = events.length > 0 ? events : mockEvents;

  const tabs = [
    { id: 'all', name: 'Tümü', count: displayEvents.length },
    { id: 'pending', name: 'Onay Bekliyor', count: displayEvents.filter(e => e.status === 'pending').length },
    { id: 'approved', name: 'Yaklaşan', count: displayEvents.filter(e => e.status === 'approved').length },
    { id: 'completed', name: 'Tamamlandı', count: displayEvents.filter(e => e.status === 'completed').length },
    { id: 'cancelled', name: 'İptal Edildi', count: displayEvents.filter(e => e.status === 'cancelled').length },
  ];

  const filteredEvents = activeTab === 'all' ? displayEvents : displayEvents.filter(e => e.status === activeTab);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Onay Bekliyor', color: 'bg-yellow-100 text-yellow-800' },
      approved: { text: 'Onaylandı', color: 'bg-blue-100 text-blue-800' },
      completed: { text: 'Tamamlandı', color: 'bg-green-100 text-green-800' },
      cancelled: { text: 'İptal Edildi', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status];
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const handleApprove = async (eventId) => {
    try {
      await eventService.updateEventStatus(userId, eventId, 'approved');
      await loadEvents(userId); // Reload events to reflect changes
    } catch (err) {
      alert('Etkinlik onaylanırken bir hata oluştu.');
      console.error('Error approving event:', err);
    }
  };

  const handleReject = async (eventId) => {
    try {
      await eventService.updateEventStatus(userId, eventId, 'cancelled');
      await loadEvents(); // Reload events to reflect changes
    } catch (err) {
      alert('Etkinlik reddedilirken bir hata oluştu.');
      console.error('Error rejecting event:', err);
    }
  };

  const handleJoin = (eventId) => {
    console.log('Etkinliğe katıl:', eventId);
    // Here you would handle joining the event (redirect to meeting platform)
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
      try {
        userId = localStorage.getItem(user._id)
        await eventService.deleteEvent(userId, eventId);
        await loadEvents(); // Reload events to reflect changes
      } catch (err) {
        alert('Etkinlik silinirken bir hata oluştu.');
        console.error('Error deleting event:', err);
      }
    }
  };

  const handleEventUpdate = async (updatedEvent) => {
    try {
      await eventService.updateEvent(userId, updatedEvent.id, updatedEvent);
      await loadEvents(); // Reload events to reflect changes
      setShowEditModal(false);
    } catch (err) {
      alert('Etkinlik güncellenirken bir hata oluştu.');
      console.error('Error updating event:', err);
    }
  };
 
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Etkinlikler</h1>
        <Link 
          to="/dashboard/etkinlikler/olustur"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Yeni Etkinlik
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Etkinlikler yükleniyor...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Hata</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadEvents}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Tekrar Dene
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events List */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Etkinlik Listesi</h3>
          </div>
          <div className="divide-y divide-gray-200">
          {filteredEvents.map((event) => (
            <div key={event.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-medium text-gray-900">{event.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      event.eventType === 'online' ? 'bg-blue-100 text-blue-800' : 
                      event.eventType === 'offline' ? 'bg-green-100 text-green-800' : 
                      'bg-primary-100 text-primary-800'
                    }`}>
                      {event.eventType === 'online' ? 'Online' : 
                       event.eventType === 'offline' ? 'Yüz Yüze' : 'Hibrit'}
                    </span>
                    {event.meetingType === '1-1' && event.consultee ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                        {event.consultee.name}
                      </span>
                    ) : event.meetingType === '1-1' ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                        1-1 Özel
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex items-center space-x-6 text-sm text-gray-600">
                    <span>📅 {event.date}</span>
                    <span>⏰ {event.time}</span>
                    <span>⏱️ {event.duration} dk</span>
                    {event.meetingType === 'grup' ? (
                      <span>👥 {event.attendees}/{event.maxAttendees}</span>
                    ) : event.consultee ? (
                      <span>👤 {event.consultee.name}</span>
                    ) : (
                      <span>👤 Birebir</span>
                    )}
                    <span>💰 ₺{event.price}</span>
                    {event.platform && <span>🔗 {event.platform}</span>}
                    {event.location && <span>📍 {event.location}</span>}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {/* Action Buttons - Left side */}
                  <div className="flex items-center space-x-2">
                    {/* Approve/Reject buttons for non-completed events */}
                    {event.status !== 'completed' && event.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleApprove(event.id)}
                          className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                          title="Onayla"
                        >
                          ✓
                        </button>
                        <button 
                          onClick={() => handleReject(event.id)}
                          className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                          title="Reddet"
                        >
                          ✗
                        </button>
                      </>
                    )}
                    
                    {/* Join button for approved events */}
                    {event.status === 'approved' && (
                      <button 
                        onClick={() => handleJoin(event.id)}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded text-sm hover:bg-primary-200 transition-colors"
                      >
                        Katıl
                      </button>
                    )}
                  </div>
                  
                  {/* Status Badge and Settings - Right side */}
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(event.status)}
                    <button 
                      onClick={() => handleEdit(event)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      ⚙️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && selectedEvent && (
        <EventEditModal
          event={selectedEvent}
          onClose={() => setShowEditModal(false)}
          onDelete={handleDelete}
          onUpdate={handleEventUpdate}
        />
      )}
    </div>
  );
};