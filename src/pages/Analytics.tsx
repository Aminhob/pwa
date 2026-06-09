import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMonthlySummary } from '../lib/analytics';
import { formatCurrency } from '../lib/utils';
import type { MonthlySummary } from '../types';

export function Analytics() {
  const { userId } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState<MonthlySummary | null>(null);

  const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  useEffect(() => {
    void getMonthlySummary(userId, month, year).then(setSummary);
  }, [userId, month, year]);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const maxExpense = Math.max(...(summary?.byCategory.map((c) => c.amount) ?? [1]), 1);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Insights</h1>
          <p className="page-subtitle">Spending breakdown</p>
        </div>
      </div>

      <div
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <button className="btn-icon" onClick={prevMonth} aria-label="Previous month">
          <ChevronLeft size={20} />
        </button>
        <span style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>{monthName}</span>
        <button className="btn-icon" onClick={nextMonth} aria-label="Next month">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="card-grid card-grid-2" style={{ marginBottom: 20 }}>
        <div className="summary-card" style={{ '--accent': 'var(--color-income)' } as React.CSSProperties}>
          <div className="summary-label">Total Income</div>
          <div className="summary-value income">{formatCurrency(summary?.income ?? 0)}</div>
        </div>
        <div className="summary-card" style={{ '--accent': 'var(--color-expense)' } as React.CSSProperties}>
          <div className="summary-label">Total Expenses</div>
          <div className="summary-value expense">{formatCurrency(summary?.expenses ?? 0)}</div>
        </div>
      </div>

      <div
        className="summary-card"
        style={{ marginBottom: 24, '--accent': 'var(--color-primary)' } as React.CSSProperties}
      >
        <div className="summary-label">Savings Rate</div>
        <div className="summary-value balance">
          {summary && summary.income > 0
            ? `${Math.round((summary.balance / summary.income) * 100)}%`
            : '0%'}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
          Net {formatCurrency(summary?.balance ?? 0)} this month
        </p>
      </div>

      <section className="section">
        <h2 className="section-title" style={{ marginBottom: 16 }}>Spending by Category</h2>
        {summary?.byCategory.length === 0 ? (
          <div className="empty-state card">
            <p>No expense data for this month</p>
          </div>
        ) : (
          <>
            <div className="chart-bars" style={{ marginBottom: 20 }}>
              {summary?.byCategory.slice(0, 6).map((cat) => (
                <div key={cat.categoryId} className="chart-bar-group">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${(cat.amount / maxExpense) * 100}%`,
                      '--bar-color': cat.color,
                      '--bar-color-dark': `${cat.color}99`,
                    } as React.CSSProperties}
                  />
                  <span className="chart-label">{cat.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {summary?.byCategory.map((cat) => {
                const pct = summary.expenses > 0 ? (cat.amount / summary.expenses) * 100 : 0;
                return (
                  <div key={cat.categoryId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: cat.color,
                            marginRight: 8,
                          }}
                        />
                        {cat.name}
                      </span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        {formatCurrency(cat.amount)}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill ok"
                        style={{ width: `${pct}%`, background: cat.color }}
                      />
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                      {pct.toFixed(1)}% of expenses
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
