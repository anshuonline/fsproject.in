import { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

const VOLUME_STEP = 0.05;

// Broadcast a shortcut action for the on-screen indicator overlay
const notifyIndicator = (detail) => {
  window.dispatchEvent(new CustomEvent('fs_shortcut_action', { detail }));
};

const clampVolume = (v) => Math.max(0, Math.min(1, v));

// Global keyboard shortcuts (YouTube-style):
//   Space        → Play / Pause
//   ArrowRight   → Next song
//   ArrowLeft    → Previous song
//   ArrowUp      → Volume up (also unmutes)
//   ArrowDown    → Volume down
//   Ctrl+K/Cmd+K → Focus search bar
// Space is skipped when a button/link is focused so the browser can activate
// it (standard web behavior). Arrows are skipped while typing. Nothing hijacks
// combos with modifier keys — browser shortcuts always win.
export function useKeyboardShortcuts() {
  const {
    currentSong, volume, isMuted,
    togglePlay, nextSong, prevSong, setVolumeLevel
  } = usePlayer();

  // Latest player state/actions via ref so the single window listener never re-binds
  const stateRef = useRef({});
  stateRef.current = { currentSong, volume, isMuted, togglePlay, nextSong, prevSong, setVolumeLevel };

  useEffect(() => {
    const isTypingContext = (el) => {
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
    };

    const isActivatable = (el) => {
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'BUTTON' || tag === 'A' || el.getAttribute?.('role') === 'button' || el.getAttribute?.('role') === 'link';
    };

    const handleKeyDown = (e) => {
      const st = stateRef.current;
      const active = document.activeElement;

      // Ctrl+K / Cmd+K — focus search (works even while typing elsewhere)
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('fs_focus_search'));
        return;
      }

      // Never hijack shortcuts with modifier combos (browser shortcuts win)
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

      switch (e.key) {
        case ' ':
        case 'Spacebar':
          // Let the browser activate focused buttons/links; otherwise toggle playback
          if (isTypingContext(active) || isActivatable(active)) return;
          e.preventDefault();
          if (!e.repeat && st.currentSong) {
            st.togglePlay();
            notifyIndicator({ kind: st.isPlaying ? 'pause' : 'play' });
          }
          break;
        case 'ArrowRight':
          if (isTypingContext(active)) return;
          e.preventDefault();
          if (!e.repeat && st.currentSong) {
            st.nextSong();
            notifyIndicator({ kind: 'next' });
          }
          break;
        case 'ArrowLeft':
          if (isTypingContext(active)) return;
          e.preventDefault();
          if (!e.repeat && st.currentSong) {
            st.prevSong();
            notifyIndicator({ kind: 'prev' });
          }
          break;
        case 'ArrowUp': {
          if (isTypingContext(active)) return;
          e.preventDefault();
          const up = clampVolume((st.isMuted ? 0 : st.volume) + VOLUME_STEP);
          st.setVolumeLevel(up);
          notifyIndicator({ kind: 'volume', value: up });
          break;
        }
        case 'ArrowDown': {
          if (isTypingContext(active)) return;
          e.preventDefault();
          const down = clampVolume((st.isMuted ? 0 : st.volume) - VOLUME_STEP);
          st.setVolumeLevel(down);
          notifyIndicator({ kind: 'volume', value: down });
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

export default useKeyboardShortcuts;
