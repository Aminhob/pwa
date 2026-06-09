import Dexie, { type Table } from 'dexie';
import type { Category, Transaction, Budget, SyncMeta } from '../types';
import { createDefaultCategories } from './seed';

export const LOCAL_USER_ID = 'local';

export class ETacabDatabase extends Dexie {
  categories!: Table<Category>;
  transactions!: Table<Transaction>;
  budgets!: Table<Budget>;
  syncMeta!: Table<SyncMeta>;

  constructor() {
    super('eTacabDB');
    this.version(1).stores({
      categories: 'id, userId, type, updatedAt, deleted',
      transactions: 'id, userId, type, categoryId, date, updatedAt, deleted',
      budgets: 'id, userId, categoryId, month, year, updatedAt, deleted',
      syncMeta: 'key',
    });
  }
}

export const db = new ETacabDatabase();

export async function initializeDatabase(userId: string = LOCAL_USER_ID): Promise<void> {
  const count = await db.categories.where('userId').equals(userId).count();
  if (count === 0) {
    const now = new Date().toISOString();
    const defaults = createDefaultCategories().map((cat) => ({
      ...cat,
      userId,
      createdAt: now,
      updatedAt: now,
      syncedAt: null,
    }));
    await db.categories.bulkAdd(defaults);
  }
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function nowISO(): string {
  return new Date().toISOString();
}
