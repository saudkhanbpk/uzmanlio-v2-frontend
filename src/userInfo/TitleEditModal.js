import { useState, useEffect } from "react";
import { useExpertData } from "../hooks/useExpertData";

export const TitleEditModal = ({ onClose, title }) => {
  const { updateTitle, loading } = useExpertData();
  const [formData, setFormData] = useState({
    title: "",
    description: ""
  });

  const [errors, setErrors] = useState({
    title: "",
    description: ""
  });

  useEffect(() => {
    if (title) {
      setFormData({
        title: title.title || "",
        description: title.description || ""
      });
    }
  }, [title]);

  const validateField = (name, value) => {
    let message = "";

    if (name === "title") {
      if (!value.trim()) {
        message = "Unvan zorunludur.";
      } else if (value.trim().length < 5) {
        message = "Unvan en az 5 karakter olmalıdır.";
      }
    }

    if (name === "description") {
      if (value.trim() && value.trim().length < 10) {
        message = "Açıklama en az 10 karakter olmalıdır.";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    validateField(name, value);
  };

  const isFormInvalid =
    errors.title ||
    errors.description ||
    formData.title.trim().length < 5;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isFormInvalid) return;

    try {
      const userId = localStorage.getItem("userId");

      await updateTitle(userId, title.id, {
        title: formData.title,
        description: formData.description
      });

      onClose();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err.message || "Güncelleme başarısız oldu."
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Unvan Düzenle</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-3">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unvan *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Örn: Kıdemli Dijital Pazarlama Uzmanı"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 
                ${errors.title ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-primary-500"}
              `}
              required
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Unvan hakkında kısa açıklama..."
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 
                ${errors.description ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-primary-500"}
              `}
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              İptal
            </button>

            <button
              type="submit"
              disabled={loading.titles || isFormInvalid}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading.titles ? "Güncelleniyor..." : "Güncelle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
