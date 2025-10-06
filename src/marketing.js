import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import CreateCouponModal from "./createCouponModal";
import { CreateEmailModal } from "./createEmailModal";

// Marketing Component - Redesigned with Kupon Kodu and E-Posta Pazarlaması sections
export const Marketing = () => {
  const SERVER_URL = process.env.REACT_APP_BACKEND_URL;  
  const [activeTab, setActiveTab] = useState('kupon');
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null); // for edit
  const [emails, setEmails] = useState([
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
  ]);

  const [selectedEmail, setSelectedEmail] = useState(null);

  const userId = "68c94094d011cdb0e5fa2caa"; // adjust as needed



  const tabs = [
    { id: 'kupon', label: 'Kupon Kodu' },
    { id: 'email', label: 'E-Posta Pazarlaması' }
  ];

  // Fetch coupons for user
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${SERVER_URL}/api/expert/${userId}/coupons`);
      setCoupons(res.data || []);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      Swal.fire({ icon: 'error', title: 'Hata', text: 'Kuponlar yüklenemedi' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchEmails();
  }, []);

  // Fetch emails for user
  const fetchEmails = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/expert/${userId}/emails`);
      setEmails(res.data || []);
    } catch (err) {
      console.error('Error fetching emails:', err);
      Swal.fire({ icon: 'error', title: 'Hata', text: 'E-postalar yüklenemedi' });
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setSelectedCoupon(null);
    setShowCouponModal(true);
  };

  // Email modal flows
  const openCreateEmailModal = () => {
    setSelectedEmail(null);
    setShowEmailModal(true);
  };

  const openEditEmailModal = (email) => {
    setSelectedEmail(email);
    setShowEmailModal(true);
  };

  // Open edit modal
  const openEditModal = (coupon) => {
    setSelectedCoupon(coupon);
    setShowCouponModal(true);
  };

  // Save handler used by CreateCouponModal (handles create & update)
  const handleSaveCoupon = async (payload) => {
    try {
      if (selectedCoupon) {
        // update
        const res = await axios.put(`${SERVER_URL}/api/expert/${userId}/coupons/${selectedCoupon._id}`, payload);
        setCoupons((prev) => prev.map((c) => (c._id === res.data._id ? res.data : c)));
        Swal.fire({ icon: 'success', title: 'Güncellendi', text: 'Kupon başarıyla güncellendi.' });
      } else {
        // create
        const res = await axios.post(`${SERVER_URL}/api/expert/${userId}/coupons`, payload);
        setCoupons((prev) => [res.data, ...prev]);
        Swal.fire({ icon: 'success', title: 'Oluşturuldu', text: 'Kupon başarıyla oluşturuldu.' });
      }
      setShowCouponModal(false);
    } catch (err) {
      console.error('Coupon save error:', err);
      const msg = err.response?.data?.error || 'İşlem başarısız';
      Swal.fire({ icon: 'error', title: 'Hata', text: msg });
    }
  };

  // Delete coupon
  const deleteCoupon = async (coupon) => {
    const result = await Swal.fire({
      title: 'Emin misiniz?',
      text: `"${coupon.code}" kuponunu silmek istiyor musunuz?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, sil',
      cancelButtonText: 'İptal'
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${SERVER_URL}/api/expert/${userId}/coupons/${coupon._id}`);
        setCoupons((prev) => prev.filter((c) => c._id !== coupon._id));
        Swal.fire({ icon: 'success', title: 'Silindi', text: 'Kupon silindi.' });
      } catch (err) {
        console.error('Delete error:', err);
        Swal.fire({ icon: 'error', title: 'Hata', text: 'Silme işlemi başarısız.' });
      }
    }
  };

  // Save handler for Emails (create & update)
  const handleSaveEmail = async (payload, options = { sendNow: false }) => {
    try {
      if (selectedEmail) {
        const res = await axios.put(`${SERVER_URL}/api/expert/${userId}/emails/${selectedEmail._id}`, payload);
        const updated = res.data.email;
        setEmails((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
        // if parent asked to send now, call sendNow
        if (options.sendNow) {
          await axios.post(`${SERVER_URL}/api/expert/${userId}/emails/${updated._id}/send-now`);
        }
        Swal.fire({ icon: 'success', title: 'Güncellendi', text: 'E-posta başarıyla güncellendi.' });
      } else {
        const res = await axios.post(`${SERVER_URL}/api/expert/${userId}/emails`, payload);
        const created = res.data.email;
        setEmails((prev) => [created, ...prev]);
        if (options.sendNow) {
          await axios.post(`${SERVER_URL}/api/expert/${userId}/emails/${created._id}/send-now`);
        }
        Swal.fire({ icon: 'success', title: 'Oluşturuldu', text: 'E-posta başarıyla oluşturuldu.' });
      }
      setShowEmailModal(false);
    } catch (err) {
      console.error('Email save error:', err);
      const msg = err.response?.data?.error || 'İşlem başarısız';
      Swal.fire({ icon: 'error', title: 'Hata', text: msg });
    }
  };

  // send now
  const sendNow = async (email) => {
    try {
      const res = await axios.post(`${SERVER_URL}/api/expert/${userId}/emails/${email._id}/send-now`);
      setEmails((prev) => prev.map((e) => (e._id === res.data.email._id ? res.data.email : e)));
      Swal.fire({ icon: 'success', title: 'Gönderildi', text: 'E-posta gönderildi.' });
    } catch (err) {
      console.error('Send now error:', err);
      Swal.fire({ icon: 'error', title: 'Hata', text: 'Gönderilemedi.' });
    }
  };

  const resendFailed = async (email) => {
    try {
      const res = await axios.post(`${SERVER_URL}/api/expert/${userId}/emails/${email._id}/resend-failed`);
      setEmails((prev) => prev.map((e) => (e._id === res.data.email._id ? res.data.email : e)));
      Swal.fire({ icon: 'success', title: 'Tekrar denendi', text: 'Hatalı alıcılara tekrar gönderim denendi.' });
    } catch (err) {
      console.error('Resend failed error:', err);
      const msg = err.response?.data?.error || 'İşlem başarısız';
      Swal.fire({ icon: 'error', title: 'Hata', text: msg });
    }
  };

  const deleteEmail = async (email) => {
    const result = await Swal.fire({
      title: 'Emin misiniz?',
      text: `"${email.subject}" e-postasını silmek istiyor musunuz?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, sil',
      cancelButtonText: 'İptal'
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${SERVER_URL}/api/expert/${userId}/emails/${email._id}`);
        setEmails((prev) => prev.filter((e) => e._id !== email._id));
        Swal.fire({ icon: 'success', title: 'Silindi', text: 'E-posta silindi.' });
      } catch (err) {
        console.error('Delete email error:', err);
        Swal.fire({ icon: 'error', title: 'Hata', text: 'Silme işlemi başarısız.' });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pazarlama</h1>
        <div className="flex space-x-3">
          {activeTab === 'kupon' && (
            <button
              onClick={openCreateModal}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              + Kupon Oluştur
            </button>
          )}
          {activeTab === 'email' && (
            <button
              onClick={openCreateEmailModal}
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
                className={`py-4 px-6 border-b-2 font-medium text-sm ${activeTab === tab.id
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
                  {loading ? (
                    <tr><td className="px-6 py-4" colSpan={7}>Yükleniyor...</td></tr>
                  ) : coupons.length === 0 ? (
                    <tr><td className="px-6 py-4" colSpan={7}>Kupon bulunamadı.</td></tr>
                  ) : coupons.map((coupon) => (
                    <tr key={coupon._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${coupon.type === 'percentage'
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
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${coupon.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {coupon.status === 'active' ? 'Aktif' : 'Süresi Doldu'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => openEditModal(coupon)} className="text-blue-500 hover:text-blue-700">✏️</button>
                          <button onClick={() => deleteCoupon(coupon)} className="text-red-500 hover:text-red-700">🗑️</button>
                        </div>
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
                  {emails.length === 0 ? (
                    <tr><td className="px-6 py-4" colSpan={5}>E-posta bulunamadı.</td></tr>
                  ) : (
                    emails.map((email) => (
                      <tr key={email._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{email.subject}</div>
                          <div className="text-xs text-gray-500">Durum: {email.status} {email.sentCount ? `• Gönderildi: ${email.sentCount}` : ''} {email.failedCount ? `• Başarısız: ${email.failedCount}` : ''}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {email.body}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {email.scheduledAt ? (
                            (() => {
                              const d = new Date(email.scheduledAt);
                              const datePart = d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
                              const time24 = d.toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                              const time12 = d.toLocaleTimeString(undefined, { hour12: true, hour: 'numeric', minute: '2-digit' });
                              return `${datePart}, ${time24} (${time12})`;
                            })()
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{email.recipientType === 'all' ? 'Tüm Müşteriler' : `${email.recipients?.length || 0} kişi`}</div>
                          {email.failedRecipients && email.failedRecipients.length > 0 && (
                            <div className="text-sm text-red-500">Hatalı: {email.failedRecipients.length} kişi</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button onClick={() => openEditEmailModal(email)} className="text-blue-500 hover:text-blue-700">✏️</button>
                            <button onClick={() => { if (confirm('Hemen gönderilsin mi?')) sendNow(email); }} className="text-green-600 hover:text-green-800">📤</button>
                            <button onClick={() => { if (confirm('Hatalı alıcılara tekrar gönderilsin mi?')) resendFailed(email); }} className="text-yellow-600 hover:text-yellow-800">🔁</button>
                            <button onClick={() => deleteEmail(email)} className="text-red-500 hover:text-red-700">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      <CreateCouponModal
        isOpen={showCouponModal}
        onClose={() => setShowCouponModal(false)}
        onSave={handleSaveCoupon}
        initialData={selectedCoupon}
      />

      {/* Create Email Modal */}
      {showEmailModal && (
        <CreateEmailModal
          onClose={() => setShowEmailModal(false)}
          onSave={handleSaveEmail}
          initialData={selectedEmail}
        />
      )}
    </div>
  );
};
