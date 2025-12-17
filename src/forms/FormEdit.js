// import { useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { Link } from "react-router-dom";
// import { mockForms } from "../utility/mockData";
// import Swal from "sweetalert2";
// // Form Edit Component
// export const FormEdit = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   // Find the form by ID (in real app, this would be an API call)
//   const existingForm = mockForms.find(form => form.id === parseInt(id));

//   const [formData, setFormData] = useState({
//     title: existingForm?.title || '',
//     description: existingForm?.description || '',
//     status: existingForm?.status || 'draft'
//   });
//   const [fields, setFields] = useState(existingForm?.fields || []);

//   const fieldTypes = [
//     { type: 'text', label: 'Metin', icon: '📝', description: 'Kısa metin girişi' },
//     { type: 'email', label: 'E-posta', icon: '📧', description: 'E-posta adresi girişi' },
//     { type: 'phone', label: 'Telefon', icon: '📞', description: 'Telefon numarası girişi' },
//     { type: 'single-choice', label: 'Tek Seçim', icon: '⚪', description: 'Seçeneklerden birini seçme' },
//     { type: 'multiple-choice', label: 'Çoklu Seçim', icon: '☑️', description: 'Birden fazla seçenek seçme' },
//     { type: 'ranking', label: 'Sıralama', icon: '🔢', description: 'Seçenekleri sıralama' },
//     { type: 'file-upload', label: 'Dosya Yükleme', icon: '📎', description: 'Dosya yükleme alanı' }
//   ];

