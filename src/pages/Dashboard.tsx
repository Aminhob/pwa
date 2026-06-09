import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMonthlySummary, getRecentTransactions } from '../lib/analytics';
import { getCategories } from '../services/categories';
import { getTransactions } from '../services/transactions';
import { BalanceCard } from '../components/Dashboard/BalanceCard';
import { ExpenseCard } from '../components/Dashboard/ExpenseCard';
import { TrendsAnalytics } from '../components/TrendsAnalytics';
import { getMonthYear } from '../lib/utils';
import type { MonthlySummary, Transaction, Category } from '../types';

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
    <div className="dashboard-container">
      <BalanceCard balance={balance} monthName={monthName} />
      <ExpenseCard income={summary?.income ?? 0} expenses={summary?.expenses ?? 0} />
      <TrendsAnalytics transactions={allTransactions} categories={categories} />
      <section className="recent-section">
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
                    {tx.amount}
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
