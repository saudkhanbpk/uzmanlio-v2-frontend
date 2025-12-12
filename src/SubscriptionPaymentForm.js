import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { authPost } from "./services/authFetch";

const SubscriptionPaymentForm = ({
  setNewsubscriptionModel,
  subscriptionType,
  price,
  billingPeriod,
  currentPlan,
  setCurrentPlan,
  setSelectedSeats,
  setBillingPeriod,
  setBackendDuration,
  selectedSeats,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onChange",
  });

  const [showBillingInfo, setShowBillingInfo] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const userId = localStorage.getItem('userId');

  const monthlyPrices = {
    individual: 350,
    institutional: 750,
    seatPrice: 100,
  };

  const yearlyPrices = {
    individual: 3500,
    institutional: 7500,
    seatPrice: 100,
  };

  const onSubmit = async (formData) => {
    const normalizedPlan = (subscriptionType || currentPlan || "").toLowerCase();
    const normalizedDuration = (billingPeriod || "monthly").toLowerCase();

    const dataPayload = {
      ...formData,
      plantype: normalizedPlan,
      duration: normalizedDuration,
      price: price ?? 0,
      selectedSeats,
    };

    console.log("Final Payload Sent to Backend:", dataPayload);

    try {
      const responseData = await authPost(
        `${backendUrl}/api/expert/${userId}/new-subscription`,
        dataPayload
      );

      // authPost throws if not OK, so we can assume success here
      const user = responseData.user;
      console.log("User after subscription:", user);

      const currentSubscription = user.subscription ?? user.Subscription ?? undefined;

      if (currentSubscription && currentSubscription.endDate) {
        const endTs = new Date(currentSubscription.endDate).getTime();

        if (!Number.isNaN(endTs) && endTs > Date.now()) {
          const planFromBackendRaw = currentSubscription.plantype ?? currentSubscription.Plantype ?? "";
          const durationFromBackendRaw = currentSubscription.duration ?? currentSubscription.Duration ?? "";

          const planFromBackend = String(planFromBackendRaw).toLowerCase();
          const durationFromBackend = String(durationFromBackendRaw).toLowerCase();

          setCurrentPlan(planFromBackend);
          setBackendDuration(durationFromBackend);
          setBillingPeriod(durationFromBackend);

          if (currentSubscription.seats) {
            setSelectedSeats(Number(currentSubscription.seats));
          }

          console.log("✅ Active subscription found:", {
            planFromBackend,
            durationFromBackend,
          });

          Swal.fire({
            icon: "success",
            title: "Başarılı",
            text: "Abonelik başarıyla oluşturuldu. Faturanız e-posta ile gönderilecektir.",
          }).then(() => {
            window.location.href = '/dashboard';
          });
        } else {
          setCurrentPlan("");
          setBackendDuration("");
          Swal.fire({
            icon: "info",
            title: "Abonelik Süresi Dolmuş",
            text: "Aboneliğiniz geçersiz veya süresi dolmuş.",
          });
        }
      } else {
        setCurrentPlan("");
        setBackendDuration("");
        Swal.fire({
          icon: "info",
          title: "Abonelik Bulunamadı",
          text: "Aktif abonelik verisi bulunamadı.",
        });
      }

      reset();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: error?.message || "Abonelik işlemi sırasında bir hata oluştu",
      });
    } finally {
      setNewsubscriptionModel(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-green-600 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold">Abonelik Ödeme Formu</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Card Information Section */}
          <div className="bg-emerald-50 rounded-lg p-5 space-y-4 border border-emerald-200">
            <div className="flex items-center gap-2 text-lg font-semibold text-emerald-800 mb-4">
              <span className="text-2xl">💳</span>
              <span>Kart Bilgileri</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kart Sahibi Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("cardHolderName", {
                  required: "Kart sahibi adı zorunludur",
                  minLength: {
                    value: 3,
                    message: "Ad en az 3 karakter olmalıdır",
                  },
                  pattern: {
                    value: /^[A-Za-zğüşıöçĞÜŞIÖÇ\s]+$/,
                    message: "Sadece harf girebilirsiniz",
                  },
                })}
                className="w-full px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                placeholder="Ad Soyad"
              />
              {errors.cardHolderName && (
                <p className="text-red-500 text-sm mt-1">{errors.cardHolderName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kart Numarası <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("cardNumber", {
                  required: "Kart numarası zorunludur",
                  pattern: {
                    value: /^[0-9]{16}$/,
                    message: "Geçerli bir kart numarası giriniz (16 hane)",
                  },
                })}
                className="w-full px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                placeholder="1234 5678 9012 3456"
                maxLength="16"
              />
              {errors.cardNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.cardNumber.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Son Kullanım <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("cardExpiry", {
                    required: "Son kullanım tarihi zorunludur",
                    pattern: {
                      value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                      message: "Format: AA/YY",
                    },
                  })}
                  className="w-full px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  placeholder="MM/YY"
                  maxLength="5"
                />
                {errors.cardExpiry && (
                  <p className="text-red-500 text-sm mt-1">{errors.cardExpiry.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("cardCvv", {
                    required: "CVV zorunludur",
                    pattern: {
                      value: /^[0-9]{3,4}$/,
                      message: "3-4 haneli CVV giriniz",
                    },
                  })}
                  className="w-full px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  placeholder="123"
                  maxLength="4"
                />
                {errors.cardCvv && (
                  <p className="text-red-500 text-sm mt-1">{errors.cardCvv.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Billing Information Toggle */}
          <button
            type="button"
            onClick={() => setShowBillingInfo(!showBillingInfo)}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-medium transition"
          >
            <span className="text-sm">{showBillingInfo ? "▼" : "▶"}</span>
            <span>Fatura Bilgileri (Opsiyonel)</span>
          </button>

          {/* Billing Information Section */}
          {showBillingInfo && (
            <div className="bg-green-50 rounded-lg p-5 space-y-4 border border-green-200">
              <div className="flex items-center gap-2 text-lg font-semibold text-green-800 mb-4">
                <span className="text-2xl">🧾</span>
                <span>Fatura Bilgileri</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şirket Adı
                </label>
                <input
                  type="text"
                  {...register("companyName", {
                    minLength: {
                      value: 3,
                      message: "Şirket adı en az 3 karakter olmalıdır",
                    },
                  })}
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="Şirket adını giriniz"
                />
                {errors.companyName && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vergi Numarası / TC Kimlik
                </label>
                <input
                  type="text"
                  {...register("taxNumber", {
                    pattern: {
                      value: /^[0-9]{10,11}$/,
                      message: "Geçerli bir vergi/TC numarası giriniz (10-11 hane)",
                    },
                  })}
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="10 veya 11 haneli numara"
                  maxLength="11"
                />
                {errors.taxNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.taxNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vergi Dairesi
                </label>
                <input
                  type="text"
                  {...register("taxOffice", {
                    minLength: {
                      value: 2,
                      message: "Vergi dairesi adı en az 2 karakter olmalıdır",
                    },
                  })}
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="Vergi dairesi adı"
                />
                {errors.taxOffice && (
                  <p className="text-red-500 text-sm mt-1">{errors.taxOffice.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  {...register("phone", {
                    pattern: {
                      value: /^[0-9\s()+-]{10,15}$/,
                      message: "Geçerli bir telefon numarası giriniz",
                    },
                  })}
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="5XX XXX XX XX"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres
                </label>
                <textarea
                  {...register("address", {
                    minLength: {
                      value: 10,
                      message: "Adres en az 10 karakter olmalıdır",
                    },
                  })}
                  rows="3"
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Fatura adresi"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şehir
                  </label>
                  <input
                    type="text"
                    {...register("city", {
                      minLength: {
                        value: 2,
                        message: "Şehir adı en az 2 karakter olmalıdır",
                      },
                      pattern: {
                        value: /^[A-Za-zğüşıöçĞÜŞIÖÇ\s]+$/,
                        message: "Şehir adı sadece harf içerebilir",
                      },
                    })}
                    className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="Şehir"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İlçe
                  </label>
                  <input
                    type="text"
                    {...register("district", {
                      minLength: {
                        value: 2,
                        message: "İlçe adı en az 2 karakter olmalıdır",
                      },
                      pattern: {
                        value: /^[A-Za-zğüşıöçĞÜŞIÖÇ\s]+$/,
                        message: "İlçe adı sadece harf içerebilir",
                      },
                    })}
                    className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="İlçe"
                  />
                  {errors.district && (
                    <p className="text-red-500 text-sm mt-1">{errors.district.message}</p>
                  )}
                </div>
              </div>

              <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded">
                <p className="text-sm text-green-800 flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <span>Fatura bilgileri, abonelik faturanız için kullanılacaktır.</span>
                </p>
              </div>
            </div>
          )}

          {/* Price Summary */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-100 rounded-lg p-5 border-2 border-emerald-300">
            <p className="text-xl font-bold text-emerald-800">
              Toplam Tutar: ₺{price?.toLocaleString('tr-TR') || price}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? "İşleniyor..." : "Ödemeyi Tamamla"}
            </button>
            <button
              type="button"
              onClick={() => setNewsubscriptionModel(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionPaymentForm;