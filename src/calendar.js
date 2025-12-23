import { useState, useEffect } from "react";
import { useExpertData } from "./hooks/useExpertData";
import Swal from "sweetalert2";
import { useSearchParams } from "react-router-dom";
import { profileService } from "./services/ProfileServices";
import { useUser } from "./context/UserContext";
import { useViewMode } from "./contexts/ViewModeContext";
import { useInstitutionUsers } from "./contexts/InstitutionUsersContext";
import { ViewModeSwitcher } from "./components/ViewModeSwitcher";


// Calendar Component
export const Calendar = () => {
  const { user } = useUser();
  let loggedInUserId = localStorage.getItem('userId');
  console.log("user from local storage", loggedInUserId);

  // View mode for institution/individual
  const { viewMode, setViewMode } = useViewMode();
  const { institutionUsers, fetchInstitutionUsers } = useInstitutionUsers();

  // Check if user is admin (only admins can see institution view)
  const isAdmin = user?.subscription?.isAdmin === true && user?.subscription?.plantype === "institutional";
  const canAccessInstitutionView = isAdmin;

  // Selected user for institution view (whose calendar to display)
  const [selectedUserId, setSelectedUserId] = useState(loggedInUserId);

  // Get the active userId (either selected user in institution view or logged-in user)
  const activeUserId = viewMode === 'institution' && selectedUserId ? selectedUserId : loggedInUserId;

  const {
    availability,
    appointments,
    loading,
    errors,
    loadExpertProfile,
    updateAvailability
  } = useExpertData();

  // Get context update methods
  const { updateUserField: updateUserContextField } = useUser();
  const { getUserById, updateUserField: updateInstitutionUserField } = useInstitutionUsers();

  // const { getProfile } = profileService();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'week' or 'month'
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [showTooltip, setShowTooltip] = useState(false);
  const [alwaysAvailable, setAlwaysAvailable] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [calendarProviders, setCalendarProviders] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState(null);

  // <<< ADDED: minimal state to hold events fetched from profileService (DOES NOT affect availability) >>>
  const [fetchedEvents, setFetchedEvents] = useState([]);

  // const [params] = useSearchParams();

  // useEffect(() => {
  //   const status = params.get("status");
  //   const error = params.get("error");
  //   const provider = params.get("provider");

  //   if (status === "success") {
  //     Swal.fire({
  //       icon: "success",
  //       title: "Calendar Connected!",
  //       text: `${provider === "google" ? "Google" : "Outlook"} Calendar connected successfully.`,
  //       timer: 3000,
  //       showConfirmButton: false,
  //     });
  //   } else if (error) {
  //     Swal.fire({
  //       icon: "error",
  //       title: "Connection Failed",
  //       text: decodeURIComponent(error),
  //     });
  //   }
  // }, [params]);

  // Load calendar data on component mount

  // Fetch institution users when in institution view
  useEffect(() => {
    if (viewMode === 'institution' && canAccessInstitutionView && institutionUsers.length === 0) {
      console.log("[Calendar] Fetching institution users...");
      fetchInstitutionUsers(loggedInUserId, user?.subscription);
    }
  }, [viewMode, canAccessInstitutionView, institutionUsers.length]);

  // Load calendar data for the active user
  useEffect(() => {
    console.log("[Calendar] Loading data for user:", activeUserId, "viewMode:", viewMode);

    // INDIVIDUAL VIEW - Use UserContext data (NO API calls!)
    if (viewMode === 'individual' && user) {
      console.log("[Calendar] ✅ Using ALL cached data from UserContext");

      // Use cached events from UserContext
      if (user.events && Array.isArray(user.events)) {
        const mapped = user.events.map(evt => ({
          id: evt.id || evt._id,
          title: evt.title,
          date: evt.date,
          time: evt.time || '',
          status: evt.status === 'approved' ? 'confirmed' : (evt.status || 'pending'),
          type: evt.meetingType || '1-1',
        }));
        setFetchedEvents(mapped);
        console.log("[Calendar] ✅ Events from UserContext:", mapped.length);
      } else {
        setFetchedEvents([]);
      }

      // Availability is now handled by the sync useEffect below to avoid race conditions
      // See "Sync local state with context data" section
      if (user.availability) {
        console.log("[Calendar] ✅ Availability present in UserContext (handled by sync effect)");
      }

      // Use cached calendar providers from UserContext
      if (user.calendarProviders) {
        setCalendarProviders(user.calendarProviders);
        console.log("[Calendar] ✅ Calendar providers from UserContext");
      } else {
        // Only fetch if not in context
        loadCalendarProviders();
      }

      return; // Don't make ANY API calls - all data from UserContext!
    }

    // INSTITUTION VIEW - Use InstitutionUsersContext data
    if (viewMode === 'institution' && institutionUsers.length > 0) {
      const cachedUser = institutionUsers.find(u => u._id === activeUserId);
      if (cachedUser) {
        console.log("[Calendar] ✅ Using ALL cached data from InstitutionContext for:", cachedUser.information?.name);

        // Use cached events from context
        if (cachedUser.events && Array.isArray(cachedUser.events)) {
          const mapped = cachedUser.events.map(evt => ({
            id: evt.id || evt._id,
            title: evt.title,
            date: evt.date,
            time: evt.time || '',
            status: evt.status === 'approved' ? 'confirmed' : (evt.status || 'pending'),
            type: evt.meetingType || '1-1',
          }));
          setFetchedEvents(mapped);
          console.log("[Calendar] ✅ Events from InstitutionContext:", mapped.length);
        } else {
          setFetchedEvents([]);
        }

        // Use cached availability from context - NO API CALL!
        if (cachedUser.availability) {
          console.log("[Calendar] ✅ Availability from InstitutionContext - NO API call");
          setAlwaysAvailable(cachedUser.availability.alwaysAvailable || false);
          setSelectedSlots(new Set(cachedUser.availability.selectedSlots || []));
        } else {
          console.log("[Calendar] No availability in cache, resetting");
          setAlwaysAvailable(false);
          setSelectedSlots(new Set());
        }

        // Use cached calendar providers from context
        if (cachedUser.calendarProviders) {
          setCalendarProviders(cachedUser.calendarProviders);
          console.log("[Calendar] ✅ Calendar providers from InstitutionContext");
        } else {
          // Only fetch if not in context
          loadCalendarProviders();
        }

        return; // Don't make ANY API calls - all data from cache!
      }
    }

    // FALLBACK - No cached data, make API calls
    console.log("[Calendar] ⏳ No cached data, making API calls...");
    loadExpertProfile(activeUserId).catch(console.error);
    profileService.getProfile(activeUserId)
      .then(data => {
        if (data && data.events && Array.isArray(data.events)) {
          console.log('[Calendar] Fetched events via API:', data.events.length);
          const mapped = data.events.map(evt => ({
            id: evt.id || evt._id,
            title: evt.title,
            date: evt.date,
            time: evt.time || '',
            status: evt.status === 'approved' ? 'confirmed' : (evt.status || 'pending'),
            type: evt.meetingType || '1-1',
          }));
          setFetchedEvents(mapped);
        } else {
          setFetchedEvents([]);
        }
      })
      .catch(console.error);
    loadCalendarProviders();
  }, [user, activeUserId, viewMode, institutionUsers]); // Re-run when user or active user changes

  // Sync local state with context data
  // In individual view, prioritize UserContext over ExpertContext
  // In institution view, data comes from InstitutionUsersContext (handled in main useEffect)
  useEffect(() => {
    // Individual view - read from UserContext
    if (viewMode === 'individual' && user?.availability) {
      console.log(`[Calendar Sync] 🔄 Syncing from UserContext. Slots found: ${user.availability.selectedSlots?.length}`);
      setAlwaysAvailable(user.availability.alwaysAvailable || false);
      const newSet = new Set(user.availability.selectedSlots || []);
      setSelectedSlots(newSet);
      console.log(`[Calendar Sync] ✅ State updated. Set size: ${newSet.size}`);
      return;
    }

    // Fallback to ExpertContext (for legacy or other views)
    if (availability) {
      setAlwaysAvailable(availability.alwaysAvailable || false);
      setSelectedSlots(new Set(availability.selectedSlots || []));
      console.log('[Calendar] 🔄 Synced UI from ExpertContext availability');
    }
  }, [availability, user, viewMode]);

  // Time slots for availability selection - Extended from 07:00 to 06:00 (next day)
  const timeSlots = [
    // Morning hours (07:00 - 11:30)
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    // Afternoon hours (12:00 - 17:30) 
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    // Evening hours (18:00 - 23:30)
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30',
    // Night/Early morning hours (00:00 - 06:00)
    '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30', '06:00'
  ];
  //All Week Days
  const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  // Get days for current month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Get week days
  const getWeekDays = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const weekDay = new Date(startOfWeek);
      weekDay.setDate(startOfWeek.getDate() + i);
      week.push(weekDay);
    }
    return week;
  };

  const formatDate = (date, format = 'full') => {
    if (!date) return '';

    if (format === 'short') {
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    }
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long'
    });
  };


  const getAppointmentsForDate = (date) => {
    if (!date) return [];

    // ✅ Use local date instead of UTC
    const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD in local timezone

    const fromContext = Array.isArray(appointments)
      ? appointments.filter(apt => apt.date === dateStr)
      : [];

    const fromProfile = Array.isArray(fetchedEvents)
      ? fetchedEvents.filter(evt => evt.date === dateStr)
      : [];

    const mergedMap = new Map();

    fromProfile.forEach(evt => {
      mergedMap.set(evt.id || `${evt.title}-${evt.time}`, evt);
    });

    fromContext.forEach(apt => {
      const key = apt.id || apt._id || `${apt.title}-${apt.time}`;
      mergedMap.set(key, {
        id: apt.id || apt._id || key,
        title: apt.title || apt.serviceName || apt.name || '',
        date: apt.date,
        time: apt.time || apt.startTime || '',
        status: apt.status || 'pending',
        type: apt.type || apt.meetingType || '1-1',
      });
    });

    return Array.from(mergedMap.values()).sort((a, b) =>
      (a.time || '').localeCompare(b.time || '')
    );
  };


  const toggleTimeSlot = (day, time) => {
    const slotKey = `${day}-${time}`;
    const newSelected = new Set(selectedSlots);

    if (newSelected.has(slotKey)) {
      newSelected.delete(slotKey);
    } else {
      newSelected.add(slotKey);
    }

    setSelectedSlots(newSelected);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };


  const handleSaveAvailability = async () => {
    try {
      setIsSaving(true);

      // If alwaysAvailable is checked, generate ALL time slots for all days
      let slotsToSave = Array.from(selectedSlots);

      if (alwaysAvailable) {
        // Generate all possible time slots for all 7 days (0-6)
        const allSlots = [];
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
          for (const time of timeSlots) {
            allSlots.push(`${dayIndex}-${time}`);
          }
        }
        slotsToSave = allSlots;
        console.log(`[Calendar] Always Available: Generated ${allSlots.length} time slots`);
      }

      const availabilityData = {
        alwaysAvailable,
        selectedSlots: slotsToSave
      };

      // Call API - response structure is: { availability: {...}, message: "..." }
      const response = await updateAvailability(activeUserId, availabilityData);

      // ✅ UPDATE CONTEXT with BACKEND RESPONSE (includes lastUpdated, _id, etc.)
      // The response from updateAvailability already contains the full availability object
      if (response && response.availability) {
        if (viewMode === 'individual') {
          updateUserContextField('availability', response.availability);
          console.log('[Calendar] ✅ UserContext updated with backend availability:', response.availability);
        } else {
          updateInstitutionUserField(activeUserId, 'availability', response.availability);
          console.log('[Calendar] ✅ InstitutionContext updated with backend availability:', response.availability);
        }
      }

      // ✅ SUCCESS SweetAlert
      Swal.fire({
        icon: "success",
        title: "Başarılı!",
        text: "Müsaitlik ayarları başarıyla kaydedildi!",
        timer: 1800,
        showConfirmButton: false
      });

    } catch (error) {
      console.error("Failed to save availability:", error);

      // ❌ ERROR SweetAlert
      Swal.fire({
        icon: "error",
        title: "Hata!",
        text: "Müsaitlik ayarları kaydedilirken bir hata oluştu."
      });

    } finally {
      setIsSaving(false);
    }
  };

  const handleResetAvailability = async () => {
    try {
      setIsSaving(true);

      // Reset local state
      setSelectedSlots(new Set());
      setAlwaysAvailable(false);

      // Save reset state to database
      const availabilityData = {
        alwaysAvailable: false,
        selectedSlots: []
      };

      // Call API - response structure is: { availability: {...}, message: "..." }
      const response = await updateAvailability(activeUserId, availabilityData);

      // ✅ UPDATE CONTEXT with BACKEND RESPONSE
      if (response && response.availability) {
        if (viewMode === 'individual') {
          updateUserContextField('availability', response.availability);
          console.log('[Calendar] ✅ UserContext updated (reset):', response.availability);
        } else {
          updateInstitutionUserField(activeUserId, 'availability', response.availability);
          console.log('[Calendar] ✅ InstitutionContext updated (reset):', response.availability);
        }
      }

      // Show success message
      alert('Müsaitlik ayarları sıfırlandı!');
    } catch (error) {
      console.error('Failed to reset availability:', error);
      alert('Müsaitlik ayarları sıfırlanırken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };
  const backendUrl = process.env.REACT_APP_BACKEND_URL

  // Calendar Integration Functions
  const connectCalendar = async (provider) => {
    try {
      setCalendarLoading(true);
      setCalendarError(null);
      // const userId = localStorage.getItem('userId') // Mock user ID for development

      const response = await fetch(`https://uzmanlio-backend-kpwz.onrender.com/api/calendar/auth/${provider}/auth/${userId}`);
      console.log("Response From Goolge calendar", response)
      const data = await response.json();
      if (response.ok && data.authUrl) {
        // Redirect the current page to Google OAuth URL
        window.location.href = data.authUrl;
      }


      // if (response.ok && data.authUrl) {
      //   // Open OAuth flow in new window
      //   const authWindow = window.open(
      //     data.authUrl,
      //     'calendar-auth',
      //     'width=600,height=700,scrollbars=yes,resizable=yes'
      //   );

      //   // Listen for auth completion
      //   const checkClosed = setInterval(() => {

      //     if (authWindow.closed) {
      //       clearInterval(checkClosed);
      //       // Reload providers after auth
      //       setTimeout(() => {
      //         loadCalendarProviders();
      //       }, 1000);
      //     }
      //   }, 1000);
      // } else {
      //   setCalendarError(data.error || 'Kimlik doğrulama başlatılamadı');
      // }
    } catch (err) {
      setCalendarError('Takvim bağlantısı başarısız');
      console.error('Error connecting calendar:', err);
    } finally {
      setCalendarLoading(false);
    }
  };

  const loadCalendarProviders = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/calendar/auth/${activeUserId}/providers`);
      const data = await response.json();

      if (response.ok) {
        const providers = data.providers || [];
        setCalendarProviders(providers);

        // ✅ UPDATE CONTEXT - cache for future page loads
        if (viewMode === 'individual') {
          updateUserContextField('calendarProviders', providers);
          console.log('[Calendar] ✅ Calendar providers cached in UserContext');
        } else {
          updateInstitutionUserField(activeUserId, 'calendarProviders', providers);
          console.log('[Calendar] ✅ Calendar providers cached in InstitutionContext');
        }
      } else {
        setCalendarError(data.error || 'Takvim sağlayıcıları yüklenemedi');
      }
    } catch (err) {
      setCalendarError('Takvim sağlayıcıları yüklenemedi');
      // console.error('Error loading providers:', err);
    }
  };

  // 🔧 FIX: Combine and sort upcoming appointments (from both sources)
  const combinedAppointments = [
    ...(Array.isArray(appointments) ? appointments : []),
    ...(Array.isArray(fetchedEvents) ? fetchedEvents : [])
  ];

  const upcomingAppointments = combinedAppointments
    .filter(apt => {
      if (!apt.date || !apt.time) return false;
      // const dateTime = new Date(`${apt.date}T${(apt.time || '').slice(0, 5)}`);
      const dateTime = new Date(`${apt.date}T${(apt.time || '').slice(0, 5)}`);

      return dateTime >= new Date();
    })
    .sort((a, b) => {
      const aDate = new Date(`${a.date}T${(a.time || '').slice(0, 5)}`);
      const bDate = new Date(`${b.date}T${(b.time || '').slice(0, 5)}`);
      return aDate - bDate;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Takvim</h1>

          {/* User Selector - Only show in institution view */}
          {viewMode === 'institution' && institutionUsers.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Kullanıcı:</span>
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                {institutionUsers.map(u => (
                  <option key={u._id} value={u._id}>
                    {u.information?.name} {u.information?.surname}
                    {u._id === loggedInUserId ? ' (Sen)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode Switcher - Only show for admins */}
          {canAccessInstitutionView && (
            <ViewModeSwitcher
              currentMode={viewMode}
              onModeChange={(mode) => {
                setViewMode(mode);
                // Reset to logged-in user when switching to individual view
                if (mode === 'individual') {
                  setSelectedUserId(loggedInUserId);
                }
              }}
              isAdmin={isAdmin}
            />
          )}

          {/* Calendar Connect Buttons - Hide in institution view */}
          {viewMode !== 'institution' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => connectCalendar('google')}
                disabled={calendarLoading}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <img
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyUzYuNDggMjIgMTIgMjJzMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJaTTEwIDZIMTRWOEgxMFY2Wk02IDEwSDE4VjE4SDZWMTBaTTggMTJWMTZIMTJWMTJIOFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg=="
                  alt="Google Calendar"
                  className="w-4 h-4"
                />
                <span>{calendarLoading ? 'Bağlanıyor...' : 'Google Calendar'}</span>
              </button>
              <button
                onClick={() => connectCalendar('microsoft')}
                disabled={calendarLoading}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <img
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTMgNFYyMEgxOEw5IDEyTDE4IDRIM1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg=="
                  alt="Outlook Calendar"
                  className="w-4 h-4"
                />
                <span>{calendarLoading ? 'Bağlanıyor...' : 'Outlook'}</span>
              </button>
            </div>
          )}

          {/* Calendar Error Display */}
          {calendarError && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {calendarError}
            </div>
          )}

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${view === 'week' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
                }`}
            >
              Haftalık
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${view === 'month' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
                }`}
            >
              Aylık
            </button>
          </div>
        </div>
      </div>

      {/* Show which user's calendar is being viewed in institution view */}
      {viewMode === 'institution' && selectedUserId && selectedUserId !== loggedInUserId && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-primary-600">👤</span>
            <span className="text-primary-800 font-medium">
              {institutionUsers.find(u => u._id === selectedUserId)?.information?.name || 'Seçili'} kullanıcısının takvimini görüntülüyorsunuz
            </span>
          </div>
          <button
            onClick={() => setSelectedUserId(loggedInUserId)}
            className="text-sm text-primary-600 hover:text-primary-800 underline"
          >
            Kendi takvimime dön
          </button>
        </div>
      )}

      {/* Calendar View */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => view === 'month' ? navigateMonth(-1) : navigateWeek(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {view === 'month' ? formatDate(currentDate) :
                `${formatDate(getWeekDays(currentDate)[0], 'short')} - ${formatDate(getWeekDays(currentDate)[6], 'short')} ${formatDate(currentDate).split(' ')[1]}`}
            </h2>
            <button
              onClick={() => view === 'month' ? navigateMonth(1) : navigateWeek(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              →
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm"
          >
            Bugün
          </button>
        </div>

        {/* Month View */}
        {view === 'month' && (
          <div>
            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                  {day.slice(0, 3)}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map((day, index) => {
                const dayAppointments = getAppointmentsForDate(day);
                const isToday = day && day.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 border border-gray-100 rounded-lg ${day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                      } ${isToday ? 'bg-primary-50 border-primary-200' : ''}`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary-600' : 'text-gray-900'
                          }`}>
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayAppointments.map((apt) => (
                            <div
                              key={apt.id}
                              className={`text-xs p-1 rounded text-white ${apt.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'
                                }`}
                            >
                              {apt.time} {apt.title ? `• ${apt.title}` : (apt.type === '1-1' ? '👤' : '👥')}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Week View */}
        {/* Week View */}
        {view === 'week' && (
          <div>
            <div className="grid grid-cols-8 gap-2">
              {/* Time Column */}
              <div className="space-y-12">
                <div className="h-12"></div>
                {timeSlots.filter((_, i) => i % 2 === 0).map((time) => (
                  <div key={time} className="text-xs text-gray-500 text-right pr-2">
                    {time}
                  </div>
                ))}
              </div>

              {/* Week Days */}
              {getWeekDays(currentDate).map((day, dayIndex) => {
                const dayAppointments = getAppointmentsForDate(day);
                const isToday = day.toDateString() === new Date().toDateString();

                // Robust time parser: handles "16:45", "16.45", "16:45:00", "4:45 PM"
                const parseTime = (t) => {
                  if (!t) return null;
                  const s = t.toString().trim().replace(/\./g, ':').replace(/[^0-9:]/g, '');
                  const match = s.match(/^(\d{1,2}):?(\d{2})?:?(\d{2})?$/);
                  if (!match) return null;
                  const [, h, m] = match;
                  const hours = parseInt(h, 10);
                  const minutes = m ? parseInt(m, 10) : 0;
                  if (isNaN(hours) || isNaN(minutes)) return null;
                  return { hours, minutes, total: hours * 60 + minutes };
                };

                // Convert timeSlots to minutes
                const slotMinutes = timeSlots.map(t => {
                  const [h, m] = t.split(':').map(Number);
                  return h * 60 + m;
                });

                // Map events to closest slot
                const slotMap = new Map(timeSlots.map(t => [t, []]));
                dayAppointments.forEach(apt => {
                  const parsed = parseTime(apt.time || apt.startTime);
                  if (!parsed) return;

                  let closestSlot = timeSlots[0];
                  let minDiff = Infinity;

                  slotMinutes.forEach((slotMin, i) => {
                    const diff = Math.abs(slotMin - parsed.total);
                    if (diff < minDiff) {
                      minDiff = diff;
                      closestSlot = timeSlots[i];
                    }
                  });

                  slotMap.get(closestSlot).push(apt);
                });

                return (
                  <div key={dayIndex} className="space-y-1">
                    {/* Day Header */}
                    <div
                      className={`text-center p-2 rounded-lg ${isToday ? 'bg-primary-100 text-primary-700' : 'bg-gray-50'
                        }`}
                    >
                      <div className="text-xs text-gray-600">{weekDays[dayIndex]}</div>
                      <div className="font-medium">{day.getDate()}</div>
                    </div>

                    {/* Time Slots */}
                    <div className="space-y-1">
                      {timeSlots.map((time) => {
                        const appts = slotMap.get(time) || [];
                        if (appts.length === 0) {
                          return (
                            <div
                              key={time}
                              className="h-6 rounded border border-gray-100 bg-gray-50 hover:bg-gray-100"
                            />
                          );
                        }

                        const first = appts[0];
                        return (
                          <div
                            key={time}
                            className={`h-6 rounded border ${first.status === 'confirmed'
                              ? 'bg-green-100 border-green-300'
                              : 'bg-yellow-100 border-yellow-300'
                              }`}
                          >
                            <div className="text-xs p-1 text-gray-700 truncate">
                              {appts.map((a, i) => (
                                <span key={a.id || i}>
                                  {a.type === '1-1' ? 'Individual' : 'Group'}{' '}
                                  {a.title ? `• ${a.title}` : a.time}
                                  {i < appts.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Availability Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <h3 className="text-lg font-medium text-gray-900">Müsaitlik Ayarları</h3>
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold hover:bg-blue-200 transition-colors"
            >
              i
            </button>
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap z-10">
                Sisteme eklenen randevular, takvimine otomatik olarak yansıyacaktır.
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Danışanların randevu oluştururken görüntüleyeceği müsait zamanlarınızı seçin
        </p>

        <div className={`grid grid-cols-1 lg:grid-cols-7 gap-4 ${alwaysAvailable ? 'opacity-50 pointer-events-none' : ''}`}>
          {weekDays.map((day, dayIndex) => (
            <div key={day} className="space-y-3">
              <h4 className="font-medium text-gray-900 text-center">{day}</h4>
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {timeSlots.map((time) => {
                  const slotKey = `${dayIndex}-${time}`;
                  const isSelected = selectedSlots.has(slotKey);
                  // Debug first few slots
                  if (dayIndex === 0 && (time === '07:00' || time === '08:00')) {
                    console.log(`[Calendar Render] Slot ${slotKey}: isSelected=${isSelected}, Set has ${selectedSlots.size} items`);
                  }

                  return (
                    <button
                      key={time}
                      onClick={() => !alwaysAvailable && toggleTimeSlot(dayIndex, time)}
                      disabled={alwaysAvailable}
                      className={`w-full text-xs py-1 px-2 rounded text-center transition-colors ${alwaysAvailable
                        ? 'bg-primary-200 text-primary-800 cursor-not-allowed'
                        : isSelected
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Always Available Info */}
        {alwaysAvailable && (
          <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-primary-600 mr-2">ℹ️</span>
              <p className="text-sm text-primary-800">
                "Her Zaman Müsaitim" seçeneği aktif. Tüm zaman dilimleri otomatik olarak müsait olarak işaretlenmiştir.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          {/* Always Available Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="alwaysAvailable"
              checked={alwaysAvailable}
              onChange={(e) => setAlwaysAvailable(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="alwaysAvailable" className="ml-2 block text-sm text-gray-700">
              Her Zaman Müsaitim
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleResetAvailability}
              disabled={isSaving || loading.availability}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sıfırla
            </button>
            <button
              onClick={handleSaveAvailability}
              disabled={isSaving || loading.availability}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving || loading.availability ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Yaklaşan Randevular</h3>
        <div className="space-y-3">
          {loading.appointments ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Randevular yükleniyor...</span>
            </div>
          ) : errors.appointments ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              Randevular yüklenirken hata oluştu: {errors.appointments}
            </div>
          ) : (!combinedAppointments || combinedAppointments.length === 0) ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-2 block">📅</span>
              <p>Henüz randevu bulunmuyor.</p>
              <p className="text-sm">Yeni randevular eklendiğinde burada görünecektir.</p>
            </div>
          ) : (
            // Use upcomingAppointments (combined and sorted ascending)
            upcomingAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${apt.type === '1-1' ? 'bg-orange-100' : 'bg-blue-100'
                    }`}>
                    <span className="text-lg">{apt.type === '1-1' ? '👤' : '👥'}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{apt.title}</h4>
                    <p className="text-sm text-gray-600">
                      {apt.date} • {apt.time} • {apt.duration} dakika
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {apt.status === 'confirmed' ? 'Onaylandı' : 'Beklemede'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div >
  );
};
