'use client';

import { useState, useEffect } from 'react';
import { mockBilling } from '@/lib/mocks';

export default function BillingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plansData = await mockBilling.getPlans();
        const current = await mockBilling.getCurrentPlan();
        setPlans(plansData);
        setCurrentPlan(current);
      } catch (err) {
        console.error('Failed to load plans', err);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-card-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-foreground">Billing</h1>
          <p className="text-muted mt-2">Manage your subscription and billing</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? <p className="text-center text-muted py-12">Loading...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className={`card p-6 ${currentPlan?.id === plan.id ? 'border-2 border-primary' : ''}`}>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-3xl font-bold text-primary mt-2">P{plan.price}</p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f: string, i: number) => <li key={i} className="text-sm text-muted">✓ {f}</li>)}
                </ul>
                <button className={`w-full mt-6 py-2 rounded font-semibold ${currentPlan?.id === plan.id ? 'bg-gray-400' : 'btn-primary'}`}>
                  {currentPlan?.id === plan.id ? 'Current' : 'Switch'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
