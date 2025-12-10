/**
 * Database Utility Functions
 * Reusable functions for common database operations
 */

import { createServerSupabaseClient, createAdminSupabaseClient } from './server';
import { createMockAdminSupabaseClient } from './server';
import { env } from '@/lib/env';
import type {
  User,
  Agent,
  Workspace,
  Comment,
  DirectMessage,
  AutomationRule,
  Subscription,
  DailyStat,
  WorkspaceMember,
  WorkspaceInvite,
  WorkspaceMemberRole,
} from '@/lib/types/database';

// ============================================================================
// USER OPERATIONS
// ============================================================================

export async function getCurrentUser() {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !data) return null;
    return data as User;
  } catch (e) {
    console.error('Failed to get current user:', e);
    return null;
  }
}

export async function createUser(userId: string, email: string, fullName?: string) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createAdminSupabaseClient();

    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email,
        full_name: fullName,
        api_key: `sk_${Math.random().toString(36).slice(2)}`,
      }])
      .select()
      .single();

    if (error) {
      console.error('Failed to create user:', error);
      return null;
    }

    return data as User;
  } catch (e) {
    console.error('Failed to create user:', e);
    return null;
  }
}

// ============================================================================
// WORKSPACE OPERATIONS
// ============================================================================

export async function getUserWorkspaces(userId: string) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .or(`owner_id.eq.${userId},workspace_members.user_id.eq.${userId}`);

    if (error) {
      console.error('Failed to get workspaces:', error);
      return [];
    }

    return (data || []) as Workspace[];
  } catch (e) {
    console.error('Failed to get workspaces:', e);
    return [];
  }
}

export async function createWorkspace(userId: string, name: string, description?: string) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createAdminSupabaseClient();

    const { data, error } = await supabase
      .from('workspaces')
      .insert([{
        owner_id: userId,
        name,
        description,
      }])
      .select()
      .single();

    if (error) {
      console.error('Failed to create workspace:', error);
      return null;
    }

    return data as Workspace;
  } catch (e) {
    console.error('Failed to create workspace:', e);
    return null;
  }
}

// ============================================================================
// AGENT OPERATIONS
// ============================================================================

export async function getWorkspaceAgents(workspaceId: string) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null);

    if (error) {
      console.error('Failed to get agents:', error);
      return [];
    }

    return (data || []) as Agent[];
  } catch (e) {
    console.error('Failed to get agents:', e);
    return [];
  }
}

export async function getAgentById(agentId: string) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (error) {
      console.error('Failed to get agent:', error);
      return null;
    }

    return data as Agent;
  } catch (e) {
    console.error('Failed to get agent:', e);
    return null;
  }
}

export async function createAgent(workspaceId: string, input: {
  name: string;
  description?: string;
  system_prompt: string;
  greeting?: string;
  fallback?: string;
  model?: string;
}) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createAdminSupabaseClient();

    const apiKey = `sk_${Math.random().toString(36).slice(2)}`;

    const { data, error } = await supabase
      .from('agents')
      .insert([{
        workspace_id: workspaceId,
        api_key: apiKey,
        model: input.model || 'gpt-4o-mini',
        ...input,
      }])
      .select()
      .single();

    if (error) {
      console.error('Failed to create agent:', error);
      return null;
    }

    return data as Agent;
  } catch (e) {
    console.error('Failed to create agent:', e);
    return null;
  }
}

export async function updateAgent(agentId: string, input: Partial<Agent>) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createAdminSupabaseClient();

    const { data, error } = await supabase
      .from('agents')
      .update(input)
      .eq('id', agentId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update agent:', error);
      return null;
    }

    return data as Agent;
  } catch (e) {
    console.error('Failed to update agent:', e);
    return null;
  }
}

// ============================================================================
// COMMENT OPERATIONS
// ============================================================================

export async function saveComment(agentId: string, input: {
  platform: string;
  author_email?: string;
  author_name?: string;
  content: string;
  platform_comment_id?: string;
}) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createAdminSupabaseClient();

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        agent_id: agentId,
        ...input,
      }])
      .select()
      .single();

    if (error) {
      console.error('Failed to save comment:', error);
      return null;
    }

    return data as Comment;
  } catch (e) {
    console.error('Failed to save comment:', e);
    return null;
  }
}

