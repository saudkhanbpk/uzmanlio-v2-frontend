import { useState } from "react";
import { AddCustomerModal } from "./AddCustomerModal";
import NotesModal from "../notesModal";

// Customers Component
export default function Customers(){
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadTooltip, setShowUploadTooltip] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const customers = [
    {
      id: 1,
      name: 'Ayşe Demir',
      email: 'ayse.demir@email.com',
      phone: '+90 532 123 4567',
      lastAppointment: '2024-06-20',
      lastAppointmentTime: '14:00'
    },
    {
      id: 2,
      name: 'Mehmet Kaya',
      email: 'mehmet.kaya@email.com',
      phone: '+90 533 987 6543',
      lastAppointment: '2024-06-18',
      lastAppointmentTime: '16:30'
    },
    {
      id: 3,
      name: 'Fatma Özkan',
      email: 'fatma.ozkan@email.com',
      phone: '+90 534 456 7890',
      lastAppointment: '2024-06-15',
      lastAppointmentTime: '10:00'
    }
  ];

  const formatDateWithDay = (dateStr, time) => {
    const date = new Date(dateStr);
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const dayName = days[date.getDay()];
    const formattedDate = date.toLocaleDateString('tr-TR');
    return `${formattedDate} ${dayName} ${time}`;
  };

  const handleDownloadList = () => {
    // Generate CSV content
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Ad,Soyad,E-posta,Telefon,Son Randevu,Saat\n"
      + customers.map(customer => {
          const [name, surname] = customer.name.split(' ');
          return `${name},${surname || ''},${customer.email},${customer.phone},${customer.lastAppointment},${customer.lastAppointmentTime}`;
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "danisanlar_listesi.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      console.log('CSV dosyası yüklendi:', file.name);
      // Here you would process the CSV file
      alert('CSV dosyası başarıyla yüklendi!');
    } else {
      alert('Lütfen geçerli bir CSV dosyası seçin.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Danışanlar</h1>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Danışan</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Danışan Listesi</h3>
        </div>
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
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.email}</div>
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDateWithDay(customer.lastAppointment, customer.lastAppointmentTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowNotesModal(true);
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                    >
                      📝 Notları Göster
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <AddCustomerModal onClose={() => setShowAddModal(false)} />
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
