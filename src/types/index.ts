export type TransactionType = 'expense' | 'income';

export interface BaseRecord {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  syncedAt: string | null;
  deleted: boolean;
}

export interface Category extends BaseRecord {
  name: string;
  icon: string;
  color: string;
  type: TransactionType | 'both';
  isDefault: boolean;
}

export interface Transaction extends BaseRecord {
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
  tags: string[];
}

export interface Budget extends BaseRecord {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}

export interface SyncMeta {
  key: string;
  value: string;
}

export interface ExportData {
  version: number;
  exportedAt: string;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
}

export interface TransactionFilters {
  search: string;
  type: TransactionType | 'all';
  categoryId: string | 'all';
  dateFrom: string | null;
  dateTo: string | null;
}

export interface MonthlySummary {
  income: number;
  expenses: number;
  balance: number;
  byCategory: { categoryId: string; name: string; color: string; amount: number }[];
}
