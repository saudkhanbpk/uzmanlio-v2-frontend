import { useState } from "react";
import { Link } from "react-router-dom";
// CreateService Component (Original CreateEvent version for Hizmetlerim)
export const CreateService = () => {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '',
    location: '',
    platform: '',
    eventType: 'online',
    meetingType: '', // 1-1 Özel or Grup
    price: '',
    maxAttendees: '',
    category: '',
    isOfflineEvent: false,
    selectedClients: []
  });

  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');

  // Mock clients data (in real app, this would come from your backend)
  const availableClients = [
    { id: 1, name: 'Ayşe Demir', email: 'ayse.demir@email.com' },
    { id: 2, name: 'Mehmet Kaya', email: 'mehmet.kaya@email.com' },
    { id: 3, name: 'Fatma Özkan', email: 'fatma.ozkan@email.com' },
    { id: 4, name: 'Ali Yılmaz', email: 'ali.yilmaz@email.com' },
    { id: 5, name: 'Zeynep Şahin', email: 'zeynep.sahin@email.com' }
  ];

  const filteredClients = availableClients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleClientSelect = (clientId) => {
    const client = availableClients.find(c => c.id === clientId);
    if (eventData.meetingType === '1-1') {
      // Single selection for 1-1 events
      setEventData(prev => ({
        ...prev,
        selectedClients: [client]
      }));
    } else {
      // Multiple selection for group events
      setEventData(prev => ({
        ...prev,
        selectedClients: prev.selectedClients.some(c => c.id === clientId)
          ? prev.selectedClients.filter(c => c.id !== clientId)
          : [...prev.selectedClients, client]
      }));
    }
  };

  const handleRemoveClient = (clientId) => {
    setEventData(prev => ({
      ...prev,
      selectedClients: prev.selectedClients.filter(c => c.id !== clientId)
    }));
  };

  const handleAddNewClient = (newClientData) => {
    // Simulate adding new client
    const newClient = {
      id: Date.now(), // Temporary ID
      name: `${newClientData.name} ${newClientData.surname}`,
      email: newClientData.email
    };
    
    // Add to available clients list
    availableClients.push(newClient);
    
    // Auto-select the new client
    if (eventData.meetingType === '1-1') {
      setEventData(prev => ({
        ...prev,
        selectedClients: [newClient]
      }));
    } else {
      setEventData(prev => ({
        ...prev,
        selectedClients: [...prev.selectedClients, newClient]
      }));
    }
    
    setShowAddClientModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Hizmet oluşturuldu:', eventData);
    // Here you would typically send the data to your backend
  };

  // Show date/time section only for grup events (not 1-1)
  const showDateTimeSection = eventData.meetingType === 'grup';

  // Show meeting type field only for Online or Hibrit
  const showMeetingType = eventData.eventType === 'online' || eventData.eventType === 'hybrid';
  
  // Show platform and location fields based on event type
  const showPlatform = eventData.eventType === 'online' || eventData.eventType === 'hybrid';
  const showLocation = eventData.eventType === 'offline' || eventData.eventType === 'hybrid';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link 
          to="/dashboard/hizmetlerim"
          className="text-gray-500 hover:text-gray-700"
        >
          ← Geri
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Yeni Hizmet Oluştur</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Temel Bilgiler</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hizmet Başlığı *
              </label>
              <input
                type="text"
                name="title"
                value={eventData.title}
                onChange={handleInputChange}
                placeholder="Örn: Dijital Pazarlama Danışmanlığı"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hizmet Açıklaması
              </label>
              <textarea
                name="description"
                value={eventData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Hizmet hakkında detaylı bilgi verin..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                name="category"
                value={eventData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Kategori seçin</option>
                <option value="teknoloji">Teknoloji</option>
                <option value="pazarlama">Pazarlama</option>
                <option value="tasarim">Tasarım</option>
                <option value="is-gelistirme">İş Geliştirme</option>
                <option value="kisisel-gelisim">Kişisel Gelişim</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hizmet Kanalı *
              </label>
              <select
                name="eventType"
                value={eventData.eventType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="online">Online</option>
                <option value="offline">Yüz Yüze</option>
                <option value="hybrid">Hibrit</option>
              </select>
            </div>

            {/* Meeting Type - Only visible for Online or Hibrit */}
            {showMeetingType && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hizmet Türü *
                </label>
                <select
                  name="meetingType"
                  value={eventData.meetingType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Hizmet türü seçin</option>
                  <option value="1-1">1-1 Özel</option>
                  <option value="grup">Grup</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Date and Time - Only visible for Grup events */}
        {showDateTimeSection && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tarih ve Saat</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarih *
                </label>
                <input
                  type="date"
                  name="date"
                  value={eventData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlangıç Saati *
                </label>
                <input
                  type="time"
                  name="time"
                  value={eventData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Platform and Location */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Platform ve Konum</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Platform - Only visible for Online or Hibrit */}
            {showPlatform && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform {eventData.eventType !== 'hybrid' ? '*' : ''}
                </label>
                <select
                  name="platform"
                  value={eventData.platform}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required={eventData.eventType === 'online'}
                >
                  <option value="">Platform seçin</option>
                  <option value="zoom">Zoom</option>
                  <option value="google-meet">Google Meet</option>
                  <option value="microsoft-teams">Microsoft Teams</option>
                  <option value="jitsi">Jitsi</option>
                </select>
              </div>
            )}
            
            {/* Location - Only visible for Yüz Yüze or Hibrit */}
            {showLocation && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konum {eventData.eventType !== 'hybrid' ? '*' : ''}
                </label>
                <input
                  type="text"
                  name="location"
                  value={eventData.location}
                  onChange={handleInputChange}
                  placeholder="Hizmet konumu (adres)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required={eventData.eventType === 'offline'}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maksimum Katılımcı
              </label>
              <input
                type="number"
                name="maxAttendees"
                value={eventData.maxAttendees}
                onChange={handleInputChange}
                placeholder="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Süre (dakika)
              </label>
              <input
                type="number"
                name="duration"
                value={eventData.duration}
                onChange={handleInputChange}
                placeholder="120"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fiyat (₺)
              </label>
              <input
                type="number"
                name="price"
                value={eventData.price}
                onChange={handleInputChange}
                placeholder="199"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Offline Event Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="isOfflineEvent"
                name="isOfflineEvent"
                checked={eventData.isOfflineEvent}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isOfflineEvent" className="ml-2 block text-sm text-gray-700">
                Bu hizmet online sistem dışında gerçekleşti
              </label>
            </div>

            {/* Client Information - Only visible when isOfflineEvent is true */}
            {eventData.isOfflineEvent && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Danışan Bilgileri</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danışan Seç *
                  </label>
                  
                  {/* Search Input */}
                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="Danışan adı veya e-posta ile ara..."
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pl-10"
                    />
                    <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                  </div>

                  {/* Selected Clients Display */}
                  {eventData.selectedClients.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">Seçili Danışanlar:</p>
                      <div className="flex flex-wrap gap-2">
                        {eventData.selectedClients.map((client) => (
                          <span
                            key={client.id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                          >
                            {client.name}
                            <button
                              type="button"
                              onClick={() => handleRemoveClient(client.id)}
                              className="ml-1 text-primary-600 hover:text-primary-800"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dropdown */}
                  {(clientSearchTerm || eventData.selectedClients.length === 0) && (
                    <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                      {filteredClients.length > 0 ? (
                        <>
                          {filteredClients.map((client) => (
                            <div
                              key={client.id}
                              onClick={() => handleClientSelect(client.id)}
                              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                                eventData.selectedClients.some(c => c.id === client.id)
                                  ? 'bg-primary-50 text-primary-700'
                                  : ''
                              }`}
                            >
                              <div className="flex items-center">
                                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-primary-600 text-sm font-medium">
                                    {client.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{client.name}</p>
                                  <p className="text-xs text-gray-500">{client.email}</p>
                                </div>
                                {eventData.selectedClients.some(c => c.id === client.id) && (
                                  <span className="ml-auto text-primary-600">✓</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="px-4 py-3 text-gray-500 text-sm">
                          Aradığınız kriterlere uygun danışan bulunamadı.
                        </div>
                      )}
                      
                      {/* Add Client Option */}
                      <div
                        onClick={() => setShowAddClientModal(true)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-t border-gray-200 bg-gray-25"
                      >
                        <div className="flex items-center text-primary-600">
                          <span className="mr-2">+</span>
                          <span className="text-sm font-medium">Danışan Ekle</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {eventData.isOfflineEvent && eventData.selectedClients.length === 0 && (
                    <p className="text-red-500 text-sm mt-1">En az bir danışan seçmelisiniz.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Link
            to="/dashboard/hizmetlerim"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            İptal
          </Link>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Hizmet Oluştur
          </button>
        </div>
      </form>
      
      {/* Add Client Modal */}
      {showAddClientModal && (
        <AddCustomerModal 
          onClose={() => setShowAddClientModal(false)}
          onAdd={handleAddNewClient}
        />
      )}
    </div>
  );
};