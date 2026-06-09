import { db, generateId, nowISO } from '../db/database';
import type { Transaction, TransactionFilters, TransactionType } from '../types';

export async function createTransaction(
  userId: string,
  data: {
    type: TransactionType;
    amount: number;
    categoryId: string;
    description: string;
    date: string;
    tags?: string[];
  }
): Promise<Transaction> {
  const now = nowISO();
  const transaction: Transaction = {
    id: generateId(),
    userId,
    type: data.type,
    amount: data.amount,
    categoryId: data.categoryId,
    description: data.description,
    date: data.date,
    tags: data.tags ?? [],
    createdAt: now,
    updatedAt: now,
    syncedAt: null,
    deleted: false,
  };
  await db.transactions.add(transaction);
  return transaction;
}

export async function updateTransaction(
  id: string,
  data: Partial<Pick<Transaction, 'type' | 'amount' | 'categoryId' | 'description' | 'date' | 'tags'>>
): Promise<void> {
  await db.transactions.update(id, { ...data, updatedAt: nowISO(), syncedAt: null });
}

export async function deleteTransaction(id: string): Promise<void> {
  await db.transactions.update(id, { deleted: true, updatedAt: nowISO(), syncedAt: null });
}

export async function getTransactions(userId: string, filters: TransactionFilters): Promise<Transaction[]> {
  let results = await db.transactions
    .where('userId')
    .equals(userId)
    .filter((t) => !t.deleted)
    .toArray();

  if (filters.type !== 'all') {
    results = results.filter((t) => t.type === filters.type);
  }
  if (filters.categoryId !== 'all') {
    results = results.filter((t) => t.categoryId === filters.categoryId);
  }
  if (filters.dateFrom) {
    results = results.filter((t) => t.date >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    results = results.filter((t) => t.date <= filters.dateTo!);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  return results.sort((a, b) => b.date.localeCompare(a.date));
}
