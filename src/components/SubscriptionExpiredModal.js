import React, { useState, useEffect } from 'react';
import SubscriptionPaymentForm from '../SubscriptionPaymentForm';
import PlanSelectionModal from './PlanSelectionModal';
import axios from 'axios';

export default function SubscriptionExpiredModal({ subscriptionEndDate, onClose }) {
    const [showPlanSelection, setShowPlanSelection] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [billingPeriod, setBillingPeriod] = useState('monthly');
    const [selectedSeats, setSelectedSeats] = useState(2);
    const [currentPlan, setCurrentPlan] = useState('');
    const [backendDuration, setBackendDuration] = useState('');
    const [subscriptionType, setSubscriptionType] = useState('');
    const [price, setPrice] = useState(0);

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Handle plan selection from PlanSelectionModal
    const handlePlanSelect = (planType, period, seats, calculatedPrice) => {
        setSubscriptionType(planType);
        setBillingPeriod(period);
        setSelectedSeats(seats);
        setPrice(calculatedPrice);
        setShowPlanSelection(false);
        setShowPaymentForm(true);
    };

    // Handle cancel from plan selection
    const handlePlanSelectionCancel = () => {
        setShowPlanSelection(false);
        // Logout
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        window.location.href = '/login';
    };

    return (
        <>
            {/* Main Expired Modal */}
            {!showPlanSelection && !showPaymentForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
                    <div className="relative max-w-md w-full mx-4">
                        {/* Animated gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-orange-500 to-pink-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>

                        {/* Modal content */}
                        <div className="relative bg-white rounded-2xl shadow-2xl p-8 border-4 border-red-500">
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
                                Aboneliğiniz Sona Erdi
                            </h2>

                            {/* Message */}
                            <div className="text-center space-y-3 mb-6">
                                <p className="text-gray-700">
                                    Hesabınıza erişim sağlamak için aboneliğinizi yenilemeniz gerekmektedir.
                                </p>
                                {subscriptionEndDate && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-sm text-red-800">
                                            <span className="font-semibold">Bitiş Tarihi:</span> {formatDate(subscriptionEndDate)}
                                        </p>
                                    </div>
                                )}
                                <p className="text-sm text-gray-600">
                                    Aboneliğinizi yenilemek için lütfen aşağıdaki butona tıklayın.
                                </p>
                            </div>

                            {/* Action Button */}
                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowPlanSelection(true)}
                                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                                >
                                    Aboneliği Yenile
                                </button>

                                <button
                                    onClick={() => {
                                        // Logout and redirect to login
                                        localStorage.removeItem('isAuthenticated');
                                        localStorage.removeItem('user');
                                        localStorage.removeItem('refreshToken');
                                        localStorage.removeItem('accessToken');
                                        localStorage.removeItem('userId');
                                        window.location.href = '/login';
                                    }}
                                    className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                                >
                                    Çıkış Yap
                                </button>
                            </div>

                            {/* Warning message */}
                            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-xs text-yellow-800 text-center">
                                    ⚠️ Bu pencere kapatılamaz. Devam etmek için aboneliğinizi yenilemeniz gerekmektedir.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Plan Selection Modal */}
            {showPlanSelection && (
                <PlanSelectionModal
                    onPlanSelect={handlePlanSelect}
                    onCancel={handlePlanSelectionCancel}
                />
            )}

            {/* Subscription Payment Form */}
            {showPaymentForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                        <SubscriptionPaymentForm
                            setNewsubscriptionModel={setShowPaymentForm}
                            subscriptionType={subscriptionType}
                            price={price}
                            billingPeriod={billingPeriod}
                            currentPlan={currentPlan}
                            setCurrentPlan={setCurrentPlan}
                            setSelectedSeats={setSelectedSeats}
                            setBillingPeriod={setBillingPeriod}
                            setBackendDuration={setBackendDuration}
                            selectedSeats={selectedSeats}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
