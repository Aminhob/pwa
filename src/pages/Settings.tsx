import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Download,
  Upload,
  Tags,
  Target,
  LogOut,
  RefreshCw,
  Cloud,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { exportToJSON, exportToCSV, importFromJSON } from '../lib/export';
import { isSupabaseConfigured } from '../lib/supabase';

export function Settings() {
  const { user, signOut, triggerSync, syncStatus, userId } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState('');

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await importFromJSON(userId, file);
    setImportMsg(result.success ? 'Import successful!' : result.error ?? 'Import failed');
    e.target.value = '';
    setTimeout(() => setImportMsg(''), 3000);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your data & account</p>
        </div>
      </div>

      {user ? (
        <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="settings-item-icon">
            <User size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{user.email}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Signed in · Multi-device sync enabled
            </div>
          </div>
        </div>
      ) : (
        <Link to="/auth" className="card" style={{ marginBottom: 16, display: 'block', textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="settings-item-icon">
              <Cloud size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>Sign in to sync</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Connect Supabase account for multi-device sync
              </div>
            </div>
          </div>
        </Link>
      )}

      <div className="settings-list">
        <Link to="/categories" className="settings-item" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="settings-item-left">
            <div className="settings-item-icon"><Tags size={18} /></div>
            <div>
              <div className="settings-item-label">Categories</div>
              <div className="settings-item-desc">Manage expense & income categories</div>
            </div>
          </div>
        </Link>

        <Link to="/budgets" className="settings-item" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="settings-item-left">
            <div className="settings-item-icon"><Target size={18} /></div>
            <div>
              <div className="settings-item-label">Budgets</div>
              <div className="settings-item-desc">Monthly budget planning</div>
            </div>
          </div>
        </Link>

        <button className="settings-item" onClick={() => void exportToJSON(userId)}>
          <div className="settings-item-left">
            <div className="settings-item-icon"><Download size={18} /></div>
            <div>
              <div className="settings-item-label">Export JSON</div>
              <div className="settings-item-desc">Full data backup</div>
            </div>
          </div>
        </button>

        <button className="settings-item" onClick={() => void exportToCSV(userId)}>
          <div className="settings-item-left">
            <div className="settings-item-icon"><Download size={18} /></div>
            <div>
              <div className="settings-item-label">Export CSV</div>
              <div className="settings-item-desc">Transactions spreadsheet</div>
            </div>
          </div>
        </button>

        <button className="settings-item" onClick={() => fileRef.current?.click()}>
          <div className="settings-item-left">
            <div className="settings-item-icon"><Upload size={18} /></div>
            <div>
              <div className="settings-item-label">Import JSON</div>
              <div className="settings-item-desc">Restore from backup</div>
            </div>
          </div>
        </button>
        <input ref={fileRef} type="file" accept=".json" hidden onChange={(e) => void handleImport(e)} />

        {user && isSupabaseConfigured && (
          <button className="settings-item" onClick={() => void triggerSync()} disabled={syncStatus === 'syncing'}>
            <div className="settings-item-left">
              <div className="settings-item-icon"><RefreshCw size={18} /></div>
              <div>
                <div className="settings-item-label">Sync Now</div>
                <div className="settings-item-desc">Push & pull changes from cloud</div>
              </div>
            </div>
          </button>
        )}

        {user && (
          <button className="settings-item" onClick={() => void signOut()}>
            <div className="settings-item-left">
              <div className="settings-item-icon" style={{ background: 'rgba(248,113,113,0.15)', color: 'var(--color-expense)' }}>
                <LogOut size={18} />
              </div>
              <div>
                <div className="settings-item-label" style={{ color: 'var(--color-expense)' }}>Sign Out</div>
              </div>
            </div>
          </button>
        )}
      </div>

      {importMsg && (
        <p style={{ textAlign: 'center', marginTop: 16, color: 'var(--color-primary-light)', fontSize: '0.875rem' }}>
          {importMsg}
        </p>
      )}

      <p style={{ textAlign: 'center', marginTop: 32, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
        eTacab v1.0 · Offline-first finance tracker
      </p>
    </div>
  );
}