export async function getUnprocessedComments(agentId: string, limit = 10) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('agent_id', agentId)
      .eq('processed', false)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Failed to get comments:', error);
      return [];
    }

    return (data || []) as Comment[];
  } catch (e) {
    console.error('Failed to get comments:', e);
    return [];
  }
}

export async function markCommentProcessed(commentId: string, botReply: string, botReplyId?: string) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createAdminSupabaseClient();

    const { data, error } = await supabase
      .from('comments')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
        bot_reply: botReply,
        bot_reply_id: botReplyId,
      })
      .eq('id', commentId)
      .select()
      .single();

    if (error) {
      console.error('Failed to mark comment processed:', error);
      return null;
    }

    return data as Comment;
  } catch (e) {
    console.error('Failed to mark comment processed:', e);
    return null;
  }
}

// ============================================================================
// DIRECT MESSAGE OPERATIONS
// ============================================================================

export async function createDirectMessage(workspaceId: string, input: {
  agent_id: string;
  recipient_id: string;
  recipient_name?: string;
  content: string;
  platform?: string;
  status?: string;
}) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createAdminSupabaseClient();

    const { data, error } = await supabase
      .from('direct_messages')
      .insert([{
        workspace_id: workspaceId,
        sender_display: 'Retail Assist Bot',
        status: 'sent',
        platform: 'email',
        ...input,
      }])
      .select()
      .single();

    if (error) {
      console.error('Failed to create direct message:', error);
      return null;
    }

    return data as DirectMessage;
  } catch (e) {
    console.error('Failed to create direct message:', e);
    return null;
  }
}

// ============================================================================
// MESSAGE LOG OPERATIONS
// ============================================================================

export async function logMessage(workspaceId: string, input: {
  agent_id: string;
  session_id?: string;
  user_message: string;
  assistant_message: string;
  tokens_used?: number;
  cost?: number;
  platform?: string;
}) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createAdminSupabaseClient();

    const { data, error } = await supabase
      .from('message_logs')
      .insert([{
        workspace_id: workspaceId,
        ...input,
      }])
      .select()
      .single();

    if (error) {
      console.error('Failed to log message:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Failed to log message:', e);
    return null;
  }
}

// ============================================================================
// COMMENT AUTOMATION LOG OPERATIONS
// ============================================================================

export async function hasAlreadyReplied(commentId: string): Promise<boolean> {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('automation_logs')
      .select('id')
      .eq('resource_id', commentId)
      .eq('action', 'replied')
      .maybeSingle();

    if (error) {
      console.error('Failed to check if already replied:', error);
      return false;
    }

    return !!data;
  } catch (e) {
    console.error('Failed to check if already replied:', e);
    return false;
  }
}

export async function logAutomationAction(input: {
  workspace_id: string;
  agent_id: string;
  comment_id: string;
  action: 'replied' | 'sent_dm' | 'skipped';
  platform: 'facebook' | 'instagram';
  trigger_rule_id: string;
  response_text?: string;
  metadata?: Record<string, any>;
}) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createAdminSupabaseClient();

    const { data, error } = await supabase
      .from('automation_logs')
      .insert([
        {
          workspace_id: input.workspace_id,
          agent_id: input.agent_id,
          resource_id: input.comment_id,
          resource_type: 'comment',
          action: input.action,
          trigger_rule_id: input.trigger_rule_id,
          platform: input.platform,
          response_text: input.response_text,
          metadata: input.metadata,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Failed to log automation action:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Failed to log automation action:', e);
    return null;
  }
}

// ============================================================================
// AUTOMATION RULE OPERATIONS
// ============================================================================

export async function getAutomationRules(workspaceId: string, agentId?: string, enabledOnly = true) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    let query = supabase
      .from('automation_rules')
      .select('*')
      .eq('workspace_id', workspaceId);

    if (enabledOnly) {
      query = query.eq('enabled', true);
    }

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to get automation rules:', error);
      return [];
    }

    return (data || []) as AutomationRule[];
  } catch (e) {
    console.error('Failed to get automation rules:', e);
    return [];
  }
}

