import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ContextMenuContext';

const PWAContext = createContext({
  isInstallable: false,
  isInstalled: false,
  installApp: () => {}
});

export function PWAProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(() => {
    if (typeof window !== 'undefined' && window.__deferredPrompt) {
      return window.__deferredPrompt;
    }
    return null;
  });
  const [isInstallable, setIsInstallable] = useState(() => {
    return typeof window !== 'undefined' && Boolean(window.__deferredPrompt);
  });
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  });

  const { showToast } = useToast();

  useEffect(() => {
    // Check if early prompt was captured
    if (typeof window !== 'undefined' && window.__deferredPrompt && !deferredPrompt) {
      setDeferredPrompt(window.__deferredPrompt);
      setIsInstallable(true);
    }

    // 1. Capture beforeinstallprompt event when fired by browser
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.__deferredPrompt = e;
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log('FreeSong PWA beforeinstallprompt captured successfully.');
    };

    // 2. Track successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      showToast('FreeSong installed successfully!', 'success');
      console.log('FreeSong PWA installed.');
    };

    // 3. Monitor standalone mode transitions
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e) => {
      if (e.matches) {
        setIsInstalled(true);
        setIsInstallable(false);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      }
    };
  }, [showToast]);

  const installApp = async () => {
    // Check if already running as standalone app
    if (isInstalled || window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      showToast('FreeSong is already installed on your device!', 'info');
      return;
    }

    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? window.__deferredPrompt : null);

    if (promptEvent) {
      try {
        // Trigger the REAL native browser installation prompt
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setIsInstallable(false);
          showToast('FreeSong installed successfully!', 'success');
        }
        setDeferredPrompt(null);
        if (typeof window !== 'undefined') {
          window.__deferredPrompt = null;
        }
      } catch (err) {
        console.warn('PWA install prompt error:', err);
      }
    } else {
      // If beforeinstallprompt hasn't fired or on desktop Chrome/Edge:
      showToast('Click the install icon in your browser address bar or menu to install FreeSong', 'info');
    }
  };

  return (
    <PWAContext.Provider value={{ isInstallable, isInstalled, installApp }}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  return useContext(PWAContext);
}
