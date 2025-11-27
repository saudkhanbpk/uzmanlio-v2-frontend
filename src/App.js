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

import EmailVerificationModal from './EmailVerificationModal';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user was previously authenticated (in a real app, you'd check localStorage/sessionStorage or a cookie)
    return localStorage.getItem('isAuthenticated') === 'true' && localStorage.getItem('userId');
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
    sessionStorage.removeItem('verificationSkipped');
  };

  return (
    <div className="App">
      <UserProvider>
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
      </UserProvider>
    </div>
  );
}

export default App;