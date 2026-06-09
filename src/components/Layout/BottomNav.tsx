import { NavLink } from 'react-router-dom';
import { Home, ListOrdered, PiggyBank, Settings, Plus } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/transactions', icon: ListOrdered, label: 'Activity' },
  { to: '/add', icon: Plus, label: 'Add', fab: true },
  { to: '/budgets', icon: PiggyBank, label: 'Budgets' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      <div className="bottom-nav-inner">
        {navItems.map(({ to, icon: Icon, label, fab }) =>
          fab ? (
            <NavLink key={to} to={to} className="nav-fab" aria-label="Add transaction">
              <Plus size={24} strokeWidth={2.5} />
            </NavLink>
          ) : (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          )
        )}
      </div>
    </nav>
  );
}
