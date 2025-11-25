import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";

export default function DeclineInvitationPage() {
    const { token } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const hasRun = useRef(false);

    useEffect(() => {
        // Decline the invitation automatically when page loads
        if (hasRun.current) return;
        hasRun.current = true;
        handleDeclineInvitation();
    }, [token]);

    const handleDeclineInvitation = async () => {
        try {
            setLoading(true);
            setError("");

            const backendUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(
                `${backendUrl}/api/expert/decline-invitation/${token}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to decline invitation");
            }

            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Logo */}
                <div className="text-center mb-6">
                    <img
                        src="https://uzmanlio.com/images/logo.png"
                        alt="Uzmanlio Logo"
                        className="h-12 mx-auto mb-4"
                    />
                    <div className="w-12 h-1 bg-primary-500 mx-auto rounded-full"></div>
                </div>

                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">İşleniyor...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">❌</div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                            Bir Hata Oluştu
                        </h2>
                        <p className="text-red-600 mb-6">{error}</p>
                        <Link
                            to="/"
                            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                        >
                            Ana Sayfaya Dön
                        </Link>
                    </div>
                )}

                {success && !loading && (
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">✋</div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                            Davet Reddedildi
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Ekip davetini reddettiniz. Bu pencereyi kapatabilirsiniz.
                        </p>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-700">
                                Fikrinizi değiştirirseniz, davet gönderen kişiden yeni bir davet
                                isteyebilirsiniz.
                            </p>
                        </div>
                        <Link
                            to="/"
                            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                        >
                            Ana Sayfaya Dön
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
