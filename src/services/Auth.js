import Swal from "sweetalert2";

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

        // ❌ ERROR SweetAlert
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: errorData.message || "Invalid email or password",
        });

        throw new Error(`Login failed: ${errorData.message || response.statusText}`);
      }

      const userData = await response.json();

      // Check subscription status
      if (userData.subscriptionExpired) {
        // Store subscription data for modal display
        localStorage.setItem("subscriptionExpired", "true");
        localStorage.setItem("subscriptionEndDate", userData.subscriptionEndDate || "");
        sessionStorage.setItem("subscriptionExpired", "true");
        sessionStorage.setItem("subscriptionEndDate", userData.subscriptionEndDate || "");

        // Still save user data but don't show success message
        // Store in both sessionStorage (new) and localStorage (backward compat)
        sessionStorage.setItem("user", JSON.stringify(userData.user));
        sessionStorage.setItem("refreshToken", userData.refreshToken);
        sessionStorage.setItem("accessToken", userData.accessToken);
        localStorage.setItem("user", JSON.stringify(userData.user));
        localStorage.setItem("refreshToken", userData.refreshToken);
        localStorage.setItem("accessToken", userData.accessToken);
        localStorage.setItem("userId", userData.user._id);

        // Throw error to trigger subscription modal
        throw new Error("SUBSCRIPTION_EXPIRED");
      }

      // Save tokens and user data to both storages
      // sessionStorage for security (clears on browser close)
      sessionStorage.setItem("user", JSON.stringify(userData.user));
      sessionStorage.setItem("refreshToken", userData.refreshToken);
      sessionStorage.setItem("accessToken", userData.accessToken);
      sessionStorage.setItem("subscriptionExpired", "false");

      // localStorage for backward compatibility with existing components
      localStorage.setItem("user", JSON.stringify(userData.user));
      localStorage.setItem("refreshToken", userData.refreshToken);
      localStorage.setItem("accessToken", userData.accessToken);
      localStorage.setItem("userId", userData.user._id);
      localStorage.setItem("subscriptionExpired", "false");
      localStorage.setItem("isAuthenticated", "true");

      // ✅ SUCCESS SweetAlert
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome back!",
        timer: 1500,
        showConfirmButton: false,
      });

      // Return full auth data for AuthContext
      return {
        user: userData.user,
        accessToken: userData.accessToken,
        refreshToken: userData.refreshToken
      };

    } catch (error) {
      console.error("Login failed:", error);

      // Don't show error alert for subscription expired - modal will handle it
      if (error.message === "SUBSCRIPTION_EXPIRED") {
        throw error;
      }

      // Optional: handle unexpected errors
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: error.message,
      });

      throw error;
    }
  }

  // Forgot Password - Send OTP
  async forgotPassword(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("Forgot password failed:", error);
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(email, otp) {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("OTP verification failed:", error);
      throw error;
    }
  }

  // Reset Password
  async resetPassword(email, otp, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("Password reset failed:", error);
      throw error;
    }
  }
}

export const auth = new Auth();
