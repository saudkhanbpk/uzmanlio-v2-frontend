import { useState } from "react";
import { useExpertData } from "../hooks/useExpertData";

export const TitleModal = ({ onClose }) => {
  const { addTitle, loading } = useExpertData();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    submit: "",
  });

  // Real-Time Validation
  const validateField = (name, value) => {
    let message = "";

    if (name === "title") {
      if (!value.trim()) {
        message = "Unvan zorunludur.";
      } else if (value.length < 5) {
        message = "Unvan en az 5 karakter olmalıdır.";
      } else if (value.length > 100) {
        message = "Unvan 100 karakterden uzun olamaz.";
      } else if (!/^[A-Za-zğüşıöçĞÜŞIÖÇ0-9\s.,-]+$/.test(value)) {
        message = "Geçersiz karakter kullanılamaz.";
      }
    }

    if (name === "description") {
      if (value.trim() && value.length < 5) {
        message = "Açıklama en az 5 karakter olmalıdır.";
      } else if (value.length > 300) {
        message = "Açıklama 300 karakterden uzun olamaz.";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    validateField(name, value); // <-- REAL-TIME VALIDATION
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final check before submit
    validateField("title", formData.title);
    validateField("description", formData.description);

    // If any error exists → stop submit
    if (errors.title || errors.description) return;

    try {
      const userId = localStorage.getItem("userId");

      await addTitle(userId, {
        title: formData.title.trim(),
        description: formData.description.trim(),
      });

      onClose();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err.message || "Failed to add title",
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Unvan Ekle</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* TITLE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unvan *
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Örn: Kıdemli Dijital Pazarlama Uzmanı"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500
                ${errors.title ? "border-red-500" : "border-gray-300"}`}
            />

            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Unvan hakkında kısa açıklama..."
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500
                ${errors.description ? "border-red-500" : "border-gray-300"}`}
            />

            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>

            <button
              type="submit"
              disabled={loading.titles}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading.titles ? "Ekleniyor..." : "Ekle"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
