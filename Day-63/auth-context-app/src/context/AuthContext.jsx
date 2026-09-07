// src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';

// Mock user database
const USERS = [
  { id: 1, email: 'admin@example.com', password: 'admin123', name: 'Admin User', role: 'admin' },
  { id: 2, email: 'user@example.com', password: 'user123', name: 'John Doe', role: 'user' },
];

// 1. Create the Context
const AuthContext = createContext();

// 2. Create the Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      setIsLoggingIn(true);
      setError(null);

      // Simulate network delay
      setTimeout(() => {
        // Find user with matching credentials
        const foundUser = USERS.find(
          (u) => u.email === email && u.password === password
        );

        if (foundUser) {
          // Remove password before storing
          const { password: _, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
          setIsLoggingIn(false);
          resolve(userWithoutPassword);
        } else {
          setError('Invalid email or password. Please try again.');
          setIsLoggingIn(false);
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    setError(null);
  };

  // Update user data (for profile page)
  const updateUser = (updatedData) => {
    if (user) {
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  // Value object
  const value = {
    user,
    loading,
    error,
    isLoggingIn,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom hook for consuming the context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;