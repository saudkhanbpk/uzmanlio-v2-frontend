import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { eventService } from "../services/eventService";
import { EventEditModal } from "./EventEditModal";
import { ViewModeSwitcher } from "../components/ViewModeSwitcher";
import { useViewMode } from "../contexts/ViewModeContext";
import { useUser } from "../context/UserContext";
import { useInstitutionUsers } from "../contexts/InstitutionUsersContext";

// Events Component
export const Events = () => {
  const { viewMode, setViewMode } = useViewMode();
  const [activeTab, setActiveTab] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userContext = useUser();
  const user = userContext.user;
  const userSubscription = userContext.user?.subscription;

  // Check if user is admin (only admins with institutional plan can see institution view)
  const isAdmin = user?.subscription?.isAdmin === true && user?.subscription?.plantype === "institutional";
  const canAccessInstitutionView = isAdmin;

  // Use the InstitutionUsers context for caching
  const {
    institutionUsers,
    fetchInstitutionUsers,
    getAllEvents,
    isLoaded: institutionDataLoaded,
    loading: institutionLoading
  } = useInstitutionUsers();

  const userId = localStorage.getItem('userId');

  // Load events on component mount and when view mode changes or user.events changes
  useEffect(() => {
    console.log("[Events] useEffect triggered - viewMode:", viewMode, "userId:", userId, "userEventsCount:", user?.events?.length || 0);
    loadEvents();
  }, [viewMode, userId, user?.events]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      let eventsData = [];

      // Check if we're in institution view mode
      if (viewMode === 'institution' && canAccessInstitutionView) {
        console.log("[Events] Institution view mode detected");
        console.log("[Events] Checking institutionUsers in context:", institutionUsers);
        console.log("[Events] Number of users in context:", institutionUsers?.length || 0);

        // Check if context already has users data
        if (institutionUsers && institutionUsers.length > 0) {
          console.log("[Events] ✅ Using cached data from InstitutionUsersContext");

          // Get events from all users in context
          eventsData = getAllEvents();
          console.log("[Events] Events extracted from context:", eventsData.length);
        } else {
          console.log("[Events] ⏳ No cached data - Making API call to fetch institution users...");

          // Make API call to fetch all institution users
          const fetchedUsers = await fetchInstitutionUsers(userId, userSubscription);
          console.log("[Events] API Response - Fetched users:", fetchedUsers?.length || 0);

          // Extract events directly from fetched users (don't rely on context state which hasn't updated yet)
          if (fetchedUsers && fetchedUsers.length > 0) {
            eventsData = fetchedUsers.flatMap(user => {
              console.log(`[Events] User ${user.information?.name}: ${user.events?.length || 0} events`);
              return (user.events || []).map(event => ({
                ...event,
                expertId: user._id,
                expertName: `${user.information?.name || ''} ${user.information?.surname || ''}`.trim()
              }));
            });
            console.log("[Events] Events extracted from fetched users:", eventsData.length);
          }
        }
      } else {
        // Individual view - use events from UserContext instead of API call
        console.log("[Events] Individual view mode - using events from UserContext");

        // Check if user.events is available in context (populated from backend)
        if (user?.events && Array.isArray(user.events) && user.events.length > 0) {
          console.log("[Events] ✅ Using events from UserContext:", user.events.length, "events");
          eventsData = user.events;
        } else {
          // Fallback to API call if events not in context (e.g., first load or context not ready)
          console.log("[Events] ⚠️ No events in UserContext, falling back to API call");
          eventsData = await eventService.getEvents(userId);
          console.log("[Events] Events fetched from API:", eventsData?.length || 0);
        }
      }

      console.log("[Events] Final events to display:", eventsData);
      setEvents(eventsData || []);
    } catch (err) {
      setError('Etkinlikler yüklenirken bir hata oluştu.');
      console.error('[Events] Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };



  // Use real events if available, otherwise use mock events
  const displayEvents = events.length > 0 ? events : [];

  const tabs = [
    { id: 'all', name: 'Tümü', count: displayEvents.length },
    { id: 'pending', name: 'Onay Bekliyor', count: displayEvents.filter(e => e.status === 'pending' || e.status === 'onay-bekliyor').length },
    { id: 'approved', name: 'Yaklaşan', count: displayEvents.filter(e => e.status === 'approved').length },
    { id: 'completed', name: 'Tamamlandı', count: displayEvents.filter(e => e.status === 'completed').length },
    { id: 'cancelled', name: 'İptal Edildi', count: displayEvents.filter(e => e.status === 'cancelled').length },
    { id: 'scheduled', name: 'Yaklaşan', count: displayEvents.filter(e => e.status === 'scheduled').length },
  ];

  const filteredEvents = activeTab === 'all' ? displayEvents : displayEvents.filter(e => e.status === activeTab);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Onay Bekliyor', color: 'bg-yellow-100 text-yellow-800' },
      approved: { text: 'Onaylandı', color: 'bg-blue-100 text-blue-800' },
      completed: { text: 'Tamamlandı', color: 'bg-green-100 text-green-800' },
      cancelled: { text: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
      scheduled: { text: 'Yaklaşan', color: 'bg-yellow-100 text-yellow-800' }
    };
    const normalizedStatus = status === 'onay-bekliyor' ? 'pending' : status;

    // Fallback for unknown status
    const config = statusConfig[normalizedStatus] || { text: 'Bilinmiyor', color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // Helper to get the correct user ID for API calls (owner's ID, not current user)
  const getEventOwnerId = (event) => {
    return event.expertId || event.userId || userId;
  };

  const handleApprove = async (event) => {
    // Show loading state
    Swal.fire({
      title: 'Onaylanıyor...',
      text: 'Etkinlik onaylanıyor, lütfen bekleyin.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const eventId = event._id;
      const ownerId = getEventOwnerId(event);
      await eventService.updateEventStatus(ownerId, eventId, 'approved');
      await loadEvents(userId); // Reload events to reflect changes

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Onaylandı!',
        text: 'Etkinlik başarıyla onaylandı.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Error approving event:', err);
      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: 'Etkinlik onaylanırken bir hata oluştu.',
        confirmButtonText: 'Tamam'
      });
    }
  };

  const handleReject = async (event) => {
    // First confirm with user
    const result = await Swal.fire({
      title: 'Emin misiniz?',
      text: 'Bu etkinliği reddetmek istediğinizden emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Evet, Reddet',
      cancelButtonText: 'İptal'
    });

    if (!result.isConfirmed) return;

    // Show loading state
    Swal.fire({
      title: 'İşleniyor...',
      text: 'Etkinlik reddediliyor, lütfen bekleyin.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const ownerId = getEventOwnerId(event);
      await eventService.updateEventStatus(ownerId, event._id, 'cancelled');
      await loadEvents(userId); // Reload events to reflect changes

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Reddedildi!',
        text: 'Etkinlik başarıyla reddedildi.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Error rejecting event:', err);
      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: 'Etkinlik reddedilirken bir hata oluştu.',
        confirmButtonText: 'Tamam'
      });
    }
  };

  const handleJoin = (event) => {
    const joinUrl = event.videoMeetingUrl || event.platform;
    if (joinUrl) {
      if (!joinUrl.startsWith('http')) {
        // Handle cases where platform might be just "Zoom" or "Jitsi" instead of a URL
        if (joinUrl.toLowerCase().includes('zoom')) {
          Swal.fire('Bilgi', 'Zoom linki belirtilmemiş. Lütfen etkinlik detaylarını kontrol edin.', 'info');
        } else if (joinUrl.toLowerCase().includes('jitsi')) {
          const jitsiRoom = `uzmanlio-${event._id}`;
          window.open(`/meeting/${jitsiRoom}`, '_blank');
        } else {
          Swal.fire('Uyarı', 'Geçerli bir katılım linki bulunamadı.', 'warning');
        }
      } else {
        window.open(joinUrl, '_blank');
      }
    } else {
      Swal.fire('Uyarı', 'Bu etkinlik için henüz bir katılım linki oluşturulmamış.', 'warning');
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleDelete = async (event) => {
    if (window.confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
      try {
        const ownerId = getEventOwnerId(event);
        await eventService.deleteEvent(ownerId, event._id);
        await loadEvents(userId); // Reload events to reflect changes
      } catch (err) {
        alert('Etkinlik silinirken bir hata oluştu.');
        console.error('Error deleting event:', err);
      }
    }
  };

  const handleEventUpdate = async (updatedEvent) => {
    try {
      const ownerId = getEventOwnerId(updatedEvent);
      await eventService.updateEvent(ownerId, updatedEvent.id, updatedEvent);
      await loadEvents(userId); // Reload events to reflect changes
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
        <div className="flex items-center space-x-4">
          {canAccessInstitutionView && (
            <ViewModeSwitcher
              currentMode={viewMode}
              onModeChange={setViewMode}
              isAdmin={isAdmin}
            />
          )}
          <Link
            to="/dashboard/etkinlikler/olustur"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            + Yeni Etkinlik
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
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
                      {/* Show expert name in institution view */}
                      {viewMode === 'institution' && event.expertName && (
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          👤 {event.expertName}
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${event.eventType === 'online' ? 'bg-blue-100 text-blue-800' :
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
                      <span className="flex items-center space-x-1">
                        {event.videoMeetingPlatform === 'google-meet' && <span>💙 Google Meet</span>}
                        {event.videoMeetingPlatform === 'microsoft-teams' && <span>💜 Teams</span>}
                        {event.videoMeetingPlatform === 'jitsi' && <span>💚 Jitsi</span>}
                        {!event.videoMeetingPlatform && event.platform && <span>🔗 {event.platform}</span>}
                      </span>
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
                            onClick={() => handleApprove(event)}
                            className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                            title="Onayla"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleReject(event)}
                            className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                            title="Reddet"
                          >
                            ✗
                          </button>
                        </>
                      )}

                      {/* Join button for approved events */}
                      {(event.status === 'approved' || event.status === 'scheduled') && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const jitsiRoom = `uzmanlio-${event._id}`;
                              // Expert must join via the frontend route to trigger the "Start Meeting" logic in Meeting.js
                              const modLink = event.moderatorMeetingUrl || `${window.location.origin}/meeting/${jitsiRoom}?role=moderator`;
                              window.open(modLink, '_blank');
                            }}
                            className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors flex items-center space-x-1"
                            title="Moderatör Olarak Başlat"
                          >
                            <span>⚡</span>
                            <span>Başlat</span>
                          </button>

                          {/* Copy Links Dropdown / Buttons */}
                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                const jitsiRoom = `uzmanlio-${event._id}`;
                                const guestLink = event.guestMeetingUrl || `${window.location.origin}/meeting/${jitsiRoom}`;
                                navigator.clipboard.writeText(guestLink);
                                Swal.fire({ title: 'Kopyalandı!', text: 'Danışan linki kopyalandı.', icon: 'success', timer: 1500, showConfirmButton: false });
                              }}
                              className="p-1.5 text-gray-500 hover:text-primary-600 bg-gray-100 rounded-md transition-colors"
                              title="Danışan Linkini Kopyala (Guest)"
                            >
                              👤🔗
                            </button>
                            <button
                              onClick={() => {
                                const jitsiRoom = `uzmanlio-${event._id}`;
                                const modLink = event.moderatorMeetingUrl || `${window.location.origin}/meeting/${jitsiRoom}?role=moderator`;
                                navigator.clipboard.writeText(modLink);
                                Swal.fire({ title: 'Kopyalandı!', text: 'Moderatör linki kopyalandı.', icon: 'success', timer: 1500, showConfirmButton: false });
                              }}
                              className="p-1.5 text-gray-500 hover:text-purple-600 bg-gray-100 rounded-md transition-colors"
                              title="Moderatör Linkini Kopyala (Admin)"
                            >
                              🔑🔗
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status Badge and Settings - Right side */}
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(event.status)}
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Düzenle"
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