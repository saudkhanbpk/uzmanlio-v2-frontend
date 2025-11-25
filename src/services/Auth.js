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

      // Save tokens and user data
      localStorage.setItem("user", JSON.stringify(userData.user));
      localStorage.setItem("refreshToken", userData.refreshToken);
      localStorage.setItem("accessToken", userData.accessToken);
      localStorage.setItem("userId", userData.user._id);

      // ✅ SUCCESS SweetAlert
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome back!",
        timer: 1500,
        showConfirmButton: false,
      });

      return userData.user;

    } catch (error) {
      console.error("Login failed:", error);

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

  // async login(formData) {
  //   try {
  //     const response = await fetch(`${API_BASE_URL}/login`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(formData),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(`Login failed: ${errorData.message || response.statusText}`);
  //     }

  //     const userData = await response.json();

  //     localStorage.setItem("user", JSON.stringify(userData.user));
  //     localStorage.setItem("refreshToken", userData.refreshToken);
  //     localStorage.setItem("accessToken", userData.accessToken);
  //     localStorage.setItem("userId", userData.user._id);

  //     return userData.user;
  //   } catch (error) {
  //     console.error("Login failed:", error);
  //     throw error;
  //   }
  // }
}

export const auth = new Auth();
