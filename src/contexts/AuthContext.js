// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on app start
  useEffect(() => {
    const authStatus = localStorage.getItem('madjestick_admin_auth');
    const authTimestamp = localStorage.getItem('madjestick_admin_timestamp');
    
    if (authStatus === 'true' && authTimestamp) {
      // Check if authentication is still valid (24 hours)
      const now = new Date().getTime();
      const authTime = parseInt(authTimestamp);
      const hoursElapsed = (now - authTime) / (1000 * 60 * 60);
      
      if (hoursElapsed < 24) {
        setIsAuthenticated(true);
      } else {
        // Authentication expired
        localStorage.removeItem('madjestick_admin_auth');
        localStorage.removeItem('madjestick_admin_timestamp');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (password) => {
    // Get password from environment variable
    const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'defaultpassword';
    
    if (password === adminPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('madjestick_admin_auth', 'true');
      localStorage.setItem('madjestick_admin_timestamp', new Date().getTime().toString());
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('madjestick_admin_auth');
    localStorage.removeItem('madjestick_admin_timestamp');
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};