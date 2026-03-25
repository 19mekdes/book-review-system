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
//const DashboardPage = lazy(() => import('./pages/user/DashboardPage'));
//const MyReviewsPage = lazy(() => import('./pages/user/MyReviewsPage'));
const SettingsPage = lazy(() => import('./pages/user/SettingsPage'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const ManageUsersPage = lazy(() => import('./pages/admin/ManageUsersPage'));
const ManageBooksPage = lazy(() => import('./pages/admin/ManageBooksPage'));
const ManageCategoriesPage = lazy(() => import('./pages/admin/ManageCategoriesPage'));
const AllReviewsPage = lazy(() => import('./pages/admin/AllReviewsPage'));
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage'));

// ADD THESE IMPORTS
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
    console.log(`❌ Not admin - redirecting to dashboard`);
    return <Navigate to="/dashboard" replace />;
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
      
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Protected User Routes */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          {/* <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} /> */}
          {/* <Route path="/my-reviews" element={<ProtectedRoute><MyReviewsPage /></ProtectedRoute>} /> */}
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><ManageUsersPage /></AdminRoute>} />
          <Route path="/admin/books" element={<AdminRoute><ManageBooksPage /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><ManageCategoriesPage /></AdminRoute>} />
          <Route path="/admin/reviews" element={<AdminRoute><AllReviewsPage /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />
          
          {/* Fallback Route - 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      
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