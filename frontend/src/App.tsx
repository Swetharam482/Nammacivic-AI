import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { AIChatPage } from './pages/AIChatPage';
import { ReportComplaintPage } from './pages/ReportComplaintPage';
import { ComplaintSuccessPage } from './pages/ComplaintSuccessPage';
import { TrackComplaintPage } from './pages/TrackComplaintPage';
import { MyComplaintsPage } from './pages/MyComplaintsPage';
import { DemoAuthorityPage } from './pages/DemoAuthorityPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SettingsPage } from './pages/SettingsPage';
import { HowToUsePage } from './pages/HowToUsePage';
import { AboutPage } from './pages/AboutPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route 
                  path="/chat" 
                  element={
                    <ProtectedRoute message="Please sign in or register to report a grievance.">
                      <AIChatPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/report" 
                  element={
                    <ProtectedRoute message="Please sign in or register to report a grievance.">
                      <ReportComplaintPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/complaint-success" element={<ComplaintSuccessPage />} />
                <Route path="/track" element={<TrackComplaintPage />} />
                <Route 
                  path="/my-complaints" 
                  element={
                    <ProtectedRoute message="Please sign in or register to view your submitted complaints.">
                      <MyComplaintsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/demo-authority" 
                  element={
                    <ProtectedRoute requiredRole={['OFFICER', 'DEMO_ADMIN', 'ADMIN']} message="Only authorized municipal officers can access this dashboard.">
                      <DemoAuthorityPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/how-to-use" element={<HowToUsePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
