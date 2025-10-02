// Form Service - API calls for forms management
const API_BASE_URL = 'http://localhost:4000/api/expert-information';

export const formService = {
  // Get all forms for a user
  async getForms(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/forms`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.forms || [];
    } catch (error) {
      console.error('Error fetching forms:', error);
      throw error;
    }
  },

  // Get forms by status
  async getFormsByStatus(userId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/forms/status/${status}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.forms || [];
    } catch (error) {
      console.error('Error fetching forms by status:', error);
      throw error;
    }
  },

  // Get single form by ID
  async getForm(userId, formId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/forms/${formId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.form;
    } catch (error) {
      console.error('Error fetching form:', error);
      throw error;
    }
  },

  // Create new form
  async createForm(userId, formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.form;
    } catch (error) {
      console.error('Error creating form:', error);
      throw error;
    }
  },

  // Update form
  async updateForm(userId, formId, formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/forms/${formId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.form;
    } catch (error) {
      console.error('Error updating form:', error);
      throw error;
    }
  },

  // Update form status
  async updateFormStatus(userId, formId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/forms/${formId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.form;
    } catch (error) {
      console.error('Error updating form status:', error);
      throw error;
    }
  },

  // Delete form
  async deleteForm(userId, formId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/forms/${formId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting form:', error);
      throw error;
    }
  },

  // Duplicate form
  async duplicateForm(userId, formId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/forms/${formId}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.form;
    } catch (error) {
      console.error('Error duplicating form:', error);
      throw error;
    }
  },

  // Get form responses
  async getFormResponses(userId, formId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/forms/${formId}/responses`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching form responses:', error);
      throw error;
    }
  },

  // Submit form response (public)
  async submitFormResponse(userId, formId, responseData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/forms/${formId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting form response:', error);
      throw error;
    }
  },

  // Get form analytics
  async getFormAnalytics(userId, formId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/forms/${formId}/analytics`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.analytics;
    } catch (error) {
      console.error('Error fetching form analytics:', error);
      throw error;
    }
  },

  // Get forms statistics
  async getFormsStats(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/forms/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error('Error fetching forms stats:', error);
      throw error;
    }
  },

  // Helper function to format form data for API
  formatFormData(formData, fields) {
    return {
      title: formData.title,
      description: formData.description || '',
      status: formData.status || 'draft',
      fields: fields || [],
      settings: formData.settings || {
        allowMultipleSubmissions: false,
        requireLogin: false,
        showProgressBar: true,
        customTheme: {
          primaryColor: '#3B82F6',
          backgroundColor: '#FFFFFF'
        },
        notifications: {
          emailOnSubmission: true,
          emailAddress: ''
        }
      }
    };
  },

  // Generate form share URL
  getFormShareUrl(userId, formId) {
    return `${window.location.origin}/form/${userId}/${formId}`;
  },

  // Copy form share URL to clipboard
  async copyFormShareUrl(userId, formId) {
    try {
      const url = this.getFormShareUrl(userId, formId);
      await navigator.clipboard.writeText(url);
      return url;
    } catch (error) {
      console.error('Error copying form URL:', error);
      throw error;
    }
  }
};

export default formService;
