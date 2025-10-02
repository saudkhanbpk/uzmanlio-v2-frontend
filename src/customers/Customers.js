import { useState, useEffect } from "react";
import { AddCustomerModal } from "./AddCustomerModal";
import NotesModal from "../notesModal";
import { customerService } from "../services/customerService";

// Customers Component
export default function Customers(){
  const [customers, setCustomers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadTooltip, setShowUploadTooltip] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState(null);

  const userId = '68c94094d011cdb0e5fa2caa'; // Mock user ID for development

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
    loadStats();
  }, []);

  const loadCustomers = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const filterParams = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
        ...filters
      };

      const customersData = await customerService.getCustomers(userId, filterParams);
      setCustomers(customersData);
    } catch (err) {
      setError('Danışanlar yüklenirken bir hata oluştu.');
      console.error('Error loading customers:', err);
      // Fallback to mock data
      setCustomers([
        {
          id: 1,
          name: 'Ayşe',
          surname: 'Demir',
          email: 'ayse.demir@email.com',
          phone: '+90 532 123 4567',
          lastAppointment: '2024-06-20',
          lastAppointmentTime: '14:00',
          status: 'active',
          totalAppointments: 5,
          completedAppointments: 4,
          totalSpent: 1200
        },
        {
          id: 2,
          name: 'Mehmet',
          surname: 'Kaya',
          email: 'mehmet.kaya@email.com',
          phone: '+90 533 987 6543',
          lastAppointment: '2024-06-18',
          lastAppointmentTime: '16:30',
          status: 'active',
          totalAppointments: 3,
          completedAppointments: 3,
          totalSpent: 800
        },
        {
          id: 3,
          name: 'Fatma',
          surname: 'Özkan',
          email: 'fatma.ozkan@email.com',
          phone: '+90 534 456 7890',
          lastAppointment: '2024-06-15',
          lastAppointmentTime: '10:00',
          status: 'active',
          totalAppointments: 2,
          completedAppointments: 1,
          totalSpent: 400
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await customerService.getCustomerStats(userId);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading customer stats:', err);
      // Fallback stats
      setStats({
        total: 0,
        active: 0,
        inactive: 0,
        totalRevenue: 0,
        newCustomersThisMonth: 0
      });
    }
  };

  const addCustomer = async (customerData) => {
    try {
      const formattedData = customerService.formatCustomerData(customerData);
      await customerService.createCustomer(userId, formattedData);
      await loadCustomers(); // Reload customers to reflect changes
      await loadStats(); // Reload stats
      setShowAddModal(false);
    } catch (err) {
      alert(err.message || 'Danışan eklenirken bir hata oluştu.');
      console.error('Error adding customer:', err);
    }
  };

  const deleteCustomer = async (customerId) => {
    if (window.confirm('Bu danışanı silmek istediğinizden emin misiniz?')) {
      try {
        await customerService.deleteCustomer(userId, customerId);
        await loadCustomers(); // Reload customers to reflect changes
        await loadStats(); // Reload stats
      } catch (err) {
        alert('Danışan silinirken bir hata oluştu.');
        console.error('Error deleting customer:', err);
      }
    }
  };

  const updateCustomerStatus = async (customerId, status) => {
    try {
      await customerService.updateCustomerStatus(userId, customerId, status);
      await loadCustomers(); // Reload customers to reflect changes
    } catch (err) {
      alert('Danışan durumu güncellenirken bir hata oluştu.');
      console.error('Error updating customer status:', err);
    }
  };

  const formatDateWithDay = (dateStr, time) => {
    if (!dateStr) return 'Henüz randevu yok';
    const date = new Date(dateStr);
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const dayName = days[date.getDay()];
    const formattedDate = date.toLocaleDateString('tr-TR');
    return `${formattedDate} ${dayName} ${time || ''}`;
  };

  const handleDownloadList = async () => {
    try {
      const exportData = await customerService.exportCustomers(userId);
      const csvContent = customerService.generateCSVContent(exportData);

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "danisanlar_listesi.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading customer list:', err);
      alert('Liste indirilirken bir hata oluştu.');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      try {
        const text = await file.text();
        const customersData = customerService.parseCSVData(text);

        if (customersData.length === 0) {
          alert('CSV dosyası boş veya geçersiz format.');
          return;
        }

        const result = await customerService.bulkImportCustomers(userId, customersData);
        alert(`Toplu içe aktarma tamamlandı. ${result.results.success} danışan eklendi, ${result.results.failed} başarısız.`);

        if (result.results.errors.length > 0) {
          console.log('Import errors:', result.results.errors);
        }

        await loadCustomers(); // Reload customers
        await loadStats(); // Reload stats
      } catch (err) {
        console.error('Error uploading file:', err);
        alert('Dosya yüklenirken bir hata oluştu.');
      }
    } else {
      alert('Lütfen geçerli bir CSV dosyası seçin.');
    }

    // Reset file input
    event.target.value = '';
  };

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    loadCustomers({ search: searchValue });
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    loadCustomers({ status });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danışanlar</h1>
          <p className="text-gray-600 mt-1">Danışanlarınızı yönetin ve iletişim bilgilerini takip edin</p>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Danışan ara..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
            <option value="prospect">Potansiyel</option>
            <option value="blocked">Engelli</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          {/* Download Button */} 
          <button
            onClick={handleDownloadList}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📥 İndir
          </button>
          
          {/* Bulk Upload Button with Info Icon Inside */}
          <div className="relative">
            <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center space-x-2">
              <span>📤 Toplu Yükle</span>
              <button
                type="button"
                onMouseEnter={() => setShowUploadTooltip(true)}
                onMouseLeave={() => setShowUploadTooltip(false)}
                className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold hover:bg-blue-200 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                i
              </button>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {showUploadTooltip && (
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg z-10 max-w-xs">
                <div className="whitespace-normal">
                  Danışan listesini indirerek aynı formatta doldurduktan sonra toplu şekilde listenizi güncelleyebilirsiniz.
                </div>
                <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
          
          {/* Add Customer Button */}
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            + Danışan Ekle
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Danışanlar yükleniyor...</p>
        </div>
      )}

      {/* Error State */}
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
              <div className="mt-4">
                <button
                  onClick={loadCustomers}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Tekrar Dene
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Danışan</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total || customers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif Danışan</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.active || customers.filter(c => c.status === 'active').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
                <p className="text-2xl font-bold text-gray-900">₺{stats?.totalRevenue?.toLocaleString('tr-TR') || '0'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bu Ay Yeni</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.newCustomersThisMonth || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customers Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Danışan Listesi</h3>
            <p className="text-sm text-gray-600 mt-1">{customers.length} danışan bulundu</p>
          </div>

          {customers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz danışan yok</h3>
              <p className="text-gray-600 mb-4">
                İlk danışanınızı eklemek için "Danışan Ekle" butonuna tıklayın.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                + Danışan Ekle
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Danışan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İletişim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Randevu Bilgileri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Son Randevu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-medium">
                              {(customer.name?.[0] || '') + (customer.surname?.[0] || '')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name} {customer.surname}
                            </div>
                            {customer.category && (
                              <div className="text-xs text-gray-500">{customer.category}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.email}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.status === 'active' ? 'bg-green-100 text-green-800' :
                          customer.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          customer.status === 'prospect' ? 'bg-yellow-100 text-yellow-800' :
                          customer.status === 'blocked' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.status === 'active' ? 'Aktif' :
                           customer.status === 'inactive' ? 'Pasif' :
                           customer.status === 'prospect' ? 'Potansiyel' :
                           customer.status === 'blocked' ? 'Engelli' : 'Bilinmiyor'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Toplam: {customer.totalAppointments || 0}
                        </div>
                        <div className="text-sm text-gray-500">
                          Tamamlanan: {customer.completedAppointments || 0}
                        </div>
                        {customer.totalSpent > 0 && (
                          <div className="text-sm text-green-600">
                            ₺{customer.totalSpent.toLocaleString('tr-TR')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDateWithDay(customer.lastAppointment, customer.lastAppointmentTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowNotesModal(true);
                            }}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                            title="Notları Göster"
                          >
                            📝
                          </button>
                          <button
                            onClick={() => deleteCustomer(customer.id)}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
                            title="Danışanı Sil"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <AddCustomerModal
          onClose={() => setShowAddModal(false)}
          onAdd={addCustomer}
        />
      )}

      {/* Notes Modal */}
      {showNotesModal && selectedCustomer && (
        <NotesModal
          customer={selectedCustomer}
          onClose={() => {
            setShowNotesModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
};
