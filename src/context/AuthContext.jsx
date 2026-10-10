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

  // Safety timeout so isGoogleLoading can NEVER stay stuck
  useEffect(() => {
    if (isGoogleLoading) {
      const timer = setTimeout(() => {
        setIsGoogleLoading(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isGoogleLoading]);

  // Sync user changes to storage
  useEffect(() => {
    storage.saveUser(user);
  }, [user]);

  // Background sync with Hostinger DB whenever user is logged in
  useEffect(() => {
    if (user?.email && !user.dbId) {
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
          // DB is the source of truth: custom name/dob/city saved in Settings must survive reloads
          if (synced?.user) {
            profileData.name = synced.user.name || profileData.name;
            profileData.dob = synced.user.dob || null;
            profileData.city = synced.user.city || null;
          }
        } catch {}
        setUser(profileData);
        storage.saveUser(profileData);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('fs_user_logged_in', { detail: profileData }));
        }
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
        // DB values win: custom name/dob/city must survive
        if (synced?.user) {
          profile.name = synced.user.name || profile.name;
          profile.dob = synced.user.dob || null;
          profile.city = synced.user.city || null;
        }
      } catch {}
      setUser(profile);
      storage.saveUser(profile);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fs_user_logged_in', { detail: profile }));
      }
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
        // DB values win: custom name/dob/city must survive
        if (synced?.user) {
          profileData.name = synced.user.name || profileData.name;
          profileData.dob = synced.user.dob || null;
          profileData.city = synced.user.city || null;
        }
      } catch {}
      setUser(profileData);
      storage.saveUser(profileData);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fs_user_logged_in', { detail: profileData }));
      }
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
      // DB values win: custom name/dob/city must survive
      if (synced?.user) {
        profileData.name = synced.user.name || profileData.name;
        profileData.dob = synced.user.dob || null;
        profileData.city = synced.user.city || null;
      }
    } catch {}
    setUser(profileData);
    storage.saveUser(profileData);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fs_user_logged_in', { detail: profileData }));
    }
    return profileData;
  }, []);

  // Direct backend email & password login (No OTP)
  const loginWithPassword = useCallback(async (email, password) => {
    const res = await api.loginWithPassword(email, password);
    if (res?.user) {
      setUser(res.user);
      storage.saveUser(res.user);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fs_user_logged_in', { detail: res.user }));
      }
      return res.user;
    }
    throw new Error('Failed to sign in');
  }, []);

  // Direct backend email & password registration (No OTP)
  const registerWithPassword = useCallback(async (name, email, password) => {
    const res = await api.registerWithPassword(name, email, password);
    if (res?.user) {
      setUser(res.user);
      storage.saveUser(res.user);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fs_user_logged_in', { detail: res.user }));
      }
      return res.user;
    }
    throw new Error('Failed to create account');
  }, []);

  // Set or update password for logged-in account
  const setPassword = useCallback(async (newPassword, currentPassword = null) => {
    if (!user) throw new Error('You must be signed in to set a password');
    const res = await api.setPassword(user.dbId || user.id, user.email, newPassword, currentPassword);
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, hasPassword: true };
      storage.saveUser(updated);
      return updated;
    });
    return res;
  }, [user]);

  // Logout (signs out of Firebase and clears local storage)
  const logout = useCallback(async () => {
    try {
      if (auth) await signOut(auth);
    } catch (err) {
      console.warn('Firebase signout error:', err);
    }
    setUser(null);
    storage.clearUser();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fs_user_logged_out'));
    }
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
    setUser,
    isAuthenticated: Boolean(user),
    loginWithGoogle,
    loginWithEmail,
    loginWithPassword,
    registerWithPassword,
    setPassword,
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

