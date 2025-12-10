/**
 * Maneja la sesión del usuario en la app.
 * Permite iniciar sesión, registrarse, cerrar sesión y mantener la sesión activa.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AuthAPI, UserAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al abrir la app, se verifica si hay una sesión guardada
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        const userData = await UserAPI.getCurrentUser();
        setUser(userData);
      }
    } catch {
      await clearSession();
    } finally {
      setLoading(false);
    }
  };

  // Borra todo lo relacionado con la sesión
  const clearSession = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('userData');
    setUser(null);
  };

  // Inicio de sesión
  const signIn = async (email, password) => {
    const response = await AuthAPI.login(email, password);
    
    if (response.access) {
      await SecureStore.setItemAsync('token', response.access);
    }
    if (response.refresh) {
      await SecureStore.setItemAsync('refreshToken', response.refresh);
    }

    try {
      const userData = await UserAPI.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  // Registro + inicio de sesión automático
  const signUp = async (userData) => {
    const response = await AuthAPI.register(userData);
    
    if (response.access) {
      await SecureStore.setItemAsync('token', response.access);
      if (response.refresh) {
        await SecureStore.setItemAsync('refreshToken', response.refresh);
      }

      const user = await UserAPI.getCurrentUser();
      setUser(user);
      return user;
    }

    return response;
  };

  // Cierra sesión
  const signOut = async () => {
    await AuthAPI.logout();
    await clearSession();
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acceder a los datos y funciones de auth
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}