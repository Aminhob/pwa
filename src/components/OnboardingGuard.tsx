import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isOnboardingComplete } from '../lib/onboarding';

const PUBLIC_PATHS = ['/', '/auth'];

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isOnboardingComplete() && !PUBLIC_PATHS.includes(location.pathname)) {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  return <>{children}</>;
}
