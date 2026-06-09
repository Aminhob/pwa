import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCategories, createCategory, deleteCategory } from '../services/categories';
import { CategoryIcon } from '../components/CategoryIcon';
import type { Category, TransactionType } from '../types';

const COLORS = ['#4ade80', '#22d3ee', '#a78bfa', '#fbbf24', '#f87171', '#fb923c', '#60a5fa', '#94a3b8'];
const ICONS = ['tag', 'utensils', 'car', 'shopping-bag', 'receipt', 'heart-pulse', 'gamepad-2', 'briefcase', 'laptop', 'wallet'];

export function Categories() {
  const { userId } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);
  const [type, setType] = useState<TransactionType | 'both'>('expense');

  const load = () => void getCategories(userId).then(setCategories);
  useEffect(() => { load(); }, [userId]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createCategory(userId, { name: name.trim(), icon, color, type });
    setName('');
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: string, isDefault: boolean) => {
    if (isDefault) return;
    await deleteCategory(id);
    load();
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">{categories.length} categories</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} />
          Add
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <div className="type-toggle">
              {(['expense', 'income', 'both'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`type-toggle-btn ${type === t ? 'active income' : ''}`}
                  onClick={() => setType(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-picker">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className={`color-swatch ${color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Icon</label>
            <div className="category-grid">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  className={`category-chip ${icon === i ? 'selected' : ''}`}
                  onClick={() => setIcon(i)}
                >
                  <CategoryIcon icon={i} color={color} size={16} />
                </button>
              ))}
            </div>
          </div>
          <button className="btn btn-primary btn-block" onClick={() => void handleCreate()}>
            Create Category
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {categories.map((cat) => (
          <div key={cat.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              className="tx-icon"
              style={{ background: `${cat.color}22` }}
            >
              <CategoryIcon icon={cat.icon} color={cat.color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{cat.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {cat.type} {cat.isDefault ? '· Default' : ''}
              </div>
            </div>
            {!cat.isDefault && (
              <button
                className="btn-icon"
                onClick={() => void handleDelete(cat.id, cat.isDefault)}
                aria-label="Delete category"
              >
                <Trash2 size={16} color="var(--color-expense)" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
