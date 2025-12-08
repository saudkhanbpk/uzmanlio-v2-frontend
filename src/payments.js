import { useState, useEffect } from "react";
import { fetchEarningsStats, fetchMonthlyRevenue, fetchPaymentOrders } from "./services/paymentService";

// Payments Component
export default function Payments() {
  const [showTransferTooltip, setShowTransferTooltip] = useState({});
  const [showRefundTooltip, setShowRefundTooltip] = useState({});

  // State for real data
  const [stats, setStats] = useState({
    totalRevenue: 0,
    completedCount: 0,
    pendingCount: 0,
    refundedCount: 0
  });
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get userId from localStorage
  const userId = localStorage.getItem('userId');

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError('User ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch all data in parallel
        const [statsResponse, monthlyResponse, ordersResponse] = await Promise.all([
          fetchEarningsStats(userId),
          fetchMonthlyRevenue(userId),
          fetchPaymentOrders(userId)
        ]);

        // Update state with fetched data
        if (statsResponse.success) {
          setStats(statsResponse.data);
        }

        if (monthlyResponse.success) {
          setMonthlyEarnings(monthlyResponse.data);
        }

        if (ordersResponse.success) {
          setPayments(ordersResponse.data);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching payment data:', err);
        setError('Failed to load payment data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Calculate max earnings, ensuring we handle the case where all earnings are 0
  const maxEarnings = monthlyEarnings.length > 0
    ? Math.max(...monthlyEarnings.map(item => item.earnings), 1)
    : 1;

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { text: 'Tamamlandı', color: 'bg-green-100 text-green-800' },
      paid: { text: 'Tamamlandı', color: 'bg-green-100 text-green-800' },
      pending: { text: 'Bekleyen', color: 'bg-yellow-100 text-yellow-800' },
      refunded: { text: 'İade Edildi', color: 'bg-red-100 text-red-800' },
      returned: { text: 'İade Edildi', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const handleApprove = (paymentId) => {
    console.log('Payment approved:', paymentId);
    // Here you would update the payment status in your backend
  };

  const handleRefund = (paymentId) => {
    console.log('Payment refunded:', paymentId);
    // Here you would process the refund in your backend
  };

  const showTransferTooltipHandler = (id) => {
    setShowTransferTooltip(prev => ({ ...prev, [id]: true }));
  };

  const hideTransferTooltipHandler = (id) => {
    setShowTransferTooltip(prev => ({ ...prev, [id]: false }));
  };

  const showRefundTooltipHandler = (id) => {
    setShowRefundTooltip(prev => ({ ...prev, [id]: true }));
  };

  const hideRefundTooltipHandler = (id) => {
    setShowRefundTooltip(prev => ({ ...prev, [id]: false }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Ödemeler</h1>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
          Rapor İndir
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
              <p className="text-2xl font-bold text-gray-900">₺{stats.totalRevenue.toLocaleString('tr-TR')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bekleyen</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <span className="text-2xl">↩️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">İade Edildi</p>
              <p className="text-2xl font-bold text-gray-900">{stats.refundedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Earnings Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Aylık Kazançlar</h3>
        <div className="space-y-4">
          {monthlyEarnings.map((item, index) => {
            // Calculate width percentage - if earnings is 0, width should be 0%
            const widthPercentage = item.earnings > 0 && maxEarnings > 0
              ? (item.earnings / maxEarnings) * 100
              : 0;

            return (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-16 text-sm font-medium text-gray-700">
                  {item.month}
                </div>
                <div className="flex-1 relative">
                  <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                    {item.earnings > 0 ? (
                      <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                        style={{ width: `${widthPercentage}%` }}
                      >
                        <span className="text-white text-sm font-medium">
                          ₺{item.earnings.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    ) : (
                      <div className="h-8 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">₺0</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Son Ödemeler</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hizmet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ödeme Yöntemi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kaynak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ödeme Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.customerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.service}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₺{payment.amount.toLocaleString('tr-TR')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.method || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {payment.orderSource === 'BookingPage' ? 'Rezervasyon Sayfası' : 'Manuel Kayıt'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(payment.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(payment.paymentDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {payment.status === 'pending' && (
                          <>
                            {/* Approve Button with Tooltip */}
                            <div className="relative">
                              <button
                                onClick={() => handleApprove(payment.id)}
                                onMouseEnter={() => showTransferTooltipHandler(payment.id)}
                                onMouseLeave={() => hideTransferTooltipHandler(payment.id)}
                                className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                              >
                                ✓
                              </button>
                              {showTransferTooltip[payment.id] && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
                                  Hesaba Transfer Et
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-800"></div>
                                </div>
                              )}
                            </div>

                            {/* Refund Button with Tooltip */}
                            <div className="relative">
                              <button
                                onClick={() => handleRefund(payment.id)}
                                onMouseEnter={() => showRefundTooltipHandler(payment.id)}
                                onMouseLeave={() => hideRefundTooltipHandler(payment.id)}
                                className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                              >
                                ✗
                              </button>
                              {showRefundTooltip[payment.id] && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
                                  İade Et
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-800"></div>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                        {(payment.status === 'completed' || payment.status === 'paid') && (
                          <span className="text-sm text-green-600 font-medium">Tamamlandı</span>
                        )}
                        {(payment.status === 'refunded' || payment.status === 'returned') && (
                          <span className="text-sm text-red-600 font-medium">İade Edildi</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    Henüz ödeme kaydı bulunmamaktadır.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};