/**
 * Maneja la sesión del usuario en la app.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AuthAPI, UserAPI } from '../api';

const AuthContext = createContext(null);

/**
 * Decodifica el JWT y extrae los datos del payload
 */
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decodificando JWT:', error);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Normaliza los datos del usuario
   */
  const normalizeUser = async (userData) => {
    
    // Intentar obtener datos del token JWT
    const token = await SecureStore.getItemAsync('token');
    const jwtData = token ? decodeJWT(token) : null;

    let primaryRole = userData.primary_role;
    
    if (!primaryRole && userData.roles && userData.roles.length > 0) {
      primaryRole = userData.roles[0].role_name;
    }
    
    if (!primaryRole && jwtData) {
      primaryRole = jwtData.primary_role;
    }
    
    if (!primaryRole) {
      primaryRole = 'citizen';
    }

    let roleStatus = userData.role_status || userData.status;
    
    if (!roleStatus && jwtData) {
      roleStatus = jwtData.role_status;
    }
    
    const normalized = {
      ...userData,
      primary_role: primaryRole,
      role_status: roleStatus,
      user_id: userData.id || jwtData?.user_id,
      institution_id: userData.institution?.id || userData.institution_id || jwtData?.institution_id,
    };
    return normalized;
  };

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        const userData = await UserAPI.getCurrentUser();
        const normalizedUser = await normalizeUser(userData);
        setUser(normalizedUser);
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      await clearSession();
    } finally {
      setLoading(false);
    }
  };

  const clearSession = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('userData');
    setUser(null);
  };

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
      
      const normalizedUser = await normalizeUser(userData);
      setUser(normalizedUser);
      
      return normalizedUser;
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
      throw error;
    }
  };

  const signUp = async (userData) => {
    const response = await AuthAPI.register(userData);

    if (response.access) {
      await SecureStore.setItemAsync('token', response.access);
      if (response.refresh) {
        await SecureStore.setItemAsync('refreshToken', response.refresh);
      }

      const user = await UserAPI.getCurrentUser();
      const normalizedUser = await normalizeUser(user);
      setUser(normalizedUser);
      return normalizedUser;
    }

    return response;
  };

  const signOut = async () => {
    await AuthAPI.logout();
    await clearSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}