'use server';

import { headers } from 'next/headers';
import { z } from 'zod';

const WEBHOOK_URL_QUIZ =
  'https://redis-n8n.rzilkp.easypanel.host/webhook-test/quizn8n';

const N8N_WEBHOOK_URL_HOMEPAGE =
  'https://redis-n8n.rzilkp.easypanel.host/webhook/paginainicial';

const UserDataSchema = z.object({
  external_id: z.string().nullable(),
  fbc: z.string().nullable().optional(),
  fbp: z.string().nullable().optional(),
  client_user_agent: z.string().nullable(),
});

const CustomDataSchema = z.object({
  ad_id: z.string().nullable().optional(),
  adset_id: z.string().nullable().optional(),
  campaign_id: z.string().nullable().optional(),
  quiz_step: z.number().optional(),
  quiz_question: z.string().optional(),
  quiz_answer: z.string().optional(),
  value: z.number().optional(),
  currency: z.string().optional(),
});

const EventSchema = z.object({
  eventName: z.enum(['HomePageView', 'QuizStep', 'InitiateCheckout']),
  eventTime: z.number(),
  userData: UserDataSchema,
  customData: CustomDataSchema,
  event_source_url: z.string().url(),
  action_source: z.literal('website'),
});

export async function trackEvent(payload: z.infer<typeof EventSchema>) {
  try {
    const validatedPayload = EventSchema.parse(payload);
    
    let targetUrl: string | null = null;

    switch (validatedPayload.eventName) {
      case 'HomePageView':
        targetUrl = N8N_WEBHOOK_URL_HOMEPAGE;
        break;
      case 'QuizStep':
        targetUrl = WEBHOOK_URL_QUIZ;
        break;
      case 'InitiateCheckout':
        // If there's a specific checkout webhook, it would go here.
        // For now, we can decide where to send it or if it needs a different handler.
        // Let's assume it goes to the quiz webhook for now.
        targetUrl = 'https://redis-n8n.rzilkp.easypanel.host/webhook/checkoutfb';
        break;
    }

    if (targetUrl) {
      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedPayload),
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Zod validation error:', error.errors);
    } else {
      console.error('Error sending event to N8N:', error);
    }
  }
}

// Keeping the old action for compatibility if it's still used elsewhere,
// but the new `trackEvent` is the primary one.
interface HomePageViewPayload {
  external_id: string | null;
  fbc: string | null;
  fbp: string | null;
  client_user_agent: string | null;
  event_source_url: string;
  ad_id: string | null;
  adset_id: string | null;
  campaign_id: string | null;
}

export async function trackHomePageView(payload: HomePageViewPayload) {
  try {
    await fetch(N8N_WEBHOOK_URL_HOMEPAGE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'HomePageView',
        eventTime: Math.floor(Date.now() / 1000),
        userData: {
          external_id: payload.external_id,
          fbc: payload.fbc,
          fbp: payload.fbp,
          client_user_agent: headers().get('user-agent'),
        },
        customData: {
          ad_id: payload.ad_id,
          adset_id: payload.adset_id,
          campaign_id: payload.campaign_id,
        },
        event_source_url: payload.event_source_url,
        action_source: 'website' as const,
      }),
    });
  } catch (error) {
    // No lado do servidor, podemos logar o erro para depuração.
    console.error('Error sending HomePageView to N8N:', error);
  }
}
