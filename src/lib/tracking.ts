
import { v4 as uuidv4 } from 'uuid';
import type { ReadonlyURLSearchParams } from 'next/navigation';

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
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = `; expires=${date.toUTCString()}`;
  }

  const hostname = window.location.hostname;
  const isDevEnvironment =
    hostname === 'localhost' || hostname.endsWith('.cloudworkstations.dev');

  const domain_string = isDevEnvironment
    ? ''
    : `; domain=${hostname.replace('www.', '')}`;

  document.cookie = `${name}=${value || ''}${expires}; path=/` + domain_string;
};

export const generateUUID = (): string => {
  return uuidv4();
};

export const generateEventId = (
  eventName: string,
  externalId: string,
): string => {
  return `${eventName}.${externalId}.${Date.now()}`;
};

async function getClientIp(): Promise<string> {
  if (typeof window === 'undefined') return '';
  try {
    const response = await fetch('https://api.ipify.org?format=json', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
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

export const initializeTracking = async (searchParams: ReadonlyURLSearchParams): Promise<{ 
    userData: N8NClientData['userData'],
    eventId: string,
}> => {
  if (typeof window === 'undefined') {
      return {
          userData: {
            external_id: null,
            fbc: null,
            fbp: null,
            client_ip_address: null,
            client_user_agent: null,
            ad_id: null,
            adset_id: null,
            campaign_id: null,
        },
        eventId: ''
      };
  }

  // Session ID
  let sessionId = getCookie('my_session_id');
  if (!sessionId) {
    sessionId = generateUUID();
    setCookie('my_session_id', sessionId, 365);
  }

  // FBP Cookie
  let fbp = getCookie('_fbp');
  if (!fbp) {
    fbp = `fb.1.${Date.now()}.${Math.floor(Math.random() * 1e10)}`;
    setCookie('_fbp', fbp);
  }
  
  // FBC Cookie from fbclid
  const fbclid = searchParams.get('fbclid');
  let fbc = getCookie('_fbc');
  if (fbclid) {
    fbc = `fb.1.${Date.now()}.${fbclid}`;
    setCookie('_fbc', fbc);
  } else {
    // Ensure we send the existing cookie if fbclid isn't in the URL
    fbc = getCookie('_fbc');
  }

  // UTM parameters
  const adId = searchParams.get('utm_source');
  const adsetId = searchParams.get('utm_medium');
  const campaignId = searchParams.get('utm_campaign');

  if (adId) localStorage.setItem('ad_id', adId);
  if (adsetId) localStorage.setItem('adset_id', adsetId);
  if (campaignId) localStorage.setItem('campaign_id', campaignId);

  // User Agent and IP
  const userAgent = navigator.userAgent;
  if (userAgent) {
    sessionStorage.setItem('user_agent', userAgent);
  }
  
  const ip = await getClientIp();
  if (ip) sessionStorage.setItem('client_ip_address', ip);

  // Generate event ID here to pass back
  const eventId = generateEventId('PageView', sessionId);

  // Return all data directly
  return {
    userData: {
      external_id: sessionId,
      fbc: fbc,
      fbp: fbp,
      client_ip_address: ip,
      client_user_agent: userAgent,
      ad_id: localStorage.getItem('ad_id'),
      adset_id: localStorage.getItem('adset_id'),
      campaign_id: localStorage.getItem('campaign_id'),
    },
    eventId,
  };
};

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
    ad_id: string | null;
    adset_id: string | null;
    campaign_id: string | null;
  };
  customData?: {
    value?: number;
    currency?: string;
  };
  event_source_url: string;
  action_source: 'website';
}

export const getClientData = (): Omit<
  N8NClientData,
  | 'eventName'
  | 'eventId'
  | 'eventTime'
  | 'event_source_url'
  | 'action_source'
> => {
  if (typeof window === 'undefined') {
    return {
      userData: {
        external_id: null,
        fbc: null,
        fbp: null,
        client_ip_address: null,
        client_user_agent: null,
        ad_id: null,
        adset_id: null,
        campaign_id: null,
      },
    };
  }

  return {
    userData: {
      external_id: getCookie('my_session_id'),
      fbc: getCookie('_fbc'),
      fbp: getCookie('_fbp'),
      client_ip_address: sessionStorage.getItem('client_ip_address'),
      client_user_agent: sessionStorage.getItem('user_agent'),
      ad_id: localStorage.getItem('ad_id'),
      adset_id: localStorage.getItem('adset_id'),
      campaign_id: localStorage.getItem('campaign_id'),
    },
  };
};
