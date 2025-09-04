'use server';

import { headers } from 'next/headers';
import { z } from 'zod';

const WEBHOOK_URL_QUIZ =
  'https://redis-n8n.rzilkp.easypanel.host/webhook-test/quizn8n';

const UserDataSchema = z.object({
  external_id: z.string().nullable(),
  client_user_agent: z.string().nullable(),
  client_ip_address: z.string().nullable(),
});

const CustomDataSchema = z.object({
  ad_id: z.string().nullable().optional(),
  adset_id: z.string().nullable().optional(),
  campaign_id: z.string().nullable().optional(),
  quiz_step: z.number().optional(),
  quiz_question: z.string().optional(),
  quiz_answer: z.string().optional(),
});

const EventSchema = z.object({
  eventName: z.enum(['HomePageView', 'QuizStep']),
  eventTime: z.number(),
  userData: UserDataSchema,
  customData: CustomDataSchema,
  event_source_url: z.string().url(),
  action_source: z.literal('website'),
});

export async function trackEvent(payload: z.infer<typeof EventSchema>) {
  try {
    const headersList = headers();
    
    // Improved IP detection logic
    const ip = (
      headersList.get('x-forwarded-for') ??
      headersList.get('x-real-ip') ??
      headersList.get('cf-connecting-ip') ??
      '127.0.0.1'
    ).split(',')[0].trim();

    const payloadWithIp = {
      ...payload,
      userData: {
        ...payload.userData,
        client_ip_address: ip,
      },
    };
    
    const validatedPayload = EventSchema.parse(payloadWithIp);
    
    let targetUrl: string | null = null;

    switch (validatedPayload.eventName) {
      case 'HomePageView':
      case 'QuizStep':
        targetUrl = WEBHOOK_URL_QUIZ;
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
