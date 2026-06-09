import { db, generateId, nowISO } from '../db/database';
import type { Category, TransactionType } from '../types';

export async function getCategories(userId: string, type?: TransactionType | 'both'): Promise<Category[]> {
  let cats = await db.categories.where('userId').equals(userId).filter((c) => !c.deleted).toArray();
  if (type) {
    cats = cats.filter((c) => c.type === type || c.type === 'both');
  }
  return cats.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createCategory(
  userId: string,
  data: { name: string; icon: string; color: string; type: TransactionType | 'both' }
): Promise<Category> {
  const now = nowISO();
  const category: Category = {
    id: generateId(),
    userId,
    name: data.name,
    icon: data.icon,
    color: data.color,
    type: data.type,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
    syncedAt: null,
    deleted: false,
  };
  await db.categories.add(category);
  return category;
}

export async function updateCategory(
  id: string,
  data: Partial<Pick<Category, 'name' | 'icon' | 'color' | 'type'>>
): Promise<void> {
  await db.categories.update(id, { ...data, updatedAt: nowISO(), syncedAt: null });
}

export async function deleteCategory(id: string): Promise<void> {
  await db.categories.update(id, { deleted: true, updatedAt: nowISO(), syncedAt: null });
}
