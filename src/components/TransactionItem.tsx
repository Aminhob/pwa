import type { Transaction, Category } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency, formatShortDate } from '../lib/utils';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  onClick?: () => void;
}

export function TransactionItem({ transaction, category, onClick }: TransactionItemProps) {
  const isIncome = transaction.type === 'income';
  const color = category?.color ?? '#86a89a';

  return (
    <div className="tx-item" onClick={onClick} role={onClick ? 'button' : undefined}>
      <div
        className="tx-icon"
        style={{
          background: `linear-gradient(135deg, ${color}22 0%, ${color}08 100%)`,
          borderColor: `${color}33`,
        }}
      >
        <CategoryIcon icon={category?.icon ?? 'tag'} color={color} />
      </div>
      <div className="tx-details">
        <div className="tx-title">{transaction.description || category?.name || 'Transaction'}</div>
        <div className="tx-meta">
          {category?.name} · {formatShortDate(transaction.date)}
        </div>
      </div>
      <div className="tx-amount-wrap">
        <div className={`tx-amount ${isIncome ? 'income' : 'expense'}`}>
          {isIncome ? '+' : '−'}{formatCurrency(transaction.amount)}
        </div>
      </div>
    </div>
  );
}
