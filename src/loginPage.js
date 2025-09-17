import { useState } from "react";
import { Link } from "react-router-dom";

// Login Page Component
export default function LoginPage({ onLogin }){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login - in real app would validate credentials
    onLogin();
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
              Korvo hesabınız yok mu? 
              <Link to="https://www.uzmanlio.com/kayit-ol" className="text-primary-600 hover:text-primary-700 ml-1">
                Hemen ücretsiz hesap oluşturun
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
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                required
              />
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
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              GİRİŞ YAP
            </button>

            <div className="text-center">
              <a href="#" className="text-sm text-gray-600 hover:text-primary-600">
                Şifremi unuttum?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};