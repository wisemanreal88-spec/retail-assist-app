import React from 'react';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { getUserSubscription, getPaymentHistory, getPendingMobileMoneyPayments } from '@/lib/supabase/queries';
import BillingActions from '@/components/billing/BillingActions';
import MobileMoneyApprovals from '@/components/billing/MobileMoneyApprovals';
import PaymentHistory from '@/components/billing/PaymentHistory';
import { env } from '@/lib/env';

export default async function BillingPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get current workspace from URL or context
  const workspace = null; // TODO: Get workspace ID from URL params or context
  
  const subscription = user ? await getUserSubscription(user.id) : null;

  // Get payment history for current workspace
  let paymentHistory: any[] = [];
  if (workspace) {
    const historyResult = await getPaymentHistory(workspace);
    if (!historyResult.error) {
      paymentHistory = historyResult.data || [];
    }
  }

  // For admin view: list pending mobile money payments
  let pendingPayments: any[] = [];
  try {
    const admin = await createAdminSupabaseClient();
    if (workspace) {
      const result = await getPendingMobileMoneyPayments(workspace);
      if (!result.error) {
        pendingPayments = result.data || [];
      }
    }
  } catch (e) {
    console.error('Error loading pending payments:', e);
  }

  // Check if user is admin/owner
  let isAdmin = false;
  if (workspace && user) {
    const { data: member } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspace)
      .eq('user_id', user.id)
      .single();
    isAdmin = member?.role === 'admin' || member?.role === 'owner';
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Billing & Payments</h1>

      {/* Subscription Status */}
      <section className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Subscription Status</h2>
        {subscription ? (
          <div className="space-y-2">
            <div>
              <span className="text-gray-600">Plan:</span>
              <span className="ml-2 font-semibold capitalize">{subscription.plan_id}</span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className={`ml-2 font-semibold ${subscription.status === 'active' ? 'text-green-600' : 'text-orange-600'}`}>
                {subscription.status.toUpperCase()}
              </span>
            </div>
            {subscription.next_billing_date && (
              <div>
                <span className="text-gray-600">Next Billing:</span>
                <span className="ml-2">{new Date(subscription.next_billing_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-600">No active subscription</p>
        )}
      </section>

      {/* Payment Actions */}
      <section className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Upgrade or Make Payment</h2>
        <BillingActions subscription={subscription} />
      </section>

      {/* Payment History */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Payment History</h2>
        <PaymentHistory payments={paymentHistory} />
      </section>

      {/* Admin: Pending Mobile Money Payments */}
      {isAdmin && pendingPayments.length > 0 && (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Pending Mobile Money Approvals</h2>
          <MobileMoneyApprovals payments={pendingPayments} />
        </section>
      )}
    </div>
  );
}
