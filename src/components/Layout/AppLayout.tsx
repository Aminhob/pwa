import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { SyncStatus } from '../SyncStatus';

export function AppLayout() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-brand">
          <div className="app-brand-mark">e</div>
          <span className="app-brand-name">eTacab</span>
        </div>
        <SyncStatus />
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
