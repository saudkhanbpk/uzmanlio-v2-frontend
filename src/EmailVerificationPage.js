import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useUser } from './context/UserContext';

const EmailVerificationPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser } = useUser();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setMessage('Invalid verification link. No token provided.');
                setLoading(false);
                return;
            }

            try {
                const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
                const response = await fetch(`${backendUrl}/api/expert/verify-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const data = await response.json();

                if (data.success) {
                    Swal.fire({
                        title: 'Email Verified!',
                        text: 'Your email has been successfully verified.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        // Update Context immediately
                        if (data.user) {
                            setUser(data.user);
                            // Save user in localStorage for persistence
                            localStorage.setItem('user', JSON.stringify(data.user));
                        }

                        // Update UI message so success icon appears
                        setMessage('Email verified successfully');
                    });

                } else {
                    setMessage(data.message || 'Verification failed.');
                }
            } catch (error) {
                console.error('Verification error:', error);
                const errorMessage = error.message || 'Failed to verify email. Please try again.';
                setMessage(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying your email...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                <div className="mb-6">
                    {message.includes('successfully') ? (
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    ) : (
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    )}
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Verification</h2>
                    <p className="text-gray-600">{message}</p>
                </div>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                    Go to dashboard
                </button>


            </div>
        </div>
    );
};

export default EmailVerificationPage;
