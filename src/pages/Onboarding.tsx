import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, BarChart3, RefreshCw, Wallet, Shield, Download, ArrowRight } from 'lucide-react';
import { completeOnboarding } from '../lib/onboarding';

const features = [
  {
    icon: Smartphone,
    title: 'Offline First',
    description: 'Your financial data works anytime, anywhere.',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Visual reports and spending insights powered by intelligent calculations.',
  },
  {
    icon: RefreshCw,
    title: 'Auto Sync',
    description: 'Securely sync with cloud storage when internet is available.',
  },
  {
    icon: Wallet,
    title: 'Budget Tracking',
    description: 'Create budgets and monitor financial goals easily.',
  },
  {
    icon: Shield,
    title: 'Secure Data',
    description: 'Your financial information remains protected and private.',
  },
];

export function Onboarding() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    setIsInstalled(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallInstructions(true);
    }
  }, [deferredPrompt]);

  const handleGetStarted = () => {
    completeOnboarding();
    navigate('/auth', { replace: true });
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#FFFFFF',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '420px',
      margin: '0 auto',
      position: 'relative',
    }}>
      <div style={{
        flex: 1,
        padding: '24px 20px',
        paddingBottom: '100px',
      }}>
        {/* App Icon + Name Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            flexShrink: 0,
          }}>
            <span style={{
              color: '#FFFFFF',
              fontSize: '36px',
              fontWeight: '800',
            }}>e</span>
          </div>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1F2937',
              margin: '0 0 4px 0',
              letterSpacing: '-0.5px',
            }}>
              eTacab
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              margin: '0',
            }}>
              Finance Tracker
            </p>
          </div>
        </div>

        {/* Subtitle + Description */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 12px 0',
            lineHeight: '1.3',
            letterSpacing: '-0.3px',
          }}>
            Take Control of Your Money
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#6B7280',
            lineHeight: '1.5',
            margin: '0',
          }}>
            Track expenses, manage budgets, analyze spending habits, and get smart financial insights — even without internet.
          </p>
        </div>

        {/* Feature Cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} style={{
                background: '#F9FAFB',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                border: '1px solid #E5E7EB',
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                }}>
                  <Icon size={22} color="#FFFFFF" strokeWidth={2.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 4px 0',
                    letterSpacing: '-0.2px',
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: '#6B7280',
                    margin: '0',
                    lineHeight: '1.4',
                  }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Install Button */}
      <div style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        background: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        padding: '16px 20px',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        maxWidth: '420px',
        margin: '0 auto',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)',
      }}>
        {!isInstalled ? (
          <>
            <button
              type="button"
              onClick={handleInstallClick}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                letterSpacing: '-0.2px',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.35)';
              }}
            >
              <Download size={20} strokeWidth={2.5} />
              Install eTacab
              <ArrowRight size={20} strokeWidth={2.5} />
            </button>
            <p style={{
              fontSize: '13px',
              color: '#9CA3AF',
              textAlign: 'center',
              margin: '10px 0 0 0',
            }}>
              Install for the best offline experience
            </p>

            {showInstallInstructions && (
              <div style={{
                background: '#F3F4F6',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '12px',
                border: '1px solid #E5E7EB',
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#374151',
                  lineHeight: '1.5',
                  margin: '0 0 12px 0',
                }}>
                  {isIOS
                    ? 'To install: Tap Share button, then "Add to Home Screen"'
                    : 'To install: Look for the install icon in your browser\'s address bar'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowInstallInstructions(false)}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    background: '#FFFFFF',
                    color: '#374151',
                    border: '1px solid #D1D5DB',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.background = '#F9FAFB';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.background = '#FFFFFF';
                  }}
                >
                  Got it
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={handleGetStarted}
            style={{
              width: '100%',
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              letterSpacing: '-0.2px',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.35)';
            }}
          >
            Get Started
            <ArrowRight size={20} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