//   if (!existingForm) {
//     return (
//       <div className="space-y-6">
//         <div className="flex items-center space-x-4">
//           <Link
//             to="/dashboard/forms"
//             className="text-gray-500 hover:text-gray-700"
//           >
//             ← Geri
//           </Link>
//           <h1 className="text-2xl font-bold text-gray-900">Form Bulunamadı</h1>
//         </div>
//         <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
//           <p className="text-gray-600">Düzenlemek istediğiniz form bulunamadı.</p>
//         </div>
//       </div>
//     );
//   }

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const addField = (fieldType) => {
//     const newField = {
//       id: Date.now(),
//       type: fieldType.type,
//       label: `${fieldType.label} Sorusu`,
//       required: false,
//       placeholder: '',
//       options: fieldType.type.includes('choice') || fieldType.type === 'ranking' ? ['Seçenek 1', 'Seçenek 2'] : undefined
//     };
//     setFields(prev => [...prev, newField]);
//   };

//   const updateField = (fieldId, updates) => {
//     setFields(prev => prev.map(field =>
//       field.id === fieldId ? { ...field, ...updates } : field
//     ));
//   };

//   const removeField = (fieldId) => {
//     setFields(prev => prev.filter(field => field.id !== fieldId));
//   };

//   const addOption = (fieldId) => {
//     const field = fields.find(f => f.id === fieldId);
//     const newOptionNumber = field.options.length + 1;
//     updateField(fieldId, {
//       options: [...field.options, `Seçenek ${newOptionNumber}`]
//     });
//   };

//   const updateOption = (fieldId, optionIndex, value) => {
//     const field = fields.find(f => f.id === fieldId);
//     const newOptions = [...field.options];
//     newOptions[optionIndex] = value;
//     updateField(fieldId, { options: newOptions });
//   };

//   const removeOption = (fieldId, optionIndex) => {
//     const field = fields.find(f => f.id === fieldId);
//     const newOptions = field.options.filter((_, index) => index !== optionIndex);
//     updateField(fieldId, { options: newOptions });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!formData.title || fields.length === 0) {
//       // alert('Lütfen form başlığını girin ve en az bir soru ekleyin.');
//       Swal.fire({
//         icon: "info",
//         title: "Lütfen form başlığını girin ve en az bir soru ekleyin."
//       })
//       return;
//     }

//     console.log('Form güncellendi:', {
//       ...existingForm,
//       ...formData,
//       fields: fields,
//       updatedAt: new Date().toISOString().split('T')[0]
//     });

//     alert('Form başarıyla güncellendi!');
//     navigate('/dashboard/forms');
//   };

//   return (

//   );
// };







import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { formService } from "../services/formService";


export const FormEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft'
  });
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  const fieldTypes = [
    { type: 'text', label: 'Metin', icon: '📝', description: 'Kısa metin girişi' },
    { type: 'email', label: 'E-posta', icon: '📧', description: 'E-posta adresi girişi' },
    { type: 'phone', label: 'Telefon', icon: '📞', description: 'Telefon numarası girişi' },
    { type: 'single-choice', label: 'Tek Seçim', icon: '⚪', description: 'Seçeneklerden birini seçme' },
    { type: 'multiple-choice', label: 'Çoklu Seçim', icon: '☑️', description: 'Birden fazla seçenek seçme' },
    { type: 'ranking', label: 'Sıralama', icon: '🔢', description: 'Seçenekleri sıralama' },
    { type: 'file-upload', label: 'Dosya Yükleme', icon: '📎', description: 'Dosya yükleme alanı' }
  ];

  // Fetch form data from API
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const form = await formService.getForm(userId, id);
        setFormData({
          title: form.title,
          description: form.description,
          status: form.status
        });
        setFields(form.fields || []);
      } catch (error) {
        console.error("Error fetching form:", error);
        Swal.fire({
          icon: 'error',
          title: 'Form yüklenemedi',
          text: error.message
        });
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [id, userId]);

  if (loading) return <p>Loading...</p>;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addField = (fieldType) => {
    const newField = {
      id: Date.now(),
      type: fieldType.type,
      label: `${fieldType.label} Sorusu`,
      required: false,
      placeholder: '',
      options: fieldType.type.includes('choice') || fieldType.type === 'ranking' ? ['Seçenek 1', 'Seçenek 2'] : undefined
    };
    setFields(prev => [...prev, newField]);
  };

  const updateField = (fieldId, updates) => {
    setFields(prev => prev.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const removeField = (fieldId) => {
    setFields(prev => prev.filter(field => field.id !== fieldId));
  };

  const addOption = (fieldId) => {
    const field = fields.find(f => f.id === fieldId);
    const newOptionNumber = field.options.length + 1;
    updateField(fieldId, {
      options: [...field.options, `Seçenek ${newOptionNumber}`]
    });
  };
  const updateOption = (fieldId, optionIndex, value) => {
    const field = fields.find(f => f.id === fieldId);
    const newOptions = [...field.options];
    newOptions[optionIndex] = value;
    updateField(fieldId, { options: newOptions });
  };
  const removeOption = (fieldId, optionIndex) => {
    const field = fields.find(f => f.id === fieldId);
    const newOptions = field.options.filter((_, index) => index !== optionIndex);
    updateField(fieldId, { options: newOptions });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || fields.length === 0) {
      return Swal.fire({
        icon: "info",
        title: "Lütfen form başlığını girin ve en az bir soru ekleyin."
      });
    }

    try {
      await formService.updateForm(userId, id, formService.formatFormData(formData, fields));

      Swal.fire({
        icon: 'success',
        title: 'Form başarıyla güncellendi!'
      });

      navigate('/dashboard/forms');
    } catch (error) {
      console.error("Update form error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Form güncellenemedi',
        text: error.message
      });
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/dashboard/forms"
          className="text-gray-500 hover:text-gray-700"
        >
          ← Geri
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Formu Düzenle</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Field Types Palette */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 sticky top-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Soru Türleri</h3>
            <div className="space-y-2">
              {fieldTypes.map(fieldType => (
                <button
                  key={fieldType.type}
                  onClick={() => addField(fieldType)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{fieldType.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{fieldType.label}</div>
                      <div className="text-xs text-gray-500">{fieldType.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form Builder */}
        <div className="lg:col-span-3 space-y-6">
          {/* Form Basic Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Form Bilgileri</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Başlığı *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Form başlığını girin..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Form açıklamasını girin..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durum
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="draft">Taslak</option>
                  <option value="active">Aktif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {fields.length === 0 ? (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz soru eklenmedi</h3>
                <p className="text-gray-600">
                  Sol taraftaki soru türlerinden birini seçerek formunuza soru eklemeye başlayın.
                </p>
              </div>
            ) : (
              fields.map((field, index) => (
                <div key={field.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {fieldTypes.find(ft => ft.type === field.type)?.icon}
                      </span>
                      <span className="text-sm font-medium text-gray-500">
                        {fieldTypes.find(ft => ft.type === field.type)?.label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => removeField(field.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Soru Metni
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    {(field.type === 'text' || field.type === 'email' || field.type === 'phone') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Placeholder
                        </label>
                        <input
                          type="text"
                          value={field.placeholder || ''}
                          onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    {(field.type === 'single-choice' || field.type === 'multiple-choice' || field.type === 'ranking') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Seçenekler
                        </label>
                        <div className="space-y-2">
                          {field.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              />
                              {field.options.length > 2 && (
                                <button
                                  onClick={() => removeOption(field.id, optionIndex)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => addOption(field.id)}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            + Seçenek Ekle
                          </button>
                        </div>
                      </div>
                    )}

                    {field.type === 'file-upload' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kabul Edilen Dosya Türleri
                        </label>
                        <input
                          type="text"
                          value={field.acceptedTypes?.join(', ') || 'pdf, doc, docx, jpg, png'}
                          onChange={(e) => updateField(field.id, {
                            acceptedTypes: e.target.value.split(',').map(type => type.trim())
                          })}
                          placeholder="pdf, doc, docx, jpg, png"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`required-${field.id}`}
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`required-${field.id}`} className="ml-2 block text-sm text-gray-700">
                        Zorunlu alan
                      </label>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              to="/dashboard/forms"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              İptal
            </Link>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {formData.status === 'active' ? 'Güncelle ve Yayınla' : 'Taslak Olarak Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
