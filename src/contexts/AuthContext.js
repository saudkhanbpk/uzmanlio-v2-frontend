import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext(null);

/**
 * AuthProvider - Manages authentication state
 * 
 * Features:
 * - Stores tokens in sessionStorage (clears when browser closes)
 * - Decodes user ID from JWT token (no localStorage userId)
 * - Provides login/logout functions
 * - Integrates with apiClient for automatic token management
 */
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Logout function - clears all auth state
     */
    const logout = useCallback(async () => {
        try {
            // Call logout endpoint to invalidate refresh token
            const userId = apiClient.getUserIdFromToken();
            if (userId) {
                await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/expert/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                }).catch(() => { }); // Ignore errors
            }
        } finally {
            // Clear all stored data
            sessionStorage.clear();

            // Also clear localStorage for any legacy data
            localStorage.removeItem('userId');
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('subscriptionExpired');
            localStorage.removeItem('subscriptionEndDate');

            // Clear API client
            apiClient.clearTokens();

            setUser(null);
            setIsAuthenticated(false);

            // Redirect to login
            window.location.href = '/login';
        }
    }, []);

    /**
     * Initialize auth state from stored tokens on mount
     */
    useEffect(() => {
        const initAuth = () => {
            // First check sessionStorage (new system)
            let accessToken = sessionStorage.getItem('accessToken');
            let refreshToken = sessionStorage.getItem('refreshToken');
            let storedUser = sessionStorage.getItem('user');

            // Fallback to localStorage for migration (old system)
            if (!accessToken || !refreshToken) {
                accessToken = localStorage.getItem('accessToken');
                refreshToken = localStorage.getItem('refreshToken');
                storedUser = localStorage.getItem('user');

                // If found in localStorage, migrate to sessionStorage
                if (accessToken && refreshToken) {
                    sessionStorage.setItem('accessToken', accessToken);
                    sessionStorage.setItem('refreshToken', refreshToken);
                    if (storedUser) {
                        sessionStorage.setItem('user', storedUser);
                    }
                    // Don't clear localStorage yet for smooth transition
                }
            }

            if (accessToken && refreshToken) {
                // Initialize API client with logout callback
                apiClient.init(accessToken, refreshToken, logout);

                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch {
                        // Invalid stored user
                    }
                }

                setIsAuthenticated(true);
            }
            setLoading(false);
        };

        initAuth();
    }, [logout]);

    /**
     * Login function
     * @param {Object} userData - User data from login response
     * @param {string} accessToken - JWT access token
     * @param {string} refreshToken - JWT refresh token
     */
    const login = useCallback((userData, accessToken, refreshToken) => {
        // Store tokens in sessionStorage (clears when browser closes)
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('refreshToken', refreshToken);
        sessionStorage.setItem('user', JSON.stringify(userData));

        // Also store in localStorage for backward compatibility during transition
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userId', userData._id); // Keep for components not yet migrated
        sessionStorage.setItem('userId', userData._id); // Store in sessionStorage too
        localStorage.setItem('isAuthenticated', 'true');

        // Initialize API client
        apiClient.init(accessToken, refreshToken, logout);

        setUser(userData);
        setIsAuthenticated(true);
    }, [logout]);

    /**
     * Get current user ID (from token, not localStorage)
     * Use this instead of localStorage.getItem('userId')
     */
    const getUserId = useCallback(() => {
        return apiClient.getUserIdFromToken();
    }, []);

    /**
     * Update user data (e.g., after profile update)
     */
    const updateUser = useCallback((userData) => {
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('user', JSON.stringify(userData)); // Keep in sync
    }, []);

    const value = {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        getUserId,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook to access auth context
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
