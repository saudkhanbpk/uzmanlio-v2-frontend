import { useState } from "react";
import { Link } from "react-router-dom";

// Services Component
export default function Services(){
  const [activeTab, setActiveTab] = useState('hizmetler');
  const [editServiceModal, setEditServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  
  // Mock services data with IDs for management - Updated with CreateService form fields
  const [services, setServices] = useState([
    {
      id: 1,
      title: "Dijital Pazarlama Eğitimi",
      description: "Kapsamlı dijital pazarlama stratejileri ve uygulamaları üzerine birebir danışmanlık hizmeti",
      category: "pazarlama",
      eventType: "online", // Hizmet Kanalı
      meetingType: "1-1",
      platform: "zoom",
      location: "",
      duration: "120", // dakika
      price: "500",
      maxAttendees: "1",
      icon: "🎓",
      iconBg: "bg-primary-100",
      status: "Aktif",
      isOfflineEvent: false
    },
    {
      id: 2,
      title: "E-ticaret Web Sitesi Geliştirme",
      description: "Modern ve kullanıcı dostu e-ticaret web siteleri geliştirme hizmeti",
      category: "teknoloji",
      eventType: "hybrid",
      meetingType: "1-1",
      platform: "google-meet",
      location: "İstanbul Ofis",
      duration: "240",
      price: "25000",
      maxAttendees: "1",
      icon: "💻",
      iconBg: "bg-blue-100",
      status: "Aktif",
      isOfflineEvent: false
    },
    {
      id: 3,
      title: "SEO Danışmanlığı",
      description: "Arama motoru optimizasyonu ve organik trafik artırma stratejileri",
      category: "pazarlama",
      eventType: "online",
      meetingType: "1-1",
      platform: "zoom",
      location: "",
      duration: "90",
      price: "3000",
      maxAttendees: "1",
      icon: "📈",
      iconBg: "bg-green-100",
      status: "Aktif",
      isOfflineEvent: false
    },
    {
      id: 4,
      title: "Psikolojik Danışmanlık",
      description: "Bireysel psikolojik destek ve terapi seansları",
      category: "kisisel-gelisim",
      eventType: "offline",
      meetingType: "1-1",
      platform: "",
      location: "Ankara Kliniği",
      duration: "50",
      price: "400",
      maxAttendees: "1",
      icon: "🧠",
      iconBg: "bg-purple-100",
      status: "Aktif",
      isOfflineEvent: false
    },
    {
      id: 5,
      title: "React.js Eğitimi",
      description: "Modern React.js framework'ü ile web geliştirme eğitimi",
      category: "teknoloji",
      eventType: "online",
      meetingType: "grup",
      platform: "microsoft-teams",
      location: "",
      duration: "180",
      price: "1500",
      maxAttendees: "20",
      icon: "📚",
      iconBg: "bg-yellow-100",
      status: "Aktif",
      isOfflineEvent: false
    },
    {
      id: 6,
      title: "Tasarım Thinking Workshop",
      description: "Yaratıcı problem çözme ve tasarım düşüncesi metodolojileri",
      category: "tasarim",
      eventType: "hybrid",
      meetingType: "grup",
      platform: "zoom",
      location: "İstanbul Workshop Alanı",
      duration: "360",
      price: "200",
      maxAttendees: "15",
      icon: "🎯",
      iconBg: "bg-red-100",
      status: "Aktif",
      isOfflineEvent: false
    }
  ]);

  // Mock packages data with CreatePackage form fields
  const [packages, setPackages] = useState([
    {
      id: 1,
      title: "Dijital Pazarlama Mastery Paketi",
      description: "Kapsamlı dijital pazarlama eğitimi ve danışmanlık paketi. 8 haftalık süreçte markanızı dijital dünyada güçlendirin.",
      category: "danismanlik",
      eventType: "hybrid",
      meetingType: "1-1",
      platform: "zoom",
      location: "İstanbul Ofis",
      duration: "90",
      price: "4500",
      appointmentCount: "8",
      maxAttendees: "1",
      date: "2024-07-01",
      time: "14:00",
      icon: "📈",
      iconBg: "bg-primary-100",
      status: "Aktif",
      isOfflineEvent: false
    },
    {
      id: 2,
      title: "Web Geliştirme Bootcamp",
      description: "Sıfırdan ileri seviye web geliştirme öğrenin. React, Node.js ve modern teknolojiler ile projeler geliştirin.",
      category: "egitim",
      eventType: "online",
      meetingType: "grup",
      platform: "microsoft-teams",
      location: "",
      duration: "240",
      price: "8900",
      appointmentCount: "12",
      maxAttendees: "15",
      date: "2024-07-15",
      time: "19:00",
      icon: "💻",
      iconBg: "bg-blue-100",
      status: "Aktif",
      isOfflineEvent: false
    },
    {
      id: 3,
      title: "Kişisel Gelişim Mentorluk Paketi",
      description: "6 aylık mentorluk programı ile kişisel ve profesyonel hedeflerinize ulaşın. Birebir rehberlik ve destek.",
      category: "mentorluk",
      eventType: "offline",
      meetingType: "1-1",
      platform: "",
      location: "Ankara Danışmanlık Merkezi",
      duration: "60",
      price: "3200",
      appointmentCount: "6",
      maxAttendees: "1",
      date: "",
      time: "",
      icon: "🧠",
      iconBg: "bg-purple-100",
      status: "Aktif",
      isOfflineEvent: false
    },
    {
      id: 4,
      title: "UX/UI Tasarım Workshop Serisi",
      description: "Kullanıcı deneyimi ve arayüz tasarımı konularında uzmanlaşın. Portfolio projelerinizi geliştirin.",
      category: "workshop",
      eventType: "hybrid",
      meetingType: "grup",
      platform: "google-meet",
      location: "İstanbul Tasarım Stüdyosu",
      duration: "180",
      price: "2750",
      appointmentCount: "5",
      maxAttendees: "10",
      date: "2024-08-01",
      time: "13:00",
      icon: "🎨",
      iconBg: "bg-yellow-100",
      status: "Aktif",
      isOfflineEvent: false
    }
  ]);

  const handleEditService = (service) => {
    setSelectedService({...service});
    setEditServiceModal(true);
  };

  const handleDeleteService = (service) => {
    setServiceToDelete(service);
    setDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    setServices(services.filter(service => service.id !== serviceToDelete.id));
    setDeleteConfirmation(false);
    setServiceToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmation(false);
    setServiceToDelete(null);
  };

  const saveServiceChanges = (updatedService) => {
    setServices(services.map(service => 
      service.id === updatedService.id ? updatedService : service
    ));
    setEditServiceModal(false);
    setSelectedService(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with Tab Switch */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <button
            onClick={() => setActiveTab('hizmetler')}
            className={`text-2xl font-bold transition-colors ${
              activeTab === 'hizmetler' 
                ? 'text-gray-900 border-b-2 border-primary-500 pb-1' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Hizmetlerim
          </button>
          <button
            onClick={() => setActiveTab('paketler')}
            className={`text-2xl font-bold transition-colors ${
              activeTab === 'paketler' 
                ? 'text-gray-900 border-b-2 border-primary-500 pb-1' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Paketler
          </button>
        </div>
        
        {activeTab === 'hizmetler' ? (
          <Link 
            to="/dashboard/hizmet/olustur"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            + Ekle
          </Link>
        ) : (
          <Link 
            to="/dashboard/packages/create"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            + Ekle
          </Link>
        )}
      </div>

      {/* Description Text */}
      {activeTab === 'hizmetler' && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-gray-700 text-sm">
            Bu bölümden, danışanlarınızın sizden alacağı randevu, eğitim, workshop vb. etkinliklerinizi yönetebilirsiniz.
          </p>
        </div>
      )}

      {/* Hizmetler Tab Content */}
      {activeTab === 'hizmetler' && (
        <>
          {/* Aktif Hizmetlerim - Card Box View */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Aktif Hizmetlerim</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => {
                // Helper functions for display
                const getCategoryDisplay = (cat) => {
                  const categories = {
                    'teknoloji': 'Teknoloji',
                    'pazarlama': 'Pazarlama', 
                    'tasarim': 'Tasarım',
                    'is-gelistirme': 'İş Geliştirme',
                    'kisisel-gelisim': 'Kişisel Gelişim'
                  };
                  return categories[cat] || cat;
                };

                const getChannelDisplay = (eventType) => {
                  const channels = {
                    'online': 'Online',
                    'offline': 'Yüz Yüze',
                    'hybrid': 'Hibrit'
                  };
                  return channels[eventType] || eventType;
                };

                const getPlatformDisplay = (platform) => {
                  const platforms = {
                    'zoom': 'Zoom',
                    'google-meet': 'Google Meet',
                    'microsoft-teams': 'Microsoft Teams',
                    'jitsi': 'Jitsi'
                  };
                  return platforms[platform] || platform || '-';
                };

                const getDurationDisplay = (duration) => {
                  if (!duration) return '-';
                  const hours = Math.floor(duration / 60);
                  const minutes = duration % 60;
                  if (hours > 0) {
                    return minutes > 0 ? `${hours}sa ${minutes}dk` : `${hours}sa`;
                  }
                  return `${minutes}dk`;
                };

                return (
                  <div key={service.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-primary-300 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 ${service.iconBg} rounded-full`}>
                        <span className="text-2xl">{service.icon}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditService(service)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                          title="Düzenle"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteService(service)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                          title="Sil"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    {/* Hizmet Başlığı */}
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h4>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                    
                    <div className="space-y-3">
                      {/* Kategori */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Kategori:</span>
                        <span className="text-sm font-medium text-gray-900">{getCategoryDisplay(service.category)}</span>
                      </div>

                      {/* Hizmet Kanalı */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Hizmet Kanalı:</span>
                        <span className="text-sm font-medium text-gray-900">{getChannelDisplay(service.eventType)}</span>
                      </div>

                      {/* Platform */}
                      {(service.eventType === 'online' || service.eventType === 'hybrid') && service.platform && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Platform:</span>
                          <span className="text-sm font-medium text-gray-900">{getPlatformDisplay(service.platform)}</span>
                        </div>
                      )}

                      {/* Konum */}
                      {(service.eventType === 'offline' || service.eventType === 'hybrid') && service.location && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Konum:</span>
                          <span className="text-sm font-medium text-gray-900 truncate">{service.location}</span>
                        </div>
                      )}

                      {/* Süre */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Süre:</span>
                        <span className="text-sm font-medium text-gray-900">{getDurationDisplay(parseInt(service.duration))}</span>
                      </div>

                      {/* Fiyat */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Fiyat:</span>
                        <span className="text-lg font-bold text-primary-600">₺{service.price}</span>
                      </div>

                      {/* Durum */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-600">Durum:</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">{service.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State - if no services */}
            {/* 
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🛠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz aktif hizmet yok</h3>
              <p className="text-gray-600 mb-4">İlk hizmetinizi oluşturmak için "+ Ekle" butonuna tıklayın.</p>
            </div>
            */}
          </div>
        </>
      )}

      {/* Edit Service Modal */}
      {editServiceModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Hizmeti Düzenle</h2>
              <button
                onClick={() => setEditServiceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              saveServiceChanges(selectedService);
            }}>
              <div className="space-y-6">
                {/* Hizmet Başlığı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hizmet Başlığı *
                  </label>
                  <input
                    type="text"
                    value={selectedService.title}
                    onChange={(e) => setSelectedService({...selectedService, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Örn: Dijital Pazarlama Danışmanlığı"
                    required
                  />
                </div>

                {/* Hizmet Açıklaması */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hizmet Açıklaması
                  </label>
                  <textarea
                    value={selectedService.description}
                    onChange={(e) => setSelectedService({...selectedService, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Hizmet hakkında detaylı bilgi verin..."
                  />
                </div>

                {/* Kategori and Hizmet Kanalı */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori *
                    </label>
                    <select
                      value={selectedService.category}
                      onChange={(e) => setSelectedService({...selectedService, category: e.target.value})}
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
                      value={selectedService.eventType}
                      onChange={(e) => setSelectedService({...selectedService, eventType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="online">Online</option>
                      <option value="offline">Yüz Yüze</option>
                      <option value="hybrid">Hibrit</option>
                    </select>
                  </div>
                </div>

                {/* Hizmet Türü - Only visible for Online or Hibrit */}
                {(selectedService.eventType === 'online' || selectedService.eventType === 'hybrid') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hizmet Türü *
                    </label>
                    <select
                      value={selectedService.meetingType}
                      onChange={(e) => setSelectedService({...selectedService, meetingType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Hizmet türü seçin</option>
                      <option value="1-1">1-1 Özel</option>
                      <option value="grup">Grup</option>
                    </select>
                  </div>
                )}

                {/* Platform and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Platform - Only visible for Online or Hibrit */}
                  {(selectedService.eventType === 'online' || selectedService.eventType === 'hybrid') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform {selectedService.eventType !== 'hybrid' ? '*' : ''}
                      </label>
                      <select
                        value={selectedService.platform}
                        onChange={(e) => setSelectedService({...selectedService, platform: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required={selectedService.eventType === 'online'}
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
                  {(selectedService.eventType === 'offline' || selectedService.eventType === 'hybrid') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konum {selectedService.eventType !== 'hybrid' ? '*' : ''}
                      </label>
                      <input
                        type="text"
                        value={selectedService.location}
                        onChange={(e) => setSelectedService({...selectedService, location: e.target.value})}
                        placeholder="Hizmet konumu (adres)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required={selectedService.eventType === 'offline'}
                      />
                    </div>
                  )}
                </div>

                {/* Duration, Price, Max Attendees */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Süre (dakika)
                    </label>
                    <input
                      type="number"
                      value={selectedService.duration}
                      onChange={(e) => setSelectedService({...selectedService, duration: e.target.value})}
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
                      value={selectedService.price}
                      onChange={(e) => setSelectedService({...selectedService, price: e.target.value})}
                      placeholder="199"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maksimum Katılımcı
                    </label>
                    <input
                      type="number"
                      value={selectedService.maxAttendees}
                      onChange={(e) => setSelectedService({...selectedService, maxAttendees: e.target.value})}
                      placeholder="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Icon and Icon Background */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İkon
                    </label>
                    <input
                      type="text"
                      value={selectedService.icon}
                      onChange={(e) => setSelectedService({...selectedService, icon: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="🎓"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İkon Arkaplan Rengi
                    </label>
                    <select
                      value={selectedService.iconBg}
                      onChange={(e) => setSelectedService({...selectedService, iconBg: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="bg-primary-100">Primary (Yeşil)</option>
                      <option value="bg-blue-100">Mavi</option>
                      <option value="bg-green-100">Yeşil</option>
                      <option value="bg-purple-100">Mor</option>
                      <option value="bg-yellow-100">Sarı</option>
                      <option value="bg-red-100">Kırmızı</option>
                      <option value="bg-pink-100">Pembe</option>
                      <option value="bg-indigo-100">Indigo</option>
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durum
                  </label>
                  <select
                    value={selectedService.status}
                    onChange={(e) => setSelectedService({...selectedService, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Pasif">Pasif</option>
                    <option value="Beklemede">Beklemede</option>
                  </select>
                </div>

                {/* Offline Event Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isOfflineEvent"
                    checked={selectedService.isOfflineEvent}
                    onChange={(e) => setSelectedService({...selectedService, isOfflineEvent: e.target.checked})}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isOfflineEvent" className="ml-2 block text-sm text-gray-700">
                    Bu hizmet online sistem dışında gerçekleşti
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditServiceModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && serviceToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Hizmeti Sil
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                "<strong>{serviceToDelete.title}</strong>" hizmetini silmek istediğinizden emin misiniz? 
                Bu işlem geri alınamaz.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paketler Tab Content */}
      {activeTab === 'paketler' && (
        <>
          {/* Aktif Paketler Table */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Aktif Paketler</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri Adı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      E-Posta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paket Adı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Satın Alma Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Randevu Kullanımı
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Ayşe Demir</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">ayse.demir@email.com</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">+90 532 123 4567</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Dijital Pazarlama Paketi</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">15 Ocak 2024</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium text-primary-600">3</span>
                        <span className="text-gray-500">/10</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Mehmet Kaya</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">mehmet.kaya@email.com</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">+90 545 987 6543</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Web Geliştirme Danışmanlığı</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">22 Ocak 2024</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium text-primary-600">7</span>
                        <span className="text-gray-500">/15</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Fatma Özkan</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">fatma.ozkan@email.com</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">+90 555 111 2233</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Eğitim Paketi Premium</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">5 Şubat 2024</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium text-primary-600">12</span>
                        <span className="text-gray-500">/20</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Aktif Paketler Card View */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Paket Şablonları</h3>
              <Link
                to="/dashboard/packages/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-primary-500"
              >
                <span className="mr-2">+</span>
                Yeni Paket Oluştur
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map(packageItem => {
                // Helper functions for package display
                const getCategoryDisplay = (cat) => {
                  const categories = {
                    'egitim': 'Eğitim',
                    'danismanlik': 'Danışmanlık',
                    'workshop': 'Workshop',
                    'mentorluk': 'Mentorlük'
                  };
                  return categories[cat] || cat;
                };

                const getChannelDisplay = (eventType) => {
                  const channels = {
                    'online': 'Online',
                    'offline': 'Yüz Yüze',
                    'hybrid': 'Hibrit'
                  };
                  return channels[eventType] || eventType;
                };

                const getPlatformDisplay = (platform) => {
                  const platforms = {
                    'zoom': 'Zoom',
                    'google-meet': 'Google Meet',
                    'microsoft-teams': 'Microsoft Teams',
                    'jitsi': 'Jitsi'
                  };
                  return platforms[platform] || platform || '-';
                };

                const getDurationDisplay = (duration) => {
                  if (!duration) return '-';
                  const hours = Math.floor(duration / 60);
                  const minutes = duration % 60;
                  if (hours > 0) {
                    return minutes > 0 ? `${hours}sa ${minutes}dk` : `${hours}sa`;
                  }
                  return `${minutes}dk`;
                };

                const getTypeDisplay = (meetingType) => {
                  return meetingType === '1-1' ? '1-1 Özel' : 'Grup';
                };

                return (
                  <div key={packageItem.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-primary-300 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 ${packageItem.iconBg} rounded-full`}>
                        <span className="text-2xl">{packageItem.icon}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                          title="Düzenle"
                        >
                          ✏️
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                          title="Sil"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    {/* Paket Adı */}
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{packageItem.title}</h4>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{packageItem.description}</p>
                    
                    <div className="space-y-3">
                      {/* Kategori */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Kategori:</span>
                        <span className="text-sm font-medium text-gray-900">{getCategoryDisplay(packageItem.category)}</span>
                      </div>

                      {/* Etkinlik Kanalı */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Kanal:</span>
                        <span className="text-sm font-medium text-gray-900">{getChannelDisplay(packageItem.eventType)}</span>
                      </div>

                      {/* Etkinlik Türü */}
                      {(packageItem.eventType === 'online' || packageItem.eventType === 'hybrid') && packageItem.meetingType && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Tür:</span>
                          <span className="text-sm font-medium text-gray-900">{getTypeDisplay(packageItem.meetingType)}</span>
                        </div>
                      )}

                      {/* Platform */}
                      {(packageItem.eventType === 'online' || packageItem.eventType === 'hybrid') && packageItem.platform && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Platform:</span>
                          <span className="text-sm font-medium text-gray-900">{getPlatformDisplay(packageItem.platform)}</span>
                        </div>
                      )}

                      {/* Konum */}
                      {(packageItem.eventType === 'offline' || packageItem.eventType === 'hybrid') && packageItem.location && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Konum:</span>
                          <span className="text-sm font-medium text-gray-900 truncate">{packageItem.location}</span>
                        </div>
                      )}

                      {/* Süre */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Süre:</span>
                        <span className="text-sm font-medium text-gray-900">{getDurationDisplay(parseInt(packageItem.duration))}</span>
                      </div>

                      {/* Randevu Adedi */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Randevu Adedi:</span>
                        <span className="text-sm font-medium text-primary-600">{packageItem.appointmentCount} seans</span>
                      </div>

                      {/* Maksimum Katılımcı - Only for group packages */}
                      {packageItem.meetingType === 'grup' && packageItem.maxAttendees && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Max Katılımcı:</span>
                          <span className="text-sm font-medium text-gray-900">{packageItem.maxAttendees} kişi</span>
                        </div>
                      )}

                      {/* Fiyat */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-600">Fiyat:</span>
                        <span className="text-lg font-bold text-primary-600">₺{packageItem.price}</span>
                      </div>

                      {/* Durum */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Durum:</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">{packageItem.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State - if no packages */}
            {packages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz paket yok</h3>
                <p className="text-gray-600 mb-4">İlk paketinizi oluşturmak için "Yeni Paket Oluştur" butonuna tıklayın.</p>
                <Link
                  to="/dashboard/packages/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Yeni Paket Oluştur
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};