import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';
import { GoogleSignInModal } from '../components/Common/GoogleSignInModal';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.getUser());
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Sync user changes to storage
  useEffect(() => {
    storage.saveUser(user);
  }, [user]);

  // Listen to Firebase auth state changes (restores Google session automatically)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser((prev) => {
          const profileData = {
            id: fbUser.uid,
            name: fbUser.displayName || 'Google User',
            email: fbUser.email || '',
            picture: fbUser.photoURL || '',
            provider: 'google',
            emailVerified: Boolean(fbUser.emailVerified),
            joinedDate: prev?.joinedDate || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          };
          storage.saveUser(profileData);
          return profileData;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle Google OAuth login using real Firebase popup
  const loginWithGoogle = useCallback(async (manualData) => {
    // Fallback if manual data is passed
    if (manualData && typeof manualData === 'object' && manualData.name && !manualData.nativeEvent) {
      const profile = {
        id: manualData.id || `usr_${Date.now()}`,
        name: manualData.name || 'Google User',
        email: manualData.email || '',
        picture: manualData.picture || '',
        provider: 'google',
        emailVerified: true,
        joinedDate: manualData.joinedDate || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      };
      setUser(profile);
      storage.saveUser(profile);
      setIsGoogleModalOpen(false);
      return profile;
    }

    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const profileData = {
        id: fbUser.uid,
        name: fbUser.displayName || 'Google User',
        email: fbUser.email || '',
        picture: fbUser.photoURL || '',
        provider: 'google',
        emailVerified: Boolean(fbUser.emailVerified),
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      };
      setUser(profileData);
      storage.saveUser(profileData);
      setIsGoogleModalOpen(false);
      return profileData;
    } catch (error) {
      console.error('Firebase Google Sign-In Error:', error);
      throw error;
    } finally {
      setIsGoogleLoading(false);
    }
  }, []);

  // Standard email/demo login
  const loginWithEmail = useCallback((name, email) => {
    const profileData = {
      id: `usr_${Date.now()}`,
      name: name || 'FreeSong Listener',
      email: email || 'listener@freesong.in',
      picture: '',
      provider: 'email',
      emailVerified: true,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
    setUser(profileData);
    storage.saveUser(profileData);
    return profileData;
  }, []);

  // Logout (signs out of Firebase and clears local storage)
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signout error:', err);
    }
    setUser(null);
    storage.clearUser();
  }, []);

  // Update existing user profile
  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      storage.saveUser(updated);
      return updated;
    });
  }, []);

  const openGoogleModal = useCallback(() => setIsGoogleModalOpen(true), []);
  const closeGoogleModal = useCallback(() => setIsGoogleModalOpen(false), []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loginWithGoogle,
    loginWithEmail,
    logout,
    updateUser,
    isGoogleModalOpen,
    openGoogleModal,
    closeGoogleModal,
    isGoogleLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <GoogleSignInModal />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

