// Reports Service - API calls for reports and analytics
import { authFetch, getAuthUserId } from './authFetch';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Fetch reports summary for an expert
 * @param {String} userId - The expert's user ID
 * @returns {Promise<Object>} Reports summary data
 */
export const fetchReportsSummary = async (userId) => {
    try {
        const effectiveUserId = userId || getAuthUserId();
        const response = await authFetch(`${API_BASE_URL}/api/expert/${effectiveUserId}/reports/summary`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching reports summary:', error);
        throw error;
    }
};

/**
 * Fetch analytics data aggregated by time period
 * @param {String} userId - The expert's user ID
 * @param {String} period - Time period: 'daily', 'weekly', or 'monthly'
 * @param {Number} year - Year for the data (optional)
 * @returns {Promise<Object>} Analytics data
 */
export const fetchAnalyticsData = async (userId, period = 'monthly', year) => {
    try {
        const effectiveUserId = userId || getAuthUserId();
        const url = year
            ? `${API_BASE_URL}/api/expert/${effectiveUserId}/reports/analytics?period=${period}&year=${year}`
            : `${API_BASE_URL}/api/expert/${effectiveUserId}/reports/analytics?period=${period}`;

        const response = await authFetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching analytics data:', error);
        throw error;
    }
};

/**
 * Fetch top performing services
 * @param {String} userId - The expert's user ID
 * @param {Number} limit - Number of top services to return (optional)
 * @returns {Promise<Object>} Top services data
 */
export const fetchTopServices = async (userId, limit = 5) => {
    try {
        const effectiveUserId = userId || getAuthUserId();
        const response = await authFetch(
            `${API_BASE_URL}/api/expert/${effectiveUserId}/reports/top-services?limit=${limit}`
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching top services:', error);
        throw error;
    }
};

export default {
    fetchReportsSummary,
    fetchAnalyticsData,
    fetchTopServices
};
