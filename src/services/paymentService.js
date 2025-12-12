// Payment Service - API calls for payment management
import { authFetch, getAuthUserId } from './authFetch';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Fetch earnings statistics for an expert
 * @param {String} userId - The expert's user ID
 * @returns {Promise<Object>} Earnings statistics
 */
export const fetchEarningsStats = async (userId) => {
    try {
        const effectiveUserId = userId || getAuthUserId();
        const response = await authFetch(`${API_BASE_URL}/api/expert/${effectiveUserId}/payments/stats`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching earnings stats:', error);
        throw error;
    }
};

/**
 * Fetch monthly revenue data for an expert
 * @param {String} userId - The expert's user ID
 * @param {Number} year - The year to fetch data for (optional)
 * @returns {Promise<Object>} Monthly revenue data
 */
export const fetchMonthlyRevenue = async (userId, year) => {
    try {
        const effectiveUserId = userId || getAuthUserId();
        const url = year
            ? `${API_BASE_URL}/api/expert/${effectiveUserId}/payments/monthly-revenue?year=${year}`
            : `${API_BASE_URL}/api/expert/${effectiveUserId}/payments/monthly-revenue`;

        const response = await authFetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching monthly revenue:', error);
        throw error;
    }
};

/**
 * Fetch payment orders for an expert
 * @param {String} userId - The expert's user ID
 * @param {Object} filters - Optional filters (status, orderSource, startDate, endDate)
 * @returns {Promise<Object>} Payment orders list
 */
export const fetchPaymentOrders = async (userId, filters = {}) => {
    try {
        const effectiveUserId = userId || getAuthUserId();
        const queryParams = new URLSearchParams();

        if (filters.status) queryParams.append('status', filters.status);
        if (filters.orderSource) queryParams.append('orderSource', filters.orderSource);
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);

        const queryString = queryParams.toString();
        const url = queryString
            ? `${API_BASE_URL}/api/expert/${effectiveUserId}/payments/orders?${queryString}`
            : `${API_BASE_URL}/api/expert/${effectiveUserId}/payments/orders`;

        const response = await authFetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching payment orders:', error);
        throw error;
    }
};

export default {
    fetchEarningsStats,
    fetchMonthlyRevenue,
    fetchPaymentOrders
};
