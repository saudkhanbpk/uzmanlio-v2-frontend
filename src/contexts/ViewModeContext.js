import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

const ViewModeContext = createContext();

export const useViewMode = () => {
    const context = useContext(ViewModeContext);
    if (!context) {
        throw new Error('useViewMode must be used within a ViewModeProvider');
    }
    return context;
};

export const ViewModeProvider = ({ children }) => {
    const { user } = useUser();
    const [viewMode, setViewModeState] = useState('individual');

    // Load saved view mode from localStorage on mount
    useEffect(() => {
        const savedMode = localStorage.getItem('viewMode');
        if (savedMode && (savedMode === 'individual' || savedMode === 'institution')) {
            setViewModeState(savedMode);
        }
    }, []);

    // Reset to individual mode if user is not eligible for institution view
    useEffect(() => {
        if (!user) return;

        const { isAdmin, plantype } = user.subscription || {};

        if (viewMode === 'institution') {
            // Force individual if:
            // 1. Not an admin
            // 2. Is admin BUT plan is 'individual' (User request)
            if (!isAdmin || (isAdmin && plantype === 'individual')) {
                setViewModeState('individual');
                localStorage.setItem('viewMode', 'individual');
            }
        }
    }, [user, viewMode]);

    const setViewMode = (mode) => {
        // Only allow institution mode for valid institution admins
        if (mode === 'institution') {
            const { isAdmin, plantype } = user?.subscription || {};

            if (!isAdmin) {
                console.warn('Only admins can switch to institution view');
                return;
            }

            if (plantype === 'individual') {
                console.warn('Individual plans cannot switch to institution view');
                return;
            }
        }

        setViewModeState(mode);
        localStorage.setItem('viewMode', mode);
    };

    const value = {
        viewMode,
        setViewMode,
        isInstitutionView: viewMode === 'institution',
        isIndividualView: viewMode === 'individual',
        // Update access check to exclude individual plans
        canAccessInstitutionView: user?.subscription?.isAdmin && user?.subscription?.plantype !== 'individual'
    };

    return (
        <ViewModeContext.Provider value={value}>
            {children}
        </ViewModeContext.Provider>
    );
};
