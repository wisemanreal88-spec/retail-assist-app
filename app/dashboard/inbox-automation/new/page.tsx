'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockAutomation } from '@/lib/mocks';

export default function NewRulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    trigger: 'facebook_comment',
    action: 'send_dm',
    enabled: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await mockAutomation.createRule(formData);
      setTimeout(() => router.push('/dashboard/inbox-automation'), 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-card-border">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/dashboard/inbox-automation" className="text-primary text-sm mb-4 inline-block">← Back</Link>
          <h1 className="text-3xl font-bold text-foreground">Create Automation Rule</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6">
            <label className="block text-sm font-semibold text-foreground mb-2">Rule Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Auto-comment to DM"
              className="w-full border border-card-border rounded px-4 py-2 bg-background text-foreground"
              required
            />
          </div>

          <div className="card p-6">
            <label className="block text-sm font-semibold text-foreground mb-2">Trigger</label>
            <select
              value={formData.trigger}
              onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
              className="w-full border border-card-border rounded px-4 py-2 bg-background text-foreground"
            >
              <option value="facebook_comment">Facebook Comment</option>
              <option value="keyword">Keyword Match</option>
              <option value="direct_message">Direct Message</option>
            </select>
          </div>

          <div className="card p-6">
            <label className="block text-sm font-semibold text-foreground mb-2">Action</label>
            <select
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              className="w-full border border-card-border rounded px-4 py-2 bg-background text-foreground"
            >
              <option value="send_dm">Send DM</option>
              <option value="auto_reply">Auto Reply</option>
              <option value="send_comment_reply">Reply to Comment</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="btn-primary px-6 py-2">
              {loading ? 'Creating...' : 'Create Rule'}
            </button>
            <Link href="/dashboard/inbox-automation" className="btn-secondary px-6 py-2">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
