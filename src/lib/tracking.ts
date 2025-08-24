import { v4 as uuidv4 } from 'uuid';

export const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

export const setCookie = (name: string, value: string, days: number = 365) => {
  if (typeof window === 'undefined') {
    return;
  }
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  const domain = `.${window.location.hostname.replace('www.', '')}`;
  document.cookie = `${name}=${value || ''}${expires}; domain=${domain}; path=/`;
};

export const generateUUID = (): string => {
  return uuidv4();
};

export const generateEventId = (eventName: string, externalId: string): string => {
    return `${eventName}.${externalId}.${Date.now()}`;
}

export interface N8NClientData {
    eventName: 'PageView' | 'AddToCart' | 'InitiateCheckout';
    eventId?: string;
    eventTime: number;
    userData: {
        external_id: string | null;
        fbc: string | null;
        fbp: string | null;
        client_ip_address?: string;
        ad_id?: string | null;
        adset_id?: string | null;
        campaign_id?: string | null;
    };
    customData?: {
        value?: number;
        currency?: string;
    };
    event_source_url: string;
    action_source: 'website';
}
