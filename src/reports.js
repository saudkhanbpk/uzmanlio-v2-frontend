import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { fetchReportsSummary, fetchAnalyticsData, fetchTopServices } from "./services/reportsService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Reports Component
export default function Reports() {
  const [timePeriod, setTimePeriod] = useState('monthly');
  const [selectedParameter, setSelectedParameter] = useState('gelir');

  // State for real data
  const [summary, setSummary] = useState({
    totalIncome: 0,
    numberOfAppointments: 0,
    numberOfCustomers: 0,
    numberOfVisits: 0
  });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [topServices, setTopServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get userId from localStorage
  const userId = localStorage.getItem('userId');

  // Fetch data on component mount and when time period changes
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
        const [summaryResponse, analyticsResponse, servicesResponse] = await Promise.all([
          fetchReportsSummary(userId),
          fetchAnalyticsData(userId, timePeriod),
          fetchTopServices(userId, 3)
        ]);

        // Update state with fetched data
        if (summaryResponse.success) {
          setSummary(summaryResponse.data);
        }

        if (analyticsResponse.success) {
          setAnalyticsData(analyticsResponse.data);
        }

        if (servicesResponse.success) {
          setTopServices(servicesResponse.data);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching reports data:', err);
        setError('Failed to load reports data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, timePeriod]);

  const parameterLabels = {
    gelir: 'Gelir',
    randevu_sayisi: 'Randevu Sayısı',
    musteri_sayisi: 'Müşteri Sayısı',
    ziyaret_sayisi: 'Ziyaret Sayısı'
  };

  const parameterUnits = {
    gelir: '₺',
    randevu_sayisi: 'adet',
    musteri_sayisi: 'kişi',
    ziyaret_sayisi: 'ziyaret'
  };

  // Get current data for selected parameter
  const getCurrentData = () => {
    if (!analyticsData || !analyticsData.data) {
      return {
        labels: [],
        data: [],
        color: 'rgb(34, 197, 94)',
        bgColor: 'rgba(34, 197, 94, 0.1)'
      };
    }

    const colors = {
      gelir: { color: 'rgb(34, 197, 94)', bgColor: 'rgba(34, 197, 94, 0.1)' },
      randevu_sayisi: { color: 'rgb(59, 130, 246)', bgColor: 'rgba(59, 130, 246, 0.1)' },
      musteri_sayisi: { color: 'rgb(168, 85, 247)', bgColor: 'rgba(168, 85, 247, 0.1)' },
      ziyaret_sayisi: { color: 'rgb(239, 68, 68)', bgColor: 'rgba(239, 68, 68, 0.1)' }
    };

    return {
      labels: analyticsData.labels,
      data: analyticsData.data[selectedParameter] || [],
      ...colors[selectedParameter]
    };
  };

  const currentData = getCurrentData();

  const chartData = {
    labels: currentData.labels,
    datasets: [
      {
        label: parameterLabels[selectedParameter],
        data: currentData.data,
        borderColor: currentData.color,
        backgroundColor: currentData.bgColor,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: currentData.color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            weight: '500'
          }
        }
      },
      title: {
        display: true,
        text: `${parameterLabels[selectedParameter]} - ${timePeriod === 'daily' ? 'Günlük' :
            timePeriod === 'weekly' ? 'Haftalık' : 'Aylık'
          } Analiz`,
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: 20
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: currentData.color,
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function (context) {
            return `${parameterLabels[selectedParameter]}: ${context.parsed.y} ${parameterUnits[selectedParameter]}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12,
            weight: '500'
          },
          color: '#6B7280'
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 12
          },
          color: '#6B7280',
          callback: function (value) {
            if (selectedParameter === 'gelir') {
              return value >= 1000 ? (value / 1000) + 'K ₺' : value + ' ₺';
            }
            return value + ' ' + parameterUnits[selectedParameter];
          }
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      point: {
        hoverRadius: 8
      }
    }
  };

  // Calculate summary statistics
  const calculateStats = () => {
    const data = currentData.data;
    if (!data || data.length === 0) {
      return { total: 0, average: 0, max: 0, min: 0, growth: 0 };
    }

    const total = data.reduce((sum, value) => sum + value, 0);
    const average = Math.round(total / data.length);
    const max = Math.max(...data);
    const min = Math.min(...data);
    const growth = data.length > 1 ? ((data[data.length - 1] - data[0]) / (data[0] || 1) * 100).toFixed(1) : 0;

    return { total, average, max, min, growth };
  };

  const stats = calculateStats();

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
        <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
          Rapor İndir
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
              <p className="text-2xl font-bold text-gray-900">₺{summary.totalIncome.toLocaleString('tr-TR')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Randevu Sayısı</p>
              <p className="text-2xl font-bold text-gray-900">{summary.numberOfAppointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Müşteri Sayısı</p>
              <p className="text-2xl font-bold text-gray-900">{summary.numberOfCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <span className="text-2xl">👁️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ziyaret Sayısı</p>
              <p className="text-2xl font-bold text-gray-900">{summary.numberOfVisits}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Parameter Selection */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Parametre:</label>
            <select
              value={selectedParameter}
              onChange={(e) => setSelectedParameter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="gelir">Gelir</option>
              <option value="randevu_sayisi">Randevu Sayısı</option>
              <option value="musteri_sayisi">Müşteri Sayısı</option>
              <option value="ziyaret_sayisi">Ziyaret Sayısı</option>
            </select>
          </div>

          {/* Time Period Selection */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setTimePeriod('daily')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${timePeriod === 'daily' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
                }`}
            >
              Günlük
            </button>
            <button
              onClick={() => setTimePeriod('weekly')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${timePeriod === 'weekly' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
                }`}
            >
              Haftalık
            </button>
            <button
              onClick={() => setTimePeriod('monthly')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${timePeriod === 'monthly' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
                }`}
            >
              Aylık
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Line Graph */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="h-96">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {selectedParameter === 'gelir' ? `₺${stats.total.toLocaleString('tr-TR')}` : `${stats.total} ${parameterUnits[selectedParameter]}`}
          </div>
          <div className="text-sm text-gray-600 mt-1">Toplam</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {selectedParameter === 'gelir' ? `₺${stats.average.toLocaleString('tr-TR')}` : `${stats.average} ${parameterUnits[selectedParameter]}`}
          </div>
          <div className="text-sm text-gray-600 mt-1">Ortalama</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
          <div className="text-2xl font-bold text-green-600">
            {selectedParameter === 'gelir' ? `₺${stats.max.toLocaleString('tr-TR')}` : `${stats.max} ${parameterUnits[selectedParameter]}`}
          </div>
          <div className="text-sm text-gray-600 mt-1">En Yüksek</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
          <div className="text-2xl font-bold text-red-600">
            {selectedParameter === 'gelir' ? `₺${stats.min.toLocaleString('tr-TR')}` : `${stats.min} ${parameterUnits[selectedParameter]}`}
          </div>
          <div className="text-sm text-gray-600 mt-1">En Düşük</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
          <div className={`text-2xl font-bold ${stats.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.growth >= 0 ? '+' : ''}{stats.growth}%
          </div>
          <div className="text-sm text-gray-600 mt-1">Büyüme</div>
        </div>
      </div>

      {/* Additional Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">En Çok Tercih Edilen Hizmetler</h3>
          <div className="space-y-3">
            {topServices.length > 0 ? (
              topServices.map((service, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{service.name}</span>
                  <span className="font-medium">{service.count} randevu</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Henüz hizmet verisi bulunmamaktadır.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Özet İstatistikler</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Toplam Sipariş</span>
              <span className="font-medium">{summary.totalOrders || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ortalama Gelir</span>
              <span className="font-medium">
                ₺{summary.numberOfAppointments > 0
                  ? Math.round(summary.totalIncome / summary.numberOfAppointments).toLocaleString('tr-TR')
                  : 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Aktif Müşteriler</span>
              <span className="font-medium">{summary.numberOfCustomers}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};