export async function createAutomationRule(
  workspaceId: string,
  agentId: string,
  input: {
    name: string;
    description?: string;
    trigger_words?: string[];
    trigger_platforms?: string[];
    send_public_reply?: boolean;
    public_reply_template?: string;
    send_private_reply?: boolean;
    private_reply_template?: string;
    auto_skip_replies?: boolean;
    delay_seconds?: number;
  }
) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createAdminSupabaseClient();

    const { data, error } = await supabase
      .from('automation_rules')
      .insert([
        {
          workspace_id: workspaceId,
          agent_id: agentId,
          enabled: true,
          ...input,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Failed to create automation rule:', error);
      return null;
    }

    return data as AutomationRule;
  } catch (e) {
    console.error('Failed to create automation rule:', e);
    return null;
  }
}

export async function updateAutomationRule(ruleId: string, input: Partial<AutomationRule>) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createAdminSupabaseClient();

    const { data, error } = await supabase
      .from('automation_rules')
      .update(input)
      .eq('id', ruleId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update automation rule:', error);
      return null;
    }

    return data as AutomationRule;
  } catch (e) {
    console.error('Failed to update automation rule:', e);
    return null;
  }
}

export async function deleteAutomationRule(ruleId: string) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createAdminSupabaseClient();

    const { error } = await supabase
      .from('automation_rules')
      .delete()
      .eq('id', ruleId);

    if (error) {
      console.error('Failed to delete automation rule:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Failed to delete automation rule:', e);
    return false;
  }
}

export async function getRuleByKeyword(workspaceId: string, keyword: string) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('enabled', true)
      .contains('trigger_words', [keyword])
      .maybeSingle();

    if (error) {
      console.error('Failed to get rule by keyword:', error);
      return null;
    }

    return data as AutomationRule | null;
  } catch (e) {
    console.error('Failed to get rule by keyword:', e);
    return null;
  }
}

// ============================================================================
// SUBSCRIPTION OPERATIONS
// ============================================================================

export async function getWorkspaceSubscription(workspaceId: string) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('workspace_id', workspaceId)
      .single();

    if (error) {
      console.error('Failed to get subscription:', error);
      return null;
    }

    return data as Subscription;
  } catch (e) {
    console.error('Failed to get subscription:', e);
    return null;
  }
}

// ============================================================================
// ANALYTICS OPERATIONS
// ============================================================================

export async function getDailyStats(workspaceId: string, agentId?: string, days = 30) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
      .from('daily_stats')
      .select('*')
      .eq('workspace_id', workspaceId)
      .gte('stat_date', startDate.toISOString().split('T')[0]);

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    const { data, error } = await query.order('stat_date', { ascending: false });

    if (error) {
      console.error('Failed to get daily stats:', error);
      return [];
    }

    return (data || []) as DailyStat[];
  } catch (e) {
    console.error('Failed to get daily stats:', e);
    return [];
  }
}

export async function incrementDailyStat(workspaceId: string, agentId: string, statName: string, increment = 1) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createAdminSupabaseClient();

    // This uses the stored procedure created in migration
    const { error } = await supabase.rpc('increment_daily_stat', {
      p_workspace_id: workspaceId,
      p_agent_id: agentId,
      p_stat_name: statName,
      p_increment: increment,
    });

    if (error) {
      console.error('Failed to increment stat:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Failed to increment stat:', e);
    return false;
  }
}

// ============================================================================
// AUDIT LOG OPERATIONS
// ============================================================================

export async function createAuditLog(
  workspaceId: string,
  userId: string | undefined,
  action: string,
  resourceType: string,
  resourceId?: string,
  changes?: Record<string, any>
) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createAdminSupabaseClient();

    const { error } = await supabase
      .from('audit_logs')
      .insert([{
        workspace_id: workspaceId,
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        changes,
      }]);

    if (error) {
      console.error('Failed to create audit log:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Failed to create audit log:', e);
    return false;
  }
}

// ============================================================================
// FACEBOOK EVENT OPERATIONS
// ============================================================================

export async function saveFacebookEvent(input: {
  workspace_id: string;
  page_id: string;
  event_type: string;
  platform?: string;
  raw_payload: Record<string, any>;
}) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createAdminSupabaseClient();

    const { data, error } = await supabase
      .from('fb_events')
      .insert([
        {
          workspace_id: input.workspace_id,
          page_id: input.page_id,
          event_type: input.event_type,
          platform: input.platform || 'facebook',
          raw_payload: input.raw_payload,
          processed: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Failed to save Facebook event:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Failed to save Facebook event:', e);
    return null;
  }
}

export async function getFacebookEvent(eventId: string) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('fb_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Failed to get Facebook event:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Failed to get Facebook event:', e);
    return null;
  }
}

