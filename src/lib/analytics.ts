import { db } from '../db/database';
import type { MonthlySummary, Transaction, Category } from '../types';

export async function getMonthlySummary(
  userId: string,
  month: number,
  year: number
): Promise<MonthlySummary> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

  const [transactions, categories] = await Promise.all([
    db.transactions
      .where('userId')
      .equals(userId)
      .filter((t) => !t.deleted && t.date >= startDate && t.date < endDate)
      .toArray(),
    db.categories.where('userId').equals(userId).filter((c) => !c.deleted).toArray(),
  ]);

  return computeSummary(transactions, categories);
}

export function computeSummary(
  transactions: Transaction[],
  categories: Category[]
): MonthlySummary {
  const catMap = new Map(categories.map((c) => [c.id, c]));
  let income = 0;
  let expenses = 0;
  const categoryTotals = new Map<string, number>();

  for (const tx of transactions) {
    if (tx.type === 'income') {
      income += tx.amount;
    } else {
      expenses += tx.amount;
      categoryTotals.set(tx.categoryId, (categoryTotals.get(tx.categoryId) ?? 0) + tx.amount);
    }
  }

  const byCategory = Array.from(categoryTotals.entries())
    .map(([categoryId, amount]) => {
      const cat = catMap.get(categoryId);
      return {
        categoryId,
        name: cat?.name ?? 'Unknown',
        color: cat?.color ?? '#94a3b8',
        amount,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return { income, expenses, balance: income - expenses, byCategory };
}

export async function getRecentTransactions(userId: string, limit = 5): Promise<Transaction[]> {
  const txs = await db.transactions
    .where('userId')
    .equals(userId)
    .filter((t) => !t.deleted)
    .toArray();
  return txs.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}

export async function getBudgetProgress(
  userId: string,
  month: number,
  year: number
): Promise<{ categoryId: string; name: string; color: string; budget: number; spent: number; percent: number }[]> {
  const [budgets, summary, categories] = await Promise.all([
    db.budgets
      .where('userId')
      .equals(userId)
      .filter((b) => !b.deleted && b.month === month && b.year === year)
      .toArray(),
    getMonthlySummary(userId, month, year),
    db.categories.where('userId').equals(userId).filter((c) => !c.deleted).toArray(),
  ]);

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const spentMap = new Map(summary.byCategory.map((c) => [c.categoryId, c.amount]));

  return budgets.map((b) => {
    const spent = spentMap.get(b.categoryId) ?? 0;
    const cat = catMap.get(b.categoryId);
    return {
      categoryId: b.categoryId,
      name: cat?.name ?? 'Unknown',
      color: cat?.color ?? '#94a3b8',
      budget: b.amount,
      spent,
      percent: b.amount > 0 ? Math.min((spent / b.amount) * 100, 100) : 0,
    };
  });
}
