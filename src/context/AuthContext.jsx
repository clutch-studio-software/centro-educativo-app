/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { auth, db } from '../services/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signOut,
  updatePassword
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Escuchar cambios en el estado de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          /**
           * IMPORTANTE: Se utiliza getIdTokenResult(true) con 'forceRefresh = true' para 
           * evitar que el cliente use un token JWT en caché. Esto garantiza que las 
           * Custom Claims de roles ('user_admin', 'Padre') asignadas recientemente en el backend
           * se propaguen de inmediato en la sesión activa sin requerir re-login manual.
           */
          const idTokenResult = await firebaseUser.getIdTokenResult(true);
          const role = idTokenResult.claims.role || 'Estudiante'; // Por defecto alumno si no posee claims
          const studentId = idTokenResult.claims.studentId || null;

          // Buscar datos de perfil extendidos en Firestore
          let profileData = {};
          if (role === 'Estudiante') {
            const docRef = doc(db, 'students', firebaseUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              profileData = docSnap.data();
            }
          } else {
            const docRef = doc(db, 'users', firebaseUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              profileData = docSnap.data();
            }
          }

          const loggedUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role,
            studentId,
            ...profileData
          };

          setUser(loggedUser);
          localStorage.setItem('school_user', JSON.stringify(loggedUser));
        } catch (error) {
          console.error("Error obteniendo claims/perfil de Firebase:", error);
          setUser(null);
          localStorage.removeItem('school_user');
        }
      } else {
        setUser(null);
        localStorage.removeItem('school_user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Método de Login integrado con Firebase
   */
  const login = useCallback(async (identifier, password, role) => {
    const cleanId = String(identifier || '').trim();
    const isStudentOrTutor = role === 'Estudiante' || role === 'Estudiante/Tutor';
    const isStudentIDLogin = isStudentOrTutor && !cleanId.includes('@');

    if (isStudentIDLogin) {
      // Iniciar sesión de alumno usando la Cloud Function cf_loginStudent (devuelve customToken)
      const FUNCTIONS_BASE_URL =
        import.meta.env.VITE_FUNCTIONS_BASE_URL ||
        (import.meta.env.DEV
          ? 'http://127.0.0.1:5001/centro-educativo-f5cc5/us-central1'
          : 'https://us-central1-centro-educativo-f5cc5.cloudfunctions.net');
      const response = await fetch(`${FUNCTIONS_BASE_URL}/cf_loginStudent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentID_login: cleanId, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Credenciales de alumno incorrectas.');
      }

      const { customToken } = await response.json();

      // Logear en Firebase Auth cliente usando el customToken retornado por el backend
      return signInWithCustomToken(auth, customToken);
    } else {
      // Logear tutores, staff o administradores con email y contraseña estándar en Firebase Auth
      try {
        return await signInWithEmailAndPassword(auth, cleanId, password);
      } catch (authError) {
        // Tolerancia a discrepancias de formato DNI (con puntos vs sin puntos)
        const isAuthCredentialError =
          authError?.code === 'auth/invalid-credential' ||
          authError?.code === 'auth/wrong-password' ||
          authError?.message?.includes('INVALID_LOGIN_CREDENTIALS');

        if (isAuthCredentialError) {
          const rawPwd = String(password || '').trim();
          const isDigitsOnly = /^\d{7,9}$/.test(rawPwd);
          const isDniWithDots = /^\d{1,2}\.\d{3}\.\d{3}$/.test(rawPwd);

          let alternatePassword = null;
          if (isDigitsOnly) {
            alternatePassword = rawPwd.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
          } else if (isDniWithDots) {
            alternatePassword = rawPwd.replace(/\./g, '');
          }

          if (alternatePassword && alternatePassword !== rawPwd) {
            try {
              return await signInWithEmailAndPassword(auth, cleanId, alternatePassword);
            } catch {
              // Si falla también el reintento, lanzamos el error original
            }
          }
        }
        throw authError;
      }
    }
  }, []);

  /**
   * Método de Logout
   */
  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  /**
   * Método para cambiar contraseña y limpiar la bandera mustChangePassword
   */
  const changePassword = useCallback(async (newPassword) => {
    if (!user) throw new Error("No hay un usuario autenticado.");

    const FUNCTIONS_BASE_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:5001/centro-educativo-f5cc5/us-central1' : 'https://us-central1-centro-educativo-f5cc5.cloudfunctions.net');
    const idToken = await auth.currentUser.getIdToken(true);

    if (user.role === 'Estudiante') {
      // Para estudiantes: Llamar a cf_changeStudentPassword (hashing interno en Firestore)
      const response = await fetch(`${FUNCTIONS_BASE_URL}/cf_changeStudentPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          studentId: user.uid,
          newPassword
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al actualizar contraseña del alumno.');
      }
    } else {
      // Para Padres / Personal: Usar SDK cliente de Firebase para cambiar la contraseña
      await updatePassword(auth.currentUser, newPassword);

      // Notificar al backend para que limpie el flag mustChangePassword en Firestore
      const response = await fetch(`${FUNCTIONS_BASE_URL}/cf_completePasswordChange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al limpiar bandera de contraseña temporal.');
      }
    }

    // Actualizar el estado del usuario localmente para remover el bloqueo de contraseña
    setUser(prev => prev ? { ...prev, mustChangePassword: false } : null);
    
    // Sincronizar en localStorage
    const savedUser = localStorage.getItem('school_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      parsed.mustChangePassword = false;
      localStorage.setItem('school_user', JSON.stringify(parsed));
    }
  }, [user]);

  const authContextValue = useMemo(() => ({
    user,
    login,
    logout,
    changePassword,
    isLoggedIn: !!user,
    loading
  }), [user, login, logout, changePassword, loading]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
