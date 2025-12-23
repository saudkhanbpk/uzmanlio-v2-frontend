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

// CSRF Token State
let csrfToken = null;
let isFetchingCsrf = false;
let csrfPromise = null;

/**
 * Fetch CSRF Token from backend
 */
/**
 * Fetch CSRF Token from backend
 */
export const fetchCsrfToken = async (force = false) => {
    if (csrfToken && !force) return csrfToken;
    if (isFetchingCsrf && csrfPromise) return csrfPromise;

    isFetchingCsrf = true;
    console.log('🔄 Fetching new CSRF token...');

    const accessToken = getAccessToken();
    const headers = {
        'Content-Type': 'application/json'
    };

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    csrfPromise = fetch(`${API_BASE_URL}/api/csrf-token`, {
        method: 'GET',
        headers,
        credentials: 'include' // Important for cookies
    })
        .then(async (response) => {
            if (!response.ok) {
                throw new Error('Failed to fetch CSRF token');
            }
            return response.json();
        })
        .then((data) => {
            if (data.csrfToken) {
                csrfToken = data.csrfToken;
                console.log('✅ CSRF token fetched successfully');
                return data.csrfToken;
            }
            throw new Error('No CSRF token in response');
        })
        .catch((err) => {
            console.error('❌ Error fetching CSRF token:', err);
            return null;
        })
        .finally(() => {
            isFetchingCsrf = false;
            csrfPromise = null;
        });

    return csrfPromise;
};

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

    // NOTE: We do NOT fetch CSRF token here anymore. 
    // The refresh endpoint (/api/expert/refresh-token) should be excluded from CSRF protection
    // or does not require it because it's in the authRoutes block which is mounted BEFORE doubleCsrfProtection.
    // Fetching here with an expired access token causes the server to generate an "anonymous" CSRF token,
    // which then fails validation for subsequent authenticated requests.

    const headers = { 'Content-Type': 'application/json' };

    // Some setups might still want CSRF if available, but be careful of the anonymous issue.
    // If csrfToken is already set (and valid), we send it.
    if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
    }

    refreshPromise = fetch(`${API_BASE_URL}/api/expert/refresh-token`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ refreshToken }),
        credentials: 'include'
    })
        .then(async (response) => {
            if (!response.ok) {
                const error = await response.clone().json().catch(() => ({}));
                throw new Error(error.message || 'Token refresh failed');
            }
            return response.json();
        })
        .then((data) => {
            saveTokens(data.accessToken, data.refreshToken);
            console.log('✅ Tokens refreshed successfully');

            // Clear the old CSRF token because it might be bound to the old session/anonymous
            // and we want to force a fetch with the new access token on next request.
            csrfToken = null;

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
 * - Attaches x-csrf-token header
 * - Refreshes token if expired
 * - Refreshes CSRF token if invalid
 * - Logs out user if refresh fails
 * 
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export const authFetch = async (url, options = {}) => {
    let accessToken = getAccessToken();

    // Debug logging
    // console.log('🔐 authFetch Debug:', url);

    // If no token, user is not logged in
    if (!accessToken) {
        console.warn('  ❌ No access token found, redirecting to login');
        forceLogout();
        throw new Error('Not authenticated');
    }

    // Check if token is expired and refresh proactively
    if (isTokenExpired(accessToken)) {
        console.log('  ⚠️ Token expired/expiring, refreshing...');
        try {
            await refreshAccessToken();
            accessToken = getAccessToken();
            console.log('  ✅ Token refreshed');
        } catch (error) {
            console.error('  ❌ Token refresh failed:', error);
            forceLogout();
            throw new Error('Session expired. Please login again.');
        }
    }

    // Ensure CSRF token is present for non-GET requests
    const method = options.method || 'GET';
    const isStateChange = !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());

    if (isStateChange && !csrfToken) {
        await fetchCsrfToken();
    }

    // Prepare headers
    const headers = {
        ...options.headers,
    };

    // Attach Authorization
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Attach CSRF Token
    if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
    }
    console.log("Here is CSRF:", csrfToken)

    // Only set Content-Type for JSON if not FormData
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    // Helper to perform the actual fetch
    const doFetch = async (currAccessToken, currCsrfToken) => {
        const currHeaders = { ...headers };
        if (currAccessToken) currHeaders['Authorization'] = `Bearer ${currAccessToken}`;
        if (currCsrfToken) currHeaders['x-csrf-token'] = currCsrfToken;

        return fetch(url, { ...options, headers: currHeaders, credentials: 'include' });
    };

    try {
        let response = await doFetch(accessToken, csrfToken);

        // Handle 403 Invalid CSRF token
        if (response.status === 403) {
            const errorClone = response.clone();
            try {
                const errData = await errorClone.json();
                if (errData.error === "Invalid CSRF token") {
                    console.log('⚠️ Invalid CSRF token, refreshing token and retrying...');
                    // FORCE refresh the CSRF token
                    await fetchCsrfToken(true);
                    // Retry with new CSRF token
                    response = await doFetch(accessToken, csrfToken);
                }
            } catch (e) {
                // Not a JSON error or other issue
            }
        }

        // If 401, try to refresh token and retry
        if (response.status === 401) {
            console.log('  ⚠️ Got 401, trying token refresh...');
            try {
                await refreshAccessToken();
                accessToken = getAccessToken();
                // Retry with new access token
                response = await doFetch(accessToken, csrfToken);
                console.log('  - Retry response status:', response.status);
            } catch (refreshError) {
                console.error('  ❌ Token refresh failed after 401:', refreshError);
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
