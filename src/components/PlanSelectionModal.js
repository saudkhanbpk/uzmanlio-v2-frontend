import React, { useState } from 'react';

export default function PlanSelectionModal({ onPlanSelect, onCancel }) {
    const [billingPeriod, setBillingPeriod] = useState('monthly');
    const [selectedSeats, setSelectedSeats] = useState(2);

    // Pricing (same as settings.js)
    const monthlyPrices = {
        individual: 500,
        institutional: 650,
        seatPrice: 100
    };

    const yearlyPrices = {
        individual: 5000,
        institutional: 7400,
        seatPrice: 100
    };

    // Get price for a plan based on billing period
    const getCurrentPrice = (plan) => {
        if (!plan) return 0;
        const key = String(plan).toLowerCase();
        if (billingPeriod === 'monthly') {
            return monthlyPrices[key];
        } else {
            return yearlyPrices[key];
        }
    };

    // Calculate institutional total price
    const getTotalKurumsalPrice = () => {
        const basePrice = billingPeriod === 'monthly' ? monthlyPrices.institutional : yearlyPrices.institutional;
        const seatPrice = billingPeriod === 'monthly' ? monthlyPrices.seatPrice : yearlyPrices.seatPrice;
        const additionalSeats = Math.max(0, selectedSeats - 1);
        return basePrice + additionalSeats * seatPrice;
    };

    // Get yearly total for institutional
    const getKurumsalYearlyTotal = () => {
        const baseYearly = yearlyPrices.institutional;
        const additionalSeats = Math.max(0, selectedSeats - 1);
        const additionalYearlySeats = additionalSeats * yearlyPrices.seatPrice;
        return baseYearly + additionalYearlySeats;
    };

    // Handle plan selection
    const handlePlanClick = (planType) => {
        const normalized = String(planType).toLowerCase();
        let computedPrice = 0;

        if (normalized === 'individual') {
            computedPrice = billingPeriod === 'monthly' ? monthlyPrices.individual : yearlyPrices.individual;
        } else if (normalized === 'institutional') {
            computedPrice = getTotalKurumsalPrice();
        }

        // Call parent callback with selected plan details
        onPlanSelect(normalized, billingPeriod, selectedSeats, computedPrice);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-2 sm:p-4">
            <div className="relative w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-5xl xl:max-w-5xl my-4 sm:my-8">
                {/* Modal content */}
                <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-4 max-h-[95vh] overflow-y-auto">
                    {/* Header */}
                    <div className="mb-4 sm:mb-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Abonelik Planı Seçin</h2>
                        <p className="text-sm sm:text-base text-gray-600">Devam etmek için bir plan seçin</p>
                    </div>

                    {/* Billing Period Toggle */}
                    <div className="flex justify-center mb-6 sm:mb-8">
                        <div className="bg-gray-100 p-1 rounded-lg flex w-full sm:w-auto">
                            <button
                                onClick={() => setBillingPeriod('monthly')}
                                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${billingPeriod === 'monthly'
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Aylık
                            </button>
                            <button
                                onClick={() => setBillingPeriod('yearly')}
                                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${billingPeriod === 'yearly'
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Yıllık
                            </button>
                        </div>
                    </div>

                    {/* Plans */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                        {/* Individual Plan */}
                        <div className="border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-gray-300 cursor-pointer flex flex-col">
                            <div className="mb-3 sm:mb-4">
                                <h4 className="text-lg sm:text-xl font-semibold text-gray-900">Bireysel</h4>
                                <div className="mt-2 flex items-baseline">
                                    <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                                        ₺{getCurrentPrice('individual').toLocaleString()}
                                    </span>
                                    <span className="text-xs sm:text-sm text-gray-600 ml-1">
                                        {billingPeriod === 'monthly' ? '/ay' : '/yıl'}
                                    </span>
                                </div>

                                {billingPeriod === 'yearly' && (
                                    <div className="mt-2">
                                        <div className="text-xs sm:text-sm text-gray-500">
                                            Yıllık Toplam: ₺{yearlyPrices.individual.toLocaleString()}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-grow">
                                <li className="flex items-center">
                                    <span className="text-primary-600 mr-2 text-sm sm:text-base">✓</span>
                                    <span className="text-xs sm:text-sm text-gray-700">Sınırsız Danışan</span>
                                </li>
                                <li className="flex items-center">
                                    <span className="text-primary-600 mr-2 text-sm sm:text-base">✓</span>
                                    <span className="text-xs sm:text-sm text-gray-700">Online Randevu</span>
                                </li>
                                <li className="flex items-center">
                                    <span className="text-primary-600 mr-2 text-sm sm:text-base">✓</span>
                                    <span className="text-xs sm:text-sm text-gray-700">Randevu Hatırlatıcı</span>
                                </li>
                                <li className="flex items-center">
                                    <span className="text-primary-600 mr-2 text-sm sm:text-base">✓</span>
                                    <span className="text-xs sm:text-sm text-gray-700">Kredi Kartı & Havale Online Ödeme</span>
                                </li>
                                <li className="flex items-center">
                                    <span className="text-primary-600 mr-2 text-sm sm:text-base">✓</span>
                                    <span className="text-xs sm:text-sm text-gray-700">1 Ana Kullanıcı</span>
                                </li>
                            </ul>

                            <button
                                onClick={() => handlePlanClick('individual')}
                                className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-colors mt-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 font-semibold text-sm sm:text-base"
                            >
                                Planı Seç
                            </button>
                        </div>

                        {/* Institutional Plan */}
                        <div className="border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-gray-300 cursor-pointer flex flex-col">
                            <div className="mb-3 sm:mb-4">
                                <h4 className="text-lg sm:text-xl font-semibold text-gray-900">Kurumsal</h4>
                                <div className="mt-2 flex items-baseline">
                                    <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                                        ₺{getTotalKurumsalPrice().toLocaleString()}
                                    </span>
                                    <span className="text-xs sm:text-sm text-gray-600 ml-1">
                                        {billingPeriod === 'monthly' ? '/ay' : '/yıl'}
                                    </span>
                                </div>

                                {billingPeriod === 'yearly' && (
                                    <div className="mt-2">
                                        <div className="text-xs sm:text-sm text-gray-500">
                                            Yıllık Toplam: ₺{getKurumsalYearlyTotal().toLocaleString()}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-grow">
                                <li className="flex items-center">
                                    <span className="text-primary-600 mr-2 text-sm sm:text-base">✓</span>
                                    <span className="text-xs sm:text-sm text-gray-700">Sınırsız Danışan</span>
                                </li>
                                <li className="flex items-center">
                                    <span className="text-primary-600 mr-2 text-sm sm:text-base">✓</span>
                                    <span className="text-xs sm:text-sm text-gray-700">Online Randevu</span>
                                </li>
                                <li className="flex items-center">
                                    <span className="text-primary-600 mr-2 text-sm sm:text-base">✓</span>
                                    <span className="text-xs sm:text-sm text-gray-700">Randevu Hatırlatıcı</span>
                                </li>
                                <li className="flex items-center">
                                    <span className="text-primary-600 mr-2 text-sm sm:text-base">✓</span>
                                    <span className="text-xs sm:text-sm text-gray-700">Kredi Kartı & Havale Online Ödeme</span>
                                </li>
                                <li className="flex items-center">
                                    <span className="text-primary-600 mr-2 text-sm sm:text-base">✓</span>
                                    <span className="text-xs sm:text-sm text-gray-700">Institutional İsim ve Çoklu Kullanıcı</span>
                                </li>
                            </ul>

                            {/* Seat Selection */}
                            <div className="mb-4 sm:mb-6">
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                    Kullanıcı Sayısı Seç
                                </label>
                                <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 border border-gray-300 rounded-lg bg-gray-50 gap-3 sm:gap-0">
                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedSeats(Math.max(2, selectedSeats - 1))}
                                            disabled={selectedSeats <= 2}
                                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors text-lg sm:text-xl ${selectedSeats <= 2
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-primary-600 text-white hover:bg-primary-700'
                                                }`}
                                        >
                                            −
                                        </button>

                                        <div className="text-center min-w-[80px] sm:min-w-[120px]">
                                            <div className="text-xl sm:text-2xl font-bold text-gray-900">{selectedSeats}</div>
                                            <div className="text-xs sm:text-sm text-gray-500">Kullanıcı</div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setSelectedSeats(Math.min(20, selectedSeats + 1))}
                                            disabled={selectedSeats >= 20}
                                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors text-lg sm:text-xl ${selectedSeats >= 20
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-primary-600 text-white hover:bg-primary-700'
                                                }`}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="text-center sm:text-right">
                                        <div className="text-xs sm:text-sm text-gray-600">Ek Maliyet</div>
                                        <div className="font-semibold text-gray-900 text-sm sm:text-base">
                                            {selectedSeats > 1 ? (
                                                `+₺${((selectedSeats - 1) * (billingPeriod === 'monthly' ? monthlyPrices.seatPrice : yearlyPrices.seatPrice)).toLocaleString()} ${billingPeriod === 'monthly' ? '/ay' : '/yıl'}`
                                            ) : (
                                                'Dahil'
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handlePlanClick('institutional')}
                                className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-colors mt-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 font-semibold text-sm sm:text-base"
                            >
                                Planı Seç
                            </button>
                        </div>
                    </div>

                    {/* Footnote */}
                    <div className="mb-4 sm:mb-6 text-left">
                        <p className="text-[10px] sm:text-xs text-gray-500">KDV hariç fiyatlar gösterilmektedir</p>
                    </div>

                    {/* Cancel Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={onCancel}
                            className="px-4 sm:px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base w-full sm:w-auto"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
