import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all context providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { ProductProvider } from './contexts/ProductContext';
import { ServiceProvider } from './contexts/ServiceContext';
import { UserDetailsProvider } from './contexts/UserDetailsContext';
import { WantToBuyProvider } from './contexts/WantToBuyContext';

// Import components and pages
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import CartPage from './pages/CartPage';
import WantToBuyPage from './pages/WantToBuyPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';

// Import admin components
import AdminLayout from './admin/components/AdminLayout';
import InventoryPage from './admin/pages/InventoryPage';
import CategoriesPage from './admin/pages/CategoriesPage';
import AdminServicesPage from './admin/pages/ServicesPage';
import UsersPage from './admin/pages/UsersPage';
import WantToBuyAdminPage from './admin/pages/WantToBuyPage';

// Main App component with routing
function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Customer-facing routes */}
        <Route path="/" element={
          <Layout>
            <HomePage />
          </Layout>
        } />
        
        <Route path="/services" element={
          <Layout>
            <ServicesPage />
          </Layout>
        } />
        
        <Route path="/cart" element={
          <Layout>
            <CartPage />
          </Layout>
        } />
        
        <Route path="/want-to-buy" element={
          <Layout>
            <WantToBuyPage />
          </Layout>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Auth routes - redirect to home if already logged in */}
        <Route path="/login" element={
          <ProtectedRoute requireAuth={false} redirectTo="/">
            <LoginPage />
          </ProtectedRoute>
        } />
        
        <Route path="/register" element={
          <ProtectedRoute requireAuth={false} redirectTo="/">
            <RegisterPage />
          </ProtectedRoute>
        } />
        
        <Route path="/reset-password" element={
          <ProtectedRoute requireAuth={false} redirectTo="/">
            <ResetPasswordPage />
          </ProtectedRoute>
        } />

        {/* Admin routes - require authentication */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout>
              <InventoryPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/inventory" element={
          <ProtectedRoute>
            <AdminLayout>
              <InventoryPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/categories" element={
          <ProtectedRoute>
            <AdminLayout>
              <CategoriesPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/services" element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminServicesPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/users" element={
          <ProtectedRoute>
            <AdminLayout>
              <UsersPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/want-to-buy" element={
          <ProtectedRoute>
            <AdminLayout>
              <WantToBuyAdminPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

// Import test component

// Main App component with all providers
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CategoryProvider>
          <ProductProvider>
            <ServiceProvider>
              <UserDetailsProvider>
                <WantToBuyProvider>
                  <AppContent />
                </WantToBuyProvider>
              </UserDetailsProvider>
            </ServiceProvider>
          </ProductProvider>
        </CategoryProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
