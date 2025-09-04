import { useState } from 'react';

interface EmailApiResponse {
  success: boolean;
  message?: string;
  emailId?: string;
  error?: string;
  details?: Record<string, unknown>;
}

interface UseEmailApiReturn {
  loading: boolean;
  error: string | null;
  success: boolean;
  sendWelcomeEmail: (data: { userName: string; userEmail: string }) => Promise<EmailApiResponse>;
  sendSubscriptionEmail: (data: {
    userName: string;
    userEmail: string;
    subscriptionType: 'new' | 'cancelled' | 'payment_failed' | 'renewed';
    planName?: string;
    amount?: number;
    currency?: string;
    nextBillingDate?: string;
    cancelDate?: string;
  }) => Promise<EmailApiResponse>;
  sendGeneralEmail: (data: {
    userName: string;
    userEmail: string;
    subject: string;
    heading: string;
    message: string;
    actionText?: string;
    actionUrl?: string;
    footerText?: string;
  }) => Promise<EmailApiResponse>;
  sendPasswordResetEmail: (data: { email: string }) => Promise<EmailApiResponse>;
  testEmailConfiguration: () => Promise<EmailApiResponse>;
  checkEmailConfiguration: () => Promise<
    EmailApiResponse & {
      configured?: boolean;
      configuration?: Record<string, unknown>;
    }
  >;
  resetState: () => void;
}

export const useEmailApi = (): UseEmailApiReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const makeApiCall = async (
    endpoint: string,
    data?: Record<string, unknown>,
    method: 'GET' | 'POST' = 'POST',
  ): Promise<EmailApiResponse> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/emails/${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method === 'POST' ? JSON.stringify(data) : undefined,
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        return result;
      } else {
        const errorMessage = result.error || 'An error occurred';
        setError(errorMessage);
        return { success: false, error: errorMessage, details: result.details };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const sendWelcomeEmail = async (data: { userName: string; userEmail: string }) => {
    return makeApiCall('welcome', data);
  };

  const sendSubscriptionEmail = async (data: {
    userName: string;
    userEmail: string;
    subscriptionType: 'new' | 'cancelled' | 'payment_failed' | 'renewed';
    planName?: string;
    amount?: number;
    currency?: string;
    nextBillingDate?: string;
    cancelDate?: string;
  }) => {
    return makeApiCall('subscription', data);
  };

  const sendGeneralEmail = async (data: {
    userName: string;
    userEmail: string;
    subject: string;
    heading: string;
    message: string;
    actionText?: string;
    actionUrl?: string;
    footerText?: string;
  }) => {
    return makeApiCall('general', data);
  };

  const sendPasswordResetEmail = async (data: { email: string }) => {
    return makeApiCall('password-reset', data);
  };

  const testEmailConfiguration = async () => {
    return makeApiCall('test', undefined, 'POST');
  };

  const checkEmailConfiguration = async () => {
    const result = await makeApiCall('test', undefined, 'GET');
    return {
      ...result,
      configured: (result as { configured?: boolean }).configured,
      configuration: (result as { configuration?: Record<string, unknown> }).configuration,
    };
  };

  const resetState = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  };

  return {
    loading,
    error,
    success,
    sendWelcomeEmail,
    sendSubscriptionEmail,
    sendGeneralEmail,
    sendPasswordResetEmail,
    testEmailConfiguration,
    checkEmailConfiguration,
    resetState,
  };
};
