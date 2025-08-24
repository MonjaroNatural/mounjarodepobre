
'use server';

import type { N8NClientData } from '@/lib/tracking';

const webhookUrls = {
  PageView: 'https://redis-n8n.rzilkp.easypanel.host/webhook-test/pageviewfb',
  AddToCart: 'https://redis-n8n.rzilkp.easypanel.host/webhook-test/addtocartfb',
  InitiateCheckout: 'https://redis-n8n.rzilkp.easypanel.host/webhook-test/checkoutfb',
};

async function getClientIp(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
        cache: 'no-store',
    });
    if (!response.ok) {
        console.error('Error fetching client IP:', response.statusText);
        return '';
    }
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching client IP:', error);
    return '';
  }
}


export const sendN8NEvent = async (clientData: Omit<N8NClientData, 'userData'> & { userData: Omit<N8NClientData['userData'], 'client_ip_address'>}) => {
  try {
    const webhookUrl = webhookUrls[clientData.eventName];
    if (!webhookUrl) {
      throw new Error(`No webhook URL configured for event: ${clientData.eventName}`);
    }

    const clientIpAddress = await getClientIp();

    const finalPayload = {
      ...clientData,
      userData: {
        ...clientData.userData,
        client_ip_address: clientIpAddress,
      }
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(finalPayload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`N8N webhook failed for ${clientData.eventName} with status ${response.status}: ${errorBody}`);
        return { success: false, error: `N8N webhook failed with status ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error(`Error sending N8N event for ${clientData.eventName}:`, error);
    return { success: false, error: (error as Error).message };
  }
};
