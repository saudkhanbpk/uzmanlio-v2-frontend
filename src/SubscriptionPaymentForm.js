import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import axios from "axios";

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

    const data = {
      ...formData,
      plantype: normalizedPlan,
      duration: normalizedDuration,
      price: price ?? 0,
      selectedSeats,
    };

    console.log("Final Payload Sent to Backend:", data);

    try {
      const response = await axios.post(
        `${backendUrl}/api/expert/${userId}/new-subscription`,
        data
      );

      if (response.status === 200) {
        const user = response.data.user;
        console.log("User after subscription:", response.data.user)
        const currentSubscription = user.subscription ?? user.Subscription ?? undefined;

        if (currentSubscription && currentSubscription.endDate) {
          const endTs = new Date(currentSubscription.endDate).getTime();
          if (!Number.isNaN(endTs) && endTs > Date.now()) {
            const planFromBackendRaw =
              currentSubscription.plantype ?? currentSubscription.Plantype ?? "";
            const durationFromBackendRaw =
              currentSubscription.duration ?? currentSubscription.Duration ?? "";

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
      }

      reset();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Hata",
        text:
          error?.response?.data?.message ||
          error.message ||
          "Abonelik işlemi sırasında bir hata oluştu",
      });
    } finally {
      setNewsubscriptionModel(false);
    }
  };

  return (
    <div className="w-full flex align-center justify-center p-4 bg-white rounded-lg shadow-md max-h-[80vh] overflow-y-auto">
      <form
        className="w-full flex flex-col align-center justify-center"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="w-full text-center text-2xl font-semibold mb-6">
          Abonelik Ödeme Formu
        </h2>

        {/* Card Information Section */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-4">💳 Kart Bilgileri</h3>

          <div className="mb-4 w-full flex gap-5 justify-between items-center">
            <div className="flex flex-col w-full">
              <label>Kart Sahibi Adı :</label>
              <input
                className="p-2 rounded-md bg-white border-gray-200 border"
                {...register("cardHolderName", {
                  required: "Kart sahibi adı gerekli",
                  pattern: {
                    value: /^[A-Za-zğüşıöçĞÜŞIÖÇ\s]+$/,
                    message: "Sadece harf kullanılabilir",
                  },
                  minLength: {
                    value: 3,
                    message: "En az 3 karakter olmalı",
                  },
                })}
              />
              {errors.cardHolderName && (
                <p className="text-red-500 text-sm mt-1">{errors.cardHolderName.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col w-full mb-4">
            <label>Kart Numarası :</label>
            <input
              className="p-2 rounded-md bg-white border-gray-200 border"
              maxLength={16}
              placeholder="1234 5678 9012 3456"
              {...register("cardNumber", {
                required: "Kart numarası gerekli",
                pattern: {
                  value: /^[0-9]{16}$/,
                  message: "Kart numarası 16 haneli olmalı",
                },
              })}
            />
            {errors.cardNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.cardNumber.message}</p>
            )}
          </div>

          <div className="mb-4 w-full gap-3 flex justify-between items-center">
            <div className="flex flex-col w-full">
              <label>Son Kullanım :</label>
              <input
                type="month"
                className="p-2 rounded-md bg-white border-gray-200 border"
                {...register("cardExpiry", {
                  required: "Son kullanım tarihi gerekli",
                })}
              />
              {errors.cardExpiry && (
                <p className="text-red-500 text-sm mt-1">{errors.cardExpiry.message}</p>
              )}
            </div>

            <div className="flex flex-col w-full">
              <label>CVV :</label>
              <input
                className="p-2 rounded-md bg-white border-gray-200 border"
                maxLength={3}
                placeholder="123"
                {...register("cardCvv", {
                  required: "CVV gerekli",
                  pattern: {
                    value: /^[0-9]{3}$/,
                    message: "CVV 3 haneli olmalı",
                  },
                })}
              />
              {errors.cardCvv && (
                <p className="text-red-500 text-sm mt-1">{errors.cardCvv.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Billing Information Toggle */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowBillingInfo(!showBillingInfo)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            {showBillingInfo ? "▼" : "▶"} Fatura Bilgileri (Opsiyonel)
          </button>
        </div>

        {/* Billing Information Section */}
        {showBillingInfo && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-lg font-medium mb-4">🧾 Fatura Bilgileri</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Şirket Adı</label>
                <input
                  className="p-2 rounded-md bg-white border-gray-200 border"
                  placeholder="Şirket veya kişi adı"
                  {...register("companyName", {
                    minLength: {
                      value: 3,
                      message: "Şirket adı en az 3 karakter olmalı",
                    },
                  })}

                />
                {errors.companyName && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Vergi Numarası / TC Kimlik</label>
                <input
                  className="p-2 rounded-md bg-white border-gray-200 border"
                  placeholder="10 veya 11 haneli"
                  maxLength={11}
                  {...register("taxNumber", {
                    pattern: {
                      value: /^[0-9]{10,11}$/,
                      message: "Vergi numarası 10 veya 11 haneli olmalı",
                    },
                  })}
                />
                {errors.taxNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.taxNumber.message}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Vergi Dairesi</label>
                <input
                  className="p-2 rounded-md bg-white border-gray-200 border"
                  placeholder="Vergi dairesi adı"
                  {...register("taxOffice", {
                    minLength: {
                      value: 2,
                      message: "Vergi dairesi adı çok kısa",
                    },
                  })}
                />
                {errors.taxOffice && (
                  <p className="text-red-500 text-sm mt-1">{errors.taxOffice.message}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Telefon</label>
                <input
                  className="p-2 rounded-md bg-white border-gray-200 border"
                  placeholder="0512 345 6789"
                  {...register("phoneNumber", {
                    pattern: {
                      value: /^[0-9\s()+-]{10,15}$/,
                      message: "Telefon formatı geçersiz",
                    },
                  })}

                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div className="flex flex-col col-span-2">
                <label className="text-sm text-gray-600 mb-1">Adres</label>
                <input
                  className="p-2 rounded-md bg-white border-gray-200 border"
                  placeholder="Fatura adresi"
                  {...register("address", {
                    minLength: {
                      value: 5,
                      message: "Adres çok kısa",
                    },
                  })}

                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Şehir</label>
                <input
                  className="p-2 rounded-md bg-white border-gray-200 border"
                  placeholder="İstanbul"
                  {...register("city", {
                    minLength: {
                      value: 2,
                      message: "Şehir adı çok kısa",
                    },
                    pattern: {
                      value: /^[A-Za-zğüşıöçĞÜŞIÖÇ\s]+$/,
                      message: "Şehir sadece harf içerebilir",
                    },
                  })}

                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">İlçe</label>
                <input
                  className="p-2 rounded-md bg-white border-gray-200 border"
                  placeholder="Kadıköy"
                  {...register("district", {
                    minLength: {
                      value: 2,
                      message: "İlçe adı çok kısa",
                    },
                    pattern: {
                      value: /^[A-Za-zğüşıöçĞÜŞIÖÇ\s]+$/,
                      message: "İlçe sadece harf içerebilir",
                    },
                  })}

                />
                 {errors.district && (
                  <p className="text-red-500 text-sm mt-1">{errors.district.message}</p>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              💡 Fatura bilgileri, abonelik faturanız için kullanılacaktır.
            </p>
          </div>
        )}

        {/* Price Summary */}
        <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-100">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Toplam Tutar:</span>
            <span className="text-2xl font-bold text-green-600">₺{price?.toLocaleString('tr-TR') || price}</span>
          </div>
        </div>

        <div className="flex flex-row w-full mb-2 gap-3">
          <button
            className="w-[100%] rounded-xl py-3 px-3 bg-green-500 hover:bg-green-600 text-white font-medium cursor-pointer transition-colors"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "İşleniyor..." : "Ödemeyi Tamamla"}
          </button>

          <button
            type="button"
            className="w-[100%] rounded-xl py-3 px-3 bg-gray-300 hover:bg-gray-400 cursor-pointer transition-colors"
            disabled={isSubmitting}
            onClick={() => setNewsubscriptionModel(false)}
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubscriptionPaymentForm;
