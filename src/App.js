import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './dashboard/expertDashboard';
import LoginPage from './loginPage';
import SignupPage from './signupPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import AcceptInvitationPage from './AcceptInvitationPage';
import DeclineInvitationPage from './DeclineInvitationPage';
import EmailVerificationPage from './EmailVerificationPage';
import { ExpertProvider } from './contexts/ExpertContext';
import { UserProvider } from './context/UserContext';
import { ViewModeProvider } from './contexts/ViewModeContext';
import { InstitutionUsersProvider } from './contexts/InstitutionUsersContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import EmailVerificationModal from './EmailVerificationModal';

/**
 * Loading spinner component
 */
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

/**
 * App Routes - Uses AuthContext for authentication state
 */
function AppRoutes() {
  const { isAuthenticated, loading, logout, login } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ?
              <Navigate to="/dashboard" replace /> :
              <LoginPage onLogin={(authData) => {
                // Handle login with AuthContext
                if (authData && authData.accessToken) {
                  login(authData.user, authData.accessToken, authData.refreshToken);
                }
              }} />
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ?
              <Navigate to="/dashboard" replace /> :
              <SignupPage />
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated ?
              <Navigate to="/dashboard" replace /> :
              <ForgotPasswordPage />
          }
        />
        {/* Invitation Routes - Public access */}
        <Route path="/accept-invitation/:token" element={<AcceptInvitationPage />} />
        <Route path="/decline-invitation/:token" element={<DeclineInvitationPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />

        <Route
          path="/dashboard/*"
          element={
            isAuthenticated ?
              <Dashboard onLogout={logout} /> :
              <Navigate to="/login" replace />
          }
        />
        {/* <Route path="/blog/:slug" element={<BlogPublicView />} /> */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      <EmailVerificationModal />
    </BrowserRouter>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <UserProvider>
          <ViewModeProvider>
            <InstitutionUsersProvider>
              <ExpertProvider>
                <AppRoutes />
              </ExpertProvider>
            </InstitutionUsersProvider>
          </ViewModeProvider>
        </UserProvider>
      </AuthProvider>
    </div>
  );
}

export default App;