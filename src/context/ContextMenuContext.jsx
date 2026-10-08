import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ContextMenuContext = createContext(null);

export function ContextMenuProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [song, setSong] = useState(null);
  const [position, setPosition] = useState(null); // { x, y } or null for bottom sheet
  const [currentView, setCurrentView] = useState('root'); // 'root' | 'playlist' | 'sleep_timer'
  const [toasts, setToasts] = useState([]);

  // Toast notification helper
  const showToast = useCallback((message, type = 'success', duration = 2800) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Open context menu (supports mouse event, touch event, button click, or custom coordinates)
  const openMenu = useCallback((targetSong, triggerEventOrPos = null) => {
    if (!targetSong) return;

    if (triggerEventOrPos) {
      if (typeof triggerEventOrPos.preventDefault === 'function') {
        triggerEventOrPos.preventDefault();
      }
      if (typeof triggerEventOrPos.stopPropagation === 'function') {
        triggerEventOrPos.stopPropagation();
      }
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    let coords = null;
    if (!isMobile && triggerEventOrPos) {
      if (typeof triggerEventOrPos.clientX === 'number') {
        coords = { x: triggerEventOrPos.clientX, y: triggerEventOrPos.clientY };
      } else if (triggerEventOrPos.currentTarget?.getBoundingClientRect) {
        const rect = triggerEventOrPos.currentTarget.getBoundingClientRect();
        coords = { x: rect.left, y: rect.bottom + 4 };
      } else if (typeof triggerEventOrPos.x === 'number') {
        coords = { x: triggerEventOrPos.x, y: triggerEventOrPos.y };
      }
    }

    setSong(targetSong);
    setPosition(coords);
    setCurrentView('root');
    setIsOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    // Delay resetting view slightly so close transition doesn't jump
    setTimeout(() => {
      setCurrentView('root');
    }, 200);
  }, []);

  const setView = useCallback((view) => {
    setCurrentView(view);
  }, []);

  return (
    <ContextMenuContext.Provider
      value={{
        isOpen,
        song,
        position,
        currentView,
        openMenu,
        closeMenu,
        setView,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </ContextMenuContext.Provider>
  );
}

export function useContextMenu() {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }
  return context;
}

export function useToast() {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useToast must be used within a ContextMenuProvider');
  }
  return {
    showToast: context.showToast,
    removeToast: context.removeToast,
    toasts: context.toasts
  };
}
