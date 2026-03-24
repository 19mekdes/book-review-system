import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import Dashboard from './pages/protected/Dashboard'; // Create this if not exists

// eslint-disable-next-line @typescript-eslint/no-unused-vars, react-refresh/only-export-components
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      
      {/* Redirect root to login or dashboard */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};