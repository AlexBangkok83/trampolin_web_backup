'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface Refund {
  id: string;
  amount: number;
  currency: string;
  status: string;
  reason: string;
  created: number;
  charge_id: string;
  payment_intent_id: string;
  metadata: Record<string, string>;
}

interface RefundFormData {
  chargeId: string;
  paymentIntentId: string;
  amount: string;
  reason: string;
  note: string;
  userEmail: string;
}

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<RefundFormData>({
    chargeId: '',
    paymentIntentId: '',
    amount: '',
    reason: 'requested_by_customer',
    note: '',
    userEmail: '',
  });

  const fetchRefunds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/refunds');

      if (response.ok) {
        const data = await response.json();
        setRefunds(data.refunds);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch refunds');
      }
    } catch (err) {
      console.error('Error fetching refunds:', err);
      setError('Failed to fetch refunds');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.chargeId && !formData.paymentIntentId) {
      setError('Either Charge ID or Payment Intent ID is required');
      return;
    }

    if (!formData.reason) {
      setError('Refund reason is required');
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/admin/refunds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chargeId: formData.chargeId || undefined,
          paymentIntentId: formData.paymentIntentId || undefined,
          amount: formData.amount ? parseInt(formData.amount) : undefined,
          reason: formData.reason,
          note: formData.note,
          userEmail: formData.userEmail,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(`Refund processed successfully: ${data.refund.id}`);
        setFormData({
          chargeId: '',
          paymentIntentId: '',
          amount: '',
          reason: 'requested_by_customer',
          note: '',
          userEmail: '',
        });
        setShowRefundForm(false);
        fetchRefunds();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to process refund');
      }
    } catch (err) {
      console.error('Error processing refund:', err);
      setError('Failed to process refund');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AuthGuard requiredRole="admin">
      <AdminLayout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Refund Management</h1>
              <p className="mt-1 text-gray-600">Process refunds and view refund history</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchRefunds}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <ArrowPathIcon className="mr-2 h-4 w-4" />
                Refresh
              </button>

              <button
                onClick={() => setShowRefundForm(true)}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <CurrencyDollarIcon className="mr-2 h-4 w-4" />
                Process Refund
              </button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Refund Form Modal */}
          {showRefundForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="mx-4 max-w-2xl rounded-lg bg-white p-6 shadow-xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Process New Refund</h3>

                <form onSubmit={handleSubmitRefund} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Charge ID</label>
                      <input
                        type="text"
                        value={formData.chargeId}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, chargeId: e.target.value }))
                        }
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="ch_xxx (or leave empty)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Payment Intent ID
                      </label>
                      <input
                        type="text"
                        value={formData.paymentIntentId}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, paymentIntentId: e.target.value }))
                        }
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="pi_xxx (or leave empty)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Refund Amount (cents)
                      </label>
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, amount: e.target.value }))
                        }
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Leave empty for full refund"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Amount in cents (e.g., 2000 = $20.00). Leave empty for full refund.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Customer Email
                      </label>
                      <input
                        type="email"
                        value={formData.userEmail}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, userEmail: e.target.value }))
                        }
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="customer@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reason</label>
                    <select
                      value={formData.reason}
                      onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="requested_by_customer">Requested by customer</option>
                      <option value="duplicate">Duplicate charge</option>
                      <option value="fraudulent">Fraudulent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Note</label>
                    <textarea
                      value={formData.note}
                      onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
                      rows={3}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Internal note about this refund..."
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowRefundForm(false)}
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={processing}
                      className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {processing ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        'Process Refund'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Refunds Table */}
          <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Refunds</h3>
            </div>

            {loading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 rounded bg-gray-200"></div>
                  ))}
                </div>
              </div>
            ) : refunds.length === 0 ? (
              <div className="p-12 text-center">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-sm font-medium text-gray-900">No refunds found</h3>
                <p className="mt-1 text-sm text-gray-500">No refunds have been processed yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="max-w-6xl">
                  <table className="w-full divide-y divide-gray-200 rounded-lg border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                          Refund ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                          Customer
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {refunds.map((refund) => (
                        <tr key={refund.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-mono text-sm text-gray-900">{refund.id}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {formatCurrency(refund.amount, refund.currency)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(refund.status)}`}
                            >
                              {getStatusIcon(refund.status)}
                              <span className="ml-1 capitalize">{refund.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {refund.reason.replace(/_/g, ' ')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDate(refund.created)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {refund.metadata.customer_email || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
