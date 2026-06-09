import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import type { Transaction, Category } from '../types';

type Period = '7d' | '30d' | '6m';

const CHART_COLORS = ['#1DB87A', '#34D399', '#60A5FA', '#F59E0B', '#F472B6', '#A78BFA', '#22D3EE', '#FB7185'];

interface TrendsAnalyticsProps {
  transactions: Transaction[];
  categories: Category[];
}

export function TrendsAnalytics({ transactions, categories }: TrendsAnalyticsProps) {
  const [period, setPeriod] = useState<Period>('30d');
  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const chartData = useMemo(() => {
    if (period === '6m') {
      const points = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        const txs = transactions.filter((t) => {
          const td = new Date(t.date);
          return td.getFullYear() === y && td.getMonth() === m;
        });
        points.push({
          label: d.toLocaleDateString(undefined, { month: 'short' }),
          income: txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
          expense: txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        });
      }
      return points;
    }

    const days = period === '7d' ? 7 : 30;
    const points = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const txs = transactions.filter((t) => t.date === key);
      points.push({
        label:
          period === '7d'
            ? d.toLocaleDateString(undefined, { weekday: 'short' })
            : `${d.getMonth() + 1}/${d.getDate()}`,
        income: txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }
    return points;
  }, [transactions, period]);

  const categoryData = useMemo(() => {
    const start = new Date();
    if (period === '7d') start.setDate(start.getDate() - 6);
    else if (period === '30d') start.setDate(start.getDate() - 29);
    else start.setMonth(start.getMonth() - 5, 1);
    const startKey = start.toISOString().slice(0, 10);

    const totals = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type === 'expense' && tx.date >= startKey) {
        totals.set(tx.categoryId, (totals.get(tx.categoryId) ?? 0) + tx.amount);
      }
    }

    const all = Array.from(totals.entries())
      .map(([id, value], i) => {
        const cat = catMap.get(id);
        return { id, name: cat?.name ?? 'Unknown', color: cat?.color ?? CHART_COLORS[i % CHART_COLORS.length], value };
      })
      .sort((a, b) => b.value - a.value);

    const top = all.slice(0, 6);
    const other = all.slice(6).reduce((s, c) => s + c.value, 0);
    if (other > 0) top.push({ id: '__other__', name: 'Other', color: '#94A3B8', value: other });
    return top;
  }, [transactions, period, catMap]);

  const totalIncome = chartData.reduce((s, d) => s + d.income, 0);
  const totalExpense = chartData.reduce((s, d) => s + d.expense, 0);
  const net = totalIncome - totalExpense;
  const categoryTotal = categoryData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="trends-analytics">
      <div className="trends-header">
        <div>
          <p className="trends-eyebrow">Analytics</p>
          <p className="trends-title">Your trends</p>
        </div>
        <div className="period-toggle">
          {(['7d', '30d', '6m'] as const).map((p) => (
            <button
              key={p}
              type="button"
              className={`period-btn ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p === '7d' ? '7D' : p === '30d' ? '30D' : '6M'}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card trends-card">
        <div className="trends-card-header">
          <div>
            <p className="trends-eyebrow">Income vs Expense</p>
            <p className="trends-summary">
              <span className="income">{formatCurrency(totalIncome)}</span>
              <span className="muted"> in · </span>
              <span className="expense">{formatCurrency(totalExpense)}</span>
              <span className="muted"> out</span>
            </p>
            <p className="trends-net">
              Net <span className={net >= 0 ? 'income' : 'expense'}>{formatCurrency(net)}</span>
            </p>
          </div>
          <div className="trends-icon-badge">
            <TrendingUp size={16} />
          </div>
        </div>
        <div className="trends-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1DB87A" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#1DB87A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F87171" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#F87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#98aa9b' }} axisLine={false} tickLine={false} />
              <Area type="monotone" dataKey="income" stroke="#1DB87A" strokeWidth={2} fill="url(#gIncome)" />
              <Area type="monotone" dataKey="expense" stroke="#F87171" strokeWidth={2} fill="url(#gExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card trends-card">
        <div className="trends-card-header">
          <div>
            <p className="trends-eyebrow">Spending by category</p>
            <p className="trends-category-total">{formatCurrency(categoryTotal)}</p>
          </div>
          <div className="trends-icon-badge">
            <PieChartIcon size={16} />
          </div>
        </div>

        {categoryData.length === 0 ? (
          <div className="trends-empty">No expenses in this period yet.</div>
        ) : (
          <div className="category-chart-grid">
            <div className="category-pie-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    innerRadius={42}
                    outerRadius={64}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {categoryData.map((c) => (
                      <Cell key={c.id} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#0F2A1F',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(value, _name, item) => [
                      formatCurrency(Number(value)),
                      (item?.payload as { name: string })?.name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="category-pie-center">
                <span className="category-pie-label">Total</span>
                <span className="category-pie-value">{formatCurrency(categoryTotal)}</span>
              </div>
            </div>
            <ul className="category-legend">
              {categoryData.map((c) => {
                const pct = categoryTotal > 0 ? (c.value / categoryTotal) * 100 : 0;
                return (
                  <li key={c.id} className="category-legend-item">
                    <div className="category-legend-row">
                      <span className="category-legend-name">
                        <span className="category-dot" style={{ background: c.color }} />
                        {c.name}
                      </span>
                      <span className="category-legend-amount">{formatCurrency(c.value)}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill ok" style={{ width: `${pct}%`, background: c.color }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
