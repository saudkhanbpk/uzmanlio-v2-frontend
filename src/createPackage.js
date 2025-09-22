import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { AddCustomerModal } from "./customers/AddCustomerModal";

// CreatePackage Component
export const CreatePackage = () => {

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
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || "68c94094d011cdb0e5fa2caa";
  const SERVER_URL = process.env.SERVER_URL;

  const [packageData, setPackageData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '',
    location: '',
    platform: '',
    eventType: 'online',
    meetingType: '',
    price: '',
    maxAttendees: '',
    category: '',
    appointmentCount: '1',
    icon: '',
    iconColor: '#3B82F6',
    status: 'active',
    isOfflineEvent: false,
    selectedClients: []
  });


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (packageData.isOfflineEvent && packageData.selectedClients.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Uyarı!',
        text: 'Offline paket için en az bir danışan seçmelisiniz.',
      });
      return;
    }

    try {
      // Show loading
      Swal.fire({
        title: 'Paket oluşturuluyor...',
        text: 'Lütfen bekleyin',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      // Prepare data for API
      const packageDataToSend = {
        title: packageData.title,
        description: packageData.description,
        price: packageData.price || '0',
        duration: packageData.duration || '0',
        appointmentCount: packageData.appointmentCount || '1',
        category: packageData.category,
        eventType: packageData.eventType,
        meetingType: packageData.meetingType,
        platform: packageData.platform,
        location: packageData.location,
        date: packageData.date,
        time: packageData.time,
        maxAttendees: packageData.maxAttendees || null,
        icon: packageData.icon || '📦',
        iconBg: packageData.iconColor || '#3B82F6',
        status: packageData.status || 'active',
        isOfflineEvent: packageData.isOfflineEvent,
        selectedClients: packageData.selectedClients,
        features: [] // You can add features if needed
      };

      // Make API call
      const response = await axios.post(
        `${SERVER_URL}/api/expert/${userId}/packages`,
        packageDataToSend
      );

      // Success alert
      await Swal.fire({
        icon: 'success',
        title: 'Başarılı!',
        text: 'Paket başarıyla oluşturuldu.',
        showConfirmButton: false,
        timer: 1500
      });

      // Navigate to services page (packages tab)
      navigate('/dashboard/services?tab=paketler');

    } catch (error) {
      console.error('Package creation failed:', error);

      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: `Paket oluşturulamadı: ${error.response?.data?.error || error.message}`,
      });
    }
  };

  const handleColorSelect = (color) => {
    setPackageData(prev => ({
      ...prev,
      iconColor: color
    }));
  };


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPackageData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleClientSelect = (clientId) => {
    const client = availableClients.find(c => c.id === clientId);
    if (packageData.meetingType === '1-1') {
      // Single selection for 1-1 events
      setPackageData(prev => ({
        ...prev,
        selectedClients: [client]
      }));
    } else {
      // Multiple selection for group events
      setPackageData(prev => ({
        ...prev,
        selectedClients: prev.selectedClients.some(c => c.id === clientId)
          ? prev.selectedClients.filter(c => c.id !== clientId)
          : [...prev.selectedClients, client]
      }));
    }
  };

  const handleRemoveClient = (clientId) => {
    setPackageData(prev => ({
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
    if (packageData.meetingType === '1-1') {
      setPackageData(prev => ({
        ...prev,
        selectedClients: [newClient]
      }));
    } else {
      setPackageData(prev => ({
        ...prev,
        selectedClients: [...prev.selectedClients, newClient]
      }));
    }

    setShowAddClientModal(false);
  };

  const showMeetingType = packageData.eventType === 'online' || packageData.eventType === 'hybrid';
  const showLocation = packageData.eventType === 'offline' || packageData.eventType === 'hybrid';
  const showPlatform = packageData.eventType === 'online' || packageData.eventType === 'hybrid';
  const showDateTime = packageData.meetingType === 'grup';



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Paket Ekle</h1>
          <p className="text-gray-600 mt-1">Danışanlarınız için paket oluşturun</p>
        </div>
        <Link
          to="/dashboard/services"
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Geri dön
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Temel Bilgiler</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paket Adı *
              </label>
              <input
                type="text"
                name="title"
                value={packageData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Paket adı"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama *
              </label>
              <textarea
                name="description"
                value={packageData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Paket açıklaması"
                required
              />
            </div>
            {/* Icon */}
            <div className="md:col-span-2 flex flex-wrap gap-4 items-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Simge
              </label>
              <input
                type="text"
                name="icon"
                maxLength={2}
                minLength={2}
                value={packageData.icon}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Paket simgesi (örn: 📦, 🎓, 💼)"
              />
              {/* Select color*/}
              <div className="mt-2 flex  gap-4 space-y-2">


                {/* Bubble preview with icon */}
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Baloncuk Önizleme
                  </label>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: packageData.iconColor }}
                  >
                    <span className="text-white text-lg">{packageData.icon}</span>
                  </div>
                </div>

                <div className="flex flex-col space-x-2">
                  {/* Bubble preview info*/}
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Renk Seçin
                  </label>

                  <input
                    type="color"
                    name="iconColor"
                    value={packageData.iconColor}
                    onChange={(e) => handleColorSelect(e.target.value)}
                  />
                </div>
              </div>

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                name="category"
                value={packageData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Kategori seçin</option>
                <option value="egitim">Eğitim</option>
                <option value="danismanlik">Danışmanlık</option>
                <option value="workshop">Workshop</option>
                <option value="mentorluk">Mentorlük</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etkinlik Kanalı *
              </label>
              <select
                name="eventType"
                value={packageData.eventType}
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
                  Etkinlik Türü *
                </label>
                <select
                  name="meetingType"
                  value={packageData.meetingType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Etkinlik türü seçin</option>
                  <option value="1-1">1-1 Özel</option>
                  <option value="grup">Grup</option>
                </select>
              </div>
            )}

            {/* Date and Time - Only visible for Group */}
            {showDateTime && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarih *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={packageData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Saat *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={packageData.time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </>
            )}

            {/* Location - Only visible for Yüz Yüze or Hibrit */}
            {showLocation && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konum {packageData.eventType !== 'hybrid' ? '*' : ''}
                </label>
                <input
                  type="text"
                  name="location"
                  value={packageData.location}
                  onChange={handleInputChange}
                  placeholder="Etkinlik konumu (adres)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required={packageData.eventType !== 'hybrid'}
                />
              </div>
            )}

            {/* Platform - Only visible for Online or Hibrit */}
            {showPlatform && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform {packageData.eventType !== 'hybrid' ? '*' : ''}
                </label>
                <select
                  name="platform"
                  value={packageData.platform}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required={packageData.eventType !== 'hybrid'}
                >
                  <option value="">Platform seçin</option>
                  <option value="google-meet">Google Meets</option>
                  <option value="zoom">Zoom</option>
                  <option value="microsoft-teams">Microsoft Teams</option>
                  <option value="jitsi">Jitsi</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fiyat *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="price"
                  value={packageData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 text-sm">₺</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Süre
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="duration"
                  value={packageData.duration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="60"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 text-sm">dakika</span>
                </div>
              </div>
            </div>

            {/* Randevu Adedi - New field specific to packages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Randevu Adedi *
              </label>
              <input
                type="number"
                name="appointmentCount"
                value={packageData.appointmentCount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="1"
                min="1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Bu pakette kaç randevu bulunacağını belirtin
              </p>
            </div>

            {packageData.meetingType === 'grup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maksimum Katılımcı
                </label>
                <input
                  type="number"
                  name="maxAttendees"
                  value={packageData.maxAttendees}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="10"
                />
              </div>
            )}
          </div>
        </div>

        {/* Offline Event Checkbox */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isOfflineEvent"
              name="isOfflineEvent"
              checked={packageData.isOfflineEvent}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isOfflineEvent" className="ml-2 block text-sm text-gray-700">
              Bu paket online sistem dışında gerçekleşti
            </label>
          </div>
        </div>

        {/* Client Information - Only visible if offline checkbox is selected */}
        {packageData.isOfflineEvent && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Danışan Bilgileri</h3>

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
                {packageData.selectedClients.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">Seçili Danışanlar:</p>
                    <div className="flex flex-wrap gap-2">
                      {packageData.selectedClients.map((client) => (
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
                {(clientSearchTerm || packageData.selectedClients.length === 0) && (
                  <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                    {filteredClients.length > 0 ? (
                      <>
                        {filteredClients.map((client) => (
                          <div
                            key={client.id}
                            onClick={() => handleClientSelect(client.id)}
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${packageData.selectedClients.some(c => c.id === client.id)
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
                              {packageData.selectedClients.some(c => c.id === client.id) && (
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

                {packageData.isOfflineEvent && packageData.selectedClients.length === 0 && (
                  <p className="text-red-500 text-sm mt-1">En az bir danışan seçmelisiniz.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Link
            to="/dashboard/services"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            İptal
          </Link>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Paketi Oluştur
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


