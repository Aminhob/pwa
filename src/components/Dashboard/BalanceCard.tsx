import { formatCurrency } from '../../lib/utils';

interface BalanceCardProps {
  balance: number;
  monthName: string;
}

export function BalanceCard({ balance, monthName }: BalanceCardProps) {
  return (
    <div className="balance-card">
      <p className="balance-label">Total balance</p>
      <h1 className="balance-amount">{formatCurrency(balance)}</h1>
      <p className="balance-month">{monthName}</p>
    </div>
  );
}
