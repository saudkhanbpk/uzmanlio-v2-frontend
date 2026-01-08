import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import ServiceSection from "./ServicesSection";
import PackageSection from "./PackageSection";
import { useUser } from "../context/UserContext";
import { AddCustomerModal } from "../customers/AddCustomerModal";
import { createPurchaseEntry } from "./purchaseService";
import { useViewMode } from "../contexts/ViewModeContext";
import { useInstitutionUsers } from "../contexts/InstitutionUsersContext";
import { ViewModeSwitcher } from "../components/ViewModeSwitcher";
import { authFetch, getAuthUserId } from "./authFetch";
import { customerService } from "./customerService";



export default function Services() {
  const { user, updateUserField } = useUser();
  const SERVER_URL = process.env.REACT_APP_BACKEND_URL;
  const [activeTab, setActiveTab] = useState('hizmetler');
  const [editServiceModal, setEditServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState();
  // Add state for package modal
  const [editPackageModal, setEditPackageModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  // Add search state
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [packageSearchTerm, setPackageSearchTerm] = useState('');
  // Purchase modal states
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedPurchasePackageId, setSelectedPurchasePackageId] = useState('');
  const [availableCustomers, setAvailableCustomers] = useState([]);
  const [purchaseDetails, setPurchaseDetails] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  // View mode for institution/individual
  const { viewMode, setViewMode } = useViewMode();
  const { institutionUsers, fetchInstitutionUsers, getAllServices, getAllPackages } = useInstitutionUsers();

  // Check if user is admin (only admins can see institution view)
  const isAdmin = user?.subscription?.isAdmin === true && user?.subscription?.plantype === "institutional";
  const canAccessInstitutionView = isAdmin;

  const userId = localStorage.getItem('userId');

  // Add this function to fetch purchase details
  const fetchPurchaseDetails = async () => {
    try {
      setLoadingPurchases(true);
      const response = await authFetch(
        `${SERVER_URL}/api/expert/${userId}/packages/purchases/details`
      );
      const data = await response.json();
      setPurchaseDetails(data.purchases || []);
    } catch (error) {
      console.error('Error fetching purchase details:', error);
    } finally {
      setLoadingPurchases(false);
    }
  };

  // Add useEffect to fetch on component mount and when packages change
  useEffect(() => {
    if (userId && activeTab === 'paketler') {
      fetchPurchaseDetails();
    }
  }, [userId, activeTab, packages]); // Re-fetch when packages change

  // Fetch services from API
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await authFetch(`${SERVER_URL}/api/expert/${userId}/services`);
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: 'Hizmetler yüklenirken bir hata oluştu.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch packages from API
  const fetchPackages = async () => {
    try {
      const response = await authFetch(`${SERVER_URL}/api/expert/${userId}/packages`);
      const data = await response.json();
      setPackages(data.packages || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  //If the services is Available in the context , Get It From there , else Fetch From the Backend
  useEffect(() => {
    if (!user) return; // wait until user is loaded
    loadData();
  }, [user, viewMode]);  // run when user updates or viewMode changes

  // Load data based on view mode
  const loadData = async () => {
    console.log("[Services] loadData called - viewMode:", viewMode, "isAdmin:", isAdmin);

    if (viewMode === 'institution' && canAccessInstitutionView) {
      console.log("[Services] Loading institution data...");
      // Check if institution users are already cached
      if (institutionUsers && institutionUsers.length > 0) {
        console.log("[Services] ✅ Using cached institution data");
        setServices(getAllServices());
        setPackages(getAllPackages());
      } else {
        console.log("[Services] ⏳ Fetching institution users...");
        const fetchedUsers = await fetchInstitutionUsers(userId, user?.subscription);
        if (fetchedUsers && fetchedUsers.length > 0) {
          // Extract services and packages from fetched users
          const allServices = fetchedUsers.flatMap(u =>
            (u.services || []).map(s => ({
              ...s,
              expertId: u._id,
              expertName: `${u.information?.name || ''} ${u.information?.surname || ''}`.trim(),
              isViewOnly: u._id !== userId // View-only if not the current user's data
            }))
          );
          const allPackages = fetchedUsers.flatMap(u =>
            (u.packages || []).map(p => ({
              ...p,
              expertId: u._id,
              expertName: `${u.information?.name || ''} ${u.information?.surname || ''}`.trim(),
              isViewOnly: u._id !== userId // View-only if not the current user's data
            }))
          );
          console.log("[Services] Loaded", allServices.length, "services and", allPackages.length, "packages");
          setServices(allServices);
          setPackages(allPackages);
        }
      }
    } else {
      // Individual view - use own data
      console.log("[Services] Loading individual data...");
      if (user?.services) {
        setServices(user.services);
      } else {
        fetchServices();
      }
      if (user?.packages) {
        setPackages(user.packages);
      } else {
        fetchPackages();
      }
    }
  };

  // Note: loadData() already handles data loading from context or API
  // No need for additional useEffect hooks to refetch on tab change or mount


  const saveServiceChanges = async (updatedService) => {
    try {
      // Show loading
      Swal.fire({
        title: 'Güncelleniyor...',
        text: 'Lütfen bekleyin',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => Swal.showLoading()
      });

      // Prepare update data with all fields
      const updateData = {
        title: updatedService.title || '',
        description: updatedService.description || '',
        price: parseFloat(updatedService.price) || 0,
        duration: parseInt(updatedService.duration) || 0,
        category: updatedService.category || '',
        features: updatedService.features || [],
        icon: updatedService.icon || '',
        iconBg: updatedService.iconBg || '',
        eventType: updatedService.eventType || 'online',
        meetingType: updatedService.meetingType || '',
        platform: updatedService.platform || '',
        location: updatedService.location || '',
        maxAttendees: updatedService.maxAttendees ? parseInt(updatedService.maxAttendees) : null,
        date: updatedService.date || null,
        time: updatedService.time || null,
        isOfflineEvent: updatedService.isOfflineEvent || false,
        selectedClients: updatedService.selectedClients || [],
        status: updatedService.status || 'active',
        isActive: (updatedService.status || 'active') === 'active'
      };

      console.log('Sending update data:', updateData);
      console.log('IconBg being sent:', updateData.iconBg);

      // Make API call - use _id for MongoDB ObjectId, fallback to id for legacy
      const serviceId = updatedService._id || updatedService.id;
      const response = await authFetch(
        `${SERVER_URL}/api/expert/${userId}/services/${serviceId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updateData)
        }
      );
      const responseData = await response.json();

      console.log('Response from server:', responseData);
      // Handle different response formats from backend
      let updatedServiceData;

      // If backend returns { success: true, service: {...} }
      if (responseData && responseData.service) {
        updatedServiceData = responseData.service;
      }
      // If backend returns the service directly
      else if (responseData && responseData.id) {
        updatedServiceData = responseData;
      }
      // Fallback: merge what we sent with original service
      else {
        updatedServiceData = {
          ...updatedService,
          ...updateData,
          id: updatedService.id
        };
      }

      // ✅ Ensure iconBg is preserved if backend didn't return it
      if (!updatedServiceData.iconBg && updateData.iconBg) {
        updatedServiceData.iconBg = updateData.iconBg;
      }

      console.log('Final service data to save:', updatedServiceData);

      // Update the services array in state
      const svcId = updatedService._id || updatedService.id;
      setServices(prevServices => {
        if (!Array.isArray(prevServices)) {
          console.error('Services is not an array:', prevServices);
          return [];
        }

        const newServices = prevServices.map(service =>
          (service._id || service.id) === svcId ? updatedServiceData : service
        );

        console.log('Updated services array:', newServices);
        return newServices;
      });

      // Close modal and clear selected service
      setEditServiceModal(false);
      setSelectedService(null);

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Başarılı!',
        text: 'Hizmet başarıyla güncellendi.',
        showConfirmButton: false,
        timer: 1500
      });

    } catch (error) {
      console.error('Update error:', error);
      console.error('Error response:', error.response?.data);

      // Show error message
      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: `Hizmet güncellenirken bir hata oluştu: ${error.response?.data?.error || error.message}`,
      });
    }
  };

  // Save package changes
  const savePackageChanges = async (updatedPackage) => {
    try {
      // Show loading
      Swal.fire({
        title: 'Güncelleniyor...',
        text: 'Lütfen bekleyin',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      // Prepare update data
      const updateData = {
        title: updatedPackage.title || '',
        description: updatedPackage.description || '',
        price: parseFloat(updatedPackage.price) || 0,
        duration: parseInt(updatedPackage.duration) || 0,
        appointmentCount: parseInt(updatedPackage.appointmentCount) || 1,
        category: updatedPackage.category || '',
        eventType: updatedPackage.eventType || 'online',
        meetingType: updatedPackage.meetingType || '',
        platform: updatedPackage.platform || '',
        location: updatedPackage.location || '',
        date: updatedPackage.date || null,
        time: updatedPackage.time || null,
        maxAttendees: updatedPackage.maxAttendees ? parseInt(updatedPackage.maxAttendees) : null,
        icon: updatedPackage.icon || '📦',
        iconBg: selectedPackage?.iconBg || '',
        status: updatedPackage.status || 'active',
        isOfflineEvent: updatedPackage.isOfflineEvent || false,
        selectedClients: updatedPackage.selectedClients || [],
        features: updatedPackage.features || []
      };

      // Use _id for MongoDB ObjectId, fallback to id for legacy
      const packageId = updatedPackage._id || updatedPackage.id;
      const response = await authFetch(
        `${SERVER_URL}/api/expert/${userId}/packages/${packageId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updateData)
        }
      );
      const responseData = await response.json();

      // Update local state - compare by _id or id
      const pkgId = updatedPackage._id || updatedPackage.id;
      setPackages(packages.map(pkg =>
        (pkg._id || pkg.id) === pkgId ? responseData.package : pkg
      ));

      setEditPackageModal(false);
      setSelectedPackage(null);

      Swal.fire({
        icon: 'success',
        title: 'Başarılı!',
        text: 'Paket başarıyla güncellendi.',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Update error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: 'Paket güncellenirken bir hata oluştu.',
      });
    }
  };

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
    const durationNum = parseInt(duration);
    const hours = Math.floor(durationNum / 60);
    const minutes = durationNum % 60;
    if (hours > 0) {
      return minutes > 0 ? `${hours}saat ${minutes}dakika` : `${hours}saat`;
    }
    return `${minutes}dk`;
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'active': 'Aktif',
      'inactive': 'Pasif',
      'onhold': 'Beklemede'
    };
    return statusMap[status] || status || 'Aktif';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'onhold': 'bg-yellow-100 text-yellow-800'
    };
    return colorMap[status] || 'bg-green-100 text-green-800';
  };

  // Helper function for package category display
  const getPackageCategoryDisplay = (cat) => {
    const categories = {
      'egitim': 'Eğitim',
      'danismanlik': 'Danışmanlık',
      'workshop': 'Workshop',
      'mentorluk': 'Mentorlük'
    };
    return categories[cat] || cat;
  };

  const handleColorSelect = (color) => {
    if (selectedPackage) {
      setSelectedPackage(prev => ({ ...prev, iconBg: color }));
    } else {
      setSelectedService(prev => ({ ...prev, iconBg: color }));
    }
  };

  // Synchronization helpers for UserContext
  const handleDeleteServiceSync = (serviceId) => {
    if (!user || !user.services) return;
    const updatedServices = user.services.filter(s => (s._id || s.id) !== serviceId);
    updateUserField('services', updatedServices);
  };

  const handleDeletePackageSync = (packageId) => {
    if (!user || !user.packages) return;
    const updatedPackages = user.packages.filter(p => (p._id || p.id) !== packageId);
    updateUserField('packages', updatedPackages);
  };

  // Fetch available customers for purchase modal
  const fetchCustomers = async () => {
    try {
      const response = await authFetch(`${SERVER_URL}/api/expert/${userId}/customers`);
      const data = await response.json();
      setAvailableCustomers(data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Handle adding new customer from modal
  const handleAddNewCustomer = async (customerData) => {
    try {
      const formattedData = customerService.formatCustomerData(customerData);
      const createdCustomer = await customerService.createCustomer(userId, formattedData);

      if (createdCustomer) {
        // Update UserContext
        const currentCustomers = user?.customers || [];
        updateUserField('customers', [...currentCustomers, { customerId: createdCustomer }]);

        setAvailableCustomers(prev => [...prev, createdCustomer]);
        setSelectedCustomerId(createdCustomer._id || createdCustomer.id);
        setShowAddCustomerModal(false);

        Swal.fire({
          icon: 'success',
          title: 'Başarılı!',
          text: 'Danışan başarıyla eklendi.',
          showConfirmButton: false,
          timer: 1500
        });
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: error.message || 'Danışan eklenirken bir hata oluştu.',
      });
    }
  };

  // Handle purchase entry submission
  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCustomerId || !selectedPurchasePackageId) {
      Swal.fire({
        icon: 'warning',
        title: 'Uyarı!',
        text: 'Lütfen danışan ve paket seçin.',
      });
      return;
    }

    try {
      Swal.fire({
        title: 'Satın alma kaydı oluşturuluyor...',
        text: 'Lütfen bekleyin',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => Swal.showLoading()
      });

      const result = await createPurchaseEntry(
        userId,
        selectedCustomerId,
        selectedPurchasePackageId
      );

      setShowPurchaseModal(false);
      setSelectedCustomerId('');
      setSelectedPurchasePackageId('');

      // Refresh packages to show updated purchase data
      await fetchPackages();

      Swal.fire({
        icon: 'success',
        title: 'Başarılı!',
        text: 'Satın alma kaydı başarıyla oluşturuldu.',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Purchase error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: `Satın alma kaydı oluşturulamadı: ${error.error || error.message}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Tab Switch */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <button
            onClick={() => setActiveTab('hizmetler')}
            className={`text-2xl font-bold transition-colors ${activeTab === 'hizmetler'
              ? 'text-gray-900 border-b-2 border-primary-500 pb-1'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {viewMode === 'institution' ? 'Tüm Hizmetler' : 'Hizmetlerim'}
          </button>
          <button
            onClick={() => setActiveTab('paketler')}
            className={`text-2xl font-bold transition-colors ${activeTab === 'paketler'
              ? 'text-gray-900 border-b-2 border-primary-500 pb-1'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {viewMode === 'institution' ? 'Tüm Paketler' : 'Paketler'}
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode Switcher - Only show for admins */}
          {canAccessInstitutionView && (
            <ViewModeSwitcher
              currentMode={viewMode}
              onModeChange={setViewMode}
              isAdmin={isAdmin}
            />
          )}

          {/* Add buttons - Only show in individual view (not in institution view-only mode) */}
          {viewMode !== 'institution' && (
            activeTab === 'hizmetler' ? (
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
            )
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder={activeTab === 'hizmetler' ? "Hizmet ara..." : "Paket ara..."}
            onChange={(e) => activeTab === 'hizmetler' ? setServiceSearchTerm(e.target.value) : setPackageSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Hizmetler Tab Content */}
      {activeTab === 'hizmetler' && (
        <>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Hizmetler yükleniyor...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Services */}
              <ServiceSection
                title="Aktif Hizmetler"
                status="active"
                bgColor="bg-green-50"
                SERVER_URL={SERVER_URL}
                userId={userId}
                services={services}
                setServices={setServices}
                setSelectedService={setSelectedService}
                setEditServiceModal={setEditServiceModal}
                serviceSearchTerm={serviceSearchTerm}
                getCategoryDisplay={getCategoryDisplay}
                getChannelDisplay={getChannelDisplay}
                getPlatformDisplay={getPlatformDisplay}
                getDurationDisplay={getDurationDisplay}
                getStatusDisplay={getStatusDisplay}
                getStatusColor={getStatusColor}
                viewMode={viewMode}
                onDeleteService={handleDeleteServiceSync}
              />

              {/* Inactive Services */}
              <ServiceSection
                title="Pasif Hizmetler"
                status="inactive"
                bgColor="bg-gray-50"
                SERVER_URL={SERVER_URL}
                userId={userId}
                setServices={setServices}
                services={services}
                setSelectedService={setSelectedService}
                setEditServiceModal={setEditServiceModal}
                serviceSearchTerm={serviceSearchTerm}
                getCategoryDisplay={getCategoryDisplay}
                getChannelDisplay={getChannelDisplay}
                getPlatformDisplay={getPlatformDisplay}
                getDurationDisplay={getDurationDisplay}
                getStatusColor={getStatusColor}
                getStatusDisplay={getStatusDisplay}
                viewMode={viewMode}
                onDeleteService={handleDeleteServiceSync}
              />

              {/* On Hold Services */}
              <ServiceSection
                title="Beklemedeki Hizmetler"
                status="onhold"
                bgColor="bg-yellow-50"
                SERVER_URL={SERVER_URL}
                userId={userId}
                services={services}
                setServices={setServices}
                setSelectedService={setSelectedService}
                setEditServiceModal={setEditServiceModal}
                serviceSearchTerm={serviceSearchTerm}
                getCategoryDisplay={getCategoryDisplay}
                getChannelDisplay={getChannelDisplay}
                getPlatformDisplay={getPlatformDisplay}
                getDurationDisplay={getDurationDisplay}
                getStatusColor={getStatusColor}
                getStatusDisplay={getStatusDisplay}
                viewMode={viewMode}
                onDeleteService={handleDeleteServiceSync}
              />

              {/* Empty state if no services at all */}
              {services.length === 0 && (
                <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
                  <div className="text-gray-400 text-6xl mb-4">🛠️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz hizmet yok</h3>
                  <p className="text-gray-600 mb-4">İlk hizmetinizi oluşturmak için "+ Ekle" butonuna tıklayın.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Paketler Tab Content */}
      {activeTab === 'paketler' && (
        <>
          {loadingPurchases ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Satın Alınan Paketler</h3>
                <button
                  onClick={() => {
                    setShowPurchaseModal(true);
                    fetchCustomers();
                  }}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
                >
                  Add Purchase entry
                </button>
              </div>

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
                        Paket Kullanımı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {purchaseDetails && purchaseDetails.length > 0 ? (
                      purchaseDetails.map((purchase, index) => (
                        <tr key={`${purchase.order.id}-${index}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {purchase.customer.fullName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{purchase.customer.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{purchase.customer.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{purchase.packageTitle}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(purchase.purchaseDate).toLocaleDateString('tr-TR')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <span className="font-medium text-primary-600">{purchase.completedSessions}</span>
                              <span className="text-gray-500"> / {purchase.totalSessions}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${purchase.order.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {purchase.order.paymentStatus === 'paid' ? 'Ödendi' : 'Beklemede'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                          Henüz satın alınan paket bulunmamaktadır.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Package Templates */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Paket Şablonları</h3>
              <Link
                to="/dashboard/packages/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-primary-500"
              >
                <span className="mr-2">+</span>
                Yeni Paket Oluştur
              </Link>
            </div>

            {/* Active Packages */}
            <PackageSection
              title="Aktif Paketler"
              status="active"
              bgColor="bg-green-50"
              SERVER_URL={SERVER_URL}
              userId={userId}
              setPackages={setPackages}
              setSelectedPackage={setSelectedPackage}
              setEditPackageModal={setEditPackageModal}
              packages={packages}
              packageSearchTerm={packageSearchTerm}
              getCategoryDisplay={getPackageCategoryDisplay}
              getChannelDisplay={getChannelDisplay}
              getDurationDisplay={getDurationDisplay}
              getStatusColor={getStatusColor}
              getStatusDisplay={getStatusDisplay}
              viewMode={viewMode}
              onDeletePackage={handleDeletePackageSync}
            />

            {/* Inactive Packages */}
            <PackageSection
              title="Pasif Paketler"
              status="inactive"
              bgColor="bg-gray-50"
              SERVER_URL={SERVER_URL}
              userId={userId}
              setPackages={setPackages}
              setSelectedPackage={setSelectedPackage}
              setEditPackageModal={setEditPackageModal}
              packages={packages}
              packageSearchTerm={packageSearchTerm}
              getCategoryDisplay={getPackageCategoryDisplay}
              getChannelDisplay={getChannelDisplay}
              getDurationDisplay={getDurationDisplay}
              getStatusColor={getStatusColor}
              getStatusDisplay={getStatusDisplay}
              viewMode={viewMode}
              onDeletePackage={handleDeletePackageSync}
            />

            {/* On Hold Packages */}
            <PackageSection
              title="Beklemedeki Paketler"
              status="onhold"
              bgColor="bg-yellow-50"
              SERVER_URL={SERVER_URL}
              userId={userId}
              setPackages={setPackages}
              setSelectedPackage={setSelectedPackage}
              setEditPackageModal={setEditPackageModal}
              packages={packages}
              packageSearchTerm={packageSearchTerm}
              getCategoryDisplay={getPackageCategoryDisplay}
              getChannelDisplay={getChannelDisplay}
              getDurationDisplay={getDurationDisplay}
              getStatusColor={getStatusColor}
              getStatusDisplay={getStatusDisplay}
              viewMode={viewMode}
              onDeletePackage={handleDeletePackageSync}
            />

            {/* Empty state if no packages at all */}
            {packages.length === 0 && (
              <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
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

      {/* Keep all your existing modals and handlers below */}
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
                    onChange={(e) => setSelectedService({ ...selectedService, title: e.target.value })}
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
                    onChange={(e) => setSelectedService({ ...selectedService, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Hizmet hakkında detaylı bilgi verin..."
                  />
                  {/* Select color */}
                  <div className="mt-2 flex  gap-4 space-y-2">

                    {/* Bubble preview with icon */}
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Baloncuk Önizleme
                      </label>
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: selectedService.iconBg }}
                      >
                        <span className="text-white text-lg">{selectedService.icon}</span>
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
                        value={selectedService.iconBg || '#ffffff'}
                        onChange={(e) => handleColorSelect(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Hizmet İkonu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hizmet İkonu
                  </label>
                  <input
                    type="text"
                    value={selectedService.icon || ''}
                    onChange={(e) => setSelectedService({ ...selectedService, icon: e.target.value })}
                    placeholder="Hizmet ikonu için emoji girin, örn: 📅"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                      onChange={(e) => setSelectedService({ ...selectedService, category: e.target.value })}
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
                      onChange={(e) => setSelectedService({ ...selectedService, eventType: e.target.value })}
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
                  <div key="edit-meeting-type">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hizmet Türü *
                    </label>
                    <select
                      value={selectedService.meetingType || ''}
                      onChange={(e) => setSelectedService({ ...selectedService, meetingType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Hizmet türü seçin</option>
                      <option value="1-1">1-1 Özel</option>
                      <option value="grup">Grup</option>
                    </select>
                  </div>
                )}

                {/* Date and Time - Only visible for Grup events */}
                {selectedService.meetingType === 'grup' && (
                  <div key="edit-date-time" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tarih
                      </label>
                      <input
                        type="date"
                        value={selectedService.date || ''}
                        onChange={(e) => setSelectedService({ ...selectedService, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Başlangıç Saati
                      </label>
                      <input
                        type="time"
                        value={selectedService.time || ''}
                        onChange={(e) => setSelectedService({ ...selectedService, time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Platform and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Platform - Only visible for Online or Hibrit */}
                  {(selectedService.eventType === 'online' || selectedService.eventType === 'hybrid') && (
                    <div key="edit-platform">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform {selectedService.eventType !== 'hybrid' ? '*' : ''}
                      </label>
                      <select
                        value={selectedService.platform || ''}
                        onChange={(e) => setSelectedService({ ...selectedService, platform: e.target.value })}
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
                    <div key="edit-location">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konum {selectedService.eventType !== 'hybrid' ? '*' : ''}
                      </label>
                      <input
                        type="text"
                        value={selectedService.location || ''}
                        onChange={(e) => setSelectedService({ ...selectedService, location: e.target.value })}
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
                      value={selectedService.duration || ''}
                      onChange={(e) => setSelectedService({ ...selectedService, duration: e.target.value })}
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
                      value={selectedService.price || ''}
                      onChange={(e) => setSelectedService({ ...selectedService, price: e.target.value })}
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
                      value={selectedService.maxAttendees || ''}
                      onChange={(e) => setSelectedService({ ...selectedService, maxAttendees: e.target.value })}
                      placeholder="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durum
                  </label>
                  <select
                    value={selectedService.status || 'active'}
                    onChange={(e) => setSelectedService({ ...selectedService, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                    <option value="onhold">Beklemede</option>
                  </select>
                </div>

                {/* Offline Event Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isOfflineEvent"
                    checked={selectedService.isOfflineEvent || false}
                    onChange={(e) => setSelectedService({ ...selectedService, isOfflineEvent: e.target.checked })}
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

      {/* Edit Package Modal */}
      {editPackageModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Paketi Düzenle</h2>
              <button
                onClick={() => setEditPackageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              savePackageChanges(selectedPackage);
            }}>
              <div className="space-y-6">
                {/* Paket Başlığı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paket Adı *
                  </label>
                  <input
                    type="text"
                    value={selectedPackage.title}
                    onChange={(e) => setSelectedPackage({ ...selectedPackage, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Paket Açıklaması */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={selectedPackage.description}
                    onChange={(e) => setSelectedPackage({ ...selectedPackage, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Paket İkonu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paket İkonu
                  </label>
                  <input
                    type="text"
                    value={selectedPackage.icon || ''}
                    onChange={(e) => setSelectedPackage({ ...selectedPackage, icon: e.target.value })}
                    placeholder="Paket ikonu için emoji girin, örn: 📦"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                        style={{ backgroundColor: selectedPackage.iconBg }}
                      >
                        <span className="text-white text-lg">{selectedPackage.icon}</span>
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
                        value={selectedPackage.iconBg}
                        onChange={(e) => handleColorSelect(e.target.value)}
                      />
                    </div>
                  </div>

                </div>

                {/* Kategori and Etkinlik Kanalı */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori *
                    </label>
                    <select
                      value={selectedPackage.category}
                      onChange={(e) => setSelectedPackage({ ...selectedPackage, category: e.target.value })}
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
                      value={selectedPackage.eventType}
                      onChange={(e) => setSelectedPackage({ ...selectedPackage, eventType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="online">Online</option>
                      <option value="offline">Yüz Yüze</option>
                      <option value="hybrid">Hibrit</option>
                    </select>
                  </div>
                </div>

                {/* Etkinlik Türü - Only visible for Online or Hibrit */}
                {(selectedPackage.eventType === 'online' || selectedPackage.eventType === 'hybrid') && (
                  <div key="edit-package-meeting-type">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Etkinlik Türü *
                    </label>
                    <select
                      value={selectedPackage.meetingType || ''}
                      onChange={(e) => setSelectedPackage({ ...selectedPackage, meetingType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Etkinlik türü seçin</option>
                      <option value="1-1">1-1 Özel</option>
                      <option value="grup">Grup</option>
                    </select>
                  </div>
                )}

                {/* Date and Time - Only visible for Grup events */}
                {selectedPackage.meetingType === 'grup' && (
                  <div key="edit-package-date-time" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tarih
                      </label>
                      <input
                        type="date"
                        value={selectedPackage.date || ''}
                        onChange={(e) => setSelectedPackage({ ...selectedPackage, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Saat
                      </label>
                      <input
                        type="time"
                        value={selectedPackage.time || ''}
                        onChange={(e) => setSelectedPackage({ ...selectedPackage, time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Platform and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Platform - Only visible for Online or Hibrit */}
                  {(selectedPackage.eventType === 'online' || selectedPackage.eventType === 'hybrid') && (
                    <div key="edit-package-platform">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform {selectedPackage.eventType !== 'hybrid' ? '*' : ''}
                      </label>
                      <select
                        value={selectedPackage.platform || ''}
                        onChange={(e) => setSelectedPackage({ ...selectedPackage, platform: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required={selectedPackage.eventType === 'online'}
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
                  {(selectedPackage.eventType === 'offline' || selectedPackage.eventType === 'hybrid') && (
                    <div key="edit-package-location">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konum {selectedPackage.eventType !== 'hybrid' ? '*' : ''}
                      </label>
                      <input
                        type="text"
                        value={selectedPackage.location || ''}
                        onChange={(e) => setSelectedPackage({ ...selectedPackage, location: e.target.value })}
                        placeholder="Etkinlik konumu (adres)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required={selectedPackage.eventType === 'offline'}
                      />
                    </div>
                  )}
                </div>

                {/* Duration, Price, Appointment Count, Max Attendees */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Süre (dakika)
                    </label>
                    <input
                      type="number"
                      value={selectedPackage.duration || ''}
                      onChange={(e) => setSelectedPackage({ ...selectedPackage, duration: e.target.value })}
                      placeholder="60"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fiyat (₺)
                    </label>
                    <input
                      type="number"
                      value={selectedPackage.price || ''}
                      onChange={(e) => setSelectedPackage({ ...selectedPackage, price: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Randevu Adedi *
                    </label>
                    <input
                      type="number"
                      value={selectedPackage.appointmentCount || ''}
                      onChange={(e) => setSelectedPackage({ ...selectedPackage, appointmentCount: e.target.value })}
                      placeholder="1"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {selectedPackage.meetingType === 'grup' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Katılımcı
                      </label>
                      <input
                        type="number"
                        value={selectedPackage.maxAttendees || ''}
                        onChange={(e) => setSelectedPackage({ ...selectedPackage, maxAttendees: e.target.value })}
                        placeholder="10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durum
                  </label>
                  <select
                    value={selectedPackage.status || 'active'}
                    onChange={(e) => setSelectedPackage({ ...selectedPackage, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                    <option value="onhold">Beklemede</option>
                  </select>
                </div>

                {/* Offline Event Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isOfflineEventPackage"
                    checked={selectedPackage.isOfflineEvent || false}
                    onChange={(e) => setSelectedPackage({ ...selectedPackage, isOfflineEvent: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isOfflineEventPackage" className="ml-2 block text-sm text-gray-700">
                    Bu paket online sistem dışında gerçekleşti
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditPackageModal(false)}
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

      {/* Purchase Entry Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Satın Alma Kaydı Ekle</h2>
              <button
                onClick={() => {
                  setShowPurchaseModal(false);
                  setSelectedCustomerId('');
                  setSelectedPurchasePackageId('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePurchaseSubmit} className="space-y-4">
              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danışan Seçin *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Danışan seçin</option>
                  {availableCustomers.map((customer) => (
                    <option key={customer._id || customer.id} value={customer._id || customer.id}>
                      {customer.name} {customer.surname} ({customer.email})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(true)}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  + Yeni Danışan Ekle
                </button>
              </div>

              {/* Package Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paket Seçin *
                </label>
                <select
                  value={selectedPurchasePackageId}
                  onChange={(e) => setSelectedPurchasePackageId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Paket seçin</option>
                  {packages.filter(pkg => pkg.status === 'active').map((pkg) => (
                    <option key={pkg._id || pkg.id} value={pkg._id || pkg.id}>
                      {pkg.title} - ₺{pkg.price} ({pkg.appointmentCount || pkg.sessionsIncluded} randevu)
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setSelectedCustomerId('');
                    setSelectedPurchasePackageId('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <AddCustomerModal
          onClose={() => setShowAddCustomerModal(false)}
          onAdd={handleAddNewCustomer}
        />
      )}
    </div>
  );
}