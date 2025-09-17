import { useState } from "react";

// Calendar Component
export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'week' or 'month'
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [showTooltip, setShowTooltip] = useState(false);
  const [alwaysAvailable, setAlwaysAvailable] = useState(false);

  // Sample appointments data
  const appointments = [
    {
      id: 1,
      title: 'React Danışmanlığı - Ahmet K.',
      date: '2024-06-25',
      time: '14:00',
      duration: 60,
      type: '1-1',
      status: 'confirmed'
    },
    {
      id: 2,
      title: 'Dijital Pazarlama Workshop',
      date: '2024-06-27',
      time: '19:00',
      duration: 120,
      type: 'group',
      status: 'confirmed'
    },
    {
      id: 3,
      title: 'SEO Danışmanlığı - Fatma Y.',
      date: '2024-06-28',
      time: '16:00',
      duration: 90,
      type: '1-1',
      status: 'pending'
    }
  ];

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
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateStr);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Takvim</h1>
        <div className="flex items-center space-x-4">
          {/* Calendar Connect Buttons */}
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
              <img 
                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyUzYuNDggMjIgMTIgMjJzMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJaTTEwIDZIMTRWOEgxMFY2Wk02IDEwSDE4VjE4SDZWMTBaTTggMTJWMTZIMTJWMTJIOFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg=="
                alt="Google Calendar"
                className="w-4 h-4"
              />
              <span>Google Calendar</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium">
              <img 
                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTMgNFYyMEgxOEw5IDEyTDE4IDRIM1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg=="
                alt="Outlook Calendar"
                className="w-4 h-4"
              />
              <span>Outlook</span>
            </button>
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                view === 'week' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              Haftalık
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                view === 'month' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              Aylık
            </button>
          </div>
        </div>
      </div>

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
                    className={`min-h-[100px] p-2 border border-gray-100 rounded-lg ${
                      day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                    } ${isToday ? 'bg-primary-50 border-primary-200' : ''}`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${
                          isToday ? 'text-primary-600' : 'text-gray-900'
                        }`}>
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayAppointments.map((apt) => (
                            <div
                              key={apt.id}
                              className={`text-xs p-1 rounded text-white ${
                                apt.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'
                              }`}
                            >
                              {apt.time} {apt.type === '1-1' ? '👤' : '👥'}
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
        {view === 'week' && (
          <div>
            <div className="grid grid-cols-8 gap-2">
              {/* Time Column */}
              <div className="space-y-12">
                <div className="h-12"></div> {/* Header space */}
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
                
                return (
                  <div key={dayIndex} className="space-y-1">
                    {/* Day Header */}
                    <div className={`text-center p-2 rounded-lg ${
                      isToday ? 'bg-primary-100 text-primary-700' : 'bg-gray-50'
                    }`}>
                      <div className="text-xs text-gray-600">{weekDays[dayIndex]}</div>
                      <div className="font-medium">{day.getDate()}</div>
                    </div>
                    
                    {/* Time Slots */}
                    <div className="space-y-1">
                      {timeSlots.map((time) => {
                        const appointment = dayAppointments.find(apt => apt.time === time);
                        return (
                          <div
                            key={time}
                            className={`h-6 rounded border border-gray-100 ${
                              appointment 
                                ? `bg-${appointment.status === 'confirmed' ? 'green' : 'yellow'}-100 border-${appointment.status === 'confirmed' ? 'green' : 'yellow'}-300`
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            {appointment && (
                              <div className="text-xs p-1 text-gray-700 truncate">
                                {appointment.type === '1-1' ? '👤' : '👥'} {appointment.title.split(' ')[0]}
                              </div>
                            )}
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
                  
                  return (
                    <button
                      key={time}
                      onClick={() => !alwaysAvailable && toggleTimeSlot(dayIndex, time)}
                      disabled={alwaysAvailable}
                      className={`w-full text-xs py-1 px-2 rounded text-center transition-colors ${
                        alwaysAvailable
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
              onClick={() => {
                setSelectedSlots(new Set());
                setAlwaysAvailable(false);
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sıfırla
            </button>
            <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Kaydet
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Yaklaşan Randevular</h3>
        <div className="space-y-3">
          {appointments.filter(apt => new Date(apt.date) >= new Date()).map((apt) => (
            <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  apt.type === '1-1' ? 'bg-orange-100' : 'bg-blue-100'
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
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {apt.status === 'confirmed' ? 'Onaylandı' : 'Beklemede'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
