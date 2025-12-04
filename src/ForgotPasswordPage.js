import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "./services/Auth.js";

export default function ForgotPasswordPage() {
    const navigate = useNavigate();

    // Track timeouts so React won't crash during unmount
    const timers = useRef([]);
    const delay = (fn, ms) => {
        const t = setTimeout(fn, ms);
        timers.current.push(t);
        return t;
    };

    useEffect(() => {
        return () => timers.current.forEach(clearTimeout); // cleanup on unmount
    }, []);

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");

    // STEP 1 → SEND OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();

        if (!email) {
            setErrors({ email: "Geçerli bir E-Posta Adresi Girin" });
            return;
        }

        setLoading(true);
        setErrors({});
        setSuccess("");

        try {
            await auth.forgotPassword(email);

            setSuccess("Verification code sent to your email!");

            delay(() => {
                setSuccess("");
                setStep(2);
            }, 800);

        } catch (error) {
            setErrors({ email: error.message });
        } finally {
            setLoading(false);
        }
    };

    // STEP 2 → VERIFY OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (!otp || otp.length !== 6) {
            setErrors({ otp: "Please enter a valid 6-digit code" });
            return;
        }

        setLoading(true);
        setErrors({});
        setSuccess("");

        try {
            await auth.verifyOTP(email, otp);

            setSuccess("OTP verified, continue.");

            delay(() => {
                setSuccess("");
                setStep(3);
            }, 600);

        } catch (error) {
            setErrors({ otp: error.message });
        } finally {
            setLoading(false);
        }
    };

    // STEP 3 → RESET PASSWORD
    const handleResetPassword = async (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!newPassword) newErrors.newPassword = "Şifenizi Oluşturun";
        else if (newPassword.length < 8)
            newErrors.newPassword = "Password must be at least 8 characters";

        if (newPassword !== confirmPassword)
            newErrors.confirmPassword = "Passwords do not match";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});
        setSuccess("");

        try {
            await auth.resetPassword(email, otp, newPassword);

            setSuccess("Password updated! Redirecting…");

            delay(() => navigate("/login"), 900);

        } catch (error) {
            setErrors({ newPassword: error.message });
        } finally {
            setLoading(false);
        }
    };

    // RESEND CODE
    const handleResendOTP = async () => {
        setLoading(true);
        setSuccess("");

        try {
            await auth.forgotPassword(email);
            setSuccess("A new code has been sent.");
            delay(() => setSuccess(""), 2000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* LEFT SIDE */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-100 to-primary-200">
                <div className="flex-1 flex items-center justify-center p-8">
                    <img
                        src="https://images.pexels.com/photos/5475760/pexels-photo-5475760.jpeg"
                        alt="Professional woman using laptop"
                        className="max-w-full max-h-full object-cover rounded-3xl shadow-2xl"
                    />
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
                <div className="max-w-md w-full space-y-8">

                    {/* LANGUAGE SELECT */}
                    <div className="flex justify-end">
                        <select className="text-sm text-gray-600 bg-transparent border-none focus:outline-none cursor-pointer">
                            <option>TR</option>
                            <option>EN</option>
                        </select>
                    </div>

                    {/* LOGO */}
                    <div className="text-center">
                        <img
                            src="https://uzmanlio.com/images/logo.png"
                            alt="Uzmanlio Logo"
                            className="h-12 mx-auto mb-2"
                        />
                        <div className="w-12 h-1 bg-primary-500 mx-auto rounded-full"></div>
                    </div>

                    {/* PROGRESS */}
                    <div className="flex items-center justify-center space-x-4">
                        {[1, 2, 3].map((n, i) => (
                            <div key={i} className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${step >= n ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    {n}
                                </div>
                                {n < 3 && (
                                    <div className={`w-16 h-1 ${step > n ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* SUCCESS MESSAGE */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm text-center">
                            {success}
                        </div>
                    )}

                    {/* STEP 1 */}
                    {step === 1 && (
                        <form className="space-y-6" onSubmit={handleSendOTP}>
                            <div>
                                <input
                                    type="email"
                                    placeholder="E-posta adresi"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                    required
                                />
                                {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
                            >
                                {loading ? "Gönderiliyor..." : "Doğrulama Kodu Gönder"}
                            </button>

                            <div className="text-center">
                                <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700 font-semibold">
                                    ← Giriş sayfasına dön
                                </Link>
                            </div>
                        </form>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <form className="space-y-6" onSubmit={handleVerifyOTP}>
                            <div>
                                <input
                                    type="text"
                                    placeholder="6 haneli kod"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    className={`w-full px-4 py-3 border rounded-lg text-center text-2xl tracking-widest ${errors.otp ? "border-red-500" : "border-gray-300"}`}
                                    maxLength={6}
                                    required
                                />
                                {errors.otp && <p className="text-red-600 text-sm">{errors.otp}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
                            >
                                {loading ? "Doğrulanıyor..." : "Kodu Doğrula"}
                            </button>

                            <div className="text-center space-y-2">
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={loading}
                                    className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                                >
                                    Kodu tekrar gönder
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-sm text-gray-600 hover:text-gray-700 block"
                                >
                                    ← E-posta adresini değiştir
                                </button>
                            </div>
                        </form>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <form className="space-y-6" onSubmit={handleResetPassword}>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Yeni şifre"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg pr-12 ${errors.newPassword ? "border-red-500" : "border-gray-300"}`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                >
                                    👁
                                </button>
                                {errors.newPassword && <p className="text-red-600 text-sm">{errors.newPassword}</p>}
                            </div>

                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Yeni şifre (tekrar)"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg pr-12 ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                >
                                    👁
                                </button>
                                {errors.confirmPassword && (
                                    <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
                            >
                                {loading ? "Şifre Sıfırlanıyor..." : "Şifreyi Sıfırla"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
