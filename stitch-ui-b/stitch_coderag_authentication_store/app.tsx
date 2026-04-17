import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ui/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';

/**
 * CodeRAG 2026 Architecture: Main Application Entry
 * 
 * Features:
 * - Centralized routing with React Router v6.
 * - Route guarding via ProtectedRoute wrapper.
 * - Flat route structure for simplicity and performance.
 * - Default redirection logic for consistent UX.
 */

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Application Routes */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Default Redirection */}
      <Route path="/" element={<Navigate to="/chat" replace />} />
      
      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
};

export default App;
