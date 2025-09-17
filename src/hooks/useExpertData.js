import { useCallback } from 'react';
import { useExpert, EXPERT_ACTIONS } from '../contexts/ExpertContext';
import expertService from '../services/expertService';

// Custom hook for managing expert data operations
export const useExpertData = () => {
  const { state, dispatch } = useExpert();
  
  // Helper function to handle API calls with loading and error states
  const handleApiCall = useCallback(async (field, apiCall, successAction) => {
    dispatch({ type: EXPERT_ACTIONS.SET_LOADING, payload: { field, value: true } });
    dispatch({ type: EXPERT_ACTIONS.SET_ERROR, payload: { field, error: null } });
    
    try {
      const result = await apiCall();
      if (successAction) {
        dispatch(successAction(result));
      }
      return result;
    } catch (error) {
      dispatch({ type: EXPERT_ACTIONS.SET_ERROR, payload: { field, error: error.message } });
      throw error;
    } finally {
      dispatch({ type: EXPERT_ACTIONS.SET_LOADING, payload: { field, value: false } });
    }
  }, [dispatch]);

  // Titles operations
  const loadTitles = useCallback(async (userId) => {
    return handleApiCall('titles', 
      () => expertService.getTitles(userId),
      (result) => ({ type: EXPERT_ACTIONS.SET_TITLES, payload: result.titles })
    );
  }, [handleApiCall]);

  const addTitle = useCallback(async (userId, titleData) => {
    return handleApiCall('titles',
      () => expertService.addTitle(userId, titleData),
      (result) => ({ type: EXPERT_ACTIONS.ADD_TITLE, payload: result.title })
    );
  }, [handleApiCall]);

  const updateTitle = useCallback(async (userId, titleId, titleData) => {
    return handleApiCall('titles',
      () => expertService.updateTitle(userId, titleId, titleData),
      (result) => ({ type: EXPERT_ACTIONS.UPDATE_TITLE, payload: result.title })
    );
  }, [handleApiCall]);

  const deleteTitle = useCallback(async (userId, titleId) => {
    await handleApiCall('titles',
      () => expertService.deleteTitle(userId, titleId)
    );
    dispatch({ type: EXPERT_ACTIONS.DELETE_TITLE, payload: titleId });
  }, [handleApiCall, dispatch]);

  // Categories operations
  const loadCategories = useCallback(async (userId) => {
    return handleApiCall('categories',
      () => expertService.getCategories(userId),
      (result) => ({ type: EXPERT_ACTIONS.SET_CATEGORIES, payload: result.categories })
    );
  }, [handleApiCall]);

  const addCategory = useCallback(async (userId, categoryData) => {
    return handleApiCall('categories',
      () => expertService.addCategory(userId, categoryData),
      (result) => ({ type: EXPERT_ACTIONS.ADD_CATEGORY, payload: result.category })
    );
  }, [handleApiCall]);

  const removeCategory = useCallback(async (userId, categoryId) => {
    await handleApiCall('categories',
      () => expertService.removeCategory(userId, categoryId)
    );
    dispatch({ type: EXPERT_ACTIONS.REMOVE_CATEGORY, payload: categoryId });
  }, [handleApiCall, dispatch]);

  // Education operations
  const loadEducation = useCallback(async (userId) => {
    return handleApiCall('education',
      () => expertService.getEducation(userId),
      (result) => ({ type: EXPERT_ACTIONS.SET_EDUCATION, payload: result.education })
    );
  }, [handleApiCall]);

  const addEducation = useCallback(async (userId, educationData) => {
    return handleApiCall('education',
      () => expertService.addEducation(userId, educationData),
      (result) => ({ type: EXPERT_ACTIONS.ADD_EDUCATION, payload: result.education })
    );
  }, [handleApiCall]);

  const updateEducation = useCallback(async (userId, educationId, educationData) => {
    return handleApiCall('education',
      () => expertService.updateEducation(userId, educationId, educationData),
      (result) => ({ type: EXPERT_ACTIONS.UPDATE_EDUCATION, payload: result.education })
    );
  }, [handleApiCall]);

  const deleteEducation = useCallback(async (userId, educationId) => {
    await handleApiCall('education',
      () => expertService.deleteEducation(userId, educationId)
    );
    dispatch({ type: EXPERT_ACTIONS.DELETE_EDUCATION, payload: educationId });
  }, [handleApiCall, dispatch]);

  // Certificate operations
  const loadCertificates = useCallback(async (userId) => {
    return handleApiCall('certificates',
      () => expertService.getCertificates(userId),
      (result) => ({ type: EXPERT_ACTIONS.SET_CERTIFICATES, payload: result.certificates })
    );
  }, [handleApiCall]);

  const addCertificate = useCallback(async (userId, certificateData) => {
    return handleApiCall('certificates',
      () => expertService.addCertificate(userId, certificateData),
      (result) => ({ type: EXPERT_ACTIONS.ADD_CERTIFICATE, payload: result.certificate })
    );
  }, [handleApiCall]);

  const updateCertificate = useCallback(async (userId, certificateId, certificateData) => {
    return handleApiCall('certificates',
      () => expertService.updateCertificate(userId, certificateId, certificateData),
      (result) => ({ type: EXPERT_ACTIONS.UPDATE_CERTIFICATE, payload: result.certificate })
    );
  }, [handleApiCall]);

  const deleteCertificate = useCallback(async (userId, certificateId) => {
    await handleApiCall('certificates',
      () => expertService.deleteCertificate(userId, certificateId)
    );
    dispatch({ type: EXPERT_ACTIONS.DELETE_CERTIFICATE, payload: certificateId });
  }, [handleApiCall, dispatch]);

  // Experience operations
  const loadExperience = useCallback(async (userId) => {
    return handleApiCall('experience',
      () => expertService.getExperience(userId),
      (result) => ({ type: EXPERT_ACTIONS.SET_EXPERIENCE, payload: result.experience })
    );
  }, [handleApiCall]);

  const addExperience = useCallback(async (userId, experienceData) => {
    return handleApiCall('experience',
      () => expertService.addExperience(userId, experienceData),
      (result) => ({ type: EXPERT_ACTIONS.ADD_EXPERIENCE, payload: result.experience })
    );
  }, [handleApiCall]);

  const updateExperience = useCallback(async (userId, experienceId, experienceData) => {
    return handleApiCall('experience',
      () => expertService.updateExperience(userId, experienceId, experienceData),
      (result) => ({ type: EXPERT_ACTIONS.UPDATE_EXPERIENCE, payload: result.experience })
    );
  }, [handleApiCall]);

  const deleteExperience = useCallback(async (userId, experienceId) => {
    await handleApiCall('experience',
      () => expertService.deleteExperience(userId, experienceId)
    );
    dispatch({ type: EXPERT_ACTIONS.DELETE_EXPERIENCE, payload: experienceId });
  }, [handleApiCall, dispatch]);

  // Skills operations
  const loadSkills = useCallback(async (userId) => {
    return handleApiCall('skills',
      () => expertService.getSkills(userId),
      (result) => ({ type: EXPERT_ACTIONS.SET_SKILLS, payload: result.skills })
    );
  }, [handleApiCall]);

  const addSkill = useCallback(async (userId, skillData) => {
    return handleApiCall('skills',
      () => expertService.addSkill(userId, skillData),
      (result) => ({ type: EXPERT_ACTIONS.ADD_SKILL, payload: result.skill })
    );
  }, [handleApiCall]);

  const updateSkill = useCallback(async (userId, skillId, skillData) => {
    return handleApiCall('skills',
      () => expertService.updateSkill(userId, skillId, skillData),
      (result) => ({ type: EXPERT_ACTIONS.UPDATE_SKILL, payload: result.skill })
    );
  }, [handleApiCall]);

  const deleteSkill = useCallback(async (userId, skillId) => {
    await handleApiCall('skills',
      () => expertService.deleteSkill(userId, skillId)
    );
    dispatch({ type: EXPERT_ACTIONS.DELETE_SKILL, payload: skillId });
  }, [handleApiCall, dispatch]);

  // Gallery files operations
  const loadGalleryFiles = useCallback(async (userId) => {
    return handleApiCall('galleryFiles',
      () => expertService.getGalleryFiles(userId),
      (result) => ({ type: EXPERT_ACTIONS.SET_GALLERY_FILES, payload: result.files })
    );
  }, [handleApiCall]);

  const uploadGalleryFile = useCallback(async (userId, fileData) => {
    return handleApiCall('galleryFiles',
      () => expertService.uploadGalleryFile(userId, fileData),
      (result) => ({ type: EXPERT_ACTIONS.ADD_GALLERY_FILE, payload: result.file })
    );
  }, [handleApiCall]);

  const deleteGalleryFile = useCallback(async (userId, fileId) => {
    await handleApiCall('galleryFiles',
      () => expertService.deleteGalleryFile(userId, fileId)
    );
    dispatch({ type: EXPERT_ACTIONS.DELETE_GALLERY_FILE, payload: fileId });
  }, [handleApiCall, dispatch]);

  // Services operations
  const loadServices = useCallback(async (userId) => {
    return handleApiCall('services',
      () => expertService.getServices(userId),
      (result) => ({ type: EXPERT_ACTIONS.SET_SERVICES, payload: result.services })
    );
  }, [handleApiCall]);

  const loadActiveServices = useCallback(async (userId) => {
    return handleApiCall('services',
      () => expertService.getActiveServices(userId),
      (result) => ({ type: EXPERT_ACTIONS.SET_ACTIVE_SERVICES, payload: result.services })
    );
  }, [handleApiCall]);

  const addService = useCallback(async (userId, serviceData) => {
    return handleApiCall('services',
      () => expertService.addService(userId, serviceData),
      (result) => ({ type: EXPERT_ACTIONS.ADD_SERVICE, payload: result.service })
    );
  }, [handleApiCall]);

  const updateService = useCallback(async (userId, serviceId, serviceData) => {
    return handleApiCall('services',
      () => expertService.updateService(userId, serviceId, serviceData),
      (result) => ({ type: EXPERT_ACTIONS.UPDATE_SERVICE, payload: result.service })
    );
  }, [handleApiCall]);

  const deleteService = useCallback(async (userId, serviceId) => {
    await handleApiCall('services',
      () => expertService.deleteService(userId, serviceId)
    );
    dispatch({ type: EXPERT_ACTIONS.DELETE_SERVICE, payload: serviceId });
  }, [handleApiCall, dispatch]);

  const toggleServiceActive = useCallback(async (userId, serviceId, isActive) => {
    await handleApiCall('services',
      () => expertService.toggleServiceActive(userId, serviceId, isActive)
    );
    dispatch({ type: EXPERT_ACTIONS.TOGGLE_SERVICE_ACTIVE, payload: serviceId });
  }, [handleApiCall, dispatch]);

  // Packages operations
  const loadPackages = useCallback(async (userId) => {
    return handleApiCall('packages',
      () => expertService.getPackages(userId),
      (result) => ({ type: EXPERT_ACTIONS.SET_PACKAGES, payload: result.packages })
    );
  }, [handleApiCall]);

  const loadActivePackages = useCallback(async (userId) => {
    return handleApiCall('packages',
      () => expertService.getActivePackages(userId),
      (result) => ({ type: EXPERT_ACTIONS.SET_ACTIVE_PACKAGES, payload: result.packages })
    );
  }, [handleApiCall]);

  const loadAvailablePackages = useCallback(async (userId) => {
    return handleApiCall('packages',
      () => expertService.getAvailablePackages(userId),
      (result) => ({ type: EXPERT_ACTIONS.SET_AVAILABLE_PACKAGES, payload: result.packages })
    );
  }, [handleApiCall]);

  const addPackage = useCallback(async (userId, packageData) => {
    return handleApiCall('packages',
      () => expertService.addPackage(userId, packageData),
      (result) => ({ type: EXPERT_ACTIONS.ADD_PACKAGE, payload: result.package })
    );
  }, [handleApiCall]);

  const updatePackage = useCallback(async (userId, packageId, packageData) => {
    return handleApiCall('packages',
      () => expertService.updatePackage(userId, packageId, packageData),
      (result) => ({ type: EXPERT_ACTIONS.UPDATE_PACKAGE, payload: result.package })
    );
  }, [handleApiCall]);

  const deletePackage = useCallback(async (userId, packageId) => {
    await handleApiCall('packages',
      () => expertService.deletePackage(userId, packageId)
    );
    dispatch({ type: EXPERT_ACTIONS.DELETE_PACKAGE, payload: packageId });
  }, [handleApiCall, dispatch]);

  const togglePackageAvailable = useCallback(async (userId, packageId, isAvailable) => {
    await handleApiCall('packages',
      () => expertService.togglePackageAvailable(userId, packageId, isAvailable)
    );
    dispatch({ type: EXPERT_ACTIONS.TOGGLE_PACKAGE_AVAILABLE, payload: packageId });
  }, [handleApiCall, dispatch]);

  // Bulk operations
  const loadExpertProfile = useCallback(async (userId) => {
    try {
      dispatch({ type: EXPERT_ACTIONS.SET_LOADING, payload: { field: 'profile', value: true } });

      const profile = await expertService.getExpertProfile(userId);
      const titles = await expertService.getTitles(userId);

      // Dispatch multiple actions to populate all data
      dispatch({ type: EXPERT_ACTIONS.SET_TITLE, payload: profile.title || '' });
      dispatch({ type: EXPERT_ACTIONS.SET_TITLES, payload: titles.titles || [] });
      dispatch({ type: EXPERT_ACTIONS.SET_CATEGORIES, payload: profile.expertCategories || [] });
      dispatch({ type: EXPERT_ACTIONS.SET_EDUCATION, payload: profile.education || [] });
      dispatch({ type: EXPERT_ACTIONS.SET_CERTIFICATES, payload: profile.certificates || [] });
      dispatch({ type: EXPERT_ACTIONS.SET_EXPERIENCE, payload: profile.experience || [] });
      dispatch({ type: EXPERT_ACTIONS.SET_SKILLS, payload: profile.skills || [] });
      dispatch({ type: EXPERT_ACTIONS.SET_GALLERY_FILES, payload: profile.galleryFiles || [] });
      dispatch({ type: EXPERT_ACTIONS.SET_SERVICES, payload: profile.services || [] });
      dispatch({ type: EXPERT_ACTIONS.SET_ACTIVE_SERVICES, payload: profile.activeServices || [] });
      dispatch({ type: EXPERT_ACTIONS.SET_PACKAGES, payload: profile.packages || [] });
      dispatch({ type: EXPERT_ACTIONS.SET_ACTIVE_PACKAGES, payload: profile.activePackages || [] });
      dispatch({ type: EXPERT_ACTIONS.SET_AVAILABLE_PACKAGES, payload: profile.availablePackages || [] });

      return profile;
    } catch (error) {
      dispatch({ type: EXPERT_ACTIONS.SET_ERROR, payload: { field: 'profile', error: error.message } });
      throw error;
    } finally {
      dispatch({ type: EXPERT_ACTIONS.SET_LOADING, payload: { field: 'profile', value: false } });
    }
  }, [dispatch]);

  return {
    // State
    ...state,
    
    // Titles operations
    loadTitles,
    addTitle,
    updateTitle,
    deleteTitle,
    
    // Categories operations
    loadCategories,
    addCategory,
    removeCategory,
    
    // Education operations
    loadEducation,
    addEducation,
    updateEducation,
    deleteEducation,
    
    // Certificate operations
    loadCertificates,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    
    // Experience operations
    loadExperience,
    addExperience,
    updateExperience,
    deleteExperience,

    // Skills operations
    loadSkills,
    addSkill,
    updateSkill,
    deleteSkill,

    // Gallery files operations
    loadGalleryFiles,
    uploadGalleryFile,
    deleteGalleryFile,
    
    // Services operations
    loadServices,
    loadActiveServices,
    addService,
    updateService,
    deleteService,
    toggleServiceActive,
    
    // Packages operations
    loadPackages,
    loadActivePackages,
    loadAvailablePackages,
    addPackage,
    updatePackage,
    deletePackage,
    togglePackageAvailable,
    
    // Bulk operations
    loadExpertProfile
  };
};

export default useExpertData;
