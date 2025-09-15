import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { mockForms } from "../utility/mockData";

// Form Responses Component
export const FormResponses = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const form = mockForms.find(f => f.id === parseInt(id));
  const responses = mockFormResponses[id] || [];
  
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  if (!form) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link 
            to="/dashboard/forms"
            className="text-gray-500 hover:text-gray-700"
          >
            ← Geri
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Form Bulunamadı</h1>
        </div>
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
          <p className="text-gray-600">Yanıtları görüntülemek istediğiniz form bulunamadı.</p>
        </div>
      </div>
    );
  }

  const filteredResponses = responses.filter(response =>
    response.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    response.participantEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedResponses = [...filteredResponses].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    } else if (sortBy === 'oldest') {
      return new Date(a.submittedAt) - new Date(b.submittedAt);
    } else if (sortBy === 'name') {
      return a.participantName.localeCompare(b.participantName);
    }
    return 0;
  });

  const renderResponseValue = (field, value) => {
    if (!value) return <span className="text-gray-400">Yanıt verilmedi</span>;
    
    if (field.type === 'multiple-choice') {
      return Array.isArray(value) ? value.join(', ') : value;
    }
    
    if (field.type === 'ranking') {
      return Array.isArray(value) ? value.map((item, index) => `${index + 1}. ${item}`).join(', ') : value;
    }
    
    if (field.type === 'file-upload') {
      return value ? (
        <span className="text-primary-600">📎 {value}</span>
      ) : (
        <span className="text-gray-400">Dosya yüklenmedi</span>
      );
    }
    
    return value;
  };

  const exportToCSV = () => {
    const headers = ['Katılımcı Adı', 'E-posta', 'Gönderim Tarihi', ...form.fields.map(f => f.label)];
    const csvData = [
      headers,
      ...responses.map(response => [
        response.participantName,
        response.participantEmail,
        new Date(response.submittedAt).toLocaleDateString('tr-TR'),
        ...form.fields.map(field => {
          const value = response.responses[field.id];
          if (Array.isArray(value)) {
            return value.join('; ');
          }
          return value || '';
        })
      ])
    ];
    
    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${form.title.replace(/[^a-zA-Z0-9]/g, '_')}_yanitlar.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to="/dashboard/forms"
            className="text-gray-500 hover:text-gray-700"
          >
            ← Geri
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{form.title} - Yanıtlar</h1>
            <p className="text-gray-600 mt-1">{responses.length} yanıt alındı</p>
          </div>
        </div>
        
        {responses.length > 0 && (
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            📊 CSV İndir
          </button>
        )}
      </div>

      {responses.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz yanıt yok</h3>
          <p className="text-gray-600">Bu form için henüz yanıt alınmamış.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filters and Search */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Katılımcı adı veya e-posta ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="newest">En Yeni</option>
                  <option value="oldest">En Eski</option>
                  <option value="name">İsme Göre</option>
                </select>
              </div>
            </div>
          </div>

          {/* Responses List */}
          <div className="space-y-4">
            {sortedResponses.map(response => (
              <div key={response.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{response.participantName}</h3>
                    <p className="text-gray-600">{response.participantEmail}</p>
                    <p className="text-sm text-gray-500">
                      Gönderilme: {new Date(response.submittedAt).toLocaleDateString('tr-TR')} 
                      {' '}{new Date(response.submittedAt).toLocaleTimeString('tr-TR')}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setSelectedResponse(selectedResponse === response.id ? null : response.id)}
                    className="mt-2 sm:mt-0 inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {selectedResponse === response.id ? 'Gizle' : 'Detayları Göster'}
                  </button>
                </div>
                
                {selectedResponse === response.id && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Yanıtlar:</h4>
                    <div className="space-y-4">
                      {form.fields.map(field => (
                        <div key={field.id} className="border-l-4 border-primary-200 pl-4">
                          <div className="text-sm font-medium text-gray-900 mb-1">{field.label}</div>
                          <div className="text-sm text-gray-600">
                            {renderResponseValue(field, response.responses[field.id])}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
