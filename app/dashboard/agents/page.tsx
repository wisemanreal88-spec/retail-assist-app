'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Agent {
  id: string;
  agent_name: string;
  system_prompt?: string;
  created_at?: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const loadAgents = async () => {
      try {
        // Demo agents
        const demoAgents: Agent[] = [
          {
            id: '1',
            agent_name: 'Sales Assistant',
            system_prompt: 'You are a friendly sales representative who helps customers find the perfect product...',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            agent_name: 'Support Bot',
            system_prompt: 'You are a helpful customer support agent who resolves issues quickly...',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
        setAgents(demoAgents);
      } catch (err) {
        console.error('Failed to load agents', err);
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      setAgents(agents.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-card-border">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">AI Agents</h1>
            <p className="text-muted">Create, manage and test your AI agents</p>
          </div>
          <Link href="/dashboard/agents/new" className="btn-primary px-6 py-2 text-sm font-semibold">
            Create New Agent
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted">Loading agents...</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-muted mb-6">No agents created yet.</p>
            <p className="text-sm text-muted mb-6">
              Create your first AI agent to start automating customer interactions.
            </p>
            <Link href="/dashboard/agents/new" className="btn-primary px-6 py-2 text-sm font-semibold inline-block">
              Create Your First Agent
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div key={agent.id} className="card p-6 hover:border-primary transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">{agent.agent_name}</h3>
                  <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                    Active
                  </span>
                </div>
                <p className="text-sm text-muted line-clamp-2 mb-4">
                  {agent.system_prompt || 'No description provided'}
                </p>
                <div className="text-xs text-muted mb-4">
                  Created {agent.created_at ? new Date(agent.created_at).toLocaleDateString() : 'recently'}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/agents/${agent.id}`}
                    className="flex-1 text-center btn-secondary px-3 py-2 text-sm font-semibold"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(agent.id)}
                    className="flex-1 text-center px-3 py-2 text-sm font-semibold border border-red-500 text-red-500 rounded hover:bg-red-500/10 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
