import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { mockForms } from "../utility/mockData";
import { formService } from "../services/formService";

// Forms Main Component
export default function Forms(){
  const [forms, setForms] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = '68c94094d011cdb0e5fa2caa'; // Mock user ID for development

  // Load forms on component mount
  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      setError(null);
      const formsData = await formService.getForms(userId);
      setForms(formsData);
    } catch (err) {
      setError('Formlar yüklenirken bir hata oluştu.');
      console.error('Error loading forms:', err);
      // Fallback to mock data
      setForms(mockForms);
    } finally {
      setLoading(false);
    }
  };

  const filteredForms = filter === 'all' 
    ? forms 
    : forms.filter(form => form.status === filter);

  const deleteForm = async (id) => {
    if (window.confirm('Bu formu silmek istediğinizden emin misiniz?')) {
      try {
        await formService.deleteForm(userId, id);
        await loadForms(); // Reload forms to reflect changes
      } catch (err) {
        alert('Form silinirken bir hata oluştu.');
        console.error('Error deleting form:', err);
      }
    }
  };

  const duplicateForm = async (form) => {
    try {
      await formService.duplicateForm(userId, form.id);
      await loadForms(); // Reload forms to reflect changes
    } catch (err) {
      alert('Form kopyalanırken bir hata oluştu.');
      console.error('Error duplicating form:', err);
    }
  };

  const updateFormStatus = async (formId, status) => {
    try {
      await formService.updateFormStatus(userId, formId, status);
      await loadForms(); // Reload forms to reflect changes
    } catch (err) {
      alert('Form durumu güncellenirken bir hata oluştu.');
      console.error('Error updating form status:', err);
    }
  };

  const copyFormUrl = async (form) => {
    try {
      await formService.copyFormShareUrl(userId, form.id);
      alert('Form URL\'si panoya kopyalandı!');
    } catch (err) {
      console.error('Error copying form URL:', err);
      alert('URL kopyalanırken bir hata oluştu.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testler ve Formlar</h1>
          <p className="text-gray-600 mt-1">Form ve anketlerinizi oluşturun, yönetin ve sonuçları analiz edin</p>
        </div>
        <Link
          to="/dashboard/forms/create"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-primary-500"
        >
          <span className="mr-2">+</span>
          Yeni Form Oluştur
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-semibold">📋</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Toplam Form</p>
              <p className="text-2xl font-semibold text-gray-900">{forms.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-semibold">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Aktif Form</p>
              <p className="text-2xl font-semibold text-gray-900">{forms.filter(f => f.status === 'active').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm font-semibold">📝</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Taslak</p>
              <p className="text-2xl font-semibold text-gray-900">{forms.filter(f => f.status === 'draft').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm font-semibold">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Toplam Katılımcı</p>
              <p className="text-2xl font-semibold text-gray-900">{forms.reduce((sum, form) => sum + form.participantCount, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Formlar yükleniyor...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Hata</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadForms}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Tekrar Dene
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {!loading && !error && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tümü ({forms.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'active' 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Aktif ({forms.filter(f => f.status === 'active').length})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'draft' 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Taslak ({forms.filter(f => f.status === 'draft').length})
          </button>
        </div>
        </div>
      )}

      {/* Forms List */}
      {!loading && !error && (
        <div className="grid gap-6">
        {filteredForms.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz form yok</h3>
            <p className="text-gray-600 mb-4">
              İlk formunuzu oluşturmak için "Yeni Form Oluştur" butonuna tıklayın.
            </p>
            <Link
              to="/dashboard/forms/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Yeni Form Oluştur
            </Link>
          </div>
        ) : (
          filteredForms.map(form => (
            <div key={form.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{form.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      form.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {form.status === 'active' ? 'Aktif' : 'Taslak'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{form.description}</p>
                  
                  <div className="flex flex-wrap items-center text-sm text-gray-600 mb-3">
                    <span className="mr-4">📊 {form.participantCount} katılımcı</span>
                    <span className="mr-4">❓ {form.fields.length} soru</span>
                    <span>📅 Oluşturulma: {new Date(form.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {form.fields.slice(0, 3).map(field => (
                      <span key={field.id} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                        {field.type === 'text' && '📝 Metin'}
                        {field.type === 'email' && '📧 E-posta'}
                        {field.type === 'phone' && '📞 Telefon'}
                        {field.type === 'single-choice' && '⚪ Tek Seçim'}
                        {field.type === 'multiple-choice' && '☑️ Çoklu Seçim'}
                        {field.type === 'ranking' && '🔢 Sıralama'}
                        {field.type === 'file-upload' && '📎 Dosya'}
                      </span>
                    ))}
                    {form.fields.length > 3 && (
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                        +{form.fields.length - 3} daha
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-4 sm:mt-0 sm:ml-4">
                  {form.participantCount > 0 && (
                    <Link
                      to={`/dashboard/forms/${form.id}/responses`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                      title="Yanıtları Görüntüle"
                    >
                      📊 Yanıtlar ({form.participantCount})
                    </Link>
                  )}
                  
                  <button
                    onClick={() => duplicateForm(form)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                    title="Kopyala"
                  >
                    📋 Kopyala
                  </button>
                  
                  <Link
                    to={`/dashboard/forms/edit/${form.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    ✏️ Düzenle
                  </Link>
                  
                  <button
                    onClick={() => deleteForm(form.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md shadow-sm text-xs font-medium text-red-700 bg-white hover:bg-red-50"
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        </div>
      )}
    </div>
  );
};
