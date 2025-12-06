import React from 'react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createMockAdminSupabaseClient } from '@/lib/supabase/mock-client';

export default async function InboxPage() {
  const isTestMode = process.env.NEXT_PUBLIC_TEST_MODE === 'true';
  const supabase = isTestMode ? createMockAdminSupabaseClient() : await createServerSupabaseClient();

  // server-side fetch messages for current user
  let messages: any[] = [];
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const recipient = session?.user?.email ?? session?.user?.id ?? `user_${Date.now()}`;
    const { data, error } = await supabase.from('direct_messages').select('*').eq('recipient_id', recipient).order('created_at', { ascending: false });
    if (!error) messages = data || [];
  } catch (e) {
    console.warn('Failed to load inbox', e);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Inbox</h2>
      {messages.length === 0 && <p className="text-muted">No messages yet.</p>}
      <ul className="space-y-4">
        {messages.map((m: any) => (
          <li key={m.id} className="p-4 border rounded bg-card-bg">
            <div className="text-sm text-muted">From: {m.sender_display ?? m.sender_id ?? 'Bot'}</div>
            <div className="mt-2">{m.content}</div>
            <div className="text-xs text-muted mt-2">{new Date(m.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
