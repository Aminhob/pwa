

import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

export function Auth() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Load last attempt time from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('authLastAttempt');
    if (stored) {
      setLastAttemptTime(parseInt(stored, 10));
    }
  }, []);

  const goToApp = () => navigate('/dashboard', { replace: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Email validation
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Password validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Rate limiting: prevent requests within 5 seconds of last attempt (reduced from 30s)
    const now = Date.now();
    const cooldown = 5000; // 5 seconds
    if (now - lastAttemptTime < cooldown) {
      const waitSeconds = Math.ceil((cooldown - (now - lastAttemptTime)) / 1000);
      setError(`Please wait ${waitSeconds} seconds before trying again`);
      return;
    }

    setLoading(true);
    setError('');
    setLastAttemptTime(now);
    localStorage.setItem('authLastAttempt', now.toString());

    try {
      const result = mode === 'signin' ? await signIn(email, password) : await signUp(email, password);
      
      if (result.error) {
        // Handle specific error messages
        if (result.error.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else if (result.error.includes('rate limit') || result.error.includes('too many requests')) {
          setError('Too many attempts. Please wait a few minutes before trying again.');
          // Extend cooldown on rate limit error
          setLastAttemptTime(now);
          localStorage.setItem('authLastAttempt', now.toString());
        } else if (result.error.includes('Email') && result.error.includes('invalid')) {
          setError('Invalid email address');
        } else if (result.error.includes('timeout')) {
          setError('Connection timeout. Please check your internet and try again.');
        } else {
          setError(result.error);
        }
      } else {
        goToApp();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-shell-inner">
        <button type="button" className="auth-back" onClick={() => navigate('/')}>
          <ArrowBack size={18} />
        </button>

        <div className="auth-hero">
          <div className="auth-brand">
            <div className="auth-brand-mark">e</div>
            <span className="auth-brand-name">eTacab</span>
          </div>
          <h1 className="auth-heading">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="auth-subheading">
            {mode === 'signin'
              ? 'Sign in to sync your finances across all devices.'
              : 'Start tracking expenses with secure cloud backup.'}
          </p>
        </div>

        {!isSupabaseConfigured ? (
          <div className="auth-card glass-card">
            <p className="auth-offline-notice">
              Supabase is not configured. The app works fully offline — add your credentials to
              enable cloud sync.
            </p>
            <button type="button" className="btn btn-primary btn-block" onClick={goToApp}>
              Continue Offline
            </button>
          </div>
        ) : (
          <>
            <div className="auth-card glass-card">
              <form className="auth-form" onSubmit={(e) => void handleSubmit(e)}>
                <div className="form-group">
                  <label className="form-label" htmlFor="auth-email">
                    Email
                  </label>
                  <div className="auth-input-wrap">
                    <Mail size={18} className="auth-input-icon" />
                    <input
                      id="auth-email"
                      className="form-input auth-input"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="auth-password">
                    Password
                  </label>
                  <div className="auth-input-wrap">
                    <Lock size={18} className="auth-input-icon" />
                    <input
                      id="auth-password"
                      className="form-input auth-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && <p className="form-error auth-error">{error}</p>}

                <button type="submit" className="btn btn-primary btn-block auth-submit" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    mode === 'signin' ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>
            </div>

            <p className="auth-toggle">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError('');
                }}
                disabled={loading}
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>

            <button type="button" className="auth-offline-link" onClick={goToApp} disabled={loading}>
              Continue without account
            </button>
          </>
        )}
      </div>
    </div>
  );
}
