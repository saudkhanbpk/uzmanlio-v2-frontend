import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { eventService } from "../services/eventService";
import AddCustomerModal from "../customers/AddCustomerModal"
import { log10 } from "chart.js/helpers";
import { useUser } from "../context/UserContext";



// CreateEvent Component - Updated with new requirements
export const CreateEvent = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') // Mock user ID for development

  const [eventData, setEventData] = useState({
    service: '', // Changed: Now uses service/package dropdown instead of title
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
    status: 'pending', // New: Etkinlik Durumu field
    selectedClients: [],
    paymentType: 'online', // New: Payment section
    isRecurring: false, // New: Recurring checkbox
    recurringType: 'haftalık' // New: Haftalık or Aylık
  });

  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [availableServices, setAvailableServices] = useState([]);
  // const [availablePackages , setAvailablePackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load services and packages on component mount
  // useEffect(() => {
  const ShowServices = async () => {

    const storedUser = localStorage.getItem("user");

    try {
      // Check if storedUser exists and can be parsed
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        // Check if parsedUser has services or packages
        if (parsedUser && (parsedUser.services?.length || parsedUser.packages?.length)) {
          console.log("Using stored user data:", parsedUser);

          const services = Array.isArray(parsedUser.services) ? parsedUser.services : [];
          const packages = Array.isArray(parsedUser.packages) ? parsedUser.packages : [];

          const combined = [
            ...services.map(s => ({ id: s.id, title: s.title, type: "service" })),
            ...packages.map(p => ({ id: p.id, title: p.title, type: "package" }))
          ];


          setAvailableServices(combined);
        } else {
          console.log("No services/packages in stored user, fetching from DB");
          loadServicesAndPackages();
        }
      } else {
        console.log("No user in localStorage, fetching from DB");
        loadServicesAndPackages();
      }
    } catch (error) {
      console.error("Error parsing stored user:", error);
      loadServicesAndPackages();
    }
  };

  useEffect(() => {
    ShowServices()
  }, []);

  const loadServicesAndPackages = async () => {
    console.log("Loading services and packages from DB");
    try {
      const user = await eventService.getServicesAndPackages(userId);

      if (!user) {
        console.error("No user data received");
        return;
      }
      ShowServices();

      // const services = Array.isArray(user.services) ? user.services : [];
      // const packages = Array.isArray(user.packages) ? user.packages : [];

      // const combined = [
      //   ...services.map(s => ({ id: s.id, title: s.title, type: "service" })),
      //   ...packages.map(p => ({ id: p.id, title: p.title, type: "package" }))
      // ];

      // setAvailableServices(combined);
      // console.log("Fetched services and packages:", combined);
    } catch (err) {
      console.error('Error loading services:', err);
      setAvailableServices([]); // Set empty array on error
    }
  };

  // Mock services and packages data (from Hizmetlerim and Paketlerim)
  //   const availableServices = [
  // //  const mockservices= [
  //     // Services from Hizmetlerim
  //     { id: 1, name: 'Dijital Pazarlama Eğitimi - Birebir', type: 'service', price: 500 },
  //     { id: 2, name: 'Dijital Pazarlama Eğitimi - Grup', type: 'service', price: 200 },
  //     { id: 3, name: 'Kurumsal Web Sitesi', type: 'service', price: 15000 },
  //     { id: 4, name: 'E-ticaret Sitesi', type: 'service', price: 25000 },
  //     { id: 5, name: 'SEO Danışmanlığı', type: 'service', price: 3000 },
  //     { id: 6, name: 'Sosyal Medya Yönetimi', type: 'service', price: 2500 },
  //     // Packages from Paketlerim 
  //     { id: 7, name: 'Dijital Pazarlama Paketi', type: 'package', price: 5000, appointments: 10 },
  //     { id: 8, name: 'Web Geliştirme Danışmanlığı', type: 'package', price: 8000, appointments: 15 },
  //     { id: 9, name: 'Kapsamlı SEO Paketi', type: 'package', price: 12000, appointments: 20 }
  //   ];

  // Mock clients data with package information  
  // const availableClients = [
  //   { id: 1, name: 'Ayşe Demir', email: 'ayse.demir@email.com', packages: [7, 9] },
  //   { id: 2, name: 'Mehmet Kaya', email: 'mehmet.kaya@email.com', packages: [8] },
  //   { id: 3, name: 'Fatma Özkan', email: 'fatma.ozkan@email.com', packages: [7] },
  //   { id: 4, name: 'Ali Yılmaz', email: 'ali.yilmaz@email.com', packages: [] },
  //   { id: 5, name: 'Zeynep Şahin', email: 'zeynep.sahin@email.com', packages: [9] }
  // ];
  const availableClients = user.customers
    .map(c => c.customerId)
    .filter(Boolean);

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

  const handleServiceChange = (e) => {
    const serviceId = parseInt(e.target.value);
    const selectedService = availableServices.find(s => s.id === serviceId);

    setEventData(prev => ({
      ...prev,
      service: e.target.value,
      price: selectedService ? selectedService.price : ''
    }));
  };

  const handleClientSelect = (clientId) => {
    const client = availableClients.find(c => (c._id || c.id) === clientId);
    if (eventData.meetingType === '1-1') {
      setEventData(prev => ({
        ...prev,
        selectedClients: [client]
      }));
    } else {
      setEventData(prev => ({
        ...prev,
        selectedClients: prev.selectedClients.some(c => (c._id || c.id) === clientId)
          ? prev.selectedClients.filter(c => (c._id || c.id) !== clientId)
          : [...prev.selectedClients, client]
      }));
    }
  };

  const handleRemoveClient = (clientId) => {
    setEventData(prev => ({
      ...prev,
      selectedClients: prev.selectedClients.filter(c => (c._id || c.id) !== clientId)
    }));
  };

  const handleAddNewClient = (newClientData) => {
    const newClient = {
      id: Date.now(),
      name: `${newClientData.name} ${newClientData.surname}`,
      email: newClientData.email,
      packages: []
    };

    availableClients.push(newClient);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // 🛠️ Make sure you're comparing the same property (serviceId)
      const selectedService = availableServices.find(
        s => s.id === eventData.service
      );

      if (!selectedService) {
        console.error("❌ Selected service not found for ID:", eventData.serviceId);
        setError("Service not found. Please select a valid one.");
        setLoading(false);
        return;
      }

      // ✅ Format selectedClients to use the correct ID field
      const formattedClients = eventData.selectedClients.map(client => ({
        id: client._id || client.id, // Use _id (MongoDB default) or fallback to id
        name: client.name,
        email: client.email,
        packages: client.packages || []
      }));

      // ✅ Build formatted data with required fields
      const formattedData = {
        ...eventData,
        serviceName: selectedService.title,   // ✅ now filled
        title: eventData.title || selectedService.title, // ✅ required by backend
        serviceType: selectedService.type,    // optional but often useful
        selectedClients: formattedClients,    // ✅ properly formatted clients
      };

      console.log("✅ Formatted Data before API:", formattedData);

      // ✅ Create event
      await eventService.createEvent(userId, formattedData);

      // ✅ Navigate back
      navigate("/dashboard/events");
    } catch (err) {
      console.error("❌ Error creating event:", err);
      setError("An error occurred while creating the event.");
    } finally {
      setLoading(false);
    }
  };


  // Show meeting type field for Online or Hibrit
  const showMeetingType = eventData.eventType === 'online' || eventData.eventType === 'hybrid';

  // Show platform and location fields based on event type  
  const showPlatform = eventData.eventType === 'online' || eventData.eventType === 'hybrid';
  const showLocation = eventData.eventType === 'offline' || eventData.eventType === 'hybrid';

  // Check if selected client has packages (for Paketten Tahsil Et option)
  const hasPackageClient = eventData.selectedClients.some(client =>
    client.packages && client.packages.length > 0
  );

  // Show price field only if not "Paketten Tahsil Et"
  const showPriceField = eventData.paymentType !== 'paketten-tahsil';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/dashboard/events"
          className="text-gray-500 hover:text-gray-700"
        >
          ← Geri
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Yeni Etkinlik Oluştur</h1>
      </div>

      {/* Error Display */}
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
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Temel Bilgiler</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Changed: Etkinlik Başlığı now shows dropdown of services/packages */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etkinlik Başlığı *
              </label>
              <select
                name="service"
                value={eventData.service}
                onChange={handleServiceChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Hizmet veya Paket Seçin</option>
                {/* {availableServices.filter(s => s.type === 'service').length > 0 && ( */}
                <optgroup label="Hizmetlerim">
                  {availableServices.filter(s => s.type === 'service').map(service => (
                    <option key={service.id} value={service.id}>
                      {service.title}
                    </option>
                  ))}

                </optgroup>
                {/* )} */}
                {/* {availableServices.filter(s => s.type === 'package').length > 0 && ( */}
                <optgroup label="Paketlerim">
                  {availableServices.filter(s => s.type === 'package').map(service => (
                    <option key={service.id} value={service.id}>
                      {service.title}
                    </option>
                  ))}

                </optgroup>
                {/* )} */}
              </select>
            </div>

            {/* Removed: Etkinlik Açıklaması field */}

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
                Etkinlik Kanalı *
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
                  Etkinlik Türü *
                </label>
                <select
                  name="meetingType"
                  value={eventData.meetingType}
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
          </div>
        </div>

        {/* Changed: Date and Time - Now available for both event types */}
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

            {/* New: Recurring options when Paketten Tahsil Et is selected */}
            {eventData.paymentType === 'paketten-tahsil' && (
              <>
                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      name="isRecurring"
                      checked={eventData.isRecurring}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
                      Tekrarla
                    </label>
                  </div>
                </div>

                {eventData.isRecurring && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tekrar Sıklığı *
                    </label>
                    <select
                      name="recurringType"
                      value={eventData.recurringType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="haftalık">Haftalık</option>
                      <option value="aylık">Aylık</option>
                    </select>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

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
                  placeholder="Etkinlik konumu (adres)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required={eventData.eventType === 'offline'}
                />
              </div>
            )}

            {/* New: Etkinlik Durumu field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etkinlik Durumu *
              </label>
              <select
                name="status"
                value={eventData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="pending">Onay Bekliyor</option>
                <option value="approved">Yaklaşan</option>
                <option value="completed">Tamamlandı</option>
                <option value="cancelled">İptal Edildi</option>
                <option value="scheduled">Planlandı</option>
              </select>
            </div>

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
          </div>

          {/* Changed: Danışan Bilgileri always visible (removed offline checkbox) */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-4">Danışan Bilgileri</h4>

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
                {eventData.selectedClients.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">Seçili Danışanlar:</p>
                    <div className="flex flex-wrap gap-2">
                      {eventData.selectedClients.map((client) => (
                        <span
                          key={client._id || client.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                        >
                          {client.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveClient(client._id || client.id)}
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
                            key={client._id || client.id}
                            onClick={() => handleClientSelect(client._id || client.id)}
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${eventData.selectedClients.some(c => (c._id || c.id) === (client._id || client.id))
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
                                {client.packages && client.packages.length > 0 && (
                                  <p className="text-xs text-green-600">
                                    {client.packages.length} aktif paket
                                  </p>
                                )}
                              </div>
                              {eventData.selectedClients.some(c => (c._id || c.id) === (client._id || client.id)) && (
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

                {eventData.selectedClients.length === 0 && (
                  <p className="text-red-500 text-sm mt-1">En az bir danışan seçmelisiniz.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* New: Payment Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ödeme</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ödeme Şekli *
              </label>
              <select
                name="paymentType"
                value={eventData.paymentType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="online">Online</option>
                <option value="havale-eft">Havale / EFT</option>
                <option value="paketten-tahsil" disabled={!hasPackageClient}>
                  Paketten Tahsil Et {!hasPackageClient && '(Seçili danışanda paket yok)'}
                </option>
              </select>
              {eventData.paymentType === 'paketten-tahsil' && !hasPackageClient && (
                <p className="text-red-500 text-sm mt-1">
                  Seçili danışanın aktif paketi bulunmuyor.
                </p>
              )}
            </div>

            {/* Price - Only visible if not Paketten Tahsil Et */}
            {showPriceField && (
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
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Link
            to="/dashboard/events"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-primary-400 transition-colors"
          >
            {loading ? 'Oluşturuluyor...' : 'Etkinlik Oluştur'}
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