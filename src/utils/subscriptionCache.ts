interface UserSubscription {
  id: string;
  monthlyLimit: number;
  usedThisMonth: number;
  trialLimit: number;
  trialUsed: number;
  currentPeriodEnd: string;
  status: string;
  isTrialing: boolean;
  activeLimit: number;
  activeUsed: number;
  activeRemaining: number;
}

interface CachedSubscription {
  data: UserSubscription;
  timestamp: number;
}

const CACHE_KEY = 'subscription_status';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get cached subscription data if valid, otherwise return null
 */
export function getCachedSubscription(): UserSubscription | null {
  if (typeof window === 'undefined') return null; // Server-side rendering

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp }: CachedSubscription = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > CACHE_DURATION;

    if (isExpired) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading subscription cache:', error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

/**
 * Cache subscription data with current timestamp
 */
export function setCachedSubscription(subscription: UserSubscription): void {
  if (typeof window === 'undefined') return; // Server-side rendering

  try {
    const cached: CachedSubscription = {
      data: subscription,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch (error) {
    console.error('Error caching subscription data:', error);
  }
}

/**
 * Clear cached subscription data (useful after payment updates)
 */
export function clearSubscriptionCache(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error clearing subscription cache:', error);
  }
}

/**
 * Fetch subscription from API and cache it
 */
export async function fetchAndCacheSubscription(): Promise<UserSubscription | null> {
  try {
    const response = await fetch('/api/user/subscription');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const subscription: UserSubscription = await response.json();
    setCachedSubscription(subscription);
    return subscription;
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    return null;
  }
}

/**
 * Check if subscription has active status (trial or paid)
 */
function hasActiveSubscription(subscription: UserSubscription): boolean {
  return (
    subscription.status === 'active' ||
    subscription.status === 'trialing' ||
    (subscription.isTrialing && subscription.trialUsed < subscription.trialLimit)
  );
}

/**
 * Get subscription data with smart caching:
 * - If cached subscription is ACTIVE → use cache (don't check API)
 * - If no cache or cached subscription is INACTIVE → check API
 */
export async function getSubscriptionWithCache(): Promise<UserSubscription | null> {
  // Try cache first
  const cached = getCachedSubscription();
  if (cached && hasActiveSubscription(cached)) {
    // Only use cache if subscription is active
    return cached;
  }

  // Cache miss OR inactive subscription - fetch from API and cache
  return await fetchAndCacheSubscription();
}

/**
 * Check if cached subscription data is still valid
 */
export function isCacheValid(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return false;

    const { timestamp }: CachedSubscription = JSON.parse(cached);
    return Date.now() - timestamp <= CACHE_DURATION;
  } catch {
    return false;
  }
}

/**
 * Get cache age in hours
 */
export function getCacheAge(): number {
  if (typeof window === 'undefined') return 0;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return 0;

    const { timestamp }: CachedSubscription = JSON.parse(cached);
    return (Date.now() - timestamp) / (1000 * 60 * 60); // Convert to hours
  } catch {
    return 0;
  }
}
