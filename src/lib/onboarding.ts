const ONBOARDING_KEY = 'etacab_onboarding_complete';

export function isOnboardingComplete(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export function completeOnboarding(): void {
  localStorage.setItem(ONBOARDING_KEY, 'true');
}
