import React, { lazy, Suspense, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/public/HomePage'));
const BooksPage = lazy(() => import('./pages/public/BooksPage'));
const BookDetailPage = lazy(() => import('./pages/public/BookDetailPage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage'));
const ReviewsPage = lazy(() => import('./pages/public/ReviewsPage'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/user/SettingsPage'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));

//  Admin Pages - Direct import to avoid loading delay
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageBooksPage from './pages/admin/ManageBooksPage';
import ManageCategoriesPage from './pages/admin/ManageCategoriesPage';
import AllReviewsPage from './pages/admin/AllReviewsPage';
import ReportsPage from './pages/admin/ReportsPage';

// Public Pages
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

// Loading component
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress />
  </Box>
);

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin Route Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  console.log('🔍 AdminRoute Check:', { 
    user, 
    isAuthenticated,
    roleId: user?.roleId,
    role: user?.role 
  });
  
  if (!isAuthenticated) {
    console.log('❌ Not authenticated - redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  const isAdmin = 
    user?.roleId === 1 ||
    user?.role === 'admin' ||
    user?.role === 'Admin' ||
    user?.role === 'ADMIN';
  
  if (!isAdmin) {
    console.log(`❌ Not admin - redirecting to home`);
    return <Navigate to="/" replace />;
  }
  
  console.log('✅ Admin access granted - showing admin page');
  return <>{children}</>;
};

// Main App Content
const AppContent: React.FC = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Pages where Header and Footer should be hidden
  const hideHeaderFooterPaths = ['/login', '/register'];
  const shouldHideHeaderFooter = hideHeaderFooterPaths.includes(location.pathname);

  const handleLogin = async () => {
    await login('demo@example.com', 'password');
  };

  const handleLogout = () => {
    logout();
  };

  const handleMenuClick = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Conditionally render Header */}
      {!shouldHideHeaderFooter && (
        <Header 
          user={isAuthenticated ? user : undefined}
          onLogout={handleLogout}
          onLogin={handleLogin}
          onMenuClick={handleMenuClick}
          mobileMenuOpen={mobileMenuOpen}
          onMobileMenuClose={handleMobileMenuClose}
          showSearch={true}
        />
      )}
      
      <Routes>
        {/* Public Routes - Lazy loaded */}
        <Route path="/" element={
          <Suspense fallback={<LoadingFallback />}>
            <HomePage />
          </Suspense>
        } />
        <Route path="/books" element={
          <Suspense fallback={<LoadingFallback />}>
            <BooksPage />
          </Suspense>
        } />
        <Route path="/books/:id" element={
          <Suspense fallback={<LoadingFallback />}>
            <BookDetailPage />
          </Suspense>
        } />
        <Route path="/reviews" element={
          <Suspense fallback={<LoadingFallback />}>
            <ReviewsPage />
          </Suspense>
        } />
        <Route path="/login" element={
          <Suspense fallback={<LoadingFallback />}>
            <LoginPage />
          </Suspense>
        } />
        <Route path="/register" element={
          <Suspense fallback={<LoadingFallback />}>
            <RegisterPage />
          </Suspense>
        } />
        <Route path="/about" element={
          <Suspense fallback={<LoadingFallback />}>
            <AboutPage />
          </Suspense>
        } />
        <Route path="/contact" element={
          <Suspense fallback={<LoadingFallback />}>
            <ContactPage />
          </Suspense>
        } />

        {/* Protected User Routes - Lazy loaded */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ProfilePage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <SettingsPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <NotificationsPage />
            </Suspense>
          </ProtectedRoute>
        } />

        {/*  Admin Routes - Direct import (no lazy loading, faster) */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <ManageUsersPage />
          </AdminRoute>
        } />
        <Route path="/admin/books" element={
          <AdminRoute>
            <ManageBooksPage />
          </AdminRoute>
        } />
        <Route path="/admin/categories" element={
          <AdminRoute>
            <ManageCategoriesPage />
          </AdminRoute>
        } />
        <Route path="/admin/reviews" element={
          <AdminRoute>
            <AllReviewsPage />
          </AdminRoute>
        } />
        <Route path="/admin/reports" element={
          <AdminRoute>
            <ReportsPage />
          </AdminRoute>
        } />
        
        {/* Fallback Route - 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Conditionally render Footer */}
      {!shouldHideHeaderFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;