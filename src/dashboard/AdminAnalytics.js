import { useState, useEffect } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    fetchAllExpertsAnalytics,
    fetchAdminExpertAnalytics,
    fetchInstitutionAnalytics
} from '../services/analyticsService';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

/**
 * Admin Analytics Dashboard
 * Shows aggregated analytics for all experts in an institution
 * Only accessible by institution admins
 */
export default function AdminAnalytics() {
    const [timePeriod, setTimePeriod] = useState('monthly');
    const [year] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedExpert, setSelectedExpert] = useState(null);

    // State for analytics data
    const [aggregatedData, setAggregatedData] = useState({
        totalViews: 0,
        totalSessions: 0,
        experts: [],
        institutionName: ''
    });
    const [institutionViews, setInstitutionViews] = useState(0);
    const [expertDetails, setExpertDetails] = useState(null);

    const userId = localStorage.getItem('userId');
    const institutionId = localStorage.getItem('institutionId');

    // Fetch aggregated data on mount and period change
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch all experts analytics
                const allExpertsResponse = await fetchAllExpertsAnalytics(timePeriod, year);

                if (allExpertsResponse.success) {
                    setAggregatedData({
                        totalViews: allExpertsResponse.totalViews || 0,
                        totalSessions: allExpertsResponse.totalSessions || 0,
                        experts: allExpertsResponse.experts || [],
                        institutionName: allExpertsResponse.institutionName || ''
                    });
                }

                // Fetch institution page views if institutionId exists
                if (institutionId) {
                    const institutionResponse = await fetchInstitutionAnalytics(institutionId, timePeriod, year);
                    if (institutionResponse.success) {
                        setInstitutionViews(institutionResponse.totalViews || 0);
                    }
                }

            } catch (err) {
                console.error('Error fetching admin analytics:', err);
                setError('Analiz verileri yüklenirken hata oluştu');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [timePeriod, year, institutionId]);

    // Fetch selected expert details
    useEffect(() => {
        if (!selectedExpert) {
            setExpertDetails(null);
            return;
        }

        const fetchExpertDetails = async () => {
            try {
                const response = await fetchAdminExpertAnalytics(selectedExpert, timePeriod, year);
                if (response.success) {
                    setExpertDetails(response);
                }
            } catch (err) {
                console.error('Error fetching expert details:', err);
            }
        };

        fetchExpertDetails();
    }, [selectedExpert, timePeriod, year]);

    // Prepare chart data for experts comparison
    const expertsChartData = {
        labels: aggregatedData.experts.map(exp => exp.name || 'Unknown'),
        datasets: [
            {
                label: 'Profil Görüntülenme',
                data: aggregatedData.experts.map(exp => exp.totalViews || 0),
                backgroundColor: 'rgba(34, 197, 94, 0.6)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Uzman Profil Görüntülenmeleri',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0
                }
            }
        }
    };

    // Traffic source chart (if expert is selected)
    const trafficSourceData = expertDetails ? {
        labels: expertDetails.trafficSources?.map(source => source.source) || [],
        datasets: [
            {
                data: expertDetails.trafficSources?.map(source => source.sessions) || [],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                ],
                borderWidth: 0,
            },
        ],
    } : null;

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

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-600">{error}</p>
                    <p className="text-gray-500 mt-2">Lütfen daha sonra tekrar deneyin.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kurum Analizi</h1>
                    {aggregatedData.institutionName && (
                        <p className="text-gray-600">{aggregatedData.institutionName}</p>
                    )}
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <span className="text-2xl">👁️</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Toplam Görüntülenme</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {aggregatedData.totalViews.toLocaleString('tr-TR')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <span className="text-2xl">📊</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Toplam Oturum</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {aggregatedData.totalSessions.toLocaleString('tr-TR')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <span className="text-2xl">👥</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Uzman Sayısı</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {aggregatedData.experts.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <span className="text-2xl">🏢</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Kurum Sayfası</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {institutionViews.toLocaleString('tr-TR')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Experts Comparison Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="h-80">
                    <Bar data={expertsChartData} options={chartOptions} />
                </div>
            </div>

            {/* Experts Table */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Uzman Performansı</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Uzman
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Görüntülenme
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Oranı
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Detay
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {aggregatedData.experts.map((expert, index) => {
                                const percentage = aggregatedData.totalViews > 0
                                    ? ((expert.totalViews / aggregatedData.totalViews) * 100).toFixed(1)
                                    : 0;
                                return (
                                    <tr key={expert.expertId || index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                    <span className="text-primary-600 font-medium">
                                                        {(expert.name || 'U').charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {expert.name || 'Bilinmiyor'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-semibold">
                                                {(expert.totalViews || 0).toLocaleString('tr-TR')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div
                                                        className="bg-primary-600 h-2 rounded-full"
                                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-600">{percentage}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => setSelectedExpert(
                                                    selectedExpert === expert.expertId ? null : expert.expertId
                                                )}
                                                className="text-primary-600 hover:text-primary-800 font-medium"
                                            >
                                                {selectedExpert === expert.expertId ? 'Gizle' : 'Göster'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Expert Details Panel */}
            {selectedExpert && expertDetails && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {expertDetails.expertName} - Detaylı Analiz
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Traffic Sources */}
                        {trafficSourceData && trafficSourceData.labels.length > 0 && (
                            <div>
                                <h4 className="text-md font-medium text-gray-700 mb-3">Trafik Kaynakları</h4>
                                <div className="h-64">
                                    <Doughnut
                                        data={trafficSourceData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'right',
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Device Breakdown */}
                        {expertDetails.devices && expertDetails.devices.length > 0 && (
                            <div>
                                <h4 className="text-md font-medium text-gray-700 mb-3">Cihaz Dağılımı</h4>
                                <div className="space-y-2">
                                    {expertDetails.devices.map((device, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 capitalize">{device.device}</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {device.sessions} oturum
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Countries */}
                        {expertDetails.countries && expertDetails.countries.length > 0 && (
                            <div className="md:col-span-2">
                                <h4 className="text-md font-medium text-gray-700 mb-3">Ülke Dağılımı</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {expertDetails.countries.slice(0, 8).map((country, idx) => (
                                        <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-sm font-medium text-gray-900">{country.country}</p>
                                            <p className="text-xs text-gray-500">{country.sessions} oturum</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
