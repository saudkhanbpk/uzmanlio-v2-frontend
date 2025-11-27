// Event Service - API calls for events management
const backendUrl = process.env.REACT_APP_BACKEND_URL
const API_BASE_URL = `${backendUrl}/api/expert`;

export const eventService = {
  // Get all events for a user
  async getEvents(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/events`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.events || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Get events by status
  async getEventsByStatus(userId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/events/status/${status}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.events || [];
    } catch (error) {
      console.error('Error fetching events by status:', error);
      throw error;
    }
  },

  // Create new event
  async createEvent(userId, eventData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Update event
  async updateEvent(userId, eventId, eventData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.event;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  // Update event status
  async updateEventStatus(userId, eventId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/events/${eventId}/status`, {
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
      return data.event;
    } catch (error) {
      console.error('Error updating event status:', error);
      throw error;
    }
  },

  // Delete event
  async deleteEvent(userId, eventId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  // Get event statistics
  async getEventStats(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/events/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error('Error fetching event stats:', error);
      throw error;
    }
  },

  // Get services and packages for event creation
  async getServicesAndPackages(userId) {
    try {
      console.log("Fetching services and packages for user:", userId)
      const response = await fetch(`${API_BASE_URL}/${userId}/profile`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse JSON body
      const data = await response.json();
      console.log("User data:", data);

      // Save the parsed user in localStorage
      localStorage.setItem("user", JSON.stringify(data));

      // Extract services
      const services = (data.services || []).map(service => ({
        id: service.id,
        name: service.name,
        type: "service",
        price: service.price,
      }));

      // Extract packages
      const packages = (data.packages || []).map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        type: "package",
        price: pkg.price,
        appointments: pkg.sessionsIncluded,
      }));

      return [...services, ...packages];
    } catch (error) {
      console.error("Error fetching services and packages:", error);
      throw error;
    }
  },

  // Helper function to format event data for API
  formatEventData(formData, selectedService) {
    return {
      title: selectedService?.name || formData.title,
      description: formData.description,
      serviceId: formData.service,
      serviceName: selectedService?.name || '',
      serviceType: selectedService?.type || 'service',
      date: formData.date,
      time: formData.time,
      duration: parseInt(formData.duration) || 60,
      location: formData.location,
      platform: formData.platform,
      eventType: formData.eventType,
      meetingType: formData.meetingType,
      price: parseFloat(formData.price) || 0,
      maxAttendees: parseInt(formData.maxAttendees) || null,
      attendees: 0,
      category: formData.category,
      status: this.mapStatusToBackend(formData.status),
      paymentType: formData.paymentType,
      isRecurring: formData.isRecurring || false,
      recurringType: formData.recurringType,
      selectedClients: formData.selectedClients || [],
      appointmentNotes: formData.appointmentNotes || '',
      files: formData.files || []
    };
  },

  // Map frontend status to backend status
  mapStatusToBackend(frontendStatus) {
    const statusMap = {
      'onay-bekliyor': 'pending',
      'yaklasan': 'approved',
      'tamamlandi': 'completed',
      'iptal-edildi': 'cancelled'
    };
    return statusMap[frontendStatus] || 'pending';
  },

  // Map backend status to frontend status
  mapStatusToFrontend(backendStatus) {
    const statusMap = {
      'pending': 'onay-bekliyor',
      'approved': 'yaklasan',
      'completed': 'tamamlandi',
      'cancelled': 'iptal-edildi'
    };
    return statusMap[backendStatus] || 'onay-bekliyor';
  }
};

export default eventService;
