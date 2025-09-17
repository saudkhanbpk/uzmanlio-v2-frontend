import { useState, useEffect, useMemo } from "react";
import { useExpertData } from "../hooks/useExpertData";
import { TitleModal } from "./TitleModal";
import { TitleEditModal } from "./TitleEditModal";
import { EducationModal } from "./EducationModal";
import { EducationEditModal } from "./EducationEditModal";
import { CertificationModal } from "./CertificationModal";
import { CertificationEditModal } from "./CertificationEditModal";
import { ExperienceModal } from "./ExperienceModal";
import { SkillModal } from "./SkillModal";
import { SkillEditModal } from "./SkillEditModal";
import { ServiceModal } from "./ServiceModal";
import { ServiceEditModal } from "./ServiceEditModal";
import { PackageModal } from "./PackageModal";
import { PackageEditModal } from "./PackageEditModal";

export const Expertise = () => {
  const {
    education,
    certificates,
    experience,
    skills,
    titles,
    services,
    packages,
    gallery,
    loading,
    errors,
    loadExpertProfile,
    deleteEducation,
    deleteCertificate,
    deleteExperience,
    deleteSkill,
    deleteTitle,
    deleteService,
    deletePackage,
    uploadGalleryFile,
    deleteGalleryFile
  } = useExpertData();

  const [showCertModal, setCertModal] = useState(false);
  const [showExpModal, setExpModal] = useState(false);
  const [showEduModal, setEduModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showTitleModal, setTitleModal] = useState(false);
  const [showTitleEditModal, setTitleEditModal] = useState(false);
  const [showEduEditModal, setEduEditModal] = useState(false);
  const [showCertEditModal, setCertEditModal] = useState(false);
  const [showSkillEditModal, setShowSkillEditModal] = useState(false);
  const [showServiceModal, setServiceModal] = useState(false);
  const [showServiceEditModal, setServiceEditModal] = useState(false);
  const [showPackageModal, setPackageModal] = useState(false);
  const [showPackageEditModal, setPackageEditModal] = useState(false);

  const [selectedEducation, setSelectedEducation] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(null);

  useEffect(() => {
    const userId = '68c94094d011cdb0e5fa2caa';
    loadExpertProfile(userId).catch(console.error);
  }, [loadExpertProfile]);

  const educationData = useMemo(() => {
    return education || [];
  }, [education]);

  const handleEditEducation = (edu) => {
    setSelectedEducation(edu);
    setEduEditModal(true);
  };

  const handleDeleteEducation = async (educationId) => {
    if (window.confirm('Bu eğitim kaydını silmek istediğinizden emin misiniz?')) {
      try {
        const userId = '68c94094d011cdb0e5fa2caa';
        await deleteEducation(userId, educationId);
      } catch (error) {
        console.error('Failed to delete education:', error);
        alert('Eğitim kaydı silinirken bir hata oluştu.');
      }
    }
  };

  const handleEditCertificate = (cert) => {
    setSelectedCertificate(cert);
    setCertEditModal(true);
  };

  const handleDeleteCertificate = async (certificateId) => {
    if (window.confirm('Bu sertifikayı silmek istediğinizden emin misiniz?')) {
      try {
        const userId = '68c94094d011cdb0e5fa2caa';
        await deleteCertificate(userId, certificateId);
      } catch (error) {
        console.error('Failed to delete certificate:', error);
        alert('Sertifika silinirken bir hata oluştu.');
      }
    }
  };

  const handleEditExperience = (exp) => {
    setSelectedExperience(exp);
    setExpModal(true);
  };

  const handleDeleteExperience = async (experienceId) => {
    if (window.confirm('Bu deneyim kaydını silmek istediğinizden emin misiniz?')) {
      try {
        const userId = '68c94094d011cdb0e5fa2caa';
        await deleteExperience(userId, experienceId);
      } catch (error) {
        console.error('Failed to delete experience:', error);
        alert('Deneyim kaydı silinirken bir hata oluştu.');
      }
    }
  };

  const handleEditSkill = (skill) => {
    setSelectedSkill(skill);
    setShowSkillEditModal(true);
  };

  const handleDeleteSkill = async (skillId) => {
    if (window.confirm('Bu beceriyi silmek istediğinizden emin misiniz?')) {
      try {
        const userId = '68c94094d011cdb0e5fa2caa';
        await deleteSkill(userId, skillId);
      } catch (error) {
        console.error('Failed to delete skill:', error);
        alert('Beceri silinirken bir hata oluştu.');
      }
    }
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setServiceEditModal(true);
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) {
      try {
        const userId = '68c94094d011cdb0e5fa2caa';
        await deleteService(userId, serviceId);
      } catch (error) {
        console.error('Failed to delete service:', error);
        alert('Hizmet silinirken bir hata oluştu.');
      }
    }
  };

  const handleEditPackage = (packageData) => {
    setSelectedPackage(packageData);
    setPackageEditModal(true);
  };

  const handleDeletePackage = async (packageId) => {
    if (window.confirm('Bu paketi silmek istediğinizden emin misiniz?')) {
      try {
        const userId = '68c94094d011cdb0e5fa2caa';
        await deletePackage(userId, packageId);
      } catch (error) {
        console.error('Failed to delete package:', error);
        alert('Paket silinirken bir hata oluştu.');
      }
    }
  };

  const handleDeleteTitle = async (titleId) => {
    if (window.confirm('Bu unvanı silmek istediğinizden emin misiniz?')) {
      try {
        const userId = '68c94094d011cdb0e5fa2caa';
        await deleteTitle(userId, titleId);
      } catch (error) {
        console.error('Failed to delete title:', error);
        alert('Unvan silinirken bir hata oluştu.');
      }
    }
  };

  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');

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

  const uploadFiles = async (files) => {
    setUploadError('');

    const validFiles = files.filter(file => {
      const isValidType = file.type.includes('pdf') || file.type.includes('image');
      const isValidSize = file.size <= 10 * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) {
      setUploadError('Lütfen geçerli dosya türleri seçin (PDF veya resim, maksimum 10MB)');
      return;
    }

    try {
      const userId = '68c94094d011cdb0e5fa2caa';
      for (const file of validFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', file.type.includes('pdf') ? 'pdf' : 'image');
        await uploadGalleryFile(userId, formData);
      }
    } catch (error) {
      console.error('Failed to upload files:', error);
      setUploadError('Dosya yükleme sırasında bir hata oluştu.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const deleteFile = async (fileId) => {
    try {
      const userId = '68c94094d011cdb0e5fa2caa';
      await deleteGalleryFile(userId, fileId);
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Dosya silinirken bir hata oluştu.');
    }
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
          {loading.titles ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Unvanlar yükleniyor...</span>
            </div>
          ) : errors.titles ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              Unvanlar yüklenirken hata oluştu: {errors.titles}
            </div>
          ) : !titles || titles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-2 block">👑</span>
              <p>Henüz unvan eklenmemiş.</p>
              <p className="text-sm">Yukarıdaki "Unvan Ekle" butonunu kullanarak unvanlarınızı ekleyebilirsiniz.</p>
            </div>
          ) : (
            titles.map((title) => (
              <div key={title.id} className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <span className="text-lg">👑</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{title.title}</h4>
                    <p className="text-sm text-gray-600">Unvan</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedTitle(title);
                    setTitleEditModal(true);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ⚙️
                </button>
              </div>
            ))
          )}
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
          {loading.skills ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Beceriler yükleniyor...</span>
            </div>
          ) : errors.skills ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              Beceriler yüklenirken hata oluştu: {errors.skills}
            </div>
          ) : !skills || skills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-2 block">🎯</span>
              <p>Henüz beceri eklenmemiş.</p>
              <p className="text-sm">Yukarıdaki "Yeni Alan Ekle" butonunu kullanarak becerilerinizi ekleyebilirsiniz.</p>
            </div>
          ) : (
            skills.map((skill) => (
              <div key={skill.id} className="space-y-2">
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
            ))
          )}
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
          {loading.education ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Eğitim bilgileri yükleniyor...</span>
            </div>
          ) : errors.education ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              Eğitim bilgileri yüklenirken hata oluştu: {errors.education}
            </div>
          ) : educationData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-2 block">🎓</span>
              <p>Henüz eğitim bilgisi eklenmemiş.</p>
              <p className="text-sm">Yukarıdaki "Eğitim Ekle" butonunu kullanarak eğitim bilgilerinizi ekleyebilirsiniz.</p>
            </div>
          ) : (
            educationData.map((edu) => (
              <div key={edu.id} className="flex items-center p-4 bg-gray-100 rounded-lg">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <span className="text-2xl">🎓</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{edu.department} {edu.level}</h4>
                  <p className="text-sm text-gray-600">{edu.name} • {edu.graduationYear}</p>
                </div>
                <button
                  onClick={() => handleEditEducation(edu)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ⚙️
                </button>
              </div>
            ))
          )}
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
          {loading.certificates ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Sertifikalar yükleniyor...</span>
            </div>
          ) : errors.certificates ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              Sertifikalar yüklenirken hata oluştu: {errors.certificates}
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-2 block">🏆</span>
              <p>Henüz sertifika eklenmemiş.</p>
              <p className="text-sm">Yukarıdaki "Sertifika Ekle" butonunu kullanarak sertifikalarınızı ekleyebilirsiniz.</p>
            </div>
          ) : (
            certificates.map((cert) => (
              <div key={cert.id} className="flex items-center p-4 bg-gray-100 rounded-lg">
                <div className="p-3 bg-primary-100 rounded-lg mr-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{cert.name}</h4>
                  <p className="text-sm text-gray-600">{cert.company} • {new Date(cert.issueDate).getFullYear()}</p>
                </div>
                <button
                  onClick={() => handleEditCertificate(cert)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ⚙️
                </button>
              </div>
            ))
          )}
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
          {loading.experience ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Deneyim bilgileri yükleniyor...</span>
            </div>
          ) : errors.experience ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              Deneyim bilgileri yüklenirken hata oluştu: {errors.experience}
            </div>
          ) : experience.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-2 block">💼</span>
              <p>Henüz deneyim bilgisi eklenmemiş.</p>
              <p className="text-sm">Yukarıdaki "Deneyim Ekle" butonunu kullanarak deneyimlerinizi ekleyebilirsiniz.</p>
            </div>
          ) : (
            experience.map((exp) => (
              <div key={exp.id} className="border-l-4 border-primary-500 pl-4">
                <h4 className="font-medium text-gray-900">{exp.position}</h4>
                <p className="text-sm text-gray-600">{exp.company} • {exp.start} - {exp.stillWork ? 'Devam ediyor' : exp.end}</p>
                {exp.description && (
                  <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Services */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Hizmetler</h3>
          <button
            onClick={() => setServiceModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            + Hizmet Ekle
          </button>
        </div>
        <div className="space-y-4">
          {loading.services ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Hizmetler yükleniyor...</span>
            </div>
          ) : errors.services ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              Hizmetler yüklenirken hata oluştu: {errors.services}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-2 block">🛠️</span>
              <p>Henüz hizmet eklenmemiş.</p>
              <p className="text-sm">Yukarıdaki "Hizmet Ekle" butonunu kullanarak hizmetlerinizi ekleyebilirsiniz.</p>
            </div>
          ) : (
            services.map((service) => (
              <div key={service.id} className="flex items-center p-4 bg-gray-100 rounded-lg">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <span className="text-2xl">🛠️</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{service.title}</h4>
                  <p className="text-sm text-gray-600">{service.description}</p>
                  <p className="text-sm text-gray-600">Fiyat: {service.price} TL • Süre: {service.duration} dakika</p>
                </div>
                <button
                  onClick={() => handleEditService(service)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ⚙️
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Packages */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Paketler</h3>
          <button
            onClick={() => setPackageModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            + Paket Ekle
          </button>
        </div>
        <div className="space-y-4">
          {loading.packages ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Paketler yükleniyor...</span>
            </div>
          ) : errors.packages ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              Paketler yüklenirken hata oluştu: {errors.packages}
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-2 block">📦</span>
              <p>Henüz paket eklenmemiş.</p>
              <p className="text-sm">Yukarıdaki "Paket Ekle" butonunu kullanarak paketlerinizi ekleyebilirsiniz.</p>
            </div>
          ) : (
            packages.map((packageData) => (
              <div key={packageData.id} className="flex items-center p-4 bg-gray-100 rounded-lg">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{packageData.title}</h4>
                  <p className="text-sm text-gray-600">{packageData.description}</p>
                  <p className="text-sm text-gray-600">Fiyat: {packageData.price} TL • Süre: {packageData.duration} dakika</p>
                </div>
                <button
                  onClick={() => handleEditPackage(packageData)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ⚙️
                </button>
              </div>
            ))
          )}
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

        {/* Error Message */}
        {uploadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {uploadError}
          </div>
        )}

        {/* Uploaded Files List */}
        {loading.gallery ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600">Dosyalar yükleniyor...</span>
          </div>
        ) : errors.gallery ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Dosyalar yüklenirken hata oluştu: {errors.gallery}
          </div>
        ) : gallery && gallery.length > 0 ? (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Yüklenen Dosyalar</h4>
            <div className="space-y-3">
              {gallery.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg">
                      <span className="text-xl">{getFileIcon(file.type)}</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{file.filename}</h5>
                      <p className="text-sm text-gray-600">
                        {file.size && formatFileSize(file.size)} • Yüklendi: {file.uploadDate ? new Date(file.uploadDate).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        if (file.path) {
                          window.open(file.path, '_blank');
                        } else {
                          console.log('Opening file:', file.filename);
                        }
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
        ) : (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-2 block">📁</span>
            <p>Henüz dosya yüklenmemiş.</p>
            <p className="text-sm">Yukarıdaki alana dosyalarınızı sürükleyip bırakın veya "Dosya Seç" butonunu kullanın.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showTitleModal && <TitleModal onClose={() => setTitleModal(false)} />}
      {showTitleEditModal && (
        <TitleEditModal
          onClose={() => {
            setTitleEditModal(false);
            setSelectedTitle(null);
          }}
          title={selectedTitle}
        />
      )}
      {showEduModal && <EducationModal onClose={() => setEduModal(false)} />}
      {showEduEditModal && (
        <EducationEditModal
          onClose={() => {
            setEduEditModal(false);
            setSelectedEducation(null);
          }}
          education={selectedEducation}
        />
      )}
      {showCertModal && <CertificationModal onClose={() => setCertModal(false)} />}
      {showCertEditModal && (
        <CertificationEditModal
          onClose={() => {
            setCertEditModal(false);
            setSelectedCertificate(null);
          }}
          certificate={selectedCertificate}
        />
      )}
      {showExpModal && <ExperienceModal onClose={() => setExpModal(false)} />}
      {showSkillModal && <SkillModal onClose={() => setShowSkillModal(false)} />}
      {showSkillEditModal && (
        <SkillEditModal
          onClose={() => {
            setShowSkillEditModal(false);
            setSelectedSkill(null);
          }}
          skill={selectedSkill}
        />
      )}
      {showServiceModal && <ServiceModal onClose={() => setServiceModal(false)} />}
      {showServiceEditModal && (
        <ServiceEditModal
          onClose={() => {
            setServiceEditModal(false);
            setSelectedService(null);
          }}
          service={selectedService}
        />
      )}
      {showPackageModal && <PackageModal onClose={() => setPackageModal(false)} />}
      {showPackageEditModal && (
        <PackageEditModal
          onClose={() => {
            setPackageEditModal(false);
            setSelectedPackage(null);
          }}
          package={selectedPackage}
        />
      )}
    </div>
  );
};