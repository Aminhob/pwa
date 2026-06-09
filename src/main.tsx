import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './styles/global.css';
import App from './App';
import { initializeDatabase } from './db/database';

void initializeDatabase();

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New version available. Reload to update?')) {
      void updateSW(true);
    }
  },
  onOfflineReady() {
    console.info('eTacab is ready for offline use');
  },
});

createRoot(document.getElementById('root')!).render(
  <App />
);
