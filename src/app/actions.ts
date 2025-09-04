
'use server';

import { z } from 'zod';

const WEBHOOK_URL_QUIZ =
  'https://redis-n8n.rzilkp.easypanel.host/webhook/quizn8n';
const WEBHOOK_URL_PAGEVIEW =
  'https://redis-n8n.rzilkp.easypanel.host/webhook-test/pageviewfb';

const UserDataSchema = z.object({
  external_id: z.string().nullable(),
  client_user_agent: z.string().nullable(),
  client_ip_address: z.string().nullable(),
  fbc: z.string().nullable().optional(),
  fbp: z.string().nullable().optional(),
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
  console.log('[SERVER ACTION] trackEvent recebido. Payload:', JSON.stringify(payload, null, 2));

  try {
    const validatedPayload = EventSchema.parse(payload);
    
    let targetUrl: string | null = null;

    switch (validatedPayload.eventName) {
      case 'HomePageView':
        targetUrl = WEBHOOK_URL_PAGEVIEW;
        console.log(`[SERVER ACTION] Evento é HomePageView. URL do Webhook: ${targetUrl}`);
        break;
      case 'QuizStep':
        targetUrl = WEBHOOK_URL_QUIZ;
        console.log(`[SERVER ACTION] Evento é QuizStep. URL do Webhook: ${targetUrl}`);
        break;
    }

    if (targetUrl) {
      console.log(`[SERVER ACTION] Enviando payload para ${targetUrl}...`);
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedPayload),
        cache: 'no-cache',
      });
      console.log(`[SERVER ACTION] Resposta do Webhook: Status ${response.status}`);
      if (!response.ok) {
          const responseBody = await response.text();
          console.error('[SERVER ACTION] Erro na resposta do Webhook:', responseBody);
      }
    } else {
       console.log('[SERVER ACTION] Nenhuma URL de webhook correspondente para o evento.');
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[SERVER ACTION] Erro de validação Zod:', error.errors);
    } else {
      console.error('[SERVER ACTION] Erro ao enviar evento para N8N:', error);
    }
  }
}
