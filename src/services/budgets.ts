import { db, generateId, nowISO } from '../db/database';
import type { Budget } from '../types';

export async function getBudgets(userId: string, month: number, year: number): Promise<Budget[]> {
  return db.budgets
    .where('userId')
    .equals(userId)
    .filter((b) => !b.deleted && b.month === month && b.year === year)
    .toArray();
}

export async function setBudget(
  userId: string,
  categoryId: string,
  amount: number,
  month: number,
  year: number
): Promise<Budget> {
  const existing = await db.budgets
    .where('userId')
    .equals(userId)
    .filter((b) => !b.deleted && b.categoryId === categoryId && b.month === month && b.year === year)
    .first();

  const now = nowISO();

  if (existing) {
    await db.budgets.update(existing.id, { amount, updatedAt: now, syncedAt: null });
    return { ...existing, amount, updatedAt: now, syncedAt: null };
  }

  const budget: Budget = {
    id: generateId(),
    userId,
    categoryId,
    amount,
    month,
    year,
    createdAt: now,
    updatedAt: now,
    syncedAt: null,
    deleted: false,
  };
  await db.budgets.add(budget);
  return budget;
}

export async function deleteBudget(id: string): Promise<void> {
  await db.budgets.update(id, { deleted: true, updatedAt: nowISO(), syncedAt: null });
}
