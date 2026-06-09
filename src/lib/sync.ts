import { db } from '../db/database';
import { supabase, isSupabaseConfigured } from './supabase';
import { camelToSnake, snakeToCamel } from './utils';
import type { Category, Transaction, Budget } from '../types';

const SYNC_META_KEY = 'lastSyncAt';

type Syncable = Category | Transaction | Budget;

function toRemote(record: Syncable) {
  const { syncedAt: _, ...rest } = record;
  return camelToSnake(rest as unknown as Record<string, unknown>);
}

function needsSync(record: Syncable): boolean {
  return record.syncedAt === null || record.updatedAt > record.syncedAt;
}

async function getLastSyncAt(userId: string): Promise<string | null> {
  const meta = await db.syncMeta.get(`${SYNC_META_KEY}:${userId}`);
  return meta?.value ?? null;
}

async function setLastSyncAt(userId: string, timestamp: string): Promise<void> {
  await db.syncMeta.put({ key: `${SYNC_META_KEY}:${userId}`, value: timestamp });
}

async function pushCategories(userId: string): Promise<void> {
  if (!supabase) return;
  const pending = (await db.categories.where('userId').equals(userId).toArray()).filter(needsSync);
  if (pending.length === 0) return;

  const { error } = await supabase.from('categories').upsert(pending.map(toRemote));
  if (error) throw error;

  const now = new Date().toISOString();
  for (const record of pending) {
    await db.categories.update(record.id, { syncedAt: now });
  }
}

async function pushTransactions(userId: string): Promise<void> {
  if (!supabase) return;
  const pending = (await db.transactions.where('userId').equals(userId).toArray()).filter(needsSync);
  if (pending.length === 0) return;

  const { error } = await supabase.from('transactions').upsert(pending.map(toRemote));
  if (error) throw error;

  const now = new Date().toISOString();
  for (const record of pending) {
    await db.transactions.update(record.id, { syncedAt: now });
  }
}

async function pushBudgets(userId: string): Promise<void> {
  if (!supabase) return;
  const pending = (await db.budgets.where('userId').equals(userId).toArray()).filter(needsSync);
  if (pending.length === 0) return;

  const { error } = await supabase.from('budgets').upsert(pending.map(toRemote));
  if (error) throw error;

  const now = new Date().toISOString();
  for (const record of pending) {
    await db.budgets.update(record.id, { syncedAt: now });
  }
}

async function pullCategories(userId: string, since: string | null): Promise<void> {
  if (!supabase) return;

  let query = supabase.from('categories').select('*').eq('user_id', userId);
  if (since) query = query.gt('updated_at', since);

  const { data, error } = await query;
  if (error) throw error;
  if (!data?.length) return;

  for (const remote of data) {
    const record = snakeToCamel<Category>(remote as Record<string, unknown>);
    const local = await db.categories.get(record.id);
    if (!local || record.updatedAt >= local.updatedAt) {
      await db.categories.put({ ...record, syncedAt: new Date().toISOString() });
    }
  }
}

async function pullTransactions(userId: string, since: string | null): Promise<void> {
  if (!supabase) return;

  let query = supabase.from('transactions').select('*').eq('user_id', userId);
  if (since) query = query.gt('updated_at', since);

  const { data, error } = await query;
  if (error) throw error;
  if (!data?.length) return;

  for (const remote of data) {
    const record = snakeToCamel<Transaction>(remote as Record<string, unknown>);
    const local = await db.transactions.get(record.id);
    if (!local || record.updatedAt >= local.updatedAt) {
      await db.transactions.put({ ...record, syncedAt: new Date().toISOString() });
    }
  }
}

async function pullBudgets(userId: string, since: string | null): Promise<void> {
  if (!supabase) return;

  let query = supabase.from('budgets').select('*').eq('user_id', userId);
  if (since) query = query.gt('updated_at', since);

  const { data, error } = await query;
  if (error) throw error;
  if (!data?.length) return;

  for (const remote of data) {
    const record = snakeToCamel<Budget>(remote as Record<string, unknown>);
    const local = await db.budgets.get(record.id);
    if (!local || record.updatedAt >= local.updatedAt) {
      await db.budgets.put({ ...record, syncedAt: new Date().toISOString() });
    }
  }
}

export async function migrateLocalToUser(userId: string): Promise<void> {
  const localCategories = await db.categories.where('userId').equals('local').toArray();
  for (const record of localCategories) {
    await db.categories.update(record.id, { userId, syncedAt: null });
  }

  const localTransactions = await db.transactions.where('userId').equals('local').toArray();
  for (const record of localTransactions) {
    await db.transactions.update(record.id, { userId, syncedAt: null });
  }

  const localBudgets = await db.budgets.where('userId').equals('local').toArray();
  for (const record of localBudgets) {
    await db.budgets.update(record.id, { userId, syncedAt: null });
  }
}

export async function syncWithSupabase(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const lastSync = await getLastSyncAt(userId);

    await pushCategories(userId);
    await pushTransactions(userId);
    await pushBudgets(userId);

    await pullCategories(userId, lastSync);
    await pullTransactions(userId, lastSync);
    await pullBudgets(userId, lastSync);

    await setLastSyncAt(userId, new Date().toISOString());
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed';
    return { success: false, error: message };
  }
}

export function startAutoSync(
  userId: string,
  onStatusChange?: (status: 'syncing' | 'synced' | 'error', error?: string) => void
): () => void {
  let syncing = false;

  const runSync = async () => {
    if (!navigator.onLine || syncing) return;
    syncing = true;
    onStatusChange?.('syncing');
    const result = await syncWithSupabase(userId);
    onStatusChange?.(result.success ? 'synced' : 'error', result.error);
    syncing = false;
  };

  const handleOnline = () => void runSync();
  window.addEventListener('online', handleOnline);

  const interval = setInterval(runSync, 60_000);
  void runSync();

  return () => {
    window.removeEventListener('online', handleOnline);
    clearInterval(interval);
  };
}
