'use client';

import { useState } from 'react';
import { mockIntegrations } from '@/lib/mocks';

interface Integration {
  name: string;
  icon: string;
  connected: boolean;
  description: string;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    { name: 'Meta Messenger', icon: '👨‍💼', connected: false, description: 'Connect your Facebook page' },
    { name: 'WhatsApp', icon: '💬', connected: false, description: 'Enable WhatsApp automation' },
    { name: 'Instagram', icon: '📷', connected: false, description: 'Manage Instagram DMs' },
    { name: 'Website Widget', icon: '💻', connected: false, description: 'Embed chat widget on your site' },
  ]);
  const [loading, setLoading] = useState(false);

  const handleConnect = async (index: number) => {
    setLoading(true);
    try {
      await mockIntegrations.connectMeta('mock_token');
      const updated = [...integrations];
      updated[index].connected = !updated[index].connected;
      setIntegrations(updated);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-card-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-foreground">Integrations</h1>
          <p className="text-muted mt-2">Connect your channels and manage integrations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((int, idx) => (
            <div key={idx} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{int.icon}</span>
                  <div>
                    <h3 className="font-bold text-foreground">{int.name}</h3>
                    <p className="text-xs text-muted">{int.description}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-semibold ${int.connected ? 'bg-green-500/20 text-green-700' : 'bg-gray-500/20 text-gray-700'}`}>
                  {int.connected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <button
                onClick={() => handleConnect(idx)}
                disabled={loading}
                className={`w-full py-2 rounded font-semibold ${int.connected ? 'btn-secondary' : 'btn-primary'}`}
              >
                {int.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
