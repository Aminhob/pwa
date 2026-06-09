import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { initializeDatabase, LOCAL_USER_ID } from '../db/database';
import { migrateLocalToUser, startAutoSync, syncWithSupabase } from '../lib/sync';
import type { User, Session } from '@supabase/supabase-js';

const AUTH_TIMEOUT = 10000; // 10 second timeout for auth operations
const SESSION_STORAGE_KEY = 'etacab_session';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  userId: string;
  loading: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  syncError: string | null;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  triggerSync: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Helper function to add timeout to promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);

  const userId = user?.id ?? LOCAL_USER_ID;

  useEffect(() => {
    void initializeDatabase(userId);
  }, [userId]);

  useEffect(() => {
    // Check for persisted session first
    const persistedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (persistedSession) {
      try {
        const sessionData = JSON.parse(persistedSession);
        setSession(sessionData);
        setUser(sessionData.user ?? null);
      } catch (e) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }

    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Add timeout to getSession to prevent infinite loading
    withTimeout(
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        setSession(s);
        setUser(s?.user ?? null);
        // Persist session to localStorage
        if (s) {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(s));
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
        setLoading(false);
      }),
      AUTH_TIMEOUT,
      'Authentication timeout. Please check your connection and try again.'
    ).catch((error) => {
      console.error('Auth timeout error:', error);
      setLoading(false);
      // Clear any stale session data
      localStorage.removeItem(SESSION_STORAGE_KEY);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      // Persist session changes
      if (s) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(s));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
      if (s?.user) {
        await migrateLocalToUser(s.user.id);
        await initializeDatabase(s.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const cleanup = startAutoSync(user.id, (status, error) => {
      setSyncStatus(status === 'syncing' ? 'syncing' : status === 'synced' ? 'synced' : 'error');
      setSyncError(error ?? null);
    });
    return cleanup;
  }, [user]);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase not configured' };
    try {
      const { error } = await withTimeout(
        supabase.auth.signUp({ email, password }),
        AUTH_TIMEOUT,
        'Sign up timeout. Please try again.'
      );
      return { error: error?.message ?? null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Sign up failed. Please try again.' };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase not configured' };
    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        AUTH_TIMEOUT,
        'Sign in timeout. Please try again.'
      );
      return { error: error?.message ?? null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Sign in failed. Please try again.' };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSyncStatus('idle');
    setSyncError(null);
  }, []);

  const triggerSync = useCallback(async () => {
    if (!user) return;
    setSyncStatus('syncing');
    const result = await syncWithSupabase(user.id);
    setSyncStatus(result.success ? 'synced' : 'error');
    setSyncError(result.error ?? null);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userId,
        loading,
        syncStatus,
        syncError,
        signUp,
        signIn,
        signOut,
        triggerSync,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
