'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockAutomation } from '@/lib/mocks';

export default function InboxAutomationPage() {
  const [rules, setRules] = useState<any[]>([
    { id: '1', name: 'Auto-Comment to DM', trigger: 'facebook_comment', action: 'send_dm', enabled: true },
    { id: '2', name: 'Keyword Response', trigger: 'keyword', action: 'auto_reply', enabled: true },
  ]);
  const [loading, setLoading] = useState(false);

  const toggleRule = async (id: string) => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 300));
      setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    } finally {
      setLoading(false);
    }
  };

  const deleteRule = (id: string) => {
    if (confirm('Delete this rule?')) {
      setRules(rules.filter(r => r.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-card-border">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inbox Automation</h1>
            <p className="text-muted mt-2">Set up automatic replies and comment-to-DM flows</p>
          </div>
          <Link href="/dashboard/inbox-automation/new" className="btn-primary px-6 py-2">Create Rule</Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.id} className="card p-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground">{rule.name}</h3>
                <p className="text-xs text-muted mt-1">Trigger: {rule.trigger} → Action: {rule.action}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleRule(rule.id)}
                  disabled={loading}
                  className={`px-4 py-2 rounded text-sm font-semibold ${rule.enabled ? 'btn-secondary' : 'bg-gray-400'}`}
                >
                  {rule.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button onClick={() => deleteRule(rule.id)} className="px-4 py-2 border border-red-500 text-red-500 rounded text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
