
import axios from 'axios';
import Swal from 'sweetalert2';
const ServiceSection = ({ SERVER_URL, userId, title, status, bgColor, services, setServices, setEditServiceModal, setSelectedService, serviceSearchTerm, getCategoryDisplay
  , getChannelDisplay,
  getPlatformDisplay,
  getDurationDisplay,
  getStatusDisplay,
  getStatusColor,
  viewMode  // New prop for view mode
}) => {
  // Check if we're in institution view (view-only mode for sub-user data)
  const isInstitutionView = viewMode === 'institution';

  const handleEditService = (service) => {
    // Don't allow editing in institution view for other users' services
    if (isInstitutionView && service.isViewOnly) return;

    setSelectedService({
      ...service,
      iconBg: service.iconBg || '',
      icon: service.icon || ''
    });
    setEditServiceModal(true);
  };

  const handleDeleteService = async (service) => {
    // Don't allow deleting in institution view for other users' services
    if (isInstitutionView && service.isViewOnly) return;

    const result = await Swal.fire({
      title: 'Hizmeti Sil',
      html: `<strong>"${service.title}"</strong> hizmetini silmek istediğinizden emin misiniz?<br/>Bu işlem geri alınamaz.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Evet, Sil',
      cancelButtonText: 'İptal'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${SERVER_URL}/api/expert/${userId}/services/${service.id}`);

        // Update local state
        setServices(services.filter(s => s.id !== service.id));

        Swal.fire({
          icon: 'success',
          title: 'Başarılı!',
          text: 'Hizmet başarıyla silindi.',
          showConfirmButton: false,
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Hata!',
          text: 'Hizmet silinirken bir hata oluştu.',
        });
      }
    }
  };
  const filteredServices = Array.isArray(services)
    ? services.filter(service =>
      service.status === status &&
      service.title?.toLowerCase().includes(serviceSearchTerm.toLowerCase()) &&
      service.description?.toLowerCase().includes(serviceSearchTerm.toLowerCase())
    )
    : [];

  // console.log('Filtered Services:', filteredServices);
  if (filteredServices.length === 0) return null;

  return (
    <div className={`${bgColor} rounded-xl p-6 border border-gray-200`}>
      <h3 className="text-lg font-medium text-gray-900 mb-6">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map(service => (
          <div key={service.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-300 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div style={{ backgroundColor: service.iconBg }} className={`p-3 rounded-full`}>
                <span className="text-2xl">{service.icon || 'n/a'}</span>
              </div>
              {/* Only show edit/delete buttons if NOT in institution view */}
              {!isInstitutionView && (
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
              )}
              {/* Show view-only badge for sub-user services in institution view */}
              {isInstitutionView && service.isViewOnly && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  Sadece Görüntüle
                </span>
              )}
            </div>

            {/* Show expert name in institution view */}
            {isInstitutionView && service.expertName && (
              <div className="mb-2">
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                  👤 {service.expertName}
                </span>
              </div>
            )}

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
                <span className="text-sm font-medium text-gray-900">{getDurationDisplay(service.duration)}</span>
              </div>

              {/* Fiyat */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Fiyat:</span>
                <span className="text-lg font-bold text-primary-600">₺{service.price}</span>
              </div>

              {/* Durum */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Durum:</span>
                <span className={`px-2 py-1 ${getStatusColor(service.status)} text-xs font-medium rounded-full`}>
                  {getStatusDisplay(service.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default ServiceSection;