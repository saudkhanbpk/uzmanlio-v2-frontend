import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../services/analyticsService';

/**
 * Google Analytics component for the main frontend dashboard
 * Automatically tracks page views when the route changes
 */
const GoogleAnalytics = () => {
    const location = useLocation();

    useEffect(() => {
        const pagePath = location.pathname + location.search;
        const pageTitle = document.title;

        // Track the page view
        trackPageView(pagePath, pageTitle);
    }, [location]);

    return null;
};

export default GoogleAnalytics;
