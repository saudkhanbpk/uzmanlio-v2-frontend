import React from 'react';

/**
 * ViewModeSwitcher Component
 * Allows admin users to toggle between Individual and Institution views
 * Only visible for admin users
 */
export const ViewModeSwitcher = ({ currentMode, onModeChange, isAdmin }) => {
    // Don't render if user is not admin
    if (!isAdmin) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-200 flex">
            <button
                onClick={() => onModeChange('individual')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentMode === 'individual'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                title="Sadece kendi verilerinizi görüntüleyin"
            >
                👤 Bireysel
            </button>
            <button
                onClick={() => onModeChange('institution')}
                className={`ml-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentMode === 'institution'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                title="Tüm kurum verilerini görüntüleyin"
            >
                🏢 Kurum
            </button>
        </div>
    );
};

export default ViewModeSwitcher;
