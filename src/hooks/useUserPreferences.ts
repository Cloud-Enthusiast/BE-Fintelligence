import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  notificationTypes: {
    newApplications: boolean;
    riskAlerts: boolean;
    systemUpdates: boolean;
    deadlineReminders: boolean;
  };
  autoApproval: boolean;
  riskThreshold: 'low' | 'medium' | 'high';
  theme: 'light' | 'dark' | 'auto';
  dateFormat: 'mm/dd/yyyy' | 'dd/mm/yyyy' | 'yyyy-mm-dd';
  autoLogoutMinutes: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Defaults (applied when no Firestore doc exists yet)
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_PREFERENCES: UserPreferences = {
  emailNotifications: true,
  pushNotifications: false,
  notificationTypes: {
    newApplications: true,
    riskAlerts: true,
    systemUpdates: false,
    deadlineReminders: true,
  },
  autoApproval: false,
  riskThreshold: 'medium',
  theme: 'auto',
  dateFormat: 'dd/mm/yyyy',
  autoLogoutMinutes: 30,
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Load and persist user preferences from `users/{uid}/preferences/settings`.
 *
 * Usage:
 *   const { preferences, isSaving, savePreferences } = useUserPreferences();
 *   await savePreferences({ riskThreshold: 'low' });
 */
export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load on mount / user change
  useEffect(() => {
    if (!user) {
      setPreferences(DEFAULT_PREFERENCES);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    const load = async () => {
      try {
        const prefRef = doc(db, 'users', user.uid, 'preferences', 'settings');
        const snap = await getDoc(prefRef);
        if (active && snap.exists()) {
          // Deep-merge so missing keys fall back to defaults
          const stored = snap.data() as Partial<UserPreferences>;
          setPreferences({
            ...DEFAULT_PREFERENCES,
            ...stored,
            notificationTypes: {
              ...DEFAULT_PREFERENCES.notificationTypes,
              ...(stored.notificationTypes ?? {}),
            },
          });
        }
      } catch (err) {
        console.error('[useUserPreferences] Failed to load:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, [user]);

  /**
   * Merge updates into local state and write to Firestore.
   * Throws if the user is not authenticated.
   */
  const savePreferences = useCallback(
    async (updates: Partial<UserPreferences>): Promise<void> => {
      if (!user) throw new Error('Not authenticated');
      setIsSaving(true);
      try {
        const next: UserPreferences = {
          ...preferences,
          ...updates,
          notificationTypes: {
            ...preferences.notificationTypes,
            ...(updates.notificationTypes ?? {}),
          },
        };
        setPreferences(next);
        const prefRef = doc(db, 'users', user.uid, 'preferences', 'settings');
        await setDoc(prefRef, next, { merge: true });
      } finally {
        setIsSaving(false);
      }
    },
    [user, preferences]
  );

  return { preferences, isLoading, isSaving, savePreferences };
};
