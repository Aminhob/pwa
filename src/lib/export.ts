import { db } from '../db/database';
import type { ExportData } from '../types';
import { downloadFile } from './utils';

export async function exportToJSON(userId: string): Promise<void> {
  const [categories, transactions, budgets] = await Promise.all([
    db.categories.where('userId').equals(userId).filter((c) => !c.deleted).toArray(),
    db.transactions.where('userId').equals(userId).filter((t) => !t.deleted).toArray(),
    db.budgets.where('userId').equals(userId).filter((b) => !b.deleted).toArray(),
  ]);

  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories,
    transactions,
    budgets,
  };

  downloadFile(JSON.stringify(data, null, 2), `etacab-export-${Date.now()}.json`, 'application/json');
}

export async function exportToCSV(userId: string): Promise<void> {
  const transactions = await db.transactions
    .where('userId')
    .equals(userId)
    .filter((t) => !t.deleted)
    .toArray();

  const categories = await db.categories.where('userId').equals(userId).toArray();
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  const header = 'date,type,amount,category,description,tags';
  const rows = transactions.map((t) => {
    const tags = t.tags.join(';');
    const category = catMap.get(t.categoryId) ?? 'Unknown';
    const desc = `"${t.description.replace(/"/g, '""')}"`;
    return `${t.date},${t.type},${t.amount},${category},${desc},${tags}`;
  });

  downloadFile([header, ...rows].join('\n'), `etacab-transactions-${Date.now()}.csv`, 'text/csv');
}

export async function importFromJSON(userId: string, file: File): Promise<{ success: boolean; error?: string }> {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as ExportData;

    if (!data.version || !data.categories || !data.transactions) {
      return { success: false, error: 'Invalid export file format' };
    }

    const now = new Date().toISOString();

    await db.transaction('rw', db.categories, db.transactions, db.budgets, async () => {
      for (const cat of data.categories) {
        await db.categories.put({ ...cat, userId, syncedAt: null, updatedAt: now });
      }
      for (const tx of data.transactions) {
        await db.transactions.put({ ...tx, userId, syncedAt: null, updatedAt: now });
      }
      if (data.budgets) {
        for (const budget of data.budgets) {
          await db.budgets.put({ ...budget, userId, syncedAt: null, updatedAt: now });
        }
      }
    });

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to parse import file' };
  }
}
