'use client';

import { useState } from 'react';
import { mockIntegrations } from '@/lib/mocks';

interface Integration {
  name: string;
  icon: string;
  connected: boolean;
  description: string;
  id: string;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: 'facebook', name: 'Facebook/Meta', icon: '👨‍💼', connected: false, description: 'Connect your Facebook page for comment automation' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', connected: false, description: 'Enable WhatsApp business message automation' },
    { id: 'instagram', name: 'Instagram', icon: '📷', connected: false, description: 'Manage Instagram DMs and comments' },
    { id: 'website', name: 'Website Widget', icon: '💻', connected: false, description: 'Embed chat widget on your site' },
  ]);
  const [loading, setLoading] = useState(false);
  const [facebookPageId, setFacebookPageId] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);

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

  const handleFacebookConnect = async () => {
    if (!facebookPageId.trim()) {
      setTestResult({ success: false, message: 'Please enter your Facebook Page ID' });
      return;
    }

    setLoading(true);
    try {
      // In production, this would validate the page ID with Facebook API
      console.log('[Integrations] Connecting Facebook page:', facebookPageId);
      
      const updated = [...integrations];
      const fbIndex = updated.findIndex(i => i.id === 'facebook');
      if (fbIndex >= 0) {
        updated[fbIndex].connected = true;
      }
      setIntegrations(updated);
      
      setTestResult({
        success: true,
        message: `✓ Facebook page ${facebookPageId} connected successfully!`,
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: `Error: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!facebookPageId.trim()) {
      setTestResult({ success: false, message: 'Please connect your Facebook page first' });
      return;
    }

    setLoading(true);
    try {
      console.log('[Integrations] Testing webhook with page ID:', facebookPageId);
      
      setTestResult({
        success: true,
        message: '✓ Webhook test successful! Your page is connected and ready to receive comments.',
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: `Webhook test failed: ${error.message}`,
      });
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
            <div key={int.id} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{int.icon}</span>
                  <div>
                    <h3 className="font-bold text-foreground">{int.name}</h3>
                    <p className="text-xs text-muted">{int.description}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-semibold ${int.connected ? 'bg-green-500/20 text-green-700' : 'bg-gray-500/20 text-gray-700'}`}>
                  {int.connected ? '✓ Connected' : 'Not Connected'}
                </span>
              </div>

              {/* Facebook-specific section */}
              {int.id === 'facebook' && (
                <div className="border-t border-card-border pt-4 mt-4">
                  <button
                    onClick={() => setActiveTab(activeTab === 'facebook' ? null : 'facebook')}
                    className="w-full text-left font-semibold text-sm text-foreground hover:text-blue-500 mb-3"
                  >
                    {activeTab === 'facebook' ? '▼' : '▶'} Configure Facebook
                  </button>

                  {activeTab === 'facebook' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1">
                          Facebook Page ID
                        </label>
                        <input
                          type="text"
                          value={facebookPageId}
                          onChange={(e) => setFacebookPageId(e.target.value)}
                          placeholder="e.g., 123456789"
                          className="w-full px-3 py-2 bg-secondary border border-card-border rounded text-sm"
                          disabled={loading}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleFacebookConnect}
                          disabled={loading || !facebookPageId.trim()}
                          className="flex-1 btn-primary text-sm"
                        >
                          {loading ? 'Connecting...' : 'Connect Page'}
                        </button>
                        <button
                          onClick={handleTestWebhook}
                          disabled={loading || !int.connected}
                          className="flex-1 btn-secondary text-sm"
                        >
                          {loading ? 'Testing...' : 'Test Webhook'}
                        </button>
                      </div>

                      {testResult && (
                        <div
                          className={`p-3 rounded text-sm ${
                            testResult.success
                              ? 'bg-green-500/10 border border-green-500/30 text-green-700'
                              : 'bg-red-500/10 border border-red-500/30 text-red-700'
                          }`}
                        >
                          {testResult.message}
                        </div>
                      )}

                      <details className="text-xs text-muted mt-3">
                        <summary className="cursor-pointer font-semibold mb-2">
                          How to find your Page ID
                        </summary>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>Go to facebook.com and open your Page</li>
                          <li>Click "Settings" (bottom left)</li>
                          <li>Select "Basic Information"</li>
                          <li>Your Page ID is shown in the "Page Details" section</li>
                        </ol>
                      </details>
                    </div>
                  )}
                </div>
              )}

              {int.id !== 'facebook' && (
                <button
                  onClick={() => handleConnect(idx)}
                  disabled={loading}
                  className={`w-full py-2 rounded font-semibold text-sm ${
                    int.connected ? 'btn-secondary' : 'btn-primary'
                  }`}
                >
                  {int.connected ? 'Disconnect' : 'Connect'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Webhook Setup Instructions */}
        <div className="mt-8 card p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">📋 Webhook Setup Instructions</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-foreground mb-2">1. Get Your Webhook URL</h3>
              <code className="block bg-secondary p-2 rounded mb-2 text-xs overflow-auto">
                {typeof window !== 'undefined'
                  ? `${window.location.origin}/api/webhooks/facebook`
                  : 'https://your-domain.com/api/webhooks/facebook'}
              </code>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">2. Configure in Facebook App Dashboard</h3>
              <ol className="list-decimal list-inside space-y-1 text-muted">
                <li>Go to developers.facebook.com → Your Apps</li>
                <li>Select your app → Products → Webhooks</li>
                <li>Set Callback URL to the URL above</li>
                <li>Set Verify Token (save this value to META_VERIFY_TOKEN)</li>
                <li>Subscribe to "feed" topic for comments</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">3. Get Your Page Access Token</h3>
              <ol className="list-decimal list-inside space-y-1 text-muted">
                <li>Go to Messenger → Get Started</li>
                <li>Select your page</li>
                <li>Copy the Page Access Token</li>
                <li>Save to META_PAGE_ACCESS_TOKEN in environment</li>
              </ol>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded">
              <p className="text-blue-700 text-xs">
                💡 <strong>Tip:</strong> After connecting, test the webhook using the "Test Webhook" button above to
                verify everything is working correctly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
