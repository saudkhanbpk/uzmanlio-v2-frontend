import React from "react";
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
  } = useForm();

  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const userId = "68c94094d011cdb0e5fa2caa";

  // Local price configs (same as Settings.js)
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

  // ✅ Main Submit Function
  const onSubmit = async (formData) => {
    const normalizedPlan = (subscriptionType || currentPlan || "").toLowerCase();
    const normalizedDuration = (billingPeriod || "monthly").toLowerCase();

    const data = {
      ...formData,
      plantype: normalizedPlan, // match backend model
      duration: normalizedDuration, // match backend model
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
        console.log("User after subscription:",response.data.user)
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

            // ✅ Update frontend states to reflect the newly active plan
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
              title: "Success",
              text: "Package Subscribed Successfully",
            });
          } else {
            setCurrentPlan("");
            setBackendDuration("");
            Swal.fire({
              icon: "info",
              title: "Subscription expired",
              text: "Your subscription is expired or invalid.",
            });
          }
        } else {
          setCurrentPlan("");
          setBackendDuration("");
          Swal.fire({
            icon: "info",
            title: "No subscription found",
            text: "Could not find active subscription data.",
          });
        }
      }

      reset();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          error.message ||
          "Something went wrong while processing your subscription",
      });
    } finally {
      setNewsubscriptionModel(false);
    }
  };

  return (
    <div className="w-full flex align-center justify-center p-4 bg-white rounded-lg shadow-md">
      <form
        className="w-full flex flex-col align-center justify-center"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="w-full text-center text-2xl font-semibold mb-8">
          Subscription Payment Form
        </h2>

        <div className="mb-4 w-full flex gap-5 justify-between items-center">
          <div className="flex flex-col w-full">
            <label>Card Holder Name :</label>
            <input
              className="p-2 rounded-md bg-gray-100 border-gray-200 border"
              {...register("cardHolderName", { required: true })}
            />
            {errors.cardHolderName && (
              <p className="text-red-500 text-sm mt-1">
                Card Holder Name is required
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col w-full mb-2">
          <label>Card Number :</label>
          <input
            className="p-2 rounded-md bg-gray-100 border-gray-200 border"
            {...register("cardNumber", { required: true })}
          />
          {errors.cardNumber && (
            <p className="text-red-500 text-sm mt-1">Card Number is required</p>
          )}
        </div>

        <div className="mb-4 mt-4 w-full gap-3 flex justify-between items-center">
          <div className="flex flex-col w-full">
            <label>Expiry Date :</label>
            <input
              type="month"
              className="p-2 rounded-md bg-gray-100 border-gray-200 border"
              {...register("cardExpiry", { required: true })}
            />
            {errors.cardExpiry && (
              <p className="text-red-500 text-sm mt-1">
                Expiry Date is required
              </p>
            )}
          </div>

          <div className="flex flex-col w-full">
            <label>CVV :</label>
            <input
              className="p-2 rounded-md bg-gray-100 border-gray-200 border"
              {...register("cardCvv", { required: true })}
            />
            {errors.cardCvv && (
              <p className="text-red-500 text-sm mt-1">CVV is required</p>
            )}
          </div>
        </div>

        <div className="flex flex-row w-full mb-2">
          <button
            className="w-[100%] mx-5 rounded-xl py-3 px-3 mt-3 bg-green-400 hover:bg-green-500 cursor-pointer"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing Payment..." : "Proceed"}
          </button>

          <button
            type="button"
            className="w-[100%] mx-5 rounded-xl py-3 px-3 mt-3 bg-gray-300 hover:bg-gray-400 cursor-pointer"
            disabled={isSubmitting}
            onClick={() => setNewsubscriptionModel(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubscriptionPaymentForm;
