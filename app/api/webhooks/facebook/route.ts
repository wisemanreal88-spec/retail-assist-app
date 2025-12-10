/**
 * Facebook/Meta Webhook Handler
 * 
 * Receives and processes:
 * - Page feed changes (comments, posts)
 * - Inbox messages (DMs)
 * 
 * Verifies webhook challenge and processes events
 */

import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import {
  parseFacebookWebhook,
  verifyWebhookSignature,
  fbReplyToComment,
  fbSendDM,
} from '@/lib/facebook';
import {
  saveFacebookEvent,
  markFacebookEventProcessed,
  getAgentById,
  getAutomationRules,
} from '@/lib/supabase/queries';
import { createAdminSupabaseClient, createMockAdminSupabaseClient } from '@/lib/supabase/server';
import { generateAgentResponse } from '@/lib/openai/server';
import { generateMockResponse } from '@/lib/openai/mock';

// ============================================================================
// CONSTANTS
// ============================================================================

const WEBHOOK_LOG_PREFIX = '[Facebook Webhook]';

// ============================================================================
// GET HANDLER - Webhook Verification
// ============================================================================

/**
 * Handle Facebook webhook verification challenge
 * Called when setting up webhook in Facebook App Dashboard
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get('hub.mode');
    const verifyToken = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    console.log(`${WEBHOOK_LOG_PREFIX} Verification request:`, {
      mode,
      verifyToken: verifyToken ? '***' : 'MISSING',
      challenge: challenge ? '***' : 'MISSING',
    });

    // Verify mode and token
    if (mode !== 'subscribe') {
      console.warn(`${WEBHOOK_LOG_PREFIX} Invalid mode:`, mode);
      return new NextResponse('Invalid mode', { status: 400 });
    }

    if (!env.meta.verifyToken) {
      console.error(`${WEBHOOK_LOG_PREFIX} META_VERIFY_TOKEN not configured`);
      return new NextResponse('Webhook token not configured', { status: 500 });
    }

    if (verifyToken !== env.meta.verifyToken) {
      console.warn(`${WEBHOOK_LOG_PREFIX} Invalid verify token`);
      return new NextResponse('Invalid verify token', { status: 403 });
    }

    if (!challenge) {
      console.warn(`${WEBHOOK_LOG_PREFIX} Missing challenge`);
      return new NextResponse('Missing challenge', { status: 400 });
    }

    console.log(`${WEBHOOK_LOG_PREFIX} ✓ Webhook verified successfully`);
    return new NextResponse(challenge, { status: 200 });
  } catch (error: any) {
    console.error(`${WEBHOOK_LOG_PREFIX} Error in verification:`, error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST HANDLER - Event Processing
// ============================================================================

/**
 * Handle incoming Facebook webhook events
 * Processes comments, messages, and other events
 */
