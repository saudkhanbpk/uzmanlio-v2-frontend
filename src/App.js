import React, { useState } from 'react';
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

import EmailVerificationModal from './EmailVerificationModal';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user was previously authenticated (in a real app, you'd check localStorage/sessionStorage or a cookie)
    const authenticated = localStorage.getItem('isAuthenticated') === 'true' && localStorage.getItem('userId');
    const subscriptionExpired = localStorage.getItem('subscriptionExpired') === 'true';

    // If subscription is expired, don't consider user as authenticated for dashboard access
    return authenticated && !subscriptionExpired;
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('subscriptionExpired');
    localStorage.removeItem('subscriptionEndDate');
    sessionStorage.removeItem('verificationSkipped');
  };

  return (
    <div className="App">
      <UserProvider>
        <ViewModeProvider>
          <InstitutionUsersProvider>
            <ExpertProvider>
              <BrowserRouter>
                <Routes>
                  <Route
                    path="/login"
                    element={
                      isAuthenticated ?
                        <Navigate to="/dashboard" replace /> :
                        <LoginPage onLogin={handleLogin} />
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
                        <Dashboard onLogout={handleLogout} /> :
                        <Navigate to="/login" replace />
                    }
                  />
                  {/* <Route path="/blog/:slug" element={<BlogPublicView />} /> */}
                  <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
                <EmailVerificationModal />
              </BrowserRouter>
            </ExpertProvider>
          </InstitutionUsersProvider>
        </ViewModeProvider>
      </UserProvider>
    </div>
  );
}

export default App;