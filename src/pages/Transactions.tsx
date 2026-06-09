import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTransactions, deleteTransaction } from '../services/transactions';
import { getCategories } from '../services/categories';
import { TransactionItem } from '../components/TransactionItem';
import type { Transaction, Category, TransactionFilters, TransactionType } from '../types';

export function Transactions() {
  const { userId } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    type: 'all',
    categoryId: 'all',
    dateFrom: null,
    dateTo: null,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [txs, cats] = await Promise.all([
      getTransactions(userId, filters),
      getCategories(userId),
    ]);
    setTransactions(txs);
    setCategories(cats);
  }, [userId, filters]);

  useEffect(() => {
    void load();
  }, [load]);

  const catMap = new Map(categories.map((c) => [c.id, c]));

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
    setSelectedId(null);
    void load();
  };

  const setType = (type: TransactionType | 'all') =>
    setFilters((f) => ({ ...f, type }));

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity</h1>
          <p className="page-subtitle">{transactions.length} records</p>
        </div>
      </div>

      <div className="search-bar">
        <Search />
        <input
          type="search"
          placeholder="Search transactions..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
      </div>

      <div className="filter-row">
        {(['all', 'expense', 'income'] as const).map((t) => (
          <button
            key={t}
            className={`filter-chip ${filters.type === t ? 'active' : ''}`}
            onClick={() => setType(t)}
          >
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`filter-chip ${filters.categoryId === cat.id ? 'active' : ''}`}
            onClick={() =>
              setFilters((f) => ({
                ...f,
                categoryId: f.categoryId === cat.id ? 'all' : cat.id,
              }))
            }
          >
            {cat.name}
          </button>
        ))}
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state card">
          <Search />
          <p>No transactions found</p>
        </div>
      ) : (
        <div className="tx-list">
          {transactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              category={catMap.get(tx.categoryId)}
              onClick={() => setSelectedId(tx.id)}
            />
          ))}
        </div>
      )}

      {selectedId && (
        <div className="modal-overlay" onClick={() => setSelectedId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Transaction Options</h3>
              <button className="btn-icon" onClick={() => setSelectedId(null)}>✕</button>
            </div>
            <button
              className="btn btn-danger btn-block"
              onClick={() => void handleDelete(selectedId)}
            >
              <Trash2 size={16} />
              Delete Transaction
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
