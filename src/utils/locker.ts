// OGAds Content Locker Controller (Campaign: o4e5p2, Trigger: LAST())

declare global {
  interface Window {
    LAST?: () => void;
    og_load?: () => void;
    ogblock?: boolean;
    og_completed?: () => void;
    og_unlock?: () => void;
    onOGAdsComplete?: () => void;
  }
}

export const CURRENT_LOCKER_ID = 'o4e5p2';
export const LOCKER_BASE_URL = `https://appsave.online/cl/i/${CURRENT_LOCKER_ID}`;

// Set of registered unlock listeners (CinemaPlayer etc.)
const unlockListeners = new Set<() => void>();

export const isMediaUnlocked = (mediaId: number): boolean => {
  try {
    return sessionStorage.getItem(`unlocked_${mediaId}`) === 'true';
  } catch {
    return false;
  }
};

export const markMediaUnlocked = (mediaId: number): void => {
  try {
    sessionStorage.setItem(`unlocked_${mediaId}`, 'true');
  } catch {
    // ignore
  }
  // Notify all active listeners to resume playback immediately
  unlockListeners.forEach((cb) => {
    try {
      cb();
    } catch (err) {
      console.warn('Unlock listener callback error:', err);
    }
  });
};

export const subscribeToLockerUnlock = (callback: () => void): (() => void) => {
  unlockListeners.add(callback);
  return () => {
    unlockListeners.delete(callback);
  };
};

// Global handlers for OGAds postMessage and completion hooks
if (typeof window !== 'undefined') {
  const handleOGAdsCompletion = () => {
    unlockListeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.warn('Error in completion hook:', err);
      }
    });
  };

  window.og_completed = handleOGAdsCompletion;
  window.og_unlock = handleOGAdsCompletion;
  window.onOGAdsComplete = handleOGAdsCompletion;

  window.addEventListener('message', (event) => {
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (
        data?.type === 'ogads_complete' ||
        data?.type === 'lead_complete' ||
        data?.type === 'og_unlock' ||
        data?.event === 'unlock' ||
        data?.action === 'close_locker'
      ) {
        handleOGAdsCompletion();
      }
    } catch {
      // not JSON or not matching
    }
  });
}

export const triggerNativeOGAdsLocker = (): boolean => {
  // Call LAST(); as requested
  if (typeof window.LAST === 'function') {
    try {
      window.LAST();
      return true;
    } catch (err) {
      console.warn('Error invoking window.LAST():', err);
    }
  }

  // Backup trigger if OGAds exposed og_load
  if (typeof window.og_load === 'function') {
    try {
      window.og_load();
      return true;
    } catch (err) {
      console.warn('Error invoking window.og_load():', err);
    }
  }

  return false;
};
