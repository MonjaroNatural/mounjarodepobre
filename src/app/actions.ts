
'use server';

import { headers } from 'next/headers';

const N8N_WEBHOOK_URL_HOMEPAGE =
  'https://redis-n8n.rzilkp.easypanel.host/webhook/paginainicial';

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
