
'use server';

import type { ReadonlyURLSearchParams } from 'next/navigation';

export interface N8NClientData {
  eventName: 'PageView' | 'AddToCart' | 'InitiateCheckout';
  eventId?: string;
  eventTime: number;
  userData: {
    external_id: string | null;
    fbc: string | null;
    fbp: string | null;
    client_ip_address: string | null;
    client_user_agent: string | null;
  };
  customData?: {
    value?: number;
    currency?: string;
    ad_id?: string | null;
    adset_id?: string | null;
    campaign_id?: string | null;
  };
  event_source_url: string;
  action_source: 'website';
}

const webhookUrls = {
  PageView: 'https://redis-n8n.rzilkp.easypanel.host/webhook-test/pageviewfb',
  AddToCart: 'https://redis-n8n.rzilkp.easypanel.host/webhook-test/addtocartfb',
  InitiateCheckout: 'https://redis-n8n.rzilkp.easypanel.host/webhook-test/checkoutfb',
};

export const sendN8NEvent = async (payload: N8NClientData) => {
  try {
    const webhookUrl = webhookUrls[payload.eventName];
    if (!webhookUrl) {
      throw new Error(`No webhook URL configured for event: ${payload.eventName}`);
    }
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`N8N webhook failed for ${payload.eventName} with status ${response.status}: ${errorBody}`);
        return { success: false, error: `N8N webhook failed with status ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error(`Error sending N8N event for ${payload.eventName}:`, error);
    return { success: false, error: (error as Error).message };
  }
};
