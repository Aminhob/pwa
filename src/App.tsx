import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OnboardingGuard } from './components/OnboardingGuard';
import { AppLayout } from './components/Layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { AddTransaction } from './pages/AddTransaction';
import { Analytics } from './pages/Analytics';
import { Budgets } from './pages/Budgets';
import { Categories } from './pages/Categories';
import { Settings } from './pages/Settings';
import { Onboarding } from './pages/Onboarding';
import { Auth } from './pages/Auth';

function AppRoutes() {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading eTacab...</p>
      </div>
    );
  }

  return (
    <OnboardingGuard>
      <Routes>
        <Route index element={<Onboarding />} />
        <Route path="onboarding" element={<Onboarding />} />
        <Route 
          path="auth" 
          element={user ? <Navigate to="/dashboard" replace /> : <Auth />} 
        />
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="add" element={<AddTransaction />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="categories" element={<Categories />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </OnboardingGuard>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
