// OGAds Content Locker Controller (Campaign: o4e5p2, Trigger: LAST())

declare global {
  interface Window {
    LAST?: () => void;
    og_load?: () => void;
    ogblock?: boolean;
  }
}

export const CURRENT_LOCKER_ID = 'o4e5p2';
export const LOCKER_BASE_URL = `https://appsave.online/cl/i/${CURRENT_LOCKER_ID}`;

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
};

export const triggerNativeOGAdsLocker = (): boolean => {
  // Call LAST(); as requested by user
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
