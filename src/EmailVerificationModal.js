import React, { useState, useEffect } from 'react';
import { useUser } from './context/UserContext';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const EmailVerificationModal = () => {
    const { user } = useUser();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if user is logged in but not verified
        // We check both is_verified and is_mail_valid to be safe with different schema versions
        let timer;

        // Only show on dashboard
        if (location.pathname.startsWith('/dashboard') && user && (user.is_mail_valid === false)) {
            // Check if we already skipped this session
            const skipped = sessionStorage.getItem('verificationSkipped');
            if (!skipped) {
                timer = setTimeout(() => {
                    setIsOpen(true);
                    // Pre-fill email from user info
                    if (user.information && user.information.email) {
                        setEmail(user.information.email);
                    }
                }, 5000);
            }
        }
        return () => clearTimeout(timer);
    }, [user, location.pathname]);

    const handleSendVerification = async () => {
        if (!email) {
            Swal.fire('Error', 'Please enter your email address', 'error');
            return;
        }

        setLoading(true);
        try {
            // Use the backend URL from env or default to localhost
            const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
            await axios.post(`${backendUrl}/api/expert/resend-verification`, { email });

            Swal.fire({
                title: 'Email Sent!',
                text: 'Please check your inbox for the verification link.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            setIsOpen(false);
        } catch (error) {
            console.error("Verification error:", error);
            Swal.fire('Error', error.response?.data?.message || 'Failed to send verification email', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        setIsOpen(false);
        sessionStorage.setItem('verificationSkipped', 'true');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-4">
                <div className="text-center mb-6">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                        <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Verify Your Email</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Please verify your email address to access all features.
                    </p>
                </div>

                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm disabled:opacity-50"
                        onClick={handleSendVerification}
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Verification'}
                    </button>
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                        onClick={handleSkip}
                    >
                        Skip for Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationModal;
