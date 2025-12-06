import Link from "next/link";
import { createServerSupabaseClient } from '@/lib/supabase/server';
import ApiKeyDisplay from '@/components/ApiKeyDisplay';

export default async function AgentsPage(){
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return (
      <div className="max-w-7xl mx-auto">
        <p className="text-muted">Please sign in to view your agents.</p>
      </div>
    );
  }

  const { data: agents, error } = await supabase.from('agents').select('*').eq('owner_id', session.user.id).order('created_at', { ascending: false });
  if (error) {
    console.error('failed to load agents', error);
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">AI Agents</h2>
          <p className="text-muted">Create, manage and test your AI agents.</p>
        </div>

        <div className="flex gap-4">
          <Link href="/dashboard/agents/new">
            <button className="btn-secondary">New Agent</button>
          </Link>
          <button className="bg-card-border text-foreground px-4 py-2 rounded-lg">Import</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {agents && agents.length > 0 ? (
          agents.map((a: any) => (
            <div key={a.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{a.name}</h3>
                  <p className="text-sm text-muted">Model: {a.model}</p>
                </div>
                <div className="text-right text-xs text-muted">{new Date(a.created_at).toLocaleDateString()}</div>
              </div>
                  <div className="mt-4 flex gap-2 items-center justify-between">
                    <div className="flex gap-2 items-center">
                      <Link href={`/dashboard/agents/${a.id}`} className="text-sm btn-secondary px-3 py-2">Open</Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <ApiKeyDisplay apiKey={a.api_key} />
                    </div>
                  </div>
            </div>
          ))
        ) : (
          <div className="card text-center text-muted">No agents yet. Create your first agent.</div>
        )}
      </div>
    </div>
  );
}
