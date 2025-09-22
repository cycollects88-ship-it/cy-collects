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
import WantToBuyPage from './pages/WantToBuyPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Import admin components
import AdminLayout from './admin/components/AdminLayout';
import InventoryPage from './admin/pages/InventoryPage';
import CategoriesPage from './admin/pages/CategoriesPage';
import ServicesPage from './admin/pages/ServicesPage';
import UsersPage from './admin/pages/UsersPage';
import WantToBuyAdminPage from './admin/pages/WantToBuyPage';

import TestApp from './TestApp';

// Main App component with routing
function AppContent() {
  console.log("AppContent - Rendering...");
  
  return (
    <Router>
      <Routes>
        {/* Customer-facing routes */}
        <Route path="/" element={
          <Layout>
            <HomePage />
          </Layout>
        } />
        
        <Route path="/want-to-buy" element={
          <Layout>
            <WantToBuyPage />
          </Layout>
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
              <ServicesPage />
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
      
      {/* Admin Access Button (hidden in production) */}
      <a
        href="/admin"
        className="fixed bottom-4 right-4 bg-[#7D78A3] hover:bg-[#A29CBB] text-white p-3 rounded-full shadow-lg transition-colors duration-200 z-50"
        title="Admin Panel"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </a>
      
    </Router>
  );
}

// Import test component

// Main App component with all providers
function App() {
  console.log("App - Rendering main App component...");
  
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
