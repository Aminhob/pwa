import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createTransaction } from '../services/transactions';
import { getCategories } from '../services/categories';
import { CategoryIcon } from '../components/CategoryIcon';
import type { Category, TransactionType } from '../types';

export function AddTransaction() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void getCategories(userId, type).then((cats) => {
      setCategories(cats);
      if (cats.length > 0 && !cats.find((c) => c.id === categoryId)) {
        setCategoryId(cats[0].id);
      }
    });
  }, [userId, type, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (!categoryId) {
      setError('Select a category');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await createTransaction(userId, {
        type,
        amount: parsed,
        categoryId,
        description,
        date,
      });
      navigate('/dashboard');
    } catch {
      setError('Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Entry</h1>
          <p className="page-subtitle">Track your money flow</p>
        </div>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)}>
        <div className="type-toggle" style={{ marginBottom: 28 }}>
          <button
            type="button"
            className={`type-toggle-btn ${type === 'expense' ? 'active expense' : ''}`}
            onClick={() => setType('expense')}
          >
            Expense
          </button>
          <button
            type="button"
            className={`type-toggle-btn ${type === 'income' ? 'active income' : ''}`}
            onClick={() => setType('income')}
          >
            Income
          </button>
        </div>

        <div className="amount-hero">
          <div className="amount-hero-label">Amount</div>
          <div className="amount-hero-input-wrap">
            <span className="amount-hero-currency">$</span>
            <input
              className="amount-hero-input"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <div className="category-grid">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`category-chip ${categoryId === cat.id ? 'selected' : ''}`}
                style={{ '--chip-color': cat.color } as React.CSSProperties}
                onClick={() => setCategoryId(cat.id)}
              >
                <div
                  className="category-chip-icon"
                  style={{ background: `${cat.color}18` }}
                >
                  <CategoryIcon icon={cat.icon} color={cat.color} size={18} />
                </div>
                <span className="category-chip-name">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Note</label>
          <input
            className="form-input"
            type="text"
            placeholder="What was this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            className="form-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block" disabled={saving} style={{ marginTop: 8 }}>
          {saving ? 'Saving...' : 'Confirm Transaction'}
        </button>
      </form>
    </div>
  );
}
