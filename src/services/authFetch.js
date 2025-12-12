/**
 * Authenticated Fetch Wrapper
 * 
 * This module provides a global fetch wrapper that:
 * 1. Automatically attaches JWT access token to all requests
 * 2. Handles 401 errors by refreshing tokens
 * 3. Redirects to login when refresh token expires
 * 4. Provides userId from JWT token (not localStorage)
 * 
 * Usage:
 *   import { authFetch, getAuthUserId, forceLogout } from './services/authFetch';
 *   
 *   // Instead of: fetch(url, options)
 *   // Use: authFetch(url, options)
 *   
 *   // Get userId from JWT:
 *   const userId = getAuthUserId();
 */

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Get access token from storage
 */
export const getAccessToken = () => {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token from storage
 */
export const getRefreshToken = () => {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Save tokens to storage
 */
export const saveTokens = (accessToken, refreshToken) => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Clear all auth data and redirect to login
 */
export const forceLogout = () => {
    // Clear all storage
    sessionStorage.clear();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('subscriptionExpired');
    localStorage.removeItem('subscriptionEndDate');

    // Redirect to login
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
};

/**
 * Decode JWT token to get payload
 */
const decodeToken = (token) => {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    } catch {
        return null;
    }
};

/**
 * Get user ID from JWT token
 * Use this instead of localStorage.getItem('userId')
 */
export const getAuthUserId = () => {
    const token = getAccessToken();
    const payload = decodeToken(token);

    if (payload?.id) {
        return payload.id;
    }

    // Fallback to localStorage during migration
    return localStorage.getItem('userId');
};

/**
 * Check if user is authenticated (has valid tokens)
 */
export const isAuthenticated = () => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    return !!(accessToken && refreshToken);
};

/**
 * Check if access token is expired or about to expire
 */
const isTokenExpired = (token, bufferSeconds = 30) => {
    const payload = decodeToken(token);
    if (!payload?.exp) return true;

    const expiresAt = payload.exp * 1000;
    const now = Date.now();
    const buffer = bufferSeconds * 1000;

    return expiresAt < (now + buffer);
};

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let refreshPromise = null;

/**
 * Refresh the access token
 */
const refreshAccessToken = async () => {
    // If already refreshing, wait for it
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    isRefreshing = true;

    refreshPromise = fetch(`${API_BASE_URL}/api/expert/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
    })
        .then(async (response) => {
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || 'Token refresh failed');
            }
            return response.json();
        })
        .then((data) => {
            saveTokens(data.accessToken, data.refreshToken);
            console.log('✅ Tokens refreshed successfully');
            return data;
        })
        .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
        });

    return refreshPromise;
};

/**
 * Authenticated fetch wrapper
 * 
 * Automatically:
 * - Attaches Authorization header with JWT token
 * - Refreshes token if expired
 * - Logs out user if refresh fails
 * 
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export const authFetch = async (url, options = {}) => {
    let accessToken = getAccessToken();

    // If no token, user is not logged in
    if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        forceLogout();
        throw new Error('Not authenticated');
    }

    // Check if token is expired and refresh proactively
    if (isTokenExpired(accessToken)) {
        try {
            await refreshAccessToken();
            accessToken = getAccessToken();
        } catch (error) {
            console.error('Token refresh failed:', error);
            forceLogout();
            throw new Error('Session expired. Please login again.');
        }
    }

    // Add Authorization header
    const headers = {
        ...options.headers,
    };

    // Only add Authorization if token exists
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Only set Content-Type for JSON if not FormData
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    try {
        let response = await fetch(url, { ...options, headers });

        // If 401, try to refresh token and retry
        if (response.status === 401) {
            try {
                await refreshAccessToken();
                accessToken = getAccessToken();
                headers['Authorization'] = `Bearer ${accessToken}`;
                response = await fetch(url, { ...options, headers });
            } catch (refreshError) {
                console.error('Token refresh failed after 401:', refreshError);
                forceLogout();
                throw new Error('Session expired. Please login again.');
            }
        }

        return response;
    } catch (error) {
        // Network error or other issue
        console.error('authFetch error:', error);
        throw error;
    }
};

/**
 * Helper: Make authenticated GET request and parse JSON
 */
export const authGet = async (url) => {
    const response = await authFetch(url);
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

/**
 * Helper: Make authenticated POST request and parse JSON
 */
export const authPost = async (url, data) => {
    const response = await authFetch(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

/**
 * Helper: Make authenticated PUT request and parse JSON
 */
export const authPut = async (url, data) => {
    const response = await authFetch(url, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

/**
 * Helper: Make authenticated PATCH request and parse JSON
 */
export const authPatch = async (url, data) => {
    const response = await authFetch(url, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

/**
 * Helper: Make authenticated DELETE request
 */
export const authDelete = async (url) => {
    const response = await authFetch(url, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

/**
 * Helper: Upload file with authentication
 */
export const authUpload = async (url, formData, method = 'POST') => {
    const response = await authFetch(url, {
        method,
        body: formData
        // Don't set Content-Type - browser will set it for FormData
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export default {
    authFetch,
    authGet,
    authPost,
    authPut,
    authPatch,
    authDelete,
    authUpload,
    getAuthUserId,
    isAuthenticated,
    forceLogout,
    getAccessToken,
    getRefreshToken,
    saveTokens
};