export async function getUnprocessedFacebookEvents(workspaceId: string, limit = 10) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('fb_events')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('processed', false)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Failed to get unprocessed Facebook events:', error);
      return [];
    }

    return data || [];
  } catch (e) {
    console.error('Failed to get unprocessed Facebook events:', e);
    return [];
  }
}

export async function markFacebookEventProcessed(
  eventId: string,
  responseSent: boolean,
  responseData?: Record<string, any>,
  errorMessage?: string
) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createAdminSupabaseClient();

    const { data, error } = await supabase
      .from('fb_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
        response_sent: responseSent,
        response_data: responseData,
        error_message: errorMessage,
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error('Failed to mark Facebook event as processed:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Failed to mark Facebook event as processed:', e);
    return null;
  }
}

// ============================================================================
// SUBSCRIPTIONS (PayPal / Mobile Money)
// ============================================================================

export async function createSubscription(input: {
  workspace_id: string;
  user_id: string;
  provider: string;
  provider_subscription_id?: string;
  plan: string;
  status?: string;
  next_billing_date?: string | null;
  metadata?: Record<string, any>;
}) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createAdminSupabaseClient();

    const { data, error } = await supabase
      .from('subscriptions')
      .insert([
        {
          workspace_id: input.workspace_id,
          user_id: input.user_id,
          provider: input.provider,
          provider_subscription_id: input.provider_subscription_id,
          plan: input.plan,
          status: input.status || 'pending',
          next_billing_date: input.next_billing_date,
          metadata: input.metadata || {},
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Failed to create subscription:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Failed to create subscription:', e);
    return null;
  }
}

export async function updateSubscriptionStatus(
  subscriptionId: string,
  updates: { status?: string; next_billing_date?: string | null; metadata?: Record<string, any> }
) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createAdminSupabaseClient();

    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: updates.status,
        next_billing_date: updates.next_billing_date,
        metadata: updates.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update subscription:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Failed to update subscription:', e);
    return null;
  }
}

export async function getUserSubscription(userId: string) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Failed to get user subscription:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Failed to get user subscription:', e);
    return null;
  }
}

export async function getSubscriptionByProviderId(providerId: string) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('provider_subscription_id', providerId)
      .maybeSingle();

    if (error) {
      console.error('Failed to get subscription by provider id:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Failed to get subscription by provider id:', e);
    return null;
  }
}

// ============================================================================
// MOBILE MONEY PAYMENTS
// ============================================================================

export async function saveMobileMoneyPayment(input: {
  workspace_id: string;
  user_id: string;
  phone_number: string;
  receipt_url?: string;
  amount?: number;
  currency?: string;
}) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createAdminSupabaseClient();

    const { data, error } = await supabase
      .from('mobile_money_payments')
      .insert([
        {
          workspace_id: input.workspace_id,
          user_id: input.user_id,
          phone_number: input.phone_number,
          receipt_url: input.receipt_url,
          amount: input.amount,
          currency: input.currency || 'USD',
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Failed to save mobile money payment:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Failed to save mobile money payment:', e);
    return null;
  }
}

export async function approveMobileMoneyPayment(
  paymentId: string,
  adminId: string,
  activateSubscriptionForUser?: { plan: string; provider: string }
) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createAdminSupabaseClient();

    // Mark payment as approved
    const { data: approved, error: approveError } = await supabase
      .from('mobile_money_payments')
      .update({ status: 'approved', admin_id: adminId, processed_at: new Date().toISOString() })
      .eq('id', paymentId)
      .select()
      .single();

    if (approveError) {
      console.error('Failed to approve mobile money payment:', approveError);
      return null;
    }

    // Optionally create subscription for the user who made payment
    if (activateSubscriptionForUser && approved) {
      const userId = approved.user_id;
      const workspaceId = approved.workspace_id;
      const sub = await createSubscription({
        workspace_id: workspaceId,
        user_id: userId,
        provider: 'mobile_money',
        plan: activateSubscriptionForUser.plan,
        status: 'active',
        next_billing_date: null,
      });

      return { approved, subscription: sub };
    }

    return { approved };
  } catch (e) {
    console.error('Failed to approve mobile money payment:', e);
    return null;
  }
}

