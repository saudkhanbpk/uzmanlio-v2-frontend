import { useState } from "react";

// Settings Component
export const Settings = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [currentPlan, setCurrentPlan] = useState('bireysel'); // Current active plan

  const monthlyPrices = {
    bireysel: 500,
    kurumsal: 750,
    seatPrice: 100
  };

  const yearlyPrices = {
    bireysel: 5500, // Monthly equivalent
    birey_yearly: 66000, // Total yearly
    bireysel_discount: 10,
    kurumsal: 6250, // Monthly equivalent  
    kurumsal_yearly: 75000, // Total yearly
    kurumsal_discount: 20,
    seatPrice: 1000 // Yearly seat price
  };

  const getCurrentPrice = (plan) => {
    if (billingPeriod === 'monthly') {
      return monthlyPrices[plan];
    } else {
      return yearlyPrices[plan];
    }
  };

  const getTotalKurumsalPrice = () => {
    const basePrice = getCurrentPrice('kurumsal');
    const seatPrice = billingPeriod === 'monthly' ? monthlyPrices.seatPrice : monthlyPrices.seatPrice; // Use monthly seat price for both
    const additionalSeats = selectedSeats - 1; // First seat included
    return basePrice + (additionalSeats * seatPrice);
  };

  const getKurumsalYearlyTotal = () => {
    const baseYearly = yearlyPrices.kurumsal_yearly;
    const additionalSeats = selectedSeats - 1;
    const additionalYearlySeats = additionalSeats * monthlyPrices.seatPrice * 12;
    return baseYearly + additionalYearlySeats;
  };

  const handlePlanClick = (planType) => {
    if (planType !== currentPlan) {
      // Redirect to uzmanlio.com for non-selected plans
      window.open('https://uzmanlio.com', '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900">Hesap Ayarları</h1>

      {/* Subscription Plans */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Aboneliklerim</h3>
        
        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Aylık
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yıllık
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bireysel Plan */}
          <div className={`border rounded-xl p-6 relative flex flex-col ${
            currentPlan === 'bireysel' 
              ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-20 bg-primary-50' 
              : 'border-gray-200 cursor-pointer hover:border-gray-300'
          }`}>
            {currentPlan === 'bireysel' && (
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-600 text-white">
                  Mevcut Plan
                </span>
              </div>
            )}
            
            <div className="mb-4">
              <h4 className="text-xl font-semibold text-gray-900">Bireysel</h4>
              <div className="mt-2 flex items-baseline">
                {billingPeriod === 'monthly' ? (
                  <span className="text-3xl font-bold text-gray-900">₺{getCurrentPrice('bireysel')}</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-gray-900">₺{getCurrentPrice('bireysel')}</span>
                    <span className="text-sm text-gray-600 ml-1">/ay</span>
                  </>
                )}
                <span className="text-sm text-gray-600 ml-1">
                  {billingPeriod === 'monthly' ? '/ay' : ''}
                </span>
              </div>
              
              {billingPeriod === 'yearly' && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                    {yearlyPrices.bireysel_discount}% indirim
                  </span>
                  <div className="text-sm text-gray-500 mt-1">
                    Yıllık ₺{yearlyPrices.birey_yearly.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
            
            <ul className="space-y-3 mb-6 flex-grow">
              <li className="flex items-center">
                <span className="text-primary-600 mr-2">✓</span>
                <span className="text-sm text-gray-700">Sınırsız Danışan</span>
              </li>
              <li className="flex items-center">
                <span className="text-primary-600 mr-2">✓</span>
                <span className="text-sm text-gray-700">Online Randevu</span>
              </li>
              <li className="flex items-center">
                <span className="text-primary-600 mr-2">✓</span>
                <span className="text-sm text-gray-700">Randevu Hatırlatıcı</span>
              </li>
              <li className="flex items-center">
                <span className="text-primary-600 mr-2">✓</span>
                <span className="text-sm text-gray-700">Kredi Kartı & Havale Online Ödeme</span>
              </li>
              <li className="flex items-center">
                <span className="text-primary-600 mr-2">✓</span>
                <span className="text-sm text-gray-700">1 Ana Kullanıcı</span>
              </li>
            </ul>
            
            <button 
              onClick={() => handlePlanClick('bireysel')}
              className={`w-full py-2 px-4 rounded-lg transition-colors mt-auto ${
                currentPlan === 'bireysel'
                  ? 'bg-primary-600 text-white cursor-default'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={currentPlan === 'bireysel'}
            >
              {currentPlan === 'bireysel' ? 'Mevcut Plan' : 'Planı Seç'}
            </button>
          </div>

          {/* Kurumsal Plan */}
          <div className={`border rounded-xl p-6 relative flex flex-col ${
            currentPlan === 'kurumsal' 
              ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-20 bg-primary-50' 
              : 'border-gray-200 cursor-pointer hover:border-gray-300'
          }`}>
            {currentPlan === 'kurumsal' && (
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-600 text-white">
                  Mevcut Plan
                </span>
              </div>
            )}
            
            <div className="mb-4">
              <h4 className="text-xl font-semibold text-gray-900">Kurumsal</h4>
              <div className="mt-2 flex items-baseline">
                {billingPeriod === 'monthly' ? (
                  <span className="text-3xl font-bold text-gray-900">₺{getTotalKurumsalPrice()}</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-gray-900">₺{getTotalKurumsalPrice()}</span>
                    <span className="text-sm text-gray-600 ml-1">/ay</span>
                  </>
                )}
                <span className="text-sm text-gray-600 ml-1">
                  {billingPeriod === 'monthly' ? '/ay' : ''}
                </span>
              </div>
              
              {billingPeriod === 'yearly' && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                    {yearlyPrices.kurumsal_discount}% indirim
                  </span>
                  <div className="text-sm text-gray-500 mt-1">
                    Yıllık ₺{getKurumsalYearlyTotal().toLocaleString()}
                  </div>
                </div>
              )}
            </div>
            
            <ul className="space-y-3 mb-6 flex-grow">
              <li className="flex items-center">
                <span className="text-primary-600 mr-2">✓</span>
                <span className="text-sm text-gray-700">Sınırsız Danışan</span>
              </li>
              <li className="flex items-center">
                <span className="text-primary-600 mr-2">✓</span>
                <span className="text-sm text-gray-700">Online Randevu</span>
              </li>
              <li className="flex items-center">
                <span className="text-primary-600 mr-2">✓</span>
                <span className="text-sm text-gray-700">Randevu Hatırlatıcı</span>
              </li>
              <li className="flex items-center">
                <span className="text-primary-600 mr-2">✓</span>
                <span className="text-sm text-gray-700">Kredi Kartı & Havale Online Ödeme</span>
              </li>
              <li className="flex items-center">
                <span className="text-primary-600 mr-2">✓</span>
                <span className="text-sm text-gray-700">Kurumsal İsim ve Çoklu Kullanıcı</span>
              </li>
            </ul>
            
            {/* Seat Selection - Only show for Kurumsal plan */}
            {currentPlan === 'kurumsal' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kullanıcı Sayısı Seç
                </label>
                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setSelectedSeats(Math.max(1, selectedSeats - 1))}
                      disabled={selectedSeats <= 1}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        selectedSeats <= 1 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      −
                    </button>
                    
                    <div className="text-center min-w-[120px]">
                      <div className="text-2xl font-bold text-gray-900">{selectedSeats}</div>
                      <div className="text-sm text-gray-500">
                        {selectedSeats === 1 ? 'Kullanıcı' : 'Kullanıcı'}
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setSelectedSeats(Math.min(20, selectedSeats + 1))}
                      disabled={selectedSeats >= 20}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        selectedSeats >= 20 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Ek Maliyet</div>
                    <div className="font-semibold text-gray-900">
                      {selectedSeats > 1 ? (
                        `+₺${((selectedSeats - 1) * (billingPeriod === 'monthly' ? monthlyPrices.seatPrice : monthlyPrices.seatPrice)).toLocaleString()} ${billingPeriod === 'monthly' ? '/ay' : '/ay'}`
                      ) : (
                        'Dahil'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => handlePlanClick('kurumsal')}
              className={`w-full py-2 px-4 rounded-lg transition-colors mt-auto ${
                currentPlan === 'kurumsal'
                  ? 'bg-primary-600 text-white cursor-default'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={currentPlan === 'kurumsal'}
            >
              {currentPlan === 'kurumsal' ? 'Mevcut Plan' : 'Planı Seç'}
            </button>
          </div>
        </div>
        
        {/* Footnote */}
        <div className="mt-6 text-left">
          <p className="text-xs text-gray-500">KDV hariç fiyatlar gösterilmektedir</p>
        </div>
      </div>

      {/* Credit Card Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Kredi Kartı Bilgileri</h3>
        
        {/* Current Credit Card Display */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">**** **** **** 4532</div>
                <div className="text-sm text-gray-600">Ahmet Yılmaz • Son kullanma: 12/27</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Aktif</span>
            </div>
          </div>
        </div>

        {/* Change Payment Method Button */}
        <div className="flex justify-start">
          <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            Ödeme Yöntemini Değiştir
          </button>
        </div>
      </div>

      {/* Notification Settings - Moved to end */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Bildirim Ayarları</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Bildirimleri</p>
              <p className="text-sm text-gray-600">Yeni siparişler ve müşteri mesajları</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">SMS Bildirimleri</p>
              <p className="text-sm text-gray-600">Önemli güncellemeler</p>
            </div>
            <input type="checkbox" className="h-4 w-4 text-primary-600 rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Pazarlama Emailları</p>
              <p className="text-sm text-gray-600">Yeni özellikler ve kampanyalar</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};