export async function POST(request: Request) {
  let eventCount = 0;
  let processedCount = 0;

  try {
    console.log(`${WEBHOOK_LOG_PREFIX} Received webhook request`);

    // Get raw body for signature verification
    const rawBody = await request.text();
    const xHubSignature = request.headers.get('x-hub-signature-256') || '';

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, xHubSignature)) {
      console.warn(`${WEBHOOK_LOG_PREFIX} Invalid webhook signature`);
      // In production, reject. In dev, allow for testing
      if (!env.isDevelopment) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 403 }
        );
      }
    }

    // Parse JSON body
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch (err) {
      console.error(`${WEBHOOK_LOG_PREFIX} Invalid JSON in request body`);
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    // Check webhook object type
    if (body.object !== 'page') {
      console.log(`${WEBHOOK_LOG_PREFIX} Ignoring non-page webhook:`, body.object);
      return NextResponse.json({ ok: true });
    }

    // Process each entry
    if (!body.entry || !Array.isArray(body.entry)) {
      console.log(`${WEBHOOK_LOG_PREFIX} No entries in webhook`);
      return NextResponse.json({ ok: true });
    }

    eventCount = body.entry.length;
    console.log(`${WEBHOOK_LOG_PREFIX} Processing ${eventCount} entries`);

    for (const entry of body.entry) {
      try {
        await processEntry(entry, body);
        processedCount++;
      } catch (entryError: any) {
        console.error(`${WEBHOOK_LOG_PREFIX} Error processing entry:`, entryError.message);
        // Continue processing other entries
      }
    }

    console.log(
      `${WEBHOOK_LOG_PREFIX} ✓ Webhook processed:`,
      { eventCount, processedCount }
    );

    // Return 200 OK immediately (webhook should not take long)
    return NextResponse.json({
      ok: true,
      processed: processedCount,
      total: eventCount,
    });
  } catch (error: any) {
    console.error(`${WEBHOOK_LOG_PREFIX} Unexpected error:`, error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Process a single webhook entry
 */
async function processEntry(entry: any, fullPayload: any) {
  try {
    const pageId = entry.id;
    console.log(`${WEBHOOK_LOG_PREFIX} Processing entry for page:`, pageId);

    // Find workspace by page ID
    const supabase = env.useMockMode
      ? await createMockAdminSupabaseClient()
      : await createAdminSupabaseClient();

    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('meta_page_id', pageId)
      .maybeSingle();

    if (!workspace) {
      console.warn(`${WEBHOOK_LOG_PREFIX} Workspace not found for page:`, pageId);
      return;
    }

    console.log(`${WEBHOOK_LOG_PREFIX} Found workspace:`, workspace.id);

    // Parse the webhook event
    const event = parseFacebookWebhook(fullPayload);
    if (!event || event.eventType === 'unknown') {
      console.log(`${WEBHOOK_LOG_PREFIX} Unknown or unhandled event type`);
      return;
    }

    console.log(`${WEBHOOK_LOG_PREFIX} Detected event:`, event.eventType);

    // Save event to database
    const savedEvent = await saveFacebookEvent({
      workspace_id: workspace.id,
      page_id: pageId,
      event_type: event.eventType,
      platform: event.pageId.includes('instagram') ? 'instagram' : 'facebook',
      raw_payload: event.rawPayload,
    });

    if (!savedEvent) {
      console.error(`${WEBHOOK_LOG_PREFIX} Failed to save event`);
      return;
    }

    console.log(`${WEBHOOK_LOG_PREFIX} Saved event:`, savedEvent.id);

    // Get automation rules for this workspace
    const rules = await getAutomationRules(workspace.id, undefined, true);

    if (!rules || rules.length === 0) {
      console.log(`${WEBHOOK_LOG_PREFIX} No automation rules configured`);
      await markFacebookEventProcessed(savedEvent.id, false, undefined, 'No automation rules');
      return;
    }

    console.log(`${WEBHOOK_LOG_PREFIX} Found ${rules.length} automation rules`);

    // Process based on event type
    if (event.eventType === 'comment' && event.comment) {
      await processCommentEvent(
        workspace.id,
        rules[0], // Use first rule for now
        event.comment,
        savedEvent.id,
        pageId
      );
    } else if (event.eventType === 'message' && event.message) {
      await processMessageEvent(
        workspace.id,
        rules[0],
        event.message,
        savedEvent.id,
        pageId
      );
    }
  } catch (error: any) {
    console.error(`${WEBHOOK_LOG_PREFIX} Error in processEntry:`, error.message);
    throw error;
  }
}

/**
 * Process a comment event
 */
async function processCommentEvent(
  workspaceId: string,
  rule: any,
  comment: any,
  eventId: string,
  pageId: string
) {
  try {
    console.log(`${WEBHOOK_LOG_PREFIX} Processing comment event:`, comment.id);

    const agent = await getAgentById(rule.agent_id);
    if (!agent) {
      console.error(`${WEBHOOK_LOG_PREFIX} Agent not found:`, rule.agent_id);
      await markFacebookEventProcessed(
        eventId,
        false,
        undefined,
        'Agent not found'
      );
      return;
    }

    // Generate response if public reply is enabled
    if (rule.send_public_reply && rule.public_reply_template) {
      try {
        console.log(`${WEBHOOK_LOG_PREFIX} Generating public reply`);

        // Generate AI response
        let replyText: string;
        if (env.useMockMode) {
          replyText = await generateMockResponse(
            agent.system_prompt,
            `Reply to this comment: "${comment.text}"`
          );
        } else {
          replyText = await generateAgentResponse(
            agent.system_prompt,
            `Reply to this comment: "${comment.text}"`,
            {
              model: agent.model,
              temperature: agent.temperature,
              max_tokens: agent.max_tokens,
            }
          );
        }

        // Send public reply via Facebook
        const replyResult = await fbReplyToComment(comment.id, replyText);

        if (replyResult.success) {
          console.log(`${WEBHOOK_LOG_PREFIX} ✓ Public reply sent:`, replyResult.replyId);
          await markFacebookEventProcessed(eventId, true, {
            type: 'comment_reply',
            replyId: replyResult.replyId,
            text: replyText,
          });
        } else {
          console.error(`${WEBHOOK_LOG_PREFIX} Failed to send reply:`, replyResult.error);
          await markFacebookEventProcessed(eventId, false, undefined, replyResult.error);
        }
      } catch (error: any) {
        console.error(`${WEBHOOK_LOG_PREFIX} Error generating/sending reply:`, error.message);
        await markFacebookEventProcessed(eventId, false, undefined, error.message);
      }
    } else {
      console.log(`${WEBHOOK_LOG_PREFIX} Public reply not enabled for this rule`);
      await markFacebookEventProcessed(eventId, false);
    }
  } catch (error: any) {
    console.error(`${WEBHOOK_LOG_PREFIX} Error processing comment:`, error.message);
    throw error;
  }
}

/**
 * Process a message event (DM)
 */
async function processMessageEvent(
  workspaceId: string,
  rule: any,
  message: any,
  eventId: string,
  pageId: string
) {
  try {
    console.log(`${WEBHOOK_LOG_PREFIX} Processing message event:`, message.id);

    const agent = await getAgentById(rule.agent_id);
    if (!agent) {
      console.error(`${WEBHOOK_LOG_PREFIX} Agent not found:`, rule.agent_id);
      await markFacebookEventProcessed(
        eventId,
        false,
        undefined,
        'Agent not found'
      );
      return;
    }

    // Generate response if DM reply is enabled
    if (rule.send_private_reply && rule.private_reply_template) {
      try {
        console.log(`${WEBHOOK_LOG_PREFIX} Generating DM reply`);

        // Generate AI response
        let dmText: string;
        if (env.useMockMode) {
          dmText = await generateMockResponse(
            agent.system_prompt,
            `Respond to this message: "${message.text}"`
          );
        } else {
          dmText = await generateAgentResponse(
            agent.system_prompt,
            `Respond to this message: "${message.text}"`,
            {
              model: agent.model,
              temperature: agent.temperature,
              max_tokens: agent.max_tokens,
            }
          );
        }

        // Send DM via Facebook
        const dmResult = await fbSendDM(message.senderId, dmText, env.meta.pageAccessToken);

        if (dmResult.success) {
          console.log(`${WEBHOOK_LOG_PREFIX} ✓ DM sent:`, dmResult.messageId);
          await markFacebookEventProcessed(eventId, true, {
            type: 'dm',
            messageId: dmResult.messageId,
            text: dmText,
          });
        } else {
          console.error(`${WEBHOOK_LOG_PREFIX} Failed to send DM:`, dmResult.error);
          await markFacebookEventProcessed(eventId, false, undefined, dmResult.error);
        }
      } catch (error: any) {
        console.error(`${WEBHOOK_LOG_PREFIX} Error generating/sending DM:`, error.message);
        await markFacebookEventProcessed(eventId, false, undefined, error.message);
      }
    } else {
      console.log(`${WEBHOOK_LOG_PREFIX} DM reply not enabled for this rule`);
      await markFacebookEventProcessed(eventId, false);
    }
  } catch (error: any) {
    console.error(`${WEBHOOK_LOG_PREFIX} Error processing message:`, error.message);
    throw error;
  }
}
