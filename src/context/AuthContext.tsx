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
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    void supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
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
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
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
