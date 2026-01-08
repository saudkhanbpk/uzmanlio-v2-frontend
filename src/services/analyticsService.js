/**
 * Analytics Service
 * Handles fetching analytics data from the backend GA4 integration
 */
import { authFetch } from './authFetch';

const SERVER_URL = process.env.REACT_APP_BACKEND_URL;
const API_URL = `${SERVER_URL}/api`;

/**
 * Fetch expert's profile page views
 * @param {string} userId - Expert user ID
 * @param {string} period - 'daily', 'weekly', or 'monthly'
 * @param {number} year - Year for the data
 * @returns {Promise<Object>} Profile views data
 */
export const fetchProfileViews = async (userId, period = 'monthly', year = new Date().getFullYear()) => {
    try {
        const response = await authFetch(
            `${API_URL}/analytics/expert/${userId}/profile-views?period=${period}&year=${year}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch profile views');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching profile views:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetch real-time visitors on expert's profile
 * @param {string} userId - Expert user ID
 * @returns {Promise<Object>} Real-time visitor data
 */
export const fetchRealtimeVisitors = async (userId) => {
    try {
        const response = await authFetch(
            `${API_URL}/analytics/expert/${userId}/realtime`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch real-time visitors');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching real-time visitors:', error);
        return { success: false, error: error.message, activeUsers: 0 };
    }
};

/**
 * Fetch detailed analytics (traffic sources, devices, countries)
 * @param {string} userId - Expert user ID
 * @param {string} period - 'daily', 'weekly', or 'monthly'
 * @param {number} year - Year for the data
 * @returns {Promise<Object>} Detailed analytics data
 */
export const fetchDetailedAnalytics = async (userId, period = 'monthly', year = new Date().getFullYear()) => {
    try {
        const response = await authFetch(
            `${API_URL}/analytics/expert/${userId}/detailed?period=${period}&year=${year}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch detailed analytics');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching detailed analytics:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetch aggregated analytics for all experts (admin only)
 * @param {string} period - 'daily', 'weekly', or 'monthly'
 * @param {number} year - Year for the data
 * @returns {Promise<Object>} Aggregated analytics data
 */
export const fetchAllExpertsAnalytics = async (period = 'monthly', year = new Date().getFullYear()) => {
    try {
        const response = await authFetch(
            `${API_URL}/analytics/admin/all-experts?period=${period}&year=${year}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch all experts analytics');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching all experts analytics:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetch specific expert analytics (admin only)
 * @param {string} expertId - Expert user ID
 * @param {string} period - 'daily', 'weekly', or 'monthly'
 * @param {number} year - Year for the data
 * @returns {Promise<Object>} Expert analytics data
 */
export const fetchAdminExpertAnalytics = async (expertId, period = 'monthly', year = new Date().getFullYear()) => {
    try {
        const response = await authFetch(
            `${API_URL}/analytics/admin/expert/${expertId}?period=${period}&year=${year}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch expert analytics');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching expert analytics:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetch institution profile views (admin only)
 * @param {string} institutionId - Institution ID
 * @param {string} period - 'daily', 'weekly', or 'monthly'
 * @param {number} year - Year for the data
 * @returns {Promise<Object>} Institution analytics data
 */
export const fetchInstitutionAnalytics = async (institutionId, period = 'monthly', year = new Date().getFullYear()) => {
    try {
        const response = await authFetch(
            `${API_URL}/analytics/institution/${institutionId}/profile-views?period=${period}&year=${year}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch institution analytics');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching institution analytics:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Track custom event in GA4 (client-side)
 * @param {string} eventName - Name of the event
 * @param {Object} params - Event parameters
 */
export const trackEvent = (eventName, params = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, params);
    }
};

/**
 * Track page view in GA4 (client-side)
 * @param {string} pagePath - Page path
 * @param {string} pageTitle - Page title
 */
export const trackPageView = (pagePath, pageTitle) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', process.env.REACT_APP_GA4_MEASUREMENT_ID, {
            page_path: pagePath,
            page_title: pageTitle
        });
    }
};

export default {
    fetchProfileViews,
    fetchRealtimeVisitors,
    fetchDetailedAnalytics,
    fetchAllExpertsAnalytics,
    fetchAdminExpertAnalytics,
    fetchInstitutionAnalytics,
    trackEvent,
    trackPageView
};
