import { useState } from "react";
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


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


import { Line } from 'react-chartjs-2';
// Reports Component
export default function Reports(){
  const [timePeriod, setTimePeriod] = useState('weekly');
  const [selectedParameter, setSelectedParameter] = useState('gelir');

  // Mock data for different parameters and time periods
  const mockData = {
    daily: {
      gelir: {
        labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
        data: [1200, 1900, 1700, 2200, 2800, 1600, 1400],
        color: 'rgb(34, 197, 94)',
        bgColor: 'rgba(34, 197, 94, 0.1)'
      },
      randevu_sayisi: {
        labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
        data: [8, 12, 10, 15, 18, 9, 7],
        color: 'rgb(59, 130, 246)',
        bgColor: 'rgba(59, 130, 246, 0.1)'
      },
      musteri_sayisi: {
        labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
        data: [6, 9, 8, 11, 14, 7, 5],
        color: 'rgb(168, 85, 247)',
        bgColor: 'rgba(168, 85, 247, 0.1)'
      },
      ziyaret_sayisi: {
        labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
        data: [45, 67, 52, 78, 89, 43, 38],
        color: 'rgb(239, 68, 68)',
        bgColor: 'rgba(239, 68, 68, 0.1)'
      }
    },
    weekly: {
      gelir: {
        labels: ['1. Hafta', '2. Hafta', '3. Hafta', '4. Hafta', '5. Hafta', '6. Hafta'],
        data: [8500, 12300, 10800, 15600, 18900, 11200],
        color: 'rgb(34, 197, 94)',
        bgColor: 'rgba(34, 197, 94, 0.1)'
      },
      randevu_sayisi: {
        labels: ['1. Hafta', '2. Hafta', '3. Hafta', '4. Hafta', '5. Hafta', '6. Hafta'],
        data: [54, 78, 65, 89, 105, 72],
        color: 'rgb(59, 130, 246)',
        bgColor: 'rgba(59, 130, 246, 0.1)'
      },
      musteri_sayisi: {
        labels: ['1. Hafta', '2. Hafta', '3. Hafta', '4. Hafta', '5. Hafta', '6. Hafta'],
        data: [42, 61, 48, 71, 85, 58],
        color: 'rgb(168, 85, 247)',
        bgColor: 'rgba(168, 85, 247, 0.1)'
      },
      ziyaret_sayisi: {
        labels: ['1. Hafta', '2. Hafta', '3. Hafta', '4. Hafta', '5. Hafta', '6. Hafta'],
        data: [320, 467, 385, 578, 645, 412],
        color: 'rgb(239, 68, 68)',
        bgColor: 'rgba(239, 68, 68, 0.1)'
      }
    },
    monthly: {
      gelir: {
        labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
        data: [34500, 42300, 38900, 51200, 67800, 45600],
        color: 'rgb(34, 197, 94)',
        bgColor: 'rgba(34, 197, 94, 0.1)'
      },
      randevu_sayisi: {
        labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
        data: [210, 287, 245, 334, 412, 298],
        color: 'rgb(59, 130, 246)',
        bgColor: 'rgba(59, 130, 246, 0.1)'
      },
      musteri_sayisi: {
        labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
        data: [168, 221, 189, 267, 325, 234],
        color: 'rgb(168, 85, 247)',
        bgColor: 'rgba(168, 85, 247, 0.1)'
      },
      ziyaret_sayisi: {
        labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
        data: [1245, 1678, 1423, 1892, 2340, 1756],
        color: 'rgb(239, 68, 68)',
        bgColor: 'rgba(239, 68, 68, 0.1)'
      }
    }
  };

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

  const currentData = mockData[timePeriod][selectedParameter];

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
        text: `${parameterLabels[selectedParameter]} - ${
          timePeriod === 'daily' ? 'Günlük' : 
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
          label: function(context) {
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
          callback: function(value) {
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
    const total = data.reduce((sum, value) => sum + value, 0);
    const average = Math.round(total / data.length);
    const max = Math.max(...data);
    const min = Math.min(...data);
    const growth = data.length > 1 ? ((data[data.length - 1] - data[0]) / data[0] * 100).toFixed(1) : 0;

    return { total, average, max, min, growth };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
          Rapor İndir
        </button>
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
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                timePeriod === 'daily' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              Günlük
            </button>
            <button
              onClick={() => setTimePeriod('weekly')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                timePeriod === 'weekly' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              Haftalık
            </button>
            <button
              onClick={() => setTimePeriod('monthly')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                timePeriod === 'monthly' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
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
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Dijital Pazarlama Danışmanlığı</span>
              <span className="font-medium">127 randevu</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Web Geliştirme Eğitimi</span>
              <span className="font-medium">89 randevu</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">SEO Danışmanlığı</span>
              <span className="font-medium">78 randevu</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Müşteri Segmentleri</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Yeni Müşteriler</span>
              <span className="font-medium">45%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tekrar Eden Müşteriler</span>
              <span className="font-medium">35%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">VIP Müşteriler</span>
              <span className="font-medium">20%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};