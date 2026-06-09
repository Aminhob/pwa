import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { setBudget } from '../services/budgets';
import { getCategories } from '../services/categories';
import { getBudgetProgress } from '../lib/analytics';
import { CategoryIcon } from '../components/CategoryIcon';
import { formatCurrency, getMonthYear } from '../lib/utils';
import type { Category } from '../types';

export function Budgets() {
  const { userId } = useAuth();
  const { month, year } = getMonthYear();
  const [categories, setCategories] = useState<Category[]>([]);
  const [progress, setProgress] = useState<Awaited<ReturnType<typeof getBudgetProgress>>>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const load = async () => {
    const [cats, prog] = await Promise.all([
      getCategories(userId, 'expense'),
      getBudgetProgress(userId, month, year),
    ]);
    setCategories(cats);
    setProgress(prog);
  };

  useEffect(() => {
    void load();
  }, [userId, month, year]);

  const handleSave = async (categoryId: string) => {
    const amount = parseFloat(editAmount);
    if (!amount || amount <= 0) return;
    await setBudget(userId, categoryId, amount, month, year);
    setEditingId(null);
    setEditAmount('');
    void load();
  };

  const budgetedIds = new Set(progress.map((p) => p.categoryId));
  const unbudgeted = categories.filter((c) => !budgetedIds.has(c.id));

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">{monthName}</p>
        </div>
      </div>

      {progress.length > 0 && (
        <section className="section">
          <h2 className="section-title" style={{ marginBottom: 12 }}>Active Budgets</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {progress.map((b) => (
              <div key={b.categoryId} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <CategoryIcon icon={categories.find((c) => c.id === b.categoryId)?.icon ?? 'tag'} color={b.color} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{b.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {formatCurrency(b.spent)} of {formatCurrency(b.budget)}
                    </div>
                  </div>
                  <span style={{
                    fontWeight: 700,
                    color: b.percent >= 100 ? 'var(--color-expense)' : 'var(--color-primary-light)',
                  }}>
                    {Math.round(b.percent)}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${b.percent >= 100 ? 'over' : b.percent >= 80 ? 'warning' : 'ok'}`}
                    style={{ width: `${b.percent}%`, background: b.percent >= 100 ? undefined : b.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <h2 className="section-title" style={{ marginBottom: 12 }}>Set Budget</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(unbudgeted.length > 0 ? unbudgeted : categories).map((cat) => (
            <div key={cat.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CategoryIcon icon={cat.icon} color={cat.color} />
              <span style={{ flex: 1, fontWeight: 500 }}>{cat.name}</span>
              {editingId === cat.id ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="form-input"
                    type="number"
                    style={{ width: 100, padding: '8px 10px' }}
                    placeholder="0"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    autoFocus
                  />
                  <button className="btn btn-primary btn-sm" onClick={() => void handleSave(cat.id)}>
                    Save
                  </button>
                </div>
              ) : (
                <button className="btn btn-secondary btn-sm" onClick={() => { setEditingId(cat.id); setEditAmount(''); }}>
                  Set
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
