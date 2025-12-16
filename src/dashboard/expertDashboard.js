import { useEffect, useState, useRef } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { DashboardHome } from "./dashboardHome";
import { Profile } from "../userInfo/Profile";
import { Expertise } from "../userInfo/Expertise";
import Services from "../services/services";
import { Calendar } from "../calendar";
import { Events } from "../events/events";
import { CreateEvent } from "../events/createEvent";
import { CreateService } from "../services/createServices";
import { CreatePackage } from "../createPackage";
import { Blog } from "../blogs/Blog";
import { BlogCreate } from "../blogs/BlogCreate";
import { BlogEdit } from "../blogs/BlogEdit";
import Forms from "../forms/Forms";
import { FormCreate } from "../forms/FormCreate";
import { FormEdit } from "../forms/FormEdit";
import { FormResponses } from "../forms/FormResponses";
import Customers from "../customers/Customers";
import Payments from "../payments";
import { Marketing } from "../marketing";
import Reports from "../reports";
import { Settings } from "../settings";
import { Adminactions } from "../Adminactions";
import AdminAnalytics from "./AdminAnalytics";
import { profileService } from "../services/ProfileServices";
import { useUser } from "../context/UserContext";

// Dashboard Component
export default function Dashboard({ onLogout }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // context (correct usage)
  const { user, setUser, setLoading, setError } = useUser();

  // guard ref to avoid double effects when dev HMR or strict mode mount/unmount happens
  const mountedRef = useRef(true);

  useEffect(() => {
    if (user?.subscription) {
      const adminCheck =
        user?.subscription?.plantype === "institutional" &&
        user?.subscription?.isAdmin === true;
      setIsAdmin(adminCheck);
    }
  }, [user]);

  // Computed safe values for rendering
  const fullName = [user?.information?.name ?? "", user?.information?.surname ?? ""]
    .join(" ")
    .trim();

  const profileImage = user?.pp;

  const navigation = [
    { name: "Anasayfa", href: "/dashboard", icon: "🏠" },
    { name: "Profil Bilgileri", href: "/dashboard/profile", icon: "👤" },
    {
      name: "Administrator Actions",
      href: "/dashboard/Administrator",
      icon: "👮",
      disabled: !isAdmin,
    },
    { name: "Uzmanlık Bilgileri", href: "/dashboard/expertise", icon: "🎓" },
    { name: "Hizmetlerim", href: "/dashboard/services", icon: "🛠️" },
    { name: "Takvim", href: "/dashboard/calendar", icon: "📅" },
    { name: "Etkinlikler", href: "/dashboard/events", icon: "🎯" },
    { name: "Blog", href: "/dashboard/blog", icon: "📝" },
    { name: "Testler ve Formlar", href: "/dashboard/forms", icon: "📋" },
    { name: "Müşteriler", href: "/dashboard/customers", icon: "👥" },
    { name: "Ödemeler", href: "/dashboard/payments", icon: "💳" },
    { name: "Pazarlama", href: "/dashboard/marketing", icon: "📢" },
    { name: "Raporlar", href: "/dashboard/reports", icon: "📊" },
    {
      name: "Kurum Analizi",
      href: "/dashboard/admin-analytics",
      icon: "📈",
      disabled: !isAdmin,
    },
    { name: "Hesap Ayarları", href: "/dashboard/settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 lg:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex-shrink-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <img
            src="https://uzmanlio.com/images/logo.png"
            alt="Uzmanlio Logo"
            className="h-8"
          />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <nav className="mt-8 px-4 pb-20">
          {navigation
            .filter((item) => !item.disabled)
            .map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-2 transition-colors ${location.pathname === item.href
                  ? "bg-primary-100 text-primary-700"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 bg-white">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span className="mr-3 text-lg">🚪</span>
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
                >
                  ☰
                </button>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ara..."
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </span>
                </div>

                {/* Booking URL */}
                <div className="hidden md:flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border">
                  <span className="text-primary-600 text-sm">📅</span>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Randevu URL'niz:</span>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`https://uzmanlio.com/${user?.information?.name + user?.information?.surname}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors cursor-pointer"
                        title="URL'yi yeni sekmede aç"
                      >
                        uzmanlio.com/{user?.information?.name + user?.information?.surname}
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`https://uzmanlio.com/${user?.information?.name + user?.information?.surname}`);
                          alert('URL panoya kopyalandı!');
                        }}
                        className="text-gray-400 hover:text-primary-600 transition-colors"
                        title="URL'yi Kopyala"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </div>
              </div>



              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-500 hover:text-gray-700">
                  <span className="text-xl">🔔</span>
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
                </button>

                {/* Profile Area */}
                <div className="flex items-center space-x-3">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={profileImage}
                    // onError={(e) => (e.target.src = "/default-avatar.png")}
                    alt="Profile"
                  />

                  <span className="text-sm font-medium text-gray-700">
                    {fullName || "Kullanıcı"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto bg-gray-50">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/Administrator" element={<Adminactions />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/expertise" element={<Expertise />} />
            <Route path="/services" element={<Services />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/create" element={<CreateEvent />} />
            <Route path="/etkinlikler/olustur" element={<CreateEvent />} />
            <Route path="/hizmet/olustur" element={<CreateService />} />
            <Route path="/packages/create" element={<CreatePackage />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/create" element={<BlogCreate />} />
            <Route path="/blog/edit/:id" element={<BlogEdit />} />
            <Route path="/forms" element={<Forms />} />
            <Route path="/forms/create" element={<FormCreate />} />
            <Route path="/forms/edit/:id" element={<FormEdit />} />
            <Route path="/forms/:id/responses" element={<FormResponses />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin-analytics" element={<AdminAnalytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
