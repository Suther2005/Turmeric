import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Public pages
import LandingPage       from './pages/LandingPage';
import AboutPage         from './pages/AboutPage';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Authenticated pages
import DashboardPage     from './pages/DashboardPage';
import UploadPage        from './pages/UploadPage';
import DetectionResultPage from './pages/DetectionResultPage';
import SoilAnalysisPage  from './pages/SoilAnalysisPage';
import ReportsPage       from './pages/ReportsPage';
import HistoryPage       from './pages/HistoryPage';
import ProfilePage       from './pages/ProfilePage';

// Admin pages
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#052e16' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
          }}
        />

        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/"               element={<LandingPage />} />
          <Route path="/about"          element={<AboutPage />} />
          <Route path="/login"          element={<LoginPage />} />
          <Route path="/register"       element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* ── Protected Routes ── */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/upload"    element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
          <Route path="/result/:id" element={<ProtectedRoute><DetectionResultPage /></ProtectedRoute>} />
          <Route path="/soil-analysis" element={<ProtectedRoute><SoilAnalysisPage /></ProtectedRoute>} />
          <Route path="/reports"   element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/history"   element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* ── Admin Routes ── */}
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
