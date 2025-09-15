import { useState } from "react";

// Expertise Component
export const Expertise = () => {
  const [skills, setSkills] = useState([
    { name: 'Dijital Pazarlama', level: 95 },
    { name: 'Web Geliştirme', level: 90 },
    { name: 'React.js', level: 88 },
    { name: 'SEO Optimizasyonu', level: 92 },
    { name: 'İçerik Pazarlama', level: 85 },
  ]);

  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showCertModal, setCertModal] = useState(false);
  const [showExpModal, setExpModal] = useState(false);
  const [showEduModal, setEduModal] = useState(false);
  const [showTitleModal, setTitleModal] = useState(false);
  const [showTitleEditModal, setTitleEditModal] = useState(false);
  const [showEduEditModal, setEduEditModal] = useState(false);
  const [showCertEditModal, setCertEditModal] = useState(false);
  
  // Files state and functionality
  const [uploadedFiles, setUploadedFiles] = useState([
    { id: 1, name: 'Google Analytics Sertifikası.pdf', type: 'pdf', size: '245 KB', uploadDate: '2024-01-15' },
    { id: 2, name: 'Diploma_Bilgisayar_Mühendisliği.pdf', type: 'pdf', size: '1.2 MB', uploadDate: '2024-01-10' },
    { id: 3, name: 'Profil_Fotoğrafı.jpg', type: 'image', size: '512 KB', uploadDate: '2024-01-12' }
  ]);
  const [isDragging, setIsDragging] = useState(false);

  // File handling functions
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    uploadFiles(files);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files);
    uploadFiles(files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const uploadFiles = (files) => {
    const validFiles = files.filter(file => {
      const isValidType = file.type.includes('pdf') || file.type.includes('image');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type.includes('pdf') ? 'pdf' : 'image',
      size: formatFileSize(file.size),
      uploadDate: new Date().toISOString().split('T')[0]
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const deleteFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getFileIcon = (type) => {
    return type === 'pdf' ? '📄' : '🖼️';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900">Uzmanlık Bilgileri</h1>

      {/* Title/Unvan */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Unvan</h3>
          <button 
            onClick={() => setTitleModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            + Unvan Ekle
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <span className="text-lg">👑</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Kıdemli Dijital Pazarlama Uzmanı</h4>
                <p className="text-sm text-gray-600">Unvan</p>
              </div>
            </div>
            <button 
              onClick={() => setTitleEditModal(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* Expertise Areas */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Uzmanlık Alanlarım</h3>
          <button 
            onClick={() => setShowSkillModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            + Yeni Alan Ekle
          </button>
        </div>
        <div className="space-y-4">
          {skills.map((skill, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                <span className="text-sm text-gray-600">{skill.level}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${skill.level}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Eğitim</h3>
          <button 
            onClick={() => setEduModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            + Eğitim Ekle
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <span className="text-2xl">🎓</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Bilgisayar Mühendisliği Lisans</h4>
              <p className="text-sm text-gray-600">İstanbul Teknik Üniversitesi • 2016-2020</p>
            </div>
            <button 
              onClick={() => setEduEditModal(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              ⚙️
            </button>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <span className="text-2xl">📚</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Dijital Pazarlama Yüksek Lisans</h4>
              <p className="text-sm text-gray-600">Boğaziçi Üniversitesi • 2020-2022</p>
            </div>
            <button 
              onClick={() => setEduEditModal(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Sertifikalar</h3>
          <button 
            onClick={() => setCertModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            + Sertifika Ekle
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="p-3 bg-primary-100 rounded-lg mr-4">
              <span className="text-2xl">🏆</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Google Analytics Sertifikası</h4>
              <p className="text-sm text-gray-600">Google • 2023</p>
            </div>
            <button 
              onClick={() => setCertEditModal(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              ⚙️
            </button>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <span className="text-2xl">📜</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">React Developer Certification</h4>
              <p className="text-sm text-gray-600">Meta • 2023</p>
            </div>
            <button 
              onClick={() => setCertEditModal(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* Experience */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Deneyim</h3>
          <button 
            onClick={() => setExpModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            + Deneyim Ekle
          </button>
        </div>
        <div className="space-y-6">
          <div className="border-l-4 border-primary-500 pl-4">
            <h4 className="font-medium text-gray-900">Kıdemli Dijital Pazarlama Uzmanı</h4>
            <p className="text-sm text-gray-600">TechCorp A.Ş. • 2020 - Devam ediyor</p>
            <p className="text-sm text-gray-700 mt-2">
              Dijital pazarlama stratejilerinin geliştirilmesi ve uygulanması, SEO optimizasyonu ve sosyal medya yönetimi.
            </p>
          </div>
          <div className="border-l-4 border-gray-300 pl-4">
            <h4 className="font-medium text-gray-900">Web Geliştirici</h4>
            <p className="text-sm text-gray-600">Freelance • 2018 - 2020</p>
            <p className="text-sm text-gray-700 mt-2">
              Müşteriler için modern web siteleri geliştirme, React.js ve Node.js teknolojileri kullanarak.
            </p>
          </div>
        </div>
      </div>

      {/* Dosyalar (Files) Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Dosyalar</h3>
        </div>
        
        {/* Information Box */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <span className="text-blue-500 text-xl">ℹ️</span>
            </div>
            <p className="text-sm text-blue-800">
              Randevu sayfanızda görünmesini istediğiniz sertifika, diploma, resim veya belgeleri bu bölümden yükleyebilirsiniz.
            </p>
          </div>
        </div>

        {/* File Upload Area */}
        <div className="mb-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-gray-100 rounded-full">
                <span className="text-3xl">📁</span>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Dosya Yükle
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  PDF veya resim dosyalarını sürükleyip bırakın veya seçin
                </p>
                <label className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition-colors">
                  <span>Dosya Seç</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Maksimum dosya boyutu: 10MB. Desteklenen formatlar: PDF, JPG, PNG, GIF
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Yüklenen Dosyalar</h4>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg">
                      <span className="text-xl">{getFileIcon(file.type)}</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{file.name}</h5>
                      <p className="text-sm text-gray-600">
                        {file.size} • Yüklendi: {new Date(file.uploadDate).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        // In a real app, this would open the file
                        console.log('Opening file:', file.name);
                      }}
                      className="text-gray-400 hover:text-primary-600 transition-colors"
                      title="Dosyayı Görüntüle"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => deleteFile(file.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Dosyayı Sil"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showTitleModal && <TitleModal onClose={() => setTitleModal(false)} />}
      {showTitleEditModal && <TitleEditModal onClose={() => setTitleEditModal(false)} />}
      {showSkillModal && <SkillModal onClose={() => setShowSkillModal(false)} />}
      {showEduModal && <EducationModal onClose={() => setEduModal(false)} />}
      {showEduEditModal && <EducationEditModal onClose={() => setEduEditModal(false)} />}
      {showCertModal && <CertificationModal onClose={() => setCertModal(false)} />}
      {showCertEditModal && <CertificationEditModal onClose={() => setCertEditModal(false)} />}
      {showExpModal && <ExperienceModal onClose={() => setExpModal(false)} />}
    </div>
  );
};