// Settings.js
import { useEffect, useState } from "react";
import SubscriptionPaymentForm from "./SubscriptionPaymentForm";
import Swal from "sweetalert2";
import axios from "../node_modules/axios/index";

// Settings Component
export const Settings = () => {
  // UI state
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // user's selected view (monthly/yearly)
  const [selectedSeats, setSelectedSeats] = useState(2);
  const [currentPlan, setCurrentPlan] = useState(''); // backend active plan (plantype) lowercase
  const [backendDuration, setBackendDuration] = useState(''); // backend active duration (duration) lowercase
  const [newSubscriptionModel, setNewsubscriptionModel] = useState(false)
  const [subscriptionType, setSubscriptionType] = useState("")
  const [price, setPrice] = useState(0);
  const [isAdmin, setIsAdmin] = useState()


  // IMPORTANT: keep this the same user id or replace dynamically
  const userId = "68c94094d011cdb0e5fa2caa";

  // Pricing (lowercase keys)
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

  // Helper: returns price for a plan based on the *view* billingPeriod
  const getCurrentPrice = (plan) => {
    if (!plan) return 0;
    const key = String(plan).toLowerCase();
    if (billingPeriod === 'monthly') {
      return monthlyPrices[key];
    } else {
      return yearlyPrices[key];
    }
  };

  // Institutional total according to the *view* billingPeriod and selectedSeats
  const getTotalKurumsalPrice = () => {
    const basePrice = billingPeriod === 'monthly' ? monthlyPrices.institutional : yearlyPrices.institutional;
    const seatPrice = billingPeriod === 'monthly' ? monthlyPrices.seatPrice : yearlyPrices.seatPrice;
    const additionalSeats = Math.max(0, selectedSeats - 1); // first seat included
    return basePrice + additionalSeats * seatPrice;
  };

  // Yearly breakdown helper (kept for backward compatibility)
  const getKurumsalYearlyTotal = () => {
    const baseYearly = yearlyPrices.institutional;
    const additionalSeats = Math.max(0, selectedSeats - 1);
    // For yearly, use yearly seat price directly (not monthly * 12)
    const additionalYearlySeats = additionalSeats * yearlyPrices.seatPrice;
    return baseYearly + additionalYearlySeats;
  };

  // Fetch user profile and subscription from backend (uses lowercase keys)
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/expert/${userId}/profile`
        );

        console.log("Response profile:", response);

        const user = response.data;
        // Accept subscription under either 'subscription' or 'Subscription' (some backends differ)
        const currentSubscription = user.subscription
        setIsAdmin(user.subscription.isAdmin === true?true:false)

        if (currentSubscription && currentSubscription.endDate) {
          // Only treat as active if endDate is in future
          const endTs = new Date(currentSubscription.endDate).getTime();
          if (!Number.isNaN(endTs) && endTs > Date.now()) {
            // Expect backend now sends lowercase: plantype, duration
            const planFromBackendRaw = currentSubscription.plantype ?? currentSubscription.Plantype ?? '';
            const durationFromBackendRaw = currentSubscription.duration ?? currentSubscription.Duration ?? '';

            const planFromBackend = String(planFromBackendRaw).toLowerCase();
            const durationFromBackend = String(durationFromBackendRaw).toLowerCase();

            // Set backend-active values (these drive the highlighting)
            setCurrentPlan(planFromBackend);      // 'individual' or 'institutional'
            setBackendDuration(durationFromBackend); // 'monthly' or 'yearly'

            // Also set the UI billingPeriod to backend duration so displayed prices match backend on load
            setBillingPeriod(durationFromBackend);

            // If backend provides seat count, use it (otherwise keep 1)
            if (currentSubscription.seats) {
              setSelectedSeats(Number(currentSubscription.seats));
            }

            // compute and set price for modal / display (based on backend plan & duration)
            let computedPrice = 0;
            if (planFromBackend === 'individual') {
              computedPrice = durationFromBackend === 'monthly' ? monthlyPrices.individual : yearlyPrices.individual;
            } else if (planFromBackend === 'institutional') {
              // compute institutional price including seats
              const base = durationFromBackend === 'monthly' ? monthlyPrices.institutional : yearlyPrices.institutional;
              const seatP = durationFromBackend === 'monthly' ? monthlyPrices.seatPrice : yearlyPrices.seatPrice;
              computedPrice = base + Math.max(0, selectedSeats - 1) * seatP;
            }
            setPrice(computedPrice);

            console.log("Active subscription found:", { planFromBackend, durationFromBackend, computedPrice });
          } else {
            // subscription expired or invalid -> clear
            setCurrentPlan('');
            setBackendDuration('');
            console.log("No Active Plan For the Current User");
          }
        } else {
          // no subscription
          setCurrentPlan('');
          setBackendDuration('');
          console.log("No subscription data found");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }

    fetchUserProfile();
    // run once on mount
  }, []);


  // When user clicks on Plan button -> open subscription modal
  // Do NOT change currentPlan/backendDuration here — they represent what's stored in backend
  const handlePlanClick = (planType) => {
    // planType passed in from UI might be 'Individual' or 'institutional' etc — normalize
    const normalized = String(planType).toLowerCase();
    // compute what price would be if user proceeds with current billingPeriod & seats
    let computedPrice = 0;
    if (normalized === 'individual') {
      computedPrice = billingPeriod === 'monthly' ? monthlyPrices.individual : yearlyPrices.individual;
    } else if (normalized === 'institutional') {
      const base = billingPeriod === 'monthly' ? monthlyPrices.institutional : yearlyPrices.institutional;
      const seatP = billingPeriod === 'monthly' ? monthlyPrices.seatPrice : yearlyPrices.seatPrice;
      computedPrice = base + Math.max(0, selectedSeats - 1) * seatP;
    }

    setSubscriptionType(normalized);
    setPrice(computedPrice);
    // open modal for payment / confirmation
    setNewsubscriptionModel(true);
    console.log("Plan clicked (will open modal):", { normalized, billingPeriod, selectedSeats, computedPrice });
  };


  // Helper used in classNames: highlight only when backend says this plan+duration is active
  const isActivePlan = (plan) => {
    // both currentPlan and backendDuration must match
    return currentPlan === plan && backendDuration === billingPeriod;
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900">Hesap Ayarları</h1>
      <div className={`${isAdmin?"block":"hidden"}`}>
      {/* Subscription Plans */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Aboneliklerim</h3>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${billingPeriod === 'monthly'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Aylık
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${billingPeriod === 'yearly'
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
          <div className={`border rounded-xl p-6 relative flex flex-col ${isActivePlan('individual')
            ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-20 bg-primary-50'
            : 'border-gray-200 cursor-pointer hover:border-gray-300'
            }`}>
            {isActivePlan('individual') && (
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-600 text-white">
                  Mevcut Plan
                </span>
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-xl font-semibold text-gray-900">Bireysel</h4>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">₺{getCurrentPrice('individual').toLocaleString()}</span>
                <span className="text-sm text-gray-600 ml-1">
                  {billingPeriod === 'monthly' ? '/ay' : '/yıl'}
                </span>
              </div>

              {billingPeriod === 'yearly' && (
                <div className="mt-2">
                  <div className="text-sm text-gray-500">
                    Yıllık Toplam: ₺{(yearlyPrices.individual ?? yearlyPrices.individual).toLocaleString()}
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
              onClick={() => {
                // Keep current billingPeriod (monthly or yearly) - don't force monthly
                handlePlanClick('individual');
                setSubscriptionType("individual")
                setPrice(getCurrentPrice('individual'))
              }}
              className={`w-full py-2 px-4 rounded-lg transition-colors mt-auto ${isActivePlan('individual')
                ? 'bg-primary-600 text-white cursor-default'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              disabled={isActivePlan('individual')}
            >
              {isActivePlan('individual') ? 'Mevcut Plan' : 'Planı Seç'}
            </button>
          </div>

          {/* Institutional Plan */}
          <div className={`border rounded-xl p-6 relative flex flex-col ${isActivePlan('institutional')
            ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-20 bg-primary-50'
            : 'border-gray-200 cursor-pointer hover:border-gray-300'
            }`}>
            {isActivePlan('institutional') && (
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-600 text-white">
                  Mevcut Plan
                </span>
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-xl font-semibold text-gray-900">Kurumsal</h4>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">₺{getTotalKurumsalPrice().toLocaleString()}</span>
                <span className="text-sm text-gray-600 ml-1">
                  {billingPeriod === 'monthly' ? '/ay' : '/yıl'}
                </span>
              </div>

              {billingPeriod === 'yearly' && (
                <div className="mt-2">
                  <div className="text-sm text-gray-500">
                    Yıllık Toplam: ₺{getKurumsalYearlyTotal().toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            <ul className="space-y-3 mb-6 flex-grow">
              <li className="flex items-center"><span className="text-primary-600 mr-2">✓</span><span className="text-sm text-gray-700">Sınırsız Danışan</span></li>
              <li className="flex items-center"><span className="text-primary-600 mr-2">✓</span><span className="text-sm text-gray-700">Online Randevu</span></li>
              <li className="flex items-center"><span className="text-primary-600 mr-2">✓</span><span className="text-sm text-gray-700">Randevu Hatırlatıcı</span></li>
              <li className="flex items-center"><span className="text-primary-600 mr-2">✓</span><span className="text-sm text-gray-700">Kredi Kartı & Havale Online Ödeme</span></li>
              <li className="flex items-center"><span className="text-primary-600 mr-2">✓</span><span className="text-sm text-gray-700">Institutional İsim ve Çoklu Kullanıcı</span></li>
            </ul>

            {/* Seat Selection - Show for Institutional plan */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kullanıcı Sayısı Seç
              </label>
              <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setSelectedSeats(Math.max(1, selectedSeats - 1))}
                    disabled={selectedSeats <= 2}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${selectedSeats <= 1
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
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${selectedSeats >= 20
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
                      `+₺${((selectedSeats - 1) * (billingPeriod === 'monthly' ? monthlyPrices.seatPrice : yearlyPrices.seatPrice)).toLocaleString()} ${billingPeriod === 'monthly' ? '/ay' : '/yıl'}`
                    ) : (
                      'Dahil'
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                // Keep current billingPeriod (monthly or yearly) - don't force yearly
                handlePlanClick('institutional')
                setSubscriptionType("institutional")
                setPrice(getTotalKurumsalPrice())
              }}
              className={`w-full py-2 px-4 rounded-lg transition-colors mt-auto ${isActivePlan('institutional')
                ? 'bg-primary-600 text-white cursor-default'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              disabled={isActivePlan('institutional')}
            >
              {isActivePlan('institutional') ? 'Mevcut Plan' : 'Planı Seç'}
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

      {/* Subscription Status */}
      {newSubscriptionModel && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <SubscriptionPaymentForm
              setNewsubscriptionModel={setNewsubscriptionModel}
              setCurrentPlan={setCurrentPlan}
              currentPlan={currentPlan}
              billingPeriod={billingPeriod}
              price={price}
              subscriptionType={subscriptionType}
              setSelectedSeats={setSelectedSeats}
              setBillingPeriod={setBillingPeriod}
              setBackendDuration={setBackendDuration}
            />
          </div>
        </div>
      )}

    </div>
  );
};
