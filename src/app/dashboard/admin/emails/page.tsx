'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useEmailApi } from '@/hooks/useEmailApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Mail, Send, Settings, TestTube } from 'lucide-react';

export default function AdminEmailsPage() {
  const emailApi = useEmailApi();

  const [emailConfig, setEmailConfig] = useState<{
    configured?: boolean;
    configuration?: {
      emailFrom: string;
      emailReplyTo: string;
      adminEmails: string[];
      domain: string;
    };
  } | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Form states
  const [welcomeForm, setWelcomeForm] = useState({
    userName: '',
    userEmail: '',
  });

  const [subscriptionForm, setSubscriptionForm] = useState({
    userName: '',
    userEmail: '',
    subscriptionType: 'new' as 'new' | 'cancelled' | 'payment_failed' | 'renewed',
    planName: '',
    amount: '',
    currency: 'usd',
  });

  const [generalForm, setGeneralForm] = useState({
    userName: '',
    userEmail: '',
    subject: '',
    heading: '',
    message: '',
    actionText: '',
    actionUrl: '',
    footerText: '',
  });

  const [passwordResetForm, setPasswordResetForm] = useState({
    email: '',
  });

  // Load email configuration
  const loadConfig = useCallback(async () => {
    try {
      const result = await emailApi.checkEmailConfiguration();
      setEmailConfig({
        configured: result.configured,
        configuration: result.configuration as
          | {
              emailFrom: string;
              emailReplyTo: string;
              adminEmails: string[];
              domain: string;
            }
          | undefined,
      });
    } catch (error) {
      console.error('Failed to load email configuration:', error);
    } finally {
      setConfigLoading(false);
    }
  }, [emailApi]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleTestConfiguration = async () => {
    await emailApi.testEmailConfiguration();
  };

  const handleSendWelcomeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    await emailApi.sendWelcomeEmail(welcomeForm);
  };

  const handleSendSubscriptionEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...subscriptionForm,
      amount: subscriptionForm.amount ? parseFloat(subscriptionForm.amount) * 100 : undefined, // Convert to cents
    };
    await emailApi.sendSubscriptionEmail(data);
  };

  const handleSendGeneralEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    await emailApi.sendGeneralEmail(generalForm);
  };

  const handleSendPasswordResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    await emailApi.sendPasswordResetEmail(passwordResetForm);
  };

  if (configLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading email configuration...</div>
      </div>
    );
  }

  return (
    <AuthGuard requiredRole="admin">
      <AdminLayout>
        <div className="mx-auto max-w-6xl p-6">
          <div className="mb-6">
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              <Mail className="h-8 w-8" />
              Email Management
            </h1>
            <p className="mt-2 text-gray-600">
              Manage and test email notifications for the Trampolin platform
            </p>
          </div>

          {/* Email Configuration Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Email Configuration Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-4">
                {emailConfig?.configured ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Configured
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    Not Configured
                  </Badge>
                )}
                <Button
                  onClick={handleTestConfiguration}
                  disabled={emailApi.loading}
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  Test Configuration
                </Button>
              </div>

              {emailConfig?.configuration && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">From Email</Label>
                    <p className="text-gray-600">{emailConfig.configuration.emailFrom}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Reply To</Label>
                    <p className="text-gray-600">{emailConfig.configuration.emailReplyTo}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Admin Emails</Label>
                    <p className="text-gray-600">
                      {emailConfig.configuration.adminEmails.join(', ')}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Domain</Label>
                    <p className="text-gray-600">{emailConfig.configuration.domain}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Messages */}
          {emailApi.error && (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{emailApi.error}</AlertDescription>
            </Alert>
          )}

          {emailApi.success && (
            <Alert className="mb-6" variant="default">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Email sent successfully!</AlertDescription>
            </Alert>
          )}

          {/* Email Forms */}
          <Tabs defaultValue="welcome" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="welcome">Welcome</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="password-reset">Password Reset</TabsTrigger>
            </TabsList>

            <TabsContent value="welcome">
              <Card>
                <CardHeader>
                  <CardTitle>Send Welcome Email</CardTitle>
                  <CardDescription>Send a welcome email to new users</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendWelcomeEmail} className="space-y-4">
                    <div>
                      <Label htmlFor="welcome-name">User Name</Label>
                      <Input
                        id="welcome-name"
                        type="text"
                        value={welcomeForm.userName}
                        onChange={(e) =>
                          setWelcomeForm((prev) => ({ ...prev, userName: e.target.value }))
                        }
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="welcome-email">User Email</Label>
                      <Input
                        id="welcome-email"
                        type="email"
                        value={welcomeForm.userEmail}
                        onChange={(e) =>
                          setWelcomeForm((prev) => ({ ...prev, userEmail: e.target.value }))
                        }
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={emailApi.loading}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {emailApi.loading ? 'Sending...' : 'Send Welcome Email'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle>Send Subscription Email</CardTitle>
                  <CardDescription>Send subscription-related notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendSubscriptionEmail} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sub-name">User Name</Label>
                        <Input
                          id="sub-name"
                          type="text"
                          value={subscriptionForm.userName}
                          onChange={(e) =>
                            setSubscriptionForm((prev) => ({ ...prev, userName: e.target.value }))
                          }
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="sub-email">User Email</Label>
                        <Input
                          id="sub-email"
                          type="email"
                          value={subscriptionForm.userEmail}
                          onChange={(e) =>
                            setSubscriptionForm((prev) => ({ ...prev, userEmail: e.target.value }))
                          }
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="sub-type">Subscription Type</Label>
                      <Select
                        value={subscriptionForm.subscriptionType}
                        onValueChange={(
                          value: 'new' | 'cancelled' | 'payment_failed' | 'renewed',
                        ) => setSubscriptionForm((prev) => ({ ...prev, subscriptionType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New Subscription</SelectItem>
                          <SelectItem value="renewed">Subscription Renewed</SelectItem>
                          <SelectItem value="cancelled">Subscription Cancelled</SelectItem>
                          <SelectItem value="payment_failed">Payment Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="sub-plan">Plan Name</Label>
                        <Input
                          id="sub-plan"
                          type="text"
                          value={subscriptionForm.planName}
                          onChange={(e) =>
                            setSubscriptionForm((prev) => ({ ...prev, planName: e.target.value }))
                          }
                          placeholder="Gold Plan"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sub-amount">Amount (USD)</Label>
                        <Input
                          id="sub-amount"
                          type="number"
                          step="0.01"
                          value={subscriptionForm.amount}
                          onChange={(e) =>
                            setSubscriptionForm((prev) => ({ ...prev, amount: e.target.value }))
                          }
                          placeholder="29.99"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sub-currency">Currency</Label>
                        <Select
                          value={subscriptionForm.currency}
                          onValueChange={(value) =>
                            setSubscriptionForm((prev) => ({ ...prev, currency: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="usd">USD</SelectItem>
                            <SelectItem value="eur">EUR</SelectItem>
                            <SelectItem value="gbp">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={emailApi.loading}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {emailApi.loading ? 'Sending...' : 'Send Subscription Email'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Send General Email</CardTitle>
                  <CardDescription>Send custom transactional emails</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendGeneralEmail} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="gen-name">User Name</Label>
                        <Input
                          id="gen-name"
                          type="text"
                          value={generalForm.userName}
                          onChange={(e) =>
                            setGeneralForm((prev) => ({ ...prev, userName: e.target.value }))
                          }
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="gen-email">User Email</Label>
                        <Input
                          id="gen-email"
                          type="email"
                          value={generalForm.userEmail}
                          onChange={(e) =>
                            setGeneralForm((prev) => ({ ...prev, userEmail: e.target.value }))
                          }
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="gen-subject">Subject</Label>
                      <Input
                        id="gen-subject"
                        type="text"
                        value={generalForm.subject}
                        onChange={(e) =>
                          setGeneralForm((prev) => ({ ...prev, subject: e.target.value }))
                        }
                        placeholder="Important Update"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="gen-heading">Heading</Label>
                      <Input
                        id="gen-heading"
                        type="text"
                        value={generalForm.heading}
                        onChange={(e) =>
                          setGeneralForm((prev) => ({ ...prev, heading: e.target.value }))
                        }
                        placeholder="📢 Important Update"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="gen-message">Message</Label>
                      <Textarea
                        id="gen-message"
                        value={generalForm.message}
                        onChange={(e) =>
                          setGeneralForm((prev) => ({ ...prev, message: e.target.value }))
                        }
                        placeholder="Your message here..."
                        rows={4}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="gen-action-text">Action Button Text (Optional)</Label>
                        <Input
                          id="gen-action-text"
                          type="text"
                          value={generalForm.actionText}
                          onChange={(e) =>
                            setGeneralForm((prev) => ({ ...prev, actionText: e.target.value }))
                          }
                          placeholder="Learn More"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gen-action-url">Action Button URL (Optional)</Label>
                        <Input
                          id="gen-action-url"
                          type="url"
                          value={generalForm.actionUrl}
                          onChange={(e) =>
                            setGeneralForm((prev) => ({ ...prev, actionUrl: e.target.value }))
                          }
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="gen-footer">Footer Text (Optional)</Label>
                      <Textarea
                        id="gen-footer"
                        value={generalForm.footerText}
                        onChange={(e) =>
                          setGeneralForm((prev) => ({ ...prev, footerText: e.target.value }))
                        }
                        placeholder="Additional information..."
                        rows={2}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={emailApi.loading}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {emailApi.loading ? 'Sending...' : 'Send General Email'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password-reset">
              <Card>
                <CardHeader>
                  <CardTitle>Send Password Reset Email</CardTitle>
                  <CardDescription>Send password reset link to users</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendPasswordResetEmail} className="space-y-4">
                    <div>
                      <Label htmlFor="reset-email">User Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        value={passwordResetForm.email}
                        onChange={(e) =>
                          setPasswordResetForm((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={emailApi.loading}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {emailApi.loading ? 'Sending...' : 'Send Password Reset Email'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
