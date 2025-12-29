/**
 * Centralized API Client with automatic token refresh
 * 
 * Features:
 * - Automatically attaches access token to all requests
 * - Intercepts 401 responses and attempts token refresh
 * - Redirects to login when refresh token expires
 * - Decodes user ID from token (no localStorage dependency)
 */

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

class ApiClient {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
        this.isRefreshing = false;
        this.refreshSubscribers = [];
        this.onLogout = null; // Callback to trigger logout
    }

    /**
     * Initialize with stored tokens
     */
    init(accessToken, refreshToken, logoutCallback) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.onLogout = logoutCallback;
    }

    /**
     * Update tokens after refresh
     */
    setTokens(accessToken, refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    /**
     * Clear tokens on logout
     */
    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
    }

    /**
     * Get user ID from access token
     * This replaces localStorage.getItem('userId')
     */
    getUserIdFromToken() {
        if (!this.accessToken) return null;
        try {
            const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
            return payload.id;
        } catch {
            return null;
        }
    }

    /**
     * Check if access token is expired
     */
    isTokenExpired() {
        if (!this.accessToken) return true;
        try {
            const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
            // Add 10 second buffer
            return (payload.exp * 1000) < (Date.now() + 10000);
        } catch {
            return true;
        }
    }

    /**
     * Wait for refresh to complete (used by concurrent requests)
     */
    subscribeToRefresh(callback) {
        this.refreshSubscribers.push(callback);
    }

    /**
     * Notify all waiting requests that refresh completed
     */
    onRefreshComplete(error) {
        this.refreshSubscribers.forEach(callback => callback(error));
        this.refreshSubscribers = [];
    }

    /**
     * Refresh the access token
     */
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }

        // If already refreshing, wait for it
        if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
                this.subscribeToRefresh((error) => {
                    if (error) reject(error);
                    else resolve();
                });
            });
        }

        this.isRefreshing = true;

        try {
            const response = await fetch(`${API_BASE_URL}/api/expert/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Token refresh failed');
            }

            const data = await response.json();
            this.setTokens(data.accessToken, data.refreshToken);

            // Store new tokens in sessionStorage
            sessionStorage.setItem('accessToken', data.accessToken);
            sessionStorage.setItem('refreshToken', data.refreshToken);

            this.onRefreshComplete(null);
            return data;
        } catch (error) {
            this.onRefreshComplete(error);
            throw error;
        } finally {
            this.isRefreshing = false;
        }
    }

    /**
     * Fetch CSRF token from backend
     */
    async fetchCsrfToken() {
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (this.accessToken) {
                headers['Authorization'] = `Bearer ${this.accessToken}`;
            }

            const response = await fetch(`${API_BASE_URL}/api/csrf-token`, {
                headers,
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                this.csrfToken = data.csrfToken;
                return data.csrfToken;
            }
        } catch (error) {
            console.error('Failed to fetch CSRF token:', error);
        }
        return null;
    }

    /**
     * Main request method with automatic token refresh and CSRF protection
     */
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const method = options.method || 'GET';

        // Fetch CSRF token for state-changing requests if not already present
        if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase()) && !this.csrfToken) {
            await this.fetchCsrfToken();
        }

        // Prepare headers
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.csrfToken) {
            headers['x-csrf-token'] = this.csrfToken;
        } else if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
            console.warn(`⚠️ No CSRF token available for ${method} request to ${endpoint}`);
        }

        // Check if token is about to expire and proactively refresh
        if (this.accessToken && this.refreshToken && this.isTokenExpired()) {
            try {
                await this.refreshAccessToken();
            } catch (refreshError) {
                console.error('Proactive token refresh failed:', refreshError);
                if (this.onLogout) {
                    this.onLogout();
                }
                throw new Error('Session expired. Please login again.');
            }
        }

        // Attach access token if available
        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        try {
            let response = await fetch(url, {
                ...options,
                headers,
                credentials: 'include' // Required for CSRF cookies
            });

            // If 403 (Invalid CSRF), try to refresh CSRF token once
            if (response.status === 403 && this.csrfToken) {
                const errorData = await response.clone().json().catch(() => ({}));
                if (errorData.error === 'Invalid CSRF token') {
                    console.warn('⚠️ Invalid CSRF token in apiClient, refreshing and retrying...');
                    await this.fetchCsrfToken();
                    if (this.csrfToken) {
                        headers['x-csrf-token'] = this.csrfToken;
                        response = await fetch(url, {
                            ...options,
                            headers,
                            credentials: 'include'
                        });
                    }
                }
            }

            // If 401 and we have a refresh token, try to refresh
            if (response.status === 401 && this.refreshToken) {
                const errorData = await response.clone().json().catch(() => ({}));

                // Only refresh if token expired, not if invalid
                if (errorData.code === 'TOKEN_EXPIRED' || errorData.code === 'NO_TOKEN') {
                    try {
                        await this.refreshAccessToken();

                        // Retry original request with new token
                        headers['Authorization'] = `Bearer ${this.accessToken}`;
                        response = await fetch(url, {
                            ...options,
                            headers,
                            credentials: 'include'
                        });
                    } catch (refreshError) {
                        // Refresh failed - logout user
                        console.error('Token refresh failed:', refreshError);
                        if (this.onLogout) {
                            this.onLogout();
                        }
                        throw new Error('Session expired. Please login again.');
                    }
                } else if (errorData.code === 'INVALID_REFRESH_TOKEN' || errorData.code === 'TOKEN_REVOKED') {
                    // Refresh token invalid - logout
                    if (this.onLogout) {
                        this.onLogout();
                    }
                    throw new Error('Session expired. Please login again.');
                }
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API call failed for ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * GET request
     */
    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    /**
     * POST request
     */
    post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     */
    put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * PATCH request
     */
    patch(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     */
    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    /**
     * For file uploads (FormData)
     * Does NOT set Content-Type - lets browser set it for FormData
     */
    async upload(endpoint, formData, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const method = options.method || 'POST';

        // Fetch CSRF token for state-changing requests if not already present
        if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase()) && !this.csrfToken) {
            await this.fetchCsrfToken();
        }

        const headers = { ...options.headers };
        delete headers['Content-Type']; // Let browser set it for FormData

        if (this.csrfToken) {
            headers['X-CSRF-Token'] = this.csrfToken;
        }

        // Check if token is about to expire and proactively refresh
        if (this.accessToken && this.refreshToken && this.isTokenExpired()) {
            try {
                await this.refreshAccessToken();
            } catch (refreshError) {
                console.error('Proactive token refresh failed:', refreshError);
                if (this.onLogout) {
                    this.onLogout();
                }
                throw new Error('Session expired. Please login again.');
            }
        }

        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        const response = await fetch(url, {
            ...options,
            method,
            headers,
            body: formData,
            credentials: 'include' // Required for CSRF cookies
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;
