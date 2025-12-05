import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { eventService } from "../services/eventService";
import AddCustomerModal from "../customers/AddCustomerModal"
import { log10 } from "chart.js/helpers";
import { useUser } from "../context/UserContext";
import PaymentDeductionModal from "./paymentDeductionmodel";



// CreateEvent Component - Updated with new requirements
export const CreateEvent = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [customerPackageMap, setCustomerPackageMap] = useState([]);
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
    // category: '',
    status: 'pending', // New: Etkinlik Durumu field
    selectedClients: [],
    paymentType: 'online', // New: Payment section
    isRecurring: false, // New: Recurring checkbox
    recurringType: 'haftalık' // New: Haftalık or Aylık
  });

  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [availableServices, setAvailableServices] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [customerPaymentSettings, setCustomerPaymentSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Process customersPackageDetails when user data changes
  useEffect(() => {
    if (user?.customersPackageDetails && user.customersPackageDetails.length > 0) {
      console.log("Raw customersPackageDetails:", user.customersPackageDetails);

      // Group packages by customer ID
      const packageMap = {};

      user.customersPackageDetails.forEach(order => {
        const customerId = order.customerId?.toString() || order.customerId;

        // Initialize customer entry if it doesn't exist
        if (!packageMap[customerId]) {
          packageMap[customerId] = {
            userId: customerId,
            userName: order.userInfo?.name || 'Unknown',
            userEmail: order.userInfo?.email || '',
            userPackages: []
          };
        }

        // Extract package details from order events
        if (order.orderDetails?.events) {
          order.orderDetails.events.forEach(event => {
            if (event.eventType === 'package' && event.package) {
              // Only add packages with remaining sessions
              const remainingSessions = event.package.sessions - (event.package.completedSessions || 0);

              if (remainingSessions > 0) {
                packageMap[customerId].userPackages.push({
                  packageId: event.package.packageId,
                  packageName: event.package.name,
                  totalSessions: event.package.sessions,
                  completedSessions: event.package.completedSessions || 0,
                  remainingSessions: remainingSessions,
                  price: event.package.price,
                  duration: event.package.duration,
                  meetingType: event.package.meetingType,
                  orderId: order._id,
                  orderDate: order.orderDetails?.orderDate,
                  paymentStatus: order.paymentInfo?.status
                });
              }
            }
          });
        }
      });

      // Convert to array format
      const packageArray = Object.values(packageMap);

      console.log("Processed Customer Package Map:", packageArray);
      setCustomerPackageMap(packageArray);
    } else {
      console.log("No customersPackageDetails found in user data");
      setCustomerPackageMap([]);
    }
  }, [user]);

  const handlePaymentSettingsConfirm = (settings) => {
    setCustomerPaymentSettings(settings);
    console.log("Payment settings saved:", settings);
  };

  const ShowServices = async () => {
    const storedUser = localStorage.getItem("user");

    try {
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

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
    } catch (err) {
      console.error('Error loading services:', err);
      setAvailableServices([]);
    }
  };

  // ✅ FIXED: Properly extract and normalize customer data
  const availableClients = (user?.customers || [])
    .map(c => {
      // Handle both cases: when customerId is an object or when it's directly the customer
      const customer = c.customerId || c;

      return {
        id: customer._id || customer.id,
        name: customer.name || '',
        surname: customer.surname || '',
        fullName: `${customer.name || ''} ${customer.surname || ''}`.trim(),
        email: customer.email || '',
        phone: customer.phone || '',
        packages: customer.packages || [],
        _id: customer._id || customer.id
      };
    })
    .filter(c => c.id && c.fullName); // Only keep valid customers

  console.log("Available Clients:", availableClients);

  // ✅ FIXED: Filter by full name, email, or phone
  const filteredClients = availableClients.filter(client => {
    const searchLower = clientSearchTerm.toLowerCase();
    return (
      client.fullName.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      (client.phone && client.phone.includes(searchLower))
    );
  });

  console.log("Filtered Clients:", filteredClients);
  console.log("Search Term:", clientSearchTerm);


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
    const client = availableClients.find(c => c.id === clientId);
    if (!client) return;

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
      name: newClientData.name,
      surname: newClientData.surname,
      fullName: `${newClientData.name} ${newClientData.surname}`,
      email: newClientData.email,
      phone: newClientData.phone,
      packages: []
    };

    // Note: You should also add this to your backend/user state
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

      const selectedService = availableServices.find(
        s => s.id === eventData.service
      );

      if (!selectedService) {
        console.error("❌ Selected service not found for ID:", eventData.serviceId);
        setError("Service not found. Please select a valid one.");
        setLoading(false);
        return;
      }

      // Convert customerPaymentSettings object to array format
      const paymentTypeArray = Object.values(customerPaymentSettings).map(setting => ({
        customerId: setting.userId,
        paymentMethod: setting.paymentMethod,
        packageId: setting.packageId,
        orderId: setting.orderId  // ADD THIS LINE
      }));

      const formattedData = {
        ...eventData,
        serviceName: selectedService.title,
        title: eventData.title || selectedService.title,
        serviceType: selectedService.type,
        paymentType: paymentTypeArray  // REPLACE the old paymentType with this array
      };

      console.log("✅ Formatted Data before API:", formattedData);

      await eventService.createEvent(userId, formattedData);

      navigate("/dashboard/events");
    } catch (err) {
      console.error("❌ Error creating event:", err);
      setError("An error occurred while creating the event.");
    } finally {
      setLoading(false);
    }
  };

  const showMeetingType = eventData.eventType === 'online' || eventData.eventType === 'hybrid';
  const showPlatform = eventData.eventType === 'online' || eventData.eventType === 'hybrid';
  const showLocation = eventData.eventType === 'offline' || eventData.eventType === 'hybrid';

  const hasPackageClient = eventData.selectedClients.some(client =>
    client.packages && client.packages.length > 0
  );

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
                <optgroup label="Hizmetlerim">
                  {availableServices.filter(s => s.type === 'service').map(service => (
                    <option key={service.id} value={service.id}>
                      {service.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Paketlerim">
                  {availableServices.filter(s => s.type === 'package').map(service => (
                    <option key={service.id} value={service.id}>
                      {service.title}
                    </option>
                  ))}
                </optgroup>
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

            {showMeetingType && (
              <div >
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

        {/* Date and Time */}
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

          {/* Client Information */}
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
                          {client.fullName}
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

                {/* Client List Dropdown - Always show when search is active or no clients selected */}
                <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                  {filteredClients.length > 0 ? (
                    <>
                      {filteredClients.map((client) => (
                        <div
                          key={client.id}
                          onClick={() => handleClientSelect(client.id)}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${eventData.selectedClients.some(c => c.id === client.id)
                            ? 'bg-primary-50 text-primary-700'
                            : ''
                            }`}
                        >
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-primary-600 text-sm font-medium">
                                {client.name.charAt(0)}{client.surname.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{client.fullName}</p>
                              <p className="text-xs text-gray-500">{client.email}</p>
                              {client.packages && client.packages.length > 0 && (
                                <p className="text-xs text-green-600">
                                  {client.packages.length} aktif paket
                                </p>
                              )}
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
                      {availableClients.length === 0
                        ? "Henüz danışan eklenmemiş."
                        : "Aradığınız kriterlere uygun danışan bulunamadı."}
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

                {eventData.selectedClients.length === 0 && (
                  <p className="text-red-500 text-sm mt-1">En az bir danışan seçmelisiniz.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
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
        </div> */}
        {/* Payment Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ödeme</h3>

          {/* Default Price for Non-Package Customers */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Varsayılan Fiyat (₺)
              <span className="text-gray-500 text-xs ml-2">
                (Paketsiz danışanlar için)
              </span>
            </label>
            <input
              type="number"
              name="price"
              value={eventData.price}
              onChange={handleInputChange}
              placeholder="199"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Bu fiyat, paketi olmayan veya paketten tahsil edilmeyen danışanlar için geçerli olacaktır.
            </p>
          </div>

          {/* Payment Settings Button */}
          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            disabled={eventData.selectedClients.length === 0}
            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {eventData.selectedClients.length === 0
              ? 'Önce danışan seçin'
              : `Ödeme Ayarlarını Düzenle (${eventData.selectedClients.length} danışan)`
            }
          </button>

          {Object.keys(customerPaymentSettings).length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ {Object.keys(customerPaymentSettings).length} danışan için ödeme ayarları yapılandırıldı
              </p>
            </div>
          )}
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

      {/* Payment Deduction Modal */}
      <PaymentDeductionModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedClients={eventData.selectedClients}
        customerPackageMap={customerPackageMap}
        onConfirm={handlePaymentSettingsConfirm}
      />
    </div>
  );
};