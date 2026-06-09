import { useOnline } from '../hooks/useOnline';
import { useAuth } from '../context/AuthContext';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export function SyncStatus() {
  const online = useOnline();
  const { syncStatus, user } = useAuth();

  if (!online) {
    return (
      <span className="status-badge offline" title="Offline mode">
        <WifiOff size={12} />
        Offline
      </span>
    );
  }

  if (user && syncStatus === 'syncing') {
    return (
      <span className="status-badge syncing">
        <RefreshCw size={12} className="status-spin" />
        Syncing
      </span>
    );
  }

  return (
    <span className="status-badge online" title="Online">
      <Wifi size={12} />
      {user ? 'Synced' : 'Online'}
    </span>
  );
}
