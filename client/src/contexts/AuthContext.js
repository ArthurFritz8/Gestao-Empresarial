import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Verificar se existe um token no localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Verificar se o token é válido (não expirado)
        const decoded = jwt_decode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp > currentTime) {
          // Configurar o token no cabeçalho da instância api
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setCurrentUser(decoded);
        } else {
          // Token expirado, remover do localStorage
          localStorage.removeItem('token');
        }
      } catch (err) {
        // Token inválido, remover do localStorage
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token } = response.data;
      
      // Salvar o token no localStorage
      localStorage.setItem('token', token);
      
      // Configurar o token no cabeçalho da instância api
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Decodificar o token para obter as informações do usuário
      const decoded = jwt_decode(token);
      setCurrentUser(decoded);
      
      return true;
    } catch (err) {
      console.error("Erro de login:", err);
      setError(err.response?.data?.message || 'Erro ao fazer login');
      return false;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      console.log("Enviando dados para registro:", userData);
      const response = await api.post('/api/auth/register', userData);
      console.log("Resposta de registro:", response.data);
      return response.data;
    } catch (err) {
      console.error("Erro de registro:", err);
      setError(err.response?.data?.message || 'Erro ao registrar usuário');
      return false;
    }
  };

  const logout = () => {
    // Remover o token do localStorage
    localStorage.removeItem('token');
    
    // Remover o token do cabeçalho da instância api
    delete api.defaults.headers.common['Authorization'];
    
    // Limpar o estado do usuário atual
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}