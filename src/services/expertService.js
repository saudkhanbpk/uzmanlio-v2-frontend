// API service for expert information
const SERVER_URL = process.env.REACT_APP_BACKEND_URL;
class ExpertService {
  // Helper method for API calls
  async apiCall(endpoint, options = {}) {
    const url = `${SERVER_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Titles operations
  async getTitles(userId) {
    return this.apiCall(`/api/expert/${userId}/titles`);
  }

  async addTitle(userId, titleData) {
    return this.apiCall(`/api/expert/${userId}/titles`, {
      method: 'POST',
      body: JSON.stringify(titleData),
    });
  }

  async updateTitle(userId, titleId, titleData) {
    return this.apiCall(`/api/expert/${userId}/titles/${titleId}`, {
      method: 'PUT',
      body: JSON.stringify(titleData),
    });
  }

  async deleteTitle(userId, titleId) {
    return this.apiCall(`/api/expert/${userId}/titles/${titleId}`, {
      method: 'DELETE',
    });
  }

  // Categories operations
  async getCategories(userId) {
    return this.apiCall(`/api/expert/${userId}/categories`);
  }

  async addCategory(userId, categoryData) {
    return this.apiCall(`/api/expert/${userId}/categories`, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async removeCategory(userId, categoryId) {
    return this.apiCall(`/api/expert/${userId}/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }

  // Education operations
  async getEducation(userId) {
    return this.apiCall(`/api/expert/${userId}/education`);
  }

  async addEducation(userId, educationData) {
    return this.apiCall(`/api/expert/${userId}/education`, {
      method: 'POST',
      body: JSON.stringify(educationData),
    });
  }

  async updateEducation(userId, educationId, educationData) {
    return this.apiCall(`/api/expert/${userId}/education/${educationId}`, {
      method: 'PUT',
      body: JSON.stringify(educationData),
    });
  }

  async deleteEducation(userId, educationId) {
    return this.apiCall(`/api/expert/${userId}/education/${educationId}`, {
      method: 'DELETE',
    });
  }

  // Certificate operations
  async getCertificates(userId) {
    return this.apiCall(`/api/expert/${userId}/certificates`);
  }

  async addCertificate(userId, certificateData) {
    return this.apiCall(`/api/expert/${userId}/certificates`, {
      method: 'POST',
      body: JSON.stringify(certificateData),
    });
  }

  async updateCertificate(userId, certificateId, certificateData) {
    return this.apiCall(`/api/expert/${userId}/certificates/${certificateId}`, {
      method: 'PUT',
      body: JSON.stringify(certificateData),
    });
  }

  async deleteCertificate(userId, certificateId) {
    return this.apiCall(`/api/expert/${userId}/certificates/${certificateId}`, {
      method: 'DELETE',
    });
  }

  // Experience operations
  async getExperience(userId) {
    return this.apiCall(`/api/expert/${userId}/experience`);
  }

  async addExperience(userId, experienceData) {
    return this.apiCall(`/api/expert/${userId}/experience`, {
      method: 'POST',
      body: JSON.stringify(experienceData),
    });
  }

  async updateExperience(userId, experienceId, experienceData) {
    return this.apiCall(`/api/expert/${userId}/experience/${experienceId}`, {
      method: 'PUT',
      body: JSON.stringify(experienceData),
    });
  }

  async deleteExperience(userId, experienceId) {
    return this.apiCall(`/api/expert/${userId}/experience/${experienceId}`, {
      method: 'DELETE',
    });
  }

  // Skills operations
  async getSkills(userId) {
    return this.apiCall(`/api/expert/${userId}/skills`);
  }

  async addSkill(userId, skillData) {
    return this.apiCall(`/api/expert/${userId}/skills`, {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
  }

  async updateSkill(userId, skillId, skillData) {
    return this.apiCall(`/api/expert/${userId}/skills/${skillId}`, {
      method: 'PUT',
      body: JSON.stringify(skillData),
    });
  }

  async deleteSkill(userId, skillId) {
    return this.apiCall(`/api/expert/${userId}/skills/${skillId}`, {
      method: 'DELETE',
    });
  }

  // Gallery files operations
  async getGalleryFiles(userId) {
    return this.apiCall(`/api/expert/${userId}/gallery`);
  }

  async uploadGalleryFile(userId, fileData) {
    const formData = new FormData();
    formData.append('file', fileData.file);
    formData.append('description', fileData.description || '');
    formData.append('type', fileData.type || 'image');

    return this.apiCall(`/api/expert/${userId}/gallery`, {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  async deleteGalleryFile(userId, fileId) {
    return this.apiCall(`/api/expert/${userId}/gallery/${fileId}`, {
      method: 'DELETE',
    });
  }

  // Services operations
  async getServices(userId) {
    return this.apiCall(`/api/expert/${userId}/services`);
  }

  async getActiveServices(userId) {
    return this.apiCall(`/api/expert/${userId}/services/active`);
  }

  async addService(userId, serviceData) {
    return this.apiCall(`/api/expert/${userId}/services`, {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  async updateService(userId, serviceId, serviceData) {
    return this.apiCall(`/api/expert/${userId}/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    });
  }

  async deleteService(userId, serviceId) {
    return this.apiCall(`/api/expert/${userId}/services/${serviceId}`, {
      method: 'DELETE',
    });
  }

  async toggleServiceActive(userId, serviceId, isActive) {
    return this.apiCall(`/api/expert/${userId}/services/${serviceId}/toggle-active`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  // Packages operations
  async getPackages(userId) {
    return this.apiCall(`/api/expert/${userId}/packages`);
  }

  async getActivePackages(userId) {
    return this.apiCall(`/api/expert/${userId}/packages/active`);
  }

  async getAvailablePackages(userId) {
    return this.apiCall(`/api/expert/${userId}/packages/available`);
  }

  async addPackage(userId, packageData) {
    return this.apiCall(`/api/expert/${userId}/packages`, {
      method: 'POST',
      body: JSON.stringify(packageData),
    });
  }

  async updatePackage(userId, packageId, packageData) {
    return this.apiCall(`/api/expert/${userId}/packages/${packageId}`, {
      method: 'PUT',
      body: JSON.stringify(packageData),
    });
  }

  async deletePackage(userId, packageId) {
    return this.apiCall(`/api/expert/${userId}/packages/${packageId}`, {
      method: 'DELETE',
    });
  }

  async togglePackageAvailable(userId, packageId, isAvailable) {
    return this.apiCall(`/api/expert/${userId}/packages/${packageId}/toggle-available`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable }),
    });
  }

  // Bulk operations
  async getExpertProfile(userId) {
    return this.apiCall(`/api/expert/${userId}/profile`);
  }

  async updateExpertProfile(userId, profileData) {
    return this.apiCall(`/api/expert/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }
}

// Create and export a singleton instance
const expertService = new ExpertService();
export default expertService;
