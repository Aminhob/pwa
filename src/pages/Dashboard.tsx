import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMonthlySummary, getRecentTransactions } from '../lib/analytics';
import { getCategories } from '../services/categories';
import { getTransactions } from '../services/transactions';
import { TrendsAnalytics } from '../components/TrendsAnalytics';
import { formatCurrency, getMonthYear } from '../lib/utils';
import type { MonthlySummary, Transaction, Category } from '../types';

function StatTile({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: 'income' | 'expense';
  icon: React.ReactNode;
}) {
  return (
    <div className="glass-card stat-tile-ref">
      <div className="stat-tile-ref-header">
        <span className="stat-tile-ref-label">{label}</span>
        <span className={`stat-tile-ref-icon ${tone}`}>{icon}</span>
      </div>
      <p className="stat-tile-ref-value">{formatCurrency(value)}</p>
    </div>
  );
}

export function Dashboard() {
  const { userId } = useAuth();
  const { month, year } = getMonthYear();
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  useEffect(() => {
    void Promise.all([
      getMonthlySummary(userId, month, year),
      getRecentTransactions(userId, 5),
      getCategories(userId),
      getTransactions(userId, {
        search: '',
        type: 'all',
        categoryId: 'all',
        dateFrom: null,
        dateTo: null,
      }),
    ]).then(([s, r, c, txs]) => {
      setSummary(s);
      setRecent(r);
      setCategories(c);
      setAllTransactions(txs);
    });
  }, [userId, month, year]);

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const balance = allTransactions.reduce(
    (sum, tx) => sum + (tx.type === 'income' ? tx.amount : -tx.amount),
    0
  );

  return (
    <div className="dashboard-page">
      <section className="balance-section glass-card">
        <p className="balance-label">Total balance</p>
        <h1 className="balance-amount">{formatCurrency(balance)}</h1>
        <p className="balance-month">{monthName}</p>
      </section>

      <section className="stat-grid-ref">
        <StatTile
          label="Income"
          value={summary?.income ?? 0}
          tone="income"
          icon={<TrendingUp size={16} />}
        />
        <StatTile
          label="Expenses"
          value={summary?.expenses ?? 0}
          tone="expense"
          icon={<TrendingDown size={16} />}
        />
      </section>

      <TrendsAnalytics transactions={allTransactions} categories={categories} />

      <section className="recent-section glass-card">
        <div className="section-header">
          <h2 className="section-title">Recent activity</h2>
          <Link to="/transactions" className="section-link-plain">
            See all
          </Link>
        </div>
        <ul className="recent-list">
          {recent.length === 0 ? (
            <li className="recent-empty">
              No transactions yet. Tap the + button to add one.
            </li>
          ) : (
            recent.map((tx) => {
              const cat = catMap.get(tx.categoryId);
              const color = cat?.color ?? '#1DB87A';
              return (
                <li key={tx.id} className="recent-item">
                  <div
                    className="recent-avatar"
                    style={{ background: `${color}22`, color }}
                  >
                    {(cat?.name ?? '?').slice(0, 1)}
                  </div>
                  <div className="recent-details">
                    <p className="recent-title">{tx.description || cat?.name || 'Transaction'}</p>
                    <p className="recent-meta">
                      {cat?.name} · {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`recent-amount ${tx.type}`}>
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      </section>
    </div>
  );
}
