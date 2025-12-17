const backendurl = process.env.REACT_APP_BACKEND_URL;
const API_BASE_URL = `${backendurl}/api/expert`;
import { authFetch } from "./authFetch";

// Change to a class-based service
class ProfileService {
  async getProfile(userId) {
    if (!userId) {
      console.warn("ProfileService: No userId provided. Logging out and redirecting to login.");
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('subscriptionExpired');
      localStorage.removeItem('subscriptionEndDate');
      sessionStorage.removeItem('verificationSkipped');

      window.location.href = '/login';
      return null;
    } try {
      const response = await authFetch(`${API_BASE_URL}/${userId}`);
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

export const profileService = new ProfileService();
