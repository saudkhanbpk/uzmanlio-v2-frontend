import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

/**
 * Fetch reports summary for an expert
 * @param {String} userId - The expert's user ID
 * @returns {Promise<Object>} Reports summary data
 */
export const fetchReportsSummary = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/expert/${userId}/reports/summary`);
        return response.data;
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
        const url = year
            ? `${API_BASE_URL}/expert/${userId}/reports/analytics?period=${period}&year=${year}`
            : `${API_BASE_URL}/expert/${userId}/reports/analytics?period=${period}`;

        const response = await axios.get(url);
        return response.data;
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
        const response = await axios.get(
            `${API_BASE_URL}/expert/${userId}/reports/top-services?limit=${limit}`
        );
        return response.data;
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
