import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';
import { api } from '../services/api';
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

  // Background sync with Hostinger DB whenever user is logged in
  useEffect(() => {
    if (user?.email) {
      api.syncUser(user).then((res) => {
        if (res?.user?.id && (!user.dbId || user.dbId !== res.user.id)) {
          setUser((prev) => {
            if (!prev) return null;
            const updated = {
              ...prev,
              dbId: res.user.id,
              dbCountry: res.user.registered_country || prev.dbCountry
            };
            storage.saveUser(updated);
            return updated;
          });
        }
      }).catch((err) => {
        console.warn('Background Hostinger DB sync notice:', err);
      });
    }
  }, [user?.email]);

  // Sync taste preferences with Hostinger Cloud MySQL
  useEffect(() => {
    if (user?.email || user?.dbId) {
      const identifier = user.dbId || user.email || user.id;
      api.getUserPreferences(identifier).then((cloudPrefs) => {
        if (cloudPrefs && (cloudPrefs.genres?.length || cloudPrefs.artists?.length)) {
          storage.savePreferences(cloudPrefs);
        } else {
          const localPrefs = storage.getPreferences();
          if (localPrefs && (localPrefs.genres?.length || localPrefs.artists?.length)) {
            api.saveUserPreferences(identifier, localPrefs, user.email).catch(console.warn);
          }
        }
      }).catch(console.warn);
    }
  }, [user?.email, user?.dbId]);

  // Listen to Firebase auth state changes (restores Google session automatically)
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profileData = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Google User',
          email: fbUser.email || '',
          picture: fbUser.photoURL || '',
          provider: 'google',
          emailVerified: Boolean(fbUser.emailVerified),
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        };
        try {
          const synced = await api.syncUser(profileData);
          if (synced?.user?.id) {
            profileData.dbId = synced.user.id;
          }
        } catch {}
        setUser(profileData);
        storage.saveUser(profileData);
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
      try {
        const synced = await api.syncUser(profile);
        if (synced?.user?.id) profile.dbId = synced.user.id;
      } catch {}
      setUser(profile);
      storage.saveUser(profile);
      setIsGoogleModalOpen(false);
      return profile;
    }

    if (!auth || !googleProvider) {
      setIsGoogleModalOpen(true);
      return;
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
      try {
        const synced = await api.syncUser(profileData);
        if (synced?.user?.id) profileData.dbId = synced.user.id;
      } catch {}
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
  const loginWithEmail = useCallback(async (name, email) => {
    const profileData = {
      id: `usr_${Date.now()}`,
      name: name || 'FreeSong Listener',
      email: email || 'listener@freesong.in',
      picture: '',
      provider: 'email',
      emailVerified: true,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
    try {
      const synced = await api.syncUser(profileData);
      if (synced?.user?.id) profileData.dbId = synced.user.id;
    } catch {}
    setUser(profileData);
    storage.saveUser(profileData);
    return profileData;
  }, []);

  // Logout (signs out of Firebase and clears local storage)
  const logout = useCallback(async () => {
    try {
      if (auth) await signOut(auth);
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

