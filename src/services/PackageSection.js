import React from 'react';
import Swal from 'sweetalert2';
import { authFetch } from './authFetch';

const PackageSection = ({ title, status, bgColor, SERVER_URL, userId, setPackages, setSelectedPackage, setEditPackageModal, packages, packageSearchTerm, getCategoryDisplay, getChannelDisplay, getDurationDisplay, getStatusColor, getStatusDisplay, viewMode }) => {
  // Check if we're in institution view (view-only mode for sub-user data)
  const isInstitutionView = viewMode === 'institution';

  // Handle edit package
  const handleEditPackage = (packageItem) => {
    // Don't allow editing in institution view for other users' packages
    if (isInstitutionView && packageItem.isViewOnly) return;

    setSelectedPackage({ ...packageItem });
    setEditPackageModal(true);
  };

  // Handle delete package
  const handleDeletePackage = async (packageItem) => {
    // Don't allow deleting in institution view for other users' packages
    if (isInstitutionView && packageItem.isViewOnly) return;

    const result = await Swal.fire({
      title: 'Paketi Sil',
      html: `<strong>"${packageItem.title}"</strong> paketini silmek istediğinizden emin misiniz?<br/>Bu işlem geri alınamaz.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Evet, Sil',
      cancelButtonText: 'İptal'
    });

    if (result.isConfirmed) {
      try {
        await authFetch(`${SERVER_URL}/api/expert/${userId}/packages/${packageItem.id}`, {
          method: 'DELETE'
        });

        // Update local state
        setPackages(packages.filter(p => p.id !== packageItem.id));

        Swal.fire({
          icon: 'success',
          title: 'Başarılı!',
          text: 'Paket başarıyla silindi.',
          showConfirmButton: false,
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Hata!',
          text: 'Paket silinirken bir hata oluştu.',
        });
      }
    }
  };
  const filteredPackages = packages.filter(pkg =>
    pkg.status === status &&
    (pkg.title.toLowerCase().includes(packageSearchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(packageSearchTerm.toLowerCase()))
  );

  if (filteredPackages.length === 0) return null;

  return (
    <div className={`${bgColor} rounded-xl p-6 border border-gray-200`}>
      <h3 className="text-lg font-medium text-gray-900 mb-6">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map(packageItem => (
          <div key={packageItem.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-300 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div style={{ backgroundColor: packageItem.iconBg }} className={`p-3 rounded-full ${packageItem.iconBg}`}>
                <span className="text-2xl">{packageItem.icon || '📦'}</span>
              </div>
              {/* Only show edit/delete buttons if NOT in institution view */}
              {!isInstitutionView && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditPackage(packageItem)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Düzenle"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeletePackage(packageItem)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Sil"
                  >
                    🗑️
                  </button>
                </div>
              )}
              {/* Show view-only badge for sub-user packages in institution view */}
              {isInstitutionView && packageItem.isViewOnly && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  Sadece Görüntüle
                </span>
              )}
            </div>

            {/* Show expert name in institution view */}
            {isInstitutionView && packageItem.expertName && (
              <div className="mb-2">
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                  👤 {packageItem.expertName}
                </span>
              </div>
            )}

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

              {/* Süre */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Süre:</span>
                <span className="text-sm font-medium text-gray-900">{getDurationDisplay(packageItem.duration)}</span>
              </div>

              {/* Randevu Adedi */}
              {packageItem.appointmentCount && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Randevu Adedi:</span>
                  <span className="text-sm font-medium text-primary-600">{packageItem.appointmentCount} seans</span>
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
                <span className={`px-2 py-1 ${getStatusColor(packageItem.status)} text-xs font-medium rounded-full`}>
                  {getStatusDisplay(packageItem.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default PackageSection;