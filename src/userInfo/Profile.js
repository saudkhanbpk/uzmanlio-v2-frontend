import axios from "axios";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useUser } from "../context/UserContext";

export const Profile = () => {
 const { user, loading, error } = useUser(); // Get user from Context

  const SERVER_URL = process.env.REACT_APP_BACKEND_URL;
  const userId = localStorage.getItem('userId') ;
  const [profile, setProfile] = useState({
    pp: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    ppFile: "", // store filename for replacement
    information: {
      name: "",
      surname: "",
      email: "",
      phone: "",
      about: "",
      address: "",
    },
    socialMedia: {
      website: "",
      linkedin: "",
      twitter: "",
      instagram: "",
      youtube: "",
      tiktok: "",
      facebook: "",
    },
    expertPaymentInfo: {
      type: false,
      owner: "",
      iban: "",
      taxNumber: "",
      taxOffice: "",
    },
  });

  // Fetch Profile
  const getProfile =  () => {
    try {
      // const res = await axios.get(`${SERVER_URL}/api/expert/${userId}`);
      if (!user) {
         console.log("User Not Available")
         return;
      }
      const res =  user 
      console.log(user)
      if (res) {
        setProfile((prevProfile) => ({
          ...prevProfile,
          // pp: res.pp || prevProfile.pp,
          ppFile: res.ppFile || "",
          information: {
            ...prevProfile.information,
            ...(res.information || {}),
          },
          socialMedia: {
            ...prevProfile.socialMedia,
            ...(res.socialMedia || {}),
          },
          expertPaymentInfo: {
            ...prevProfile.expertPaymentInfo,
            ...(res.expertPaymentInfo || {}),
          },
        }));
        Swal.fire({
          icon: "success",
          title: "Başarılı!",
          text: "Profil bilgileri başarıyla yüklendi.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      console.log("Profile fetched:", res);
    } catch (error) {
      console.error("Fetch profile failed:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: `${SERVER_URL}/api/expert/${userId}`,
      });
      Swal.fire({
        icon: "error",
        title: "Hata!",
        text: `Profil yüklenemedi: ${error.response?.data?.error || error.message}`,
      });
    }
  };

  // Profile Picture Upload
  const handleProfileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    // Get existing filename for replacement if available
    const existingFilename = profile.ppFile ? profile.ppFile.split("/").pop() : "";

    //  include /upload in the path
    const uploadUrl = `${SERVER_URL}/api/expert/${userId}/upload${existingFilename ? `?imageId=${existingFilename}` : ""}`;

    try {
      const response = await axios.post(
        uploadUrl,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Server returns the uploaded file URL under response.data.data.pp
      // and may also include expertInformation at top-level. Use fallbacks
      // and a cache-buster to force the browser to load the new file.
      const returnedFileUrl = response.data?.data?.pp || response.data?.pp || response.data?.expertInformation?.pp || "";
      const returnedFilePath = response.data?.data?.ppFile || response.data?.ppFile || response.data?.expertInformation?.ppFile || "";

      if (!returnedFileUrl) {
        console.warn("Upload succeeded but server didn't return a file URL", response.data);
      }

      const imageUrlWithCacheBuster = returnedFileUrl
        ? `${returnedFileUrl}${returnedFileUrl.includes("?") ? "&" : "?"}t=${Date.now()}`
        : profile.pp;

      setProfile(prev => ({
        ...prev,
        pp: imageUrlWithCacheBuster,
        ppFile: returnedFilePath || prev.ppFile
      }));

      console.log("Image data", imageUrlWithCacheBuster, returnedFilePath);

      Swal.fire({
        icon: "success",
        title: "Başarılı!",
        text: "Profil fotoğrafı başarıyla güncellendi.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Upload failed:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: uploadUrl,
      });
      Swal.fire({
        icon: "error",
        title: "Hata!",
        text: `Fotoğraf yüklenemedi: ${error.response?.data?.error || error.message}`,
      });
    }
  };
  // Update Profile
  const updateProfile = async () => {
    try {
      const response = await axios.put(`${SERVER_URL}/api/expert/${userId}`, {
        information: profile.information,
        socialMedia: profile.socialMedia,
        expertPaymentInfo: profile.expertPaymentInfo,
      });
      console.log("Profile updated:", response.data);
      if (response.data && response.data.expertInformation) {
        const { expertInformation } = response.data;
        setProfile((prevProfile) => ({
          ...prevProfile,
          pp: expertInformation.pp || prevProfile.pp,
          information: { ...prevProfile.information, ...(expertInformation.information || {}) },
          socialMedia: { ...prevProfile.socialMedia, ...(expertInformation.socialMedia || {}) },
          expertPaymentInfo: { ...prevProfile.expertPaymentInfo, ...(expertInformation.expertPaymentInfo || {}) },
        }));
      }
      Swal.fire({
        icon: "success",
        title: "Başarılı!",
        text: "Profil bilgileri başarıyla güncellendi.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Update failed:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      Swal.fire({
        icon: "error",
        title: "Hata!",
        text: `Güncelleme başarısız: ${error.response?.data?.error || error.message}`,
      });
    }
  };

  // Handle input changes
  const handleInputChange = (e, section, field) => {
    setProfile({
      ...profile,
      [section]: {
        ...profile[section],
        [field]: e.target.value,
      },
    });
  };

  // Handle payment type change
  const handlePaymentTypeChange = (e) => {
    setProfile({
      ...profile,
      expertPaymentInfo: {
        ...profile.expertPaymentInfo,
        type: e.target.value === "kurumsal",
      },
    });
  };

  // Call getProfile on component mount
  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900">Profil Bilgileri</h1>

      {/* Profile Photo */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              className="h-24 w-24 rounded-full object-cover"
              src={profile.pp}
              alt="Profil Fotoğrafı"
            />
            <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 transition-colors cursor-pointer">
              📷
            </label>
            <input
              id="profile-upload"
              type="file"
              accept="image/jpeg,image/png,image/gif"
              className="hidden"
              onChange={handleProfileUpload}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Profil Fotoğrafı</h3>
            <p className="text-gray-600">JPG, PNG veya GIF formatında, maksimum 5MB</p>
            <label htmlFor="profile-upload" className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium cursor-pointer">
              Fotoğraf Değiştir
            </label>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Kişisel Bilgiler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
            <input
              type="text"
              value={profile.information.name}
              onChange={(e) => handleInputChange(e, "information", "name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Soyad</label>
            <input
              type="text"
              value={profile.information.surname}
              onChange={(e) => handleInputChange(e, "information", "surname")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
            <input
              type="email"
              value={profile.information.email}
              onChange={(e) => handleInputChange(e, "information", "email")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
            <input
              type="tel"
              value={profile.information.phone}
              onChange={(e) => handleInputChange(e, "information", "phone")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Hakkımda</label>
            <textarea
              rows={4}
              value={profile.information.about}
              onChange={(e) => handleInputChange(e, "information", "about")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
            <textarea
              rows={3}
              value={profile.information.address}
              onChange={(e) => handleInputChange(e, "information", "address")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={updateProfile}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Güncelle
          </button>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sosyal Medya</h3>
        <div className="space-y-4">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <span className="mr-2 text-lg">🔗</span>
              Website
            </label>
            <input
              type="url"
              value={profile.socialMedia.website}
              onChange={(e) => handleInputChange(e, "socialMedia", "website")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <span className="mr-2 text-lg">💼</span>
              LinkedIn
            </label>
            <input
              type="url"
              value={profile.socialMedia.linkedin}
              onChange={(e) => handleInputChange(e, "socialMedia", "linkedin")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <span className="mr-2 text-lg">🐦</span>
              Twitter
            </label>
            <input
              type="url"
              value={profile.socialMedia.twitter}
              onChange={(e) => handleInputChange(e, "socialMedia", "twitter")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <span className="mr-2 text-lg">📸</span>
              Instagram
            </label>
            <input
              type="url"
              value={profile.socialMedia.instagram}
              onChange={(e) => handleInputChange(e, "socialMedia", "instagram")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <span className="mr-2 text-lg">📺</span>
              YouTube
            </label>
            <input
              type="url"
              value={profile.socialMedia.youtube}
              onChange={(e) => handleInputChange(e, "socialMedia", "youtube")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <span className="mr-2 text-lg">🎵</span>
              TikTok
            </label>
            <input
              type="url"
              value={profile.socialMedia.tiktok}
              onChange={(e) => handleInputChange(e, "socialMedia", "tiktok")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <span className="mr-2 text-lg">👥</span>
              Facebook
            </label>
            <input
              type="url"
              value={profile.socialMedia.facebook}
              onChange={(e) => handleInputChange(e, "socialMedia", "facebook")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={updateProfile}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Güncelle
          </button>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ödeme Bilgilerim</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hesap Türü *
            </label>
            <select
              value={profile.expertPaymentInfo.type ? "kurumsal" : "bireysel"}
              onChange={handlePaymentTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Hesap türü seçin</option>
              <option value="bireysel">Bireysel</option>
              <option value="kurumsal">Kurumsal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ad Soyad / Şirket Unvanı *
            </label>
            <input
              type="text"
              value={profile.expertPaymentInfo.owner}
              onChange={(e) => handleInputChange(e, "expertPaymentInfo", "owner")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IBAN Numarası *
            </label>
            <input
              type="text"
              value={profile.expertPaymentInfo.iban}
              onChange={(e) => handleInputChange(e, "expertPaymentInfo", "iban")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TCKN / Vergi No *
            </label>
            <input
              type="text"
              value={profile.expertPaymentInfo.taxNumber}
              onChange={(e) => handleInputChange(e, "expertPaymentInfo", "taxNumber")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vergi Dairesi
            </label>
            <input
              type="text"
              value={profile.expertPaymentInfo.taxOffice}
              onChange={(e) => handleInputChange(e, "expertPaymentInfo", "taxOffice")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={updateProfile}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Güncelle
          </button>
        </div>
      </div>
    </div>
  );
};