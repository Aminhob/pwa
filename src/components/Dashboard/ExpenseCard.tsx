import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface ExpenseCardProps {
  income: number;
  expenses: number;
}

export function ExpenseCard({ income, expenses }: ExpenseCardProps) {
  return (
    <div className="expense-card">
      <div className="expense-card-item">
        <div className="expense-card-header">
          <span className="expense-card-label">Income</span>
          <span className="expense-card-icon income">
            <TrendingUp size={16} />
          </span>
        </div>
        <p className="expense-card-value">{formatCurrency(income)}</p>
      </div>
      <div className="expense-card-item">
        <div className="expense-card-header">
          <span className="expense-card-label">Expenses</span>
          <span className="expense-card-icon expense">
            <TrendingDown size={16} />
          </span>
        </div>
        <p className="expense-card-value">{formatCurrency(expenses)}</p>
      </div>
    </div>
  );
}
