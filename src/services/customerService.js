// Customer Service - API calls for customer management
const API_BASE_URL = 'http://localhost:4000/api/expert';

export const customerService = {
  // Get all customers for a user
  async getCustomers(userId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters.category && filters.category !== 'all') {
        queryParams.append('category', filters.category);
      }
      if (filters.search) {
        queryParams.append('search', filters.search);
      }

      const url = `${API_BASE_URL}/${userId}/customers${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.customers || [];
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // Get single customer by ID
  async getCustomer(userId, customerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/customers/${customerId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.customer;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  },

  // Create new customer
  async createCustomer(userId, customerData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Update customer
  async updateCustomer(userId, customerId, customerData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.customer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  // Delete customer
  async deleteCustomer(userId, customerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/customers/${customerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },

  // Archive/Unarchive customer
  async archiveCustomer(userId, customerId, isArchived) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/customers/${customerId}/archive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isArchived }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.customer;
    } catch (error) {
      console.error('Error archiving customer:', error);
      throw error;
    }
  },

  // Update customer status
  async updateCustomerStatus(userId, customerId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/customers/${customerId}/status`, {
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
      return data.customer;
    } catch (error) {
      console.error('Error updating customer status:', error);
      throw error;
    }
  },

  // Get customer notes
  async getCustomerNotes(userId, customerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/customers/${customerId}/notes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching customer notes:', error);
      throw error;
    }
  },

  // Add customer note
  async addCustomerNote(userId, customerId, noteData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/customers/${customerId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.note;
    } catch (error) {
      console.error('Error adding customer note:', error);
      throw error;
    }
  },

  // Update customer note
  async updateCustomerNote(userId, customerId, noteId, noteData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/customers/${customerId}/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.note;
    } catch (error) {
      console.error('Error updating customer note:', error);
      throw error;
    }
  },

  // Delete customer note
  async deleteCustomerNote(userId, customerId, noteId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/customers/${customerId}/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting customer note:', error);
      throw error;
    }
  },

  // Get customer statistics
  async getCustomerStats(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/customersStats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("Stats:",response)
      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      throw error;
    }
  },

  // Bulk import customers
  async bulkImportCustomers(userId, customersData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/customers/bulk-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customers: customersData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error bulk importing customers:', error);
      throw error;
    }
  },

  // Export customers
  async exportCustomers(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/customers/export`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.customers;
    } catch (error) {
      console.error('Error exporting customers:', error);
      throw error;
    }
  },

  // Helper function to format customer data for API
  formatCustomerData(customerData) {
    return {
      name: customerData.name?.trim(),
      surname: customerData.surname?.trim(),
      email: customerData.email?.trim().toLowerCase(),
      phone: customerData.phone?.trim(),
      dateOfBirth: customerData.dateOfBirth,
      gender: customerData.gender,
      address: customerData.address || {},
      occupation: customerData.occupation?.trim(),
      company: customerData.company?.trim(),
      preferences: customerData.preferences || {
        communicationMethod: 'email',
        language: 'tr',
        timezone: 'Europe/Istanbul',
        reminderSettings: {
          enabled: true,
          beforeHours: 24
        }
      },
      status: customerData.status || 'active',
      category: customerData.category?.trim(),
      tags: customerData.tags || [],
      source: customerData.source || 'website',
      referredBy: customerData.referredBy?.trim(),
      paymentMethod: customerData.paymentMethod,
      consentGiven: customerData.consentGiven || {
        dataProcessing: false,
        marketing: false
      }
    };
  },

  // Parse CSV data for bulk import
  parseCSVData(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const customers = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim());
        const customer = {};
        
        headers.forEach((header, index) => {
          customer[header] = values[index] || '';
        });
        
        customers.push(customer);
      }
    }

    return customers;
  },

  // Generate CSV content for export
  generateCSVContent(customers) {
    const headers = [
      'name', 'surname', 'email', 'phone', 'dateOfBirth', 'gender',
      'occupation', 'company', 'status', 'category', 'source', 'referredBy',
      'totalAppointments', 'completedAppointments', 'totalSpent', 'averageRating',
      'lastAppointment', 'createdAt'
    ];

    const csvContent = [
      headers.join(','),
      ...customers.map(customer => 
        headers.map(header => customer[header] || '').join(',')
      )
    ].join('\n');

    return csvContent;
  }
};

export default customerService;
