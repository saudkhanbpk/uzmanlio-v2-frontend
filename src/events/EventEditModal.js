import { useState } from "react";
import { useUser } from "../context/UserContext";

// Event Edit Modal Component
export const EventEditModal = ({ event, onClose, onDelete, onUpdate }) => {
  const user = useUser();
  const [formData, setFormData] = useState({
    title: event.title || '',
    description: event.description || '',
    date: event.date || '',
    time: event.time || '',
    duration: event.duration || '',
    location: event.location || '',
    platform: event.platform || '',
    eventType: event.eventType || 'online',
    meetingType: event.meetingType || '',
    price: event.price || '',
    maxAttendees: event.maxAttendees || '',
    category: event.category || '',
    isOfflineEvent: event.isOfflineEvent || false,
    selectedClients: event.selectedClients || []
  });

  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');

  // Mock clients data (in real app, this would come from your backend)
  const availableClients = user.user.customers||[]
  console.log("User From context",user.user.customers)

  const filteredClients = availableClients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleClientSelect = (clientId) => {
    const client = availableClients.find(c => c.id === clientId);
    if (formData.meetingType === '1-1') {
      // Single selection for 1-1 events
      setFormData(prev => ({
        ...prev,
        selectedClients: [client]
      }));
    } else {
      // Multiple selection for group events
      setFormData(prev => ({
        ...prev,
        selectedClients: prev.selectedClients.some(c => c.id === clientId)
          ? prev.selectedClients.filter(c => c.id !== clientId)
          : [...prev.selectedClients, client]
      }));
    }
  };

  const handleRemoveClient = (clientId) => {
    setFormData(prev => ({
      ...prev,
      selectedClients: prev.selectedClients.filter(c => c.id !== clientId)
    }));
  };

  const handleAddNewClient = (newClientData) => {
    // Simulate adding new client (in real app, this would make an API call)
    const newClient = {
      id: Date.now(), // Temporary ID
      name: `${newClientData.name} ${newClientData.surname}`,
      email: newClientData.email
    };
    
    // Add to available clients list
    availableClients.push(newClient);
    
    // Auto-select the new client
    if (formData.meetingType === '1-1') {
      setFormData(prev => ({
        ...prev,
        selectedClients: [newClient]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedClients: [...prev.selectedClients, newClient]
      }));
    }
    
    setShowAddClientModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onUpdate) {
      onUpdate(formData);
    } else {
      console.log('Etkinlik güncellendi:', formData);
      onClose();
    }
  };

  const handleDeleteClick = () => {
    onDelete(event.id);
    onClose();
  };

  // Show meeting type field only for Online or Hibrit
  const showMeetingType = formData.eventType === 'online' || formData.eventType === 'hybrid';
  
  // Show date/time section only if Grup is selected
  const showDateTime = formData.meetingType === 'grup';
  
  // Determine which location fields to show
  const showPlatform = formData.eventType === 'online' || formData.eventType === 'hybrid';
  const showLocation = formData.eventType === 'offline' || formData.eventType === 'hybrid';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Etkinlik Düzenle</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Temel Bilgiler</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etkinlik Başlığı *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etkinlik Açıklaması
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  Etkinlik Kanalı *
                </label>
                <select
                  name="eventType"
                  value={formData.eventType}
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
                    value={formData.meetingType}
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

          {/* Date and Time - Only visible if Grup is selected */}
          {showDateTime && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Tarih ve Saat</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarih *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required={showDateTime}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlangıç Saati *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required={showDateTime}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Süre (dakika)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="120"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Platform and Location */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Platform ve Konum</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Platform - Only visible for Online or Hibrit */}
              {showPlatform && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform
                  </label>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    Konum
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Etkinlik konumu (adres)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  value={formData.maxAttendees}
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
                  value={formData.duration}
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
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="199"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Offline Event Checkbox */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isOfflineEventEdit"
                name="isOfflineEvent"
                checked={formData.isOfflineEvent}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isOfflineEventEdit" className="ml-2 block text-sm text-gray-700">
                Bu etkinlik online sistem dışında gerçekleşti
              </label>
            </div>
          </div>

          {/* Client Information - Only visible if offline checkbox is selected */}
          {formData.isOfflineEvent && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Danışan Bilgileri</h4>
              
              <div className="space-y-4">
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
                  {formData.selectedClients.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">Seçili Danışanlar:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.selectedClients.map((client) => (
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
                  {(clientSearchTerm || formData.selectedClients.length === 0) && (
                    <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                      {filteredClients.length > 0 ? (
                        <>
                          {filteredClients.map((client) => (
                            <div
                              key={client.id}
                              onClick={() => handleClientSelect(client.id)}
                              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                                formData.selectedClients.some(c => c.id === client.id)
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
                                {formData.selectedClients.some(c => c.id === client.id) && (
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

                  {formData.isOfflineEvent && formData.selectedClients.length === 0 && (
                    <p className="text-red-500 text-sm mt-1">En az bir danışan seçmelisiniz.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Appointment Notes - Read Only */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Randevu Notu</h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {event.appointmentNotes || "Müşteri bu etkinlik için özel isteklerini belirtmiş: 'Lütfen React Hooks konusuna özel olarak odaklanılmasını istiyorum. Özellikle useState ve useEffect konularında detaylı örnekler görmek istiyorum. Ayrıca real-world projelerden örnekler de olursa çok memnun olurum.'"}
              </p>
              <p className="text-xs text-gray-500 mt-2 italic">* Bu alan müşteri siparişi sırasında doldurulur</p>
            </div>
          </div>

          {/* Files - Read Only */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Dosyalar</h4>
            <div className="space-y-3">
              {event.files && event.files.length > 0 ? (
                event.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <span className="text-blue-600">
                          {file.type === 'pdf' ? '📄' : 
                           file.type === 'doc' ? '📝' : 
                           file.type === 'image' ? '🖼️' : '📎'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size} • {file.uploadDate}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.open(file.url, '_blank')}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                    >
                      İndir
                    </button>
                  </div>
                ))
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <span className="text-blue-600">📄</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Etkinlik_Gereksinimleri.pdf</p>
                        <p className="text-xs text-gray-500">245 KB • 20.06.2024</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.open('#', '_blank')}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                    >
                      İndir
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <span className="text-green-600">📝</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Müşteri_Notları.docx</p>
                        <p className="text-xs text-gray-500">89 KB • 18.06.2024</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.open('#', '_blank')}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                    >
                      İndir
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <span className="text-primary-600">🖼️</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Referans_Tasarımlar.zip</p>
                        <p className="text-xs text-gray-500">1.2 MB • 17.06.2024</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.open('#', '_blank')}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                    >
                      İndir
                    </button>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-3 italic">* Dosyalar müşteri siparişi sırasında yüklenir</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleDeleteClick}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              🗑️ Sil
            </button>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Güncelle
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
