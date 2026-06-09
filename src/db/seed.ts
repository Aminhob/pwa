import type { Category } from '../types';

const LOCAL_USER = 'local';

export function createDefaultCategories(): Omit<Category, 'createdAt' | 'updatedAt' | 'syncedAt'>[] {
  const now = new Date().toISOString();
  void now;
  return [
    { id: 'cat-food', userId: LOCAL_USER, name: 'Food & Dining', icon: 'utensils', color: '#4ade80', type: 'expense', isDefault: true, deleted: false },
    { id: 'cat-transport', userId: LOCAL_USER, name: 'Transport', icon: 'car', color: '#22d3ee', type: 'expense', isDefault: true, deleted: false },
    { id: 'cat-shopping', userId: LOCAL_USER, name: 'Shopping', icon: 'shopping-bag', color: '#a78bfa', type: 'expense', isDefault: true, deleted: false },
    { id: 'cat-bills', userId: LOCAL_USER, name: 'Bills & Utilities', icon: 'receipt', color: '#fbbf24', type: 'expense', isDefault: true, deleted: false },
    { id: 'cat-health', userId: LOCAL_USER, name: 'Health', icon: 'heart-pulse', color: '#f87171', type: 'expense', isDefault: true, deleted: false },
    { id: 'cat-entertainment', userId: LOCAL_USER, name: 'Entertainment', icon: 'gamepad-2', color: '#fb923c', type: 'expense', isDefault: true, deleted: false },
    { id: 'cat-salary', userId: LOCAL_USER, name: 'Salary', icon: 'briefcase', color: '#34d399', type: 'income', isDefault: true, deleted: false },
    { id: 'cat-freelance', userId: LOCAL_USER, name: 'Freelance', icon: 'laptop', color: '#2dd4bf', type: 'income', isDefault: true, deleted: false },
    { id: 'cat-investment', userId: LOCAL_USER, name: 'Investment', icon: 'trending-up', color: '#60a5fa', type: 'income', isDefault: true, deleted: false },
    { id: 'cat-other-income', userId: LOCAL_USER, name: 'Other Income', icon: 'wallet', color: '#86efac', type: 'income', isDefault: true, deleted: false },
    { id: 'cat-other-expense', userId: LOCAL_USER, name: 'Other', icon: 'circle-dot', color: '#94a3b8', type: 'expense', isDefault: true, deleted: false },
  ];
}
