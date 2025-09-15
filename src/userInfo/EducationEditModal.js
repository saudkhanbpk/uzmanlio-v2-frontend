// Education Edit Modal Component
export const EducationEditModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    institution: 'İstanbul Teknik Üniversitesi',
    degree: 'lisans',
    field: 'Bilgisayar Mühendisliği',
    startDate: '2016-09-01',
    endDate: '2020-06-01',
    current: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Eğitim güncellendi:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Eğitim Düzenle</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kurum *</label>
            <input
              type="text"
              value={formData.institution}
              onChange={(e) => setFormData({...formData, institution: e.target.value})}
              placeholder="Örn: İstanbul Teknik Üniversitesi"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Derece *</label>
            <select
              value={formData.degree}
              onChange={(e) => setFormData({...formData, degree: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Derece seçin</option>
              <option value="lisans">Lisans</option>
              <option value="yuksek-lisans">Yüksek Lisans</option>
              <option value="doktora">Doktora</option>
              <option value="on-lisans">Ön Lisans</option>
              <option value="sertifika">Sertifika Programı</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alan *</label>
            <input
              type="text"
              value={formData.field}
              onChange={(e) => setFormData({...formData, field: e.target.value})}
              placeholder="Örn: Bilgisayar Mühendisliği"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç Tarihi *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bitiş Tarihi</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={formData.current}
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="currentEdit"
              checked={formData.current}
              onChange={(e) => setFormData({...formData, current: e.target.checked})}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="currentEdit" className="ml-2 block text-sm text-gray-700">
              Halen devam ediyor
            </label>
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
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Güncelle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};