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

    // Reset to individual mode if user is not admin
    useEffect(() => {
        if (user && !user.subscription?.isAdmin && user?.subscription?.plantype !== 'institutional' && viewMode === 'institution') {
            setViewModeState('individual');
            localStorage.setItem('viewMode', 'individual');
        }
    }, [user, viewMode]);

    const setViewMode = (mode) => {
        // Only allow institution mode for admins
        if (mode === 'institution' && !user?.subscription?.isAdmin) {
            console.warn('Only admins can switch to institution view');
            return;
        }

        setViewModeState(mode);
        localStorage.setItem('viewMode', mode);
    };

    const value = {
        viewMode,
        setViewMode,
        isInstitutionView: viewMode === 'institution',
        isIndividualView: viewMode === 'individual',
        canAccessInstitutionView: user?.subscription?.isAdmin || false
    };

    return (
        <ViewModeContext.Provider value={value}>
            {children}
        </ViewModeContext.Provider>
    );
};
