import { useState, useEffect } from "react";
import { useExpertData } from "../hooks/useExpertData";

// Certification Edit Modal Component
export const CertificationEditModal = ({ onClose, certificate }) => {
  const { updateCertificate, loading } = useExpertData();
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    date: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (certificate) {
      setFormData({
        name: certificate.name || '',
        issuer: certificate.company || '',
        date: certificate.issueDate ? new Date(certificate.issueDate).toISOString().split('T')[0] : '',
        expiryDate: certificate.expiryDate ? new Date(certificate.expiryDate).toISOString().split('T')[0] : '',
        credentialId: certificate.credentialId || '',
        credentialUrl: certificate.credentialUrl || ''
      });
    }
  }, [certificate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // For now, using a mock userId - in a real app, this would come from auth context
      const userId = '68c94094d011cdb0e5fa2caa'; // Mock user ID

      const certificateData = {
        name: formData.name,
        company: formData.issuer,
        issueDate: formData.date ? new Date(formData.date) : null,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
        credentialId: formData.credentialId,
        credentialUrl: formData.credentialUrl
      };

      await updateCertificate(userId, certificate.id, certificateData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update certificate');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Sertifika Düzenle</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sertifika Adı *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Örn: Google Analytics Sertifikası"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Veren Kurum *</label>
            <input
              type="text"
              value={formData.issuer}
              onChange={(e) => setFormData({...formData, issuer: e.target.value})}
              placeholder="Örn: Google"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alınma Tarihi *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Geçerlilik Süresi</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
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
              disabled={loading.certificates}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading.certificates ? 'Güncelleniyor...' : 'Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
