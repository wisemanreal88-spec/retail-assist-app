'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Agent {
  id: string;
  agent_name: string;
  system_prompt?: string;
  created_at?: string;
}

interface Stat {
  label: string;
  value: string | number;
  change?: string;
}

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<Stat[]>([
    { label: 'Total Agents', value: 0, change: '+2 this month' },
    { label: 'Messages Processed', value: 0, change: '+1,245 today' },
    { label: 'Conversion Rate', value: '0%', change: '+5% vs last week' },
    { label: 'Avg Response Time', value: '0s', change: 'Real-time' },
  ]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Fetch demo agents or real agents from Supabase
        // For demo mode, we'll show sample agents
        const demoAgents: Agent[] = [
          {
            id: '1',
            agent_name: 'Sales Assistant',
            system_prompt: 'You are a friendly sales representative who helps customers find products...',
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            agent_name: 'Support Bot',
            system_prompt: 'You are a helpful customer support agent who resolves issues...',
            created_at: new Date().toISOString(),
          },
        ];
        setAgents(demoAgents);

        // Update stats with demo data
        setStats([
          { label: 'Total Agents', value: demoAgents.length, change: '+2 this month' },
          { label: 'Messages Processed', value: '5,234', change: '+1,245 today' },
          { label: 'Conversion Rate', value: '12.5%', change: '+5% vs last week' },
          { label: 'Avg Response Time', value: '1.2s', change: 'Real-time' },
        ]);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-card-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted">Welcome back! Here's your business overview.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="card p-6">
              <p className="text-sm text-muted font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
              {stat.change && <p className="text-xs text-primary mt-2">{stat.change}</p>}
            </div>
          ))}
        </div>

        {/* Agents Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Your AI Agents</h2>
            <Link
              href="/dashboard/agents/new"
              className="btn-primary px-6 py-2 text-sm font-semibold"
            >
              Create Agent
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted">Loading agents...</p>
            </div>
          ) : agents.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-muted mb-4">No agents created yet.</p>
              <Link
                href="/dashboard/agents/new"
                className="btn-primary px-6 py-2 text-sm font-semibold inline-block"
              >
                Create Your First Agent
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/dashboard/agents/${agent.id}`}
                  className="card p-6 hover:border-primary transition-colors cursor-pointer"
                >
                  <h3 className="text-lg font-bold text-foreground mb-2">{agent.agent_name}</h3>
                  <p className="text-sm text-muted line-clamp-3 mb-4">
                    {agent.system_prompt || 'No description'}
                  </p>
                  <div className="flex justify-between items-center text-xs text-muted">
                    <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded">
                      Active
                    </span>
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/dashboard/inbox"
              className="card p-6 hover:border-primary transition-colors cursor-pointer"
            >
              <h3 className="text-lg font-bold text-foreground mb-2">📨 Inbox</h3>
              <p className="text-sm text-muted">View and manage customer messages</p>
            </Link>
            <Link
              href="/dashboard/analytics"
              className="card p-6 hover:border-primary transition-colors cursor-pointer"
            >
              <h3 className="text-lg font-bold text-foreground mb-2">📊 Analytics</h3>
              <p className="text-sm text-muted">Track conversions and performance</p>
            </Link>
            <Link
              href="/dashboard/settings"
              className="card p-6 hover:border-primary transition-colors cursor-pointer"
            >
              <h3 className="text-lg font-bold text-foreground mb-2">⚙️ Settings</h3>
              <p className="text-sm text-muted">Configure your business and integrations</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
