const backendurl = process.env.REACT_APP_BACKEND_URL;
const API_BASE_URL = `${backendurl}/api/expert`;

// Change to a class-based service
class ProfileService {
  async getProfile(userId) {
    try {   
      const response = await fetch(`${API_BASE_URL}/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched profile:', data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const profileService = new ProfileService();
