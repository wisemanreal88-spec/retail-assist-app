// FIXED: add minimal missing query functions required by server code (getPendingMobileMoneyPayments, insertSystemLog)

import { createServerSupabaseClient } from './server';

/**
 * Get pending mobile money payments for admin view.
 * Minimal implementation to satisfy build & usage in server components.
 */
export async function getPendingMobileMoneyPayments(workspaceId: string) {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('mobile_money_payments')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    return { error: error ? error.message : null, data: data || [] };
  } catch (e: any) {
    console.error('getPendingMobileMoneyPayments error:', e);
    return { error: e.message || 'Unknown error', data: [] };
  }
}

/**
 * insertSystemLog
 * Minimal system log inserter for server-side logging.
 */
export async function insertSystemLog(payload: {
  level: string;
  message: string;
  meta?: Record<string, any>;
}) {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.from('system_logs').insert([
      {
        level: payload.level,
        message: payload.message,
        meta: payload.meta || null,
      },
    ]);
    return { error: null };
  } catch (e: any) {
    console.error('insertSystemLog error:', e);
    return { error: e.message || 'Unknown error' };
  }
}

// placeholder export to satisfy module system
export {};
