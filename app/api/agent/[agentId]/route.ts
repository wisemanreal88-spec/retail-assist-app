import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createMockAdminSupabaseClient } from '@/lib/supabase/mock-client';
import { callOpenAIChat } from '@/lib/openai/server';
import { callOpenAI } from '@/lib/openai/mock';
import { env } from '@/lib/env';

export async function POST(request: Request, { params }: { params: Promise<{ agentId: string }> }) {
  try {
    const { agentId } = await params;
    const body = await request.json();
    const message = body.message;
    if (!message) return NextResponse.json({ error: 'Missing message' }, { status: 400 });

    // Check for API key in headers (public API use)
    const apiKeyHeader = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace(/^Bearer\s+/, '');

    // Use mock or real client based on test mode
    const isTestMode = env.isTestMode;
    
    // Create supabase server client (uses cookies for auth when no API key)
    const supabase = isTestMode ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    let agent: any = null;

    if (apiKeyHeader) {
      // Use admin client for API-key lookups (bypass RLS)
      const admin = isTestMode ? createMockAdminSupabaseClient() : createAdminSupabaseClient();
      const { data: agentRow, error: keyErr } = await admin
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .eq('api_key', apiKeyHeader)
        .limit(1)
        .maybeSingle();
      if (keyErr) {
        console.error('supabase error', keyErr);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
      if (!agentRow) return NextResponse.json({ error: 'Invalid API key or agent not found' }, { status: 401 });
      agent = agentRow;
      // use admin for inserting logs when api key used
      try {
        await admin.from('agent_logs').insert([{ agent_id: agentId, user_message: message, assistant_message: 'log-placeholder' }]);
      } catch (e) {
        // ignore; we'll re-insert later with supabase if desired
      }
    } else {
      // Require authenticated session for non-API-key requests
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && !isTestMode) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      // Fetch agent config
      const { data: agentRow, error } = await supabase.from('agents').select('*').eq('id', agentId).limit(1).maybeSingle();
      if (error && !isTestMode) {
        console.error('supabase error', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
      agent = agentRow;
      if (!agent && !isTestMode) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      
      // Create a mock agent if in test mode and none found
      if (!agent && isTestMode) {
        agent = { id: agentId, system_prompt: 'You are a helpful retail assistant.', model: 'gpt-4o-mini' };
      }
    }

    const systemPrompt = agent.system_prompt ?? 'You are a helpful assistant for retail support.';
    const model = agent.model ?? 'gpt-4o-mini';

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ];

    // Use mock or real OpenAI based on test mode
    const reply = isTestMode ? await callOpenAI(message) : await callOpenAIChat(messages, model);

    // Optionally save to logs table (best-effort)
    try {
      await supabase.from('agent_logs').insert([{ agent_id: agentId, user_message: message, assistant_message: reply }]);
    } catch (e) {
      console.warn('Failed to save log', e);
    }

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
