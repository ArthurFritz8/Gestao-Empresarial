import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { useAuth } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import POS from './pages/POS';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <CssBaseline />
      <Routes>
        {/* Rotas protegidas */}
        <Route 
          path="/" 
          element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="pos" element={<POS />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Rotas públicas */}
        <Route path="/" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* 404 - Página não encontrada */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;