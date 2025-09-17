import { useState, useEffect } from "react";
import { useExpertData } from "../hooks/useExpertData";

// Skill Edit Modal Component
export const SkillEditModal = ({ onClose, skill }) => {
  const { updateSkill, loading } = useExpertData();
  const [formData, setFormData] = useState({
    name: '',
    level: 50,
    category: '',
    description: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (skill) {
      setFormData({
        name: skill.name || '',
        level: skill.level || 50,
        category: skill.category || '',
        description: skill.description || ''
      });
    }
  }, [skill]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim()) {
      setError('Beceri adı gereklidir');
      return;
    }

    if (formData.level < 0 || formData.level > 100) {
      setError('Beceri seviyesi 0-100 arasında olmalıdır');
      return;
    }

    try {
      // TODO: Replace with real user ID from authentication context in production
      const userId = '68c94094d011cdb0e5fa2caa'; // Mock user ID for development
      
      await updateSkill(userId, skill.id, {
        name: formData.name.trim(),
        level: parseInt(formData.level),
        category: formData.category.trim(),
        description: formData.description.trim()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update skill');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Beceri Düzenle</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Beceri Adı *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Örn: React.js, Dijital Pazarlama"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Kategori seçin</option>
              <option value="technical">Teknik</option>
              <option value="marketing">Pazarlama</option>
              <option value="design">Tasarım</option>
              <option value="management">Yönetim</option>
              <option value="language">Dil</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seviye: {formData.level}%
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={formData.level}
              onChange={(e) => setFormData({...formData, level: parseInt(e.target.value)})}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Başlangıç</span>
              <span>Orta</span>
              <span>İleri</span>
              <span>Uzman</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Bu beceri hakkında kısa bir açıklama..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
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
              disabled={loading.skills}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading.skills ? 'Güncelleniyor...' : 'Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
