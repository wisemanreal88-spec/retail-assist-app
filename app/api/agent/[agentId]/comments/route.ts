import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createMockAdminSupabaseClient } from '@/lib/supabase/mock-client';
import { callOpenAI } from '@/lib/openai/mock';
import { callOpenAIChat } from '@/lib/openai/server';
import { env } from '@/lib/env';

export async function POST(request: Request, { params }: { params: Promise<{ agentId: string }> }) {
  try {
    const { agentId } = await params;
    const body = await request.json();
    const { author_email, content } = body;
    if (!content) return NextResponse.json({ error: 'Missing content' }, { status: 400 });

    const isTestMode = env.isTestMode;
    const supabase = isTestMode ? createMockAdminSupabaseClient() : await createServerSupabaseClient();

    // Save public comment
    try {
      await supabase.from('comments').insert([{ agent_id: agentId, author_email, content }]);
    } catch (e) {
      console.warn('Failed to save comment', e);
    }

    // Build a prompt for the bot to reply to the comment
    const prompt = `A user commented: "${content}". Reply politely and helpfully.`;

    // Get bot reply (mock or real)
    const reply = isTestMode ? await callOpenAI(content) : await callOpenAIChat([{ role: 'user', content: prompt }], 'gpt-4o-mini');

    // Create a DM for the commenting user (if we have their email we treat it as id)
    const recipientId = author_email ?? `anon_${Date.now()}`;
    const senderDisplay = 'Retail Assist Bot';

    try {
      await supabase.from('direct_messages').insert([{ recipient_id: recipientId, sender_display: senderDisplay, content: reply }]);
    } catch (e) {
      console.warn('Failed to create DM', e);
    }

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
