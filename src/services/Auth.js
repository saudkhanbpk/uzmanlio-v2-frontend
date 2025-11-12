const backendurl = process.env.REACT_APP_BACKEND_URL;
const API_BASE_URL = `${backendurl}/api/expert`;

class Auth {
  // User Sign Up
  async signUp(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      window.location.href = `${process.env.REACT_APP_FRONTEND_URL}/login`;
      return data;
    } catch (error) {
      console.error("SignUp failed:", error);
      throw error;
    }
  }

  // User Login
  async login(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Login failed: ${errorData.message || response.statusText}`);
      }

      const userData = await response.json();

      localStorage.setItem("user", JSON.stringify(userData.user));
      localStorage.setItem("refreshToken", userData.refreshToken);
      localStorage.setItem("accessToken", userData.accessToken);
      localStorage.setItem("userId", userData.user._id);

      return userData.user;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }
}

export const auth = new Auth();
