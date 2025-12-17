import { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from './services/Auth.js';
import { useUser } from "./context/UserContext.js"
import SubscriptionExpiredModal from "./components/SubscriptionExpiredModal.js";


// Login Page Component
export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { setUser, loading, error } = useUser(); // Get user from Context

  // Validation functions
  const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError('Geçerli bir e-posta adresi giriniz.');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload

    const formData = { email, password };
    setIsLoading(true); // Start loading

    try {
      // auth.login now returns { user, accessToken, refreshToken }
      const authData = await auth.login(formData);
      setUser(authData.user);

      // Pass full auth data to App.js for AuthContext
      onLogin(authData);

    } catch (error) {
      console.error("Login failed:", error.message);

      // Check if error is due to expired subscription
      if (error.message === "SUBSCRIPTION_EXPIRED") {
        const endDate = localStorage.getItem("subscriptionEndDate") || sessionStorage.getItem("subscriptionEndDate");
        setSubscriptionEndDate(endDate);
        setShowSubscriptionModal(true);
        setIsLoading(false); // Stop loading
        return; // Don't proceed with login
      }

      // Optionally show toast or message to user for other errors
    } finally {
      setIsLoading(false); // Stop loading in all cases
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-100 to-primary-200">
        <div className="flex-1 flex items-center justify-center p-8">
          <img
            src="https://images.pexels.com/photos/5475760/pexels-photo-5475760.jpeg"
            alt="Professional woman using laptop"
            className="max-w-full max-h-full object-cover rounded-3xl shadow-2xl"
          />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="max-w-md w-full space-y-8">
          {/* Language Selector */}
          <div className="flex justify-end">
            <select className="text-sm text-gray-600 bg-transparent border-none focus:outline-none cursor-pointer">
              <option>TR</option>
              <option>EN</option>
            </select>
          </div>

          {/* Logo */}
          <div className="text-center">
            <img
              src="https://uzmanlio.com/images/logo.png"
              alt="Uzmanlio Logo"
              className="h-12 mx-auto mb-2"
            />
            <div className="w-12 h-1 bg-primary-500 mx-auto rounded-full"></div>
          </div>

          {/* Welcome Message */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Hoş geldiniz!</h2>
            <p className="text-gray-600 text-sm">
              Hesabınız yok mu?
              <Link to="/signup" className="text-primary-600 hover:text-primary-700 ml-1 font-semibold">
                Hemen kaydolun
              </Link>
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <input
                type="email"
                placeholder="E-posta adresi"
                value={email}
                onChange={handleEmailChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Giriş yapılıyor...
                </>
              ) : (
                'GİRİŞ YAP'
              )}
            </button>

            <div className="text-center">
              <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-primary-600">
                Şifremi unuttum?
              </Link>
            </div>
          </form>

          {/* Signup Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Hesabınız yok mu?{' '}
              <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-semibold">
                Kaydolun
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Expired Modal */}
      {showSubscriptionModal && (
        <SubscriptionExpiredModal subscriptionEndDate={subscriptionEndDate} />
      )}
    </div>
  );
}