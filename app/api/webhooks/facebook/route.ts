import { NextRequest, NextResponse } from 'next/server';
import { detectCommentEvent } from '@/lib/meta/comment';
import { runCommentAutomation } from '@/lib/automation/comment/runCommentAutomation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { isComment, platform, data } = detectCommentEvent(body);

  if (!isComment || !data) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Find workspace by pageId
  const supabase = await createServerSupabaseClient();
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, meta_page_id')
    .eq('meta_page_id', data.pageId)
    .single();
  if (!workspace) {
    return NextResponse.json({ ok: false, error: 'Workspace not found' }, { status: 404 });
  }

  // Get automation rule
  const { data: rule } = await supabase
    .from('comment_automation_rules')
    .select('*')
    .eq('workspace_id', workspace.id)
    .eq('enabled', true)
    .maybeSingle();
  if (!rule) {
    return NextResponse.json({ ok: true, ignored: true, reason: 'No automation rule' });
  }

  // Run automation logic
  const result = await runCommentAutomation({
    workspaceId: workspace.id,
    comment: data,
    rule,
    pageAccessToken: process.env.META_PAGE_ACCESS_TOKEN!, // must be set
    // aiAgent: optional, can be injected here
  });
  return NextResponse.json(result);
}

// Optionally handle GET for webhook verification
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}
