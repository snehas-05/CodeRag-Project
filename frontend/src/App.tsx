import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import { ProtectedRoute } from './components/ui/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

/**
 * CodeRAG Premium Application Entry Point
 */

export default function App() {
  return (
    <BrowserRouter>
      {/* Toast notifications with premium styling */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#12141c',
            color: '#e2e8f0',
            border: '1px solid #1e293b',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '600'
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
           <Route path="/chat" element={<ChatPage />} />
           <Route path="/dashboard" element={<DashboardPage />} />
           <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
