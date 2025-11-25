import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function AcceptInvitationPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [invitationDetails, setInvitationDetails] = useState(null);

    const hasRun = useRef(false);

    useEffect(() => {
        // Accept the invitation automatically when page loads
        if (hasRun.current) return;
        hasRun.current = true;
        handleAcceptInvitation();
    }, [token]);

    const handleAcceptInvitation = async () => {
        try {
            setLoading(true);
            setError("");

            const backendUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(
                `${backendUrl}/api/expert/accept-invitation/${token}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to accept invitation");
            }

            setSuccess(true);
            setInvitationDetails(data);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
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
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Davet işleniyor...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">❌</div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                            Davet Kabul Edilemedi
                        </h2>
                        <p className="text-red-600 mb-6">{error}</p>
                        <Link
                            to="/"
                            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                        >
                            Ana Sayfaya Dön
                        </Link>
                    </div>
                )}

                {success && !loading && (
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">✅</div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                            Davet Kabul Edildi!
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Ekibe başarıyla katıldınız. Giriş sayfasına yönlendiriliyorsunuz...
                        </p>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-green-700">
                                <strong>Bilgi:</strong> Hesabınıza giriş yaparak ekip
                                özelliklerine erişebilirsiniz.
                            </p>
                        </div>
                        <Link
                            to="/login"
                            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                        >
                            Giriş Yap
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
