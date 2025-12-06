'use client';

import { useState } from 'react';
import { mockSettings } from '@/lib/mocks';

export default function SettingsPage() {
  const [businessData, setBusinessData] = useState({ name: '', description: '', api_key: '' });
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGenerateKey = async () => {
    setLoading(true);
    try {
      const result = await mockSettings.generateApiKey();
      setApiKey(result.api_key);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await mockSettings.updateBusiness(businessData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-card-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted mt-2">Configure your business and preferences</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {success && <div className="card p-4 bg-green-50 dark:bg-green-950 text-green-700">✓ Settings saved</div>}

        <div className="card p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Business Info</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Business Name"
              value={businessData.name}
              onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
              className="w-full border border-card-border rounded px-4 py-2 bg-background text-foreground"
            />
            <textarea
              placeholder="Description"
              value={businessData.description}
              onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
              rows={4}
              className="w-full border border-card-border rounded px-4 py-2 bg-background text-foreground"
            />
            <button onClick={handleSave} disabled={loading} className="btn-primary px-6 py-2">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">API Key</h2>
          {apiKey ? (
            <div className="bg-background border border-card-border p-4 rounded font-mono text-sm break-all">{apiKey}</div>
          ) : (
            <p className="text-muted mb-4">No API key generated yet</p>
          )}
          <button onClick={handleGenerateKey} disabled={loading} className="btn-secondary px-6 py-2 mt-4">
            {loading ? 'Generating...' : 'Generate API Key'}
          </button>
        </div>
      </div>
    </div>
  );
}
