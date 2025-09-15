import { useState } from "react";

// Marketing Component - Redesigned with Kupon Kodu and E-Posta Pazarlaması sections
export const Marketing = () => {
  const [activeTab, setActiveTab] = useState('kupon');
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Mock coupon data
  const coupons = [
    {
      id: 1,
      code: 'YENI2024',
      type: 'percentage',
      value: 20,
      usageCount: 45,
      maxUsage: 100,
      expiryDate: '2024-12-31',
      status: 'active'
    },
    {
      id: 2,
      code: 'INDIRIM50',
      type: 'amount',
      value: 50,
      usageCount: 23,
      maxUsage: 50,
      expiryDate: '2024-11-30',
      status: 'active'
    },
    {
      id: 3,
      code: 'YAZINDIRIMI',
      type: 'percentage',
      value: 15,
      usageCount: 89,
      maxUsage: 200,
      expiryDate: '2024-09-30',
      status: 'expired'
    }
  ];

  // Mock email marketing data
  const emails = [
    {
      id: 1,
      title: 'Yeni Kurs Duyurusu - React Bootcamp',
      text: 'Yepyeni React Bootcamp kursumuz açıldı! İlk 50 kişiye özel indirim.',
      sendDate: '2024-07-25',
      recipientCount: 1247,
      recipients: 'Tüm Müşteriler'
    },
    {
      id: 2,
      title: 'Yazlık İndirim Kampanyası',
      text: 'Yaz aylarında tüm kurslarımızda %25 indirim fırsatı kaçmaz!',
      sendDate: '2024-07-20',
      recipientCount: 856,
      recipients: 'Aktif Kullanıcılar'
    },
    {
      id: 3,
      title: 'Aylık Bülten - Temmuz 2024',
      text: 'Bu ay gerçekleşen etkinlikler ve yeni içeriklerimiz hakkında...',
      sendDate: '2024-07-15',
      recipientCount: 2103,
      recipients: 'Tüm Müşteriler'
    }
  ];

  const tabs = [
    { id: 'kupon', label: 'Kupon Kodu' },
    { id: 'email', label: 'E-Posta Pazarlaması' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pazarlama</h1>
        <div className="flex space-x-3">
          {activeTab === 'kupon' && (
            <button 
              onClick={() => setShowCouponModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              + Kupon Oluştur
            </button>
          )}
          {activeTab === 'email' && (
            <button 
              onClick={() => setShowEmailModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              + E-Posta Oluştur
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Kupon Kodu Tab Content */}
        {activeTab === 'kupon' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kupon Kodu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tip
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Değer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kullanım
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Son Kullanma
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          coupon.type === 'percentage' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {coupon.type === 'percentage' ? 'Yüzde' : 'TL'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {coupon.type === 'percentage' ? `%${coupon.value}` : `${coupon.value} TL`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {coupon.usageCount} / {coupon.maxUsage}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {coupon.expiryDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          coupon.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {coupon.status === 'active' ? 'Aktif' : 'Süresi Doldu'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-600">⚙️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* E-Posta Pazarlaması Tab Content */}
        {activeTab === 'email' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Başlık
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gönderim Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gönderilen Kullanıcı
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emails.map((email) => (
                    <tr key={email.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{email.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {email.text}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {email.sendDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{email.recipients}</div>
                        <div className="text-sm text-gray-500">{email.recipientCount.toLocaleString()} kişi</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-600">⚙️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {showCouponModal && (
        <CreateCouponModal 
          onClose={() => setShowCouponModal(false)}
        />
      )}

      {/* Create Email Modal */}
      {showEmailModal && (
        <CreateEmailModal 
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
};