// ============================================================================
// TEAM MANAGEMENT OPERATIONS
// ============================================================================

/**
 * Get all members of a workspace
 * Requires user to be a member of the workspace
 */
export async function getWorkspaceMembers(workspaceId: string) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('workspace_members')
      .select(`
        id,
        workspace_id,
        user_id,
        role,
        invited_by,
        invited_at,
        accepted_at,
        created_at,
        users:user_id(email, full_name, avatar_url)
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[team] Error fetching workspace members:', error);
      return [];
    }

    return (data || []) as WorkspaceMember[];
  } catch (e) {
    console.error('[team] Error in getWorkspaceMembers:', e);
    return [];
  }
}

/**
 * Get all pending invites for a workspace
 * Only admins can view
 */
export async function getWorkspaceInvites(workspaceId: string) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('workspace_invites')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[team] Error fetching workspace invites:', error);
      return [];
    }

    return (data || []) as WorkspaceInvite[];
  } catch (e) {
    console.error('[team] Error in getWorkspaceInvites:', e);
    return [];
  }
}

/**
 * Invite a member to workspace
 * User must be owner/admin
 */
export async function inviteMember(
  workspaceId: string,
  email: string,
  role: WorkspaceMemberRole,
  currentUserId: string
) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    // Check if current user is owner/admin
    const { data: memberData, error: memberError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', currentUserId)
      .single();

    if (memberError || !memberData || !['owner', 'admin'].includes(memberData.role)) {
      console.error('[team] User does not have permission to invite members');
      return { error: 'Insufficient permissions', data: null };
    }

    // Prevent inviting with higher role than inviter
    if (role === 'owner' && memberData.role !== 'owner') {
      console.error('[team] Cannot invite with owner role');
      return { error: 'Cannot invite with owner role', data: null };
    }

    // Create invite
    const { data, error } = await supabase
      .from('workspace_invites')
      .insert({
        workspace_id: workspaceId,
        email,
        role,
        created_by: currentUserId,
      })
      .select()
      .single();

    if (error) {
      console.error('[team] Error creating invite:', error);
      return { error: error.message, data: null };
    }

    // Log to audit
    await supabase
      .from('audit_logs')
      .insert({
        workspace_id: workspaceId,
        action: 'invite_member',
        details: { email, role },
        created_by: currentUserId,
      });

    console.log('[team] Invite created:', data.id);
    return { error: null, data: data as WorkspaceInvite };
  } catch (e) {
    console.error('[team] Error in inviteMember:', e);
    return { error: String(e), data: null };
  }
}

/**
 * Accept a workspace invite
 * Token must be valid and not expired
 */
export async function acceptInvite(token: string, userId: string) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createAdminSupabaseClient();

    // Get the invite
    const { data: inviteData, error: inviteError } = await supabase
      .from('workspace_invites')
      .select('*')
      .eq('token', token)
      .single();

    if (inviteError || !inviteData) {
      console.error('[team] Invalid invite token');
      return { error: 'Invalid invite token', data: null };
    }

    // Check if expired
    if (new Date(inviteData.expires_at) < new Date()) {
      console.error('[team] Invite has expired');
      return { error: 'Invite has expired', data: null };
    }

    // Check if already accepted
    if (inviteData.accepted) {
      console.error('[team] Invite already accepted');
      return { error: 'Invite already accepted', data: null };
    }

    // Get user email to verify match
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('[team] User not found');
      return { error: 'User not found', data: null };
    }

    if (userData.email !== inviteData.email) {
      console.error('[team] Email does not match invite');
      return { error: 'Email does not match invite', data: null };
    }

    // Add member to workspace
    const { data: memberData, error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: inviteData.workspace_id,
        user_id: userId,
        role: inviteData.role,
        invited_by: inviteData.created_by,
      })
      .select()
      .single();

    if (memberError) {
      // Member might already exist
      if (memberError.code === '23505') {
        console.log('[team] User already a member');
        return { error: null, data: memberData };
      }
      console.error('[team] Error adding member:', memberError);
      return { error: memberError.message, data: null };
    }

    // Mark invite as accepted
    await supabase
      .from('workspace_invites')
      .update({
        accepted: true,
        accepted_by: userId,
        accepted_at: new Date().toISOString(),
      })
      .eq('id', inviteData.id);

    // Log to audit
    await supabase
      .from('audit_logs')
      .insert({
        workspace_id: inviteData.workspace_id,
        action: 'accept_invite',
        details: { email: inviteData.email, role: inviteData.role },
        created_by: userId,
      });

    console.log('[team] Invite accepted, member added');
    return { error: null, data: memberData as WorkspaceMember };
  } catch (e) {
    console.error('[team] Error in acceptInvite:', e);
    return { error: String(e), data: null };
  }
}

/**
 * Remove a member from workspace
 * Cannot remove if it's the last owner
 */
export async function removeMember(
  workspaceId: string,
  memberId: string,
  currentUserId: string
) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    // Check if current user is owner/admin
    const { data: currentMemberData, error: currentError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', currentUserId)
      .single();

    if (currentError || !currentMemberData || !['owner', 'admin'].includes(currentMemberData.role)) {
      console.error('[team] User does not have permission to remove members');
      return { error: 'Insufficient permissions', data: null };
    }

    // Get the member being removed
    const { data: memberData, error: memberError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (memberError || !memberData) {
      console.error('[team] Member not found');
      return { error: 'Member not found', data: null };
    }

    // Cannot remove owner unless you're removing yourself
    if (memberData.role === 'owner' && memberData.user_id !== currentUserId) {
      // Check if this is the last owner
      const { data: ownerCount, error: countError } = await supabase
        .from('workspace_members')
        .select('id', { count: 'exact' })
        .eq('workspace_id', workspaceId)
        .eq('role', 'owner');

      if (!countError && ownerCount && ownerCount.length <= 1) {
        console.error('[team] Cannot remove last owner');
        return { error: 'Cannot remove the last owner', data: null };
      }
    }

    // Cannot remove if someone is removing someone with higher role
    if (memberData.role === 'owner' && currentMemberData.role !== 'owner') {
      console.error('[team] Cannot remove owner as non-owner');
      return { error: 'Cannot remove owner', data: null };
    }

    // Delete member
    const { error: deleteError } = await supabase
      .from('workspace_members')
      .delete()
      .eq('id', memberId);

    if (deleteError) {
      console.error('[team] Error removing member:', deleteError);
      return { error: deleteError.message, data: null };
    }

    // Log to audit
    await supabase
      .from('audit_logs')
      .insert({
        workspace_id: workspaceId,
        action: 'remove_member',
        details: { member_id: memberId, member_role: memberData.role },
        created_by: currentUserId,
      });

    console.log('[team] Member removed');
    return { error: null, data: { success: true } };
  } catch (e) {
    console.error('[team] Error in removeMember:', e);
    return { error: String(e), data: null };
  }
}

/**
 * Update a member's role
 * Cannot downgrade owner to lower role
 */
export async function updateMemberRole(
  workspaceId: string,
  memberId: string,
  newRole: WorkspaceMemberRole,
  currentUserId: string
) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    // Check if current user is owner/admin
    const { data: currentMemberData, error: currentError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', currentUserId)
      .single();

    if (currentError || !currentMemberData || !['owner', 'admin'].includes(currentMemberData.role)) {
      console.error('[team] User does not have permission to update roles');
      return { error: 'Insufficient permissions', data: null };
    }

    // Get the member being updated
    const { data: memberData, error: memberError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (memberError || !memberData) {
      console.error('[team] Member not found');
      return { error: 'Member not found', data: null };
    }

    // Cannot change owner role if not owner yourself
    if ((memberData.role === 'owner' || newRole === 'owner') && currentMemberData.role !== 'owner') {
      console.error('[team] Only owners can manage owner roles');
      return { error: 'Only owners can manage owner roles', data: null };
    }

    // Cannot downgrade last owner
    if (memberData.role === 'owner' && newRole !== 'owner') {
      const { data: ownerCount, error: countError } = await supabase
        .from('workspace_members')
        .select('id', { count: 'exact' })
        .eq('workspace_id', workspaceId)
        .eq('role', 'owner');

      if (!countError && ownerCount && ownerCount.length <= 1) {
        console.error('[team] Cannot downgrade last owner');
        return { error: 'Cannot downgrade the last owner', data: null };
      }
    }

    // Update role
    const { data: updatedData, error: updateError } = await supabase
      .from('workspace_members')
      .update({ role: newRole })
      .eq('id', memberId)
      .select()
      .single();

    if (updateError) {
      console.error('[team] Error updating member role:', updateError);
      return { error: updateError.message, data: null };
    }

    // Log to audit
    await supabase
      .from('audit_logs')
      .insert({
        workspace_id: workspaceId,
        action: 'update_member_role',
        details: { member_id: memberId, old_role: memberData.role, new_role: newRole },
        created_by: currentUserId,
      });

    console.log('[team] Member role updated');
    return { error: null, data: updatedData as WorkspaceMember };
  } catch (e) {
    console.error('[team] Error in updateMemberRole:', e);
    return { error: String(e), data: null };
  }
}

/**
 * Resend an invite to a member
 */
export async function resendInvite(
  workspaceId: string,
  inviteId: string,
  currentUserId: string
) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    // Check if current user is owner/admin
    const { data: memberData, error: memberError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', currentUserId)
      .single();

    if (memberError || !memberData || !['owner', 'admin'].includes(memberData.role)) {
      console.error('[team] User does not have permission to resend invites');
      return { error: 'Insufficient permissions', data: null };
    }

    // Get the invite
    const { data: inviteData, error: inviteError } = await supabase
      .from('workspace_invites')
      .select('*')
      .eq('id', inviteId)
      .eq('workspace_id', workspaceId)
      .single();

    if (inviteError || !inviteData) {
      console.error('[team] Invite not found');
      return { error: 'Invite not found', data: null };
    }

    // If already accepted, cannot resend
    if (inviteData.accepted) {
      console.error('[team] Cannot resend accepted invite');
      return { error: 'Invite already accepted', data: null };
    }

    // Update invite expiry
    const { data: updatedData, error: updateError } = await supabase
      .from('workspace_invites')
      .update({
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', inviteId)
      .select()
      .single();

    if (updateError) {
      console.error('[team] Error resending invite:', updateError);
      return { error: updateError.message, data: null };
    }

    console.log('[team] Invite resent');
    return { error: null, data: updatedData as WorkspaceInvite };
  } catch (e) {
    console.error('[team] Error in resendInvite:', e);
    return { error: String(e), data: null };
  }
}

// ============================================================================
// PAYMENT OPERATIONS
// ============================================================================

export async function createPayment(
  workspaceId: string,
  userId: string,
  amount: number,
  method: 'paypal' | 'mobile_money',
  metadata?: Record<string, any>
) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('payments')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        amount,
        method,
        status: 'pending',
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('[payment] Error creating payment:', error);
      return { error: error.message, data: null };
    }

    console.log('[payment] Payment created:', data?.id);
    return { error: null, data };
  } catch (e) {
    console.error('[payment] Error in createPayment:', e);
    return { error: String(e), data: null };
  }
}

export async function updatePaymentStatus(
  paymentId: string,
  status: 'pending' | 'completed' | 'failed',
  metadata?: Record<string, any>
) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (metadata) {
      const { data: existing } = await supabase
        .from('payments')
        .select('metadata')
        .eq('id', paymentId)
        .single();

      updateData.metadata = { ...(existing?.metadata || {}), ...metadata };
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      console.error('[payment] Error updating payment:', error);
      return { error: error.message, data: null };
    }

    console.log('[payment] Payment updated:', paymentId, status);
    return { error: null, data };
  } catch (e) {
    console.error('[payment] Error in updatePaymentStatus:', e);
    return { error: String(e), data: null };
  }
}

export async function getPaymentHistory(workspaceId: string) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[payment] Error fetching payment history:', error);
      return { error: error.message, data: [] };
    }

    return { error: null, data: data || [] };
  } catch (e) {
    console.error('[payment] Error in getPaymentHistory:', e);
    return { error: String(e), data: [] };
  }
}

// ============================================================================
// BILLING OPERATIONS (Feature 10 - Billing & Payment Gateway)
// ============================================================================

export async function getAllPlans() {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[billing] Error fetching plans:', error);
      return { error: error.message, data: [] };
    }

    return { error: null, data: data || [] };
  } catch (e) {
    console.error('[billing] Error in getAllPlans:', e);
    return { error: String(e), data: [] };
  }
}

export async function getPlanById(planId: string) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) {
      console.error('[billing] Error fetching plan:', error);
      return { error: error.message, data: null };
    }

    return { error: null, data };
  } catch (e) {
    console.error('[billing] Error in getPlanById:', e);
    return { error: String(e), data: null };
  }
}

export async function updateSubscriptionBilling(
  subscriptionId: string,
  updates: Record<string, any>
) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      console.error('[billing] Error updating subscription:', error);
      return { error: error.message, data: null };
    }

    console.log('[billing] Subscription updated:', subscriptionId);
    return { error: null, data };
  } catch (e) {
    console.error('[billing] Error in updateSubscriptionBilling:', e);
    return { error: String(e), data: null };
  }
}

export async function recordBillingPayment(
  subscriptionId: string,
  workspaceId: string,
  amount: number,
  currency: string,
  provider: 'paypal' | 'stripe' | 'momo' | 'manual',
  transactionId?: string,
  metadata?: Record<string, any>
) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('billing_payments')
      .insert({
        subscription_id: subscriptionId,
        workspace_id: workspaceId,
        amount,
        currency,
        provider,
        status: 'completed',
        transaction_id: transactionId,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('[billing] Error recording payment:', error);
      return { error: error.message, data: null };
    }

    console.log('[billing] Payment recorded:', data?.id);
    return { error: null, data };
  } catch (e) {
    console.error('[billing] Error in recordBillingPayment:', e);
    return { error: String(e), data: null };
  }
}

export async function getBillingPaymentHistory(workspaceId: string) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('billing_payments')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[billing] Error fetching payment history:', error);
      return { error: error.message, data: [] };
    }

    return { error: null, data: data || [] };
  } catch (e) {
    console.error('[billing] Error in getBillingPaymentHistory:', e);
    return { error: String(e), data: [] };
  }
}

export async function createMobileMoneyPaymentBilling(
  subscriptionId: string,
  workspaceId: string,
  phoneNumber: string,
  amount: number,
  referenceCode: string,
  provider: 'mtn' | 'vodacom' | 'airtel' = 'mtn'
) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('momo_payments')
      .insert({
        subscription_id: subscriptionId,
        workspace_id: workspaceId,
        phone_number: phoneNumber,
        amount,
        reference_code: referenceCode,
        provider,
        status: 'pending',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[billing] Error creating momo payment:', error);
      return { error: error.message, data: null };
    }

    console.log('[billing] Mobile money payment created:', referenceCode);
    return { error: null, data };
  } catch (e) {
    console.error('[billing] Error in createMobileMoneyPaymentBilling:', e);
    return { error: String(e), data: null };
  }
}

export async function confirmMobileMoneyPaymentBilling(
  paymentId: string,
  confirmedByUserId: string,
  notes?: string
) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('momo_payments')
      .update({
        status: 'confirmed',
        confirmed_by: confirmedByUserId,
        confirmed_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      console.error('[billing] Error confirming momo payment:', error);
      return { error: error.message, data: null };
    }

    console.log('[billing] Mobile money payment confirmed:', paymentId);
    return { error: null, data };
  } catch (e) {
    console.error('[billing] Error in confirmMobileMoneyPaymentBilling:', e);
    return { error: String(e), data: null };
  }
}

export async function recordBillingEvent(
  workspaceId: string,
  eventType: string,
  subscriptionId?: string,
  paymentId?: string,
  data?: Record<string, any>
) {
  try {
    const useMock = env.useMockMode;
    const supabase = useMock ? await createMockAdminSupabaseClient() : await createServerSupabaseClient();

    const { data: result, error } = await supabase
      .from('billing_events')
      .insert({
        workspace_id: workspaceId,
        event_type: eventType,
        subscription_id: subscriptionId,
        payment_id: paymentId,
        data: data || {},
      })
      .select()
      .single();

    if (error) {
      console.error('[billing] Error recording event:', error);
      return { error: error.message, data: null };
    }

    console.log('[billing] Event recorded:', eventType);
    return { error: null, data: result };
  } catch (e) {
    console.error('[billing] Error in recordBillingEvent:', e);
    return { error: String(e), data: null };
  }
}




