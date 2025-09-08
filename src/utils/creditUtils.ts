// Credit management utilities

export interface CreditInfo {
  available: number;
  used: number;
  total: number;
}

/**
 * Get current credit information from localStorage
 */
export function getCurrentCredits(): CreditInfo {
  // Default credits for new users
  const defaultCredits = {
    available: 50,
    used: 0,
    total: 50,
  };

  if (typeof window === 'undefined') {
    return defaultCredits;
  }

  const stored = localStorage.getItem('userCredits');
  if (stored) {
    return JSON.parse(stored);
  }

  localStorage.setItem('userCredits', JSON.stringify(defaultCredits));
  return defaultCredits;
}

/**
 * Deduct credits for analysis operations
 */
export function deductCredits(amount: number): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const credits = getCurrentCredits();

  if (credits.available < amount) {
    return false; // Insufficient credits
  }

  const updatedCredits = {
    ...credits,
    available: credits.available - amount,
    used: credits.used + amount,
  };

  localStorage.setItem('userCredits', JSON.stringify(updatedCredits));
  return true;
}

/**
 * Check if user has sufficient credits
 */
export function hasEnoughCredits(amount: number): boolean {
  const credits = getCurrentCredits();
  return credits.available >= amount;
}

/**
 * Get credit cost for different operations
 */
export function getCreditCost(
  operation: 'single_analysis' | 'reanalysis' | 'comparison_reanalysis',
): number {
  const costs = {
    single_analysis: 1,
    reanalysis: 1,
    comparison_reanalysis: 1, // Cost per product in comparison
  };

  return costs[operation];
}

/**
 * Add credits (for testing or admin purposes)
 */
export function addCredits(amount: number): void {
  if (typeof window === 'undefined') {
    return;
  }

  const credits = getCurrentCredits();
  const updatedCredits = {
    ...credits,
    available: credits.available + amount,
    total: credits.total + amount,
  };

  localStorage.setItem('userCredits', JSON.stringify(updatedCredits));
}
