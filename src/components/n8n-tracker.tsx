'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getCookie, setCookie, generateUUID } from '@/lib/tracking';
import { sendN8NEvent } from '@/app/actions';

async function getClientIp(): Promise<string> {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) return '';
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error("Erro ao buscar IP do cliente:", error);
        return '';
    }
}

export function N8NTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    
    async function trackUser() {
      let sessionId = getCookie('my_session_id');
      if (!sessionId) {
        sessionId = generateUUID();
        setCookie('my_session_id', sessionId, 365);
      }

      const fbc = searchParams.get('fbclid')
        ? `fb.1.${Date.now()}.${searchParams.get('fbclid')}`
        : getCookie('_fbc');

      if (fbc) {
        setCookie('_fbc', fbc);
      }

      const adId = searchParams.get('utm_source');
      const adsetId = searchParams.get('utm_medium');
      const campaignId = searchParams.get('utm_campaign');

      if (adId) localStorage.setItem('ad_id', adId);
      if (adsetId) localStorage.setItem('adset_id', adsetId);
      if (campaignId) localStorage.setItem('campaign_id', campaignId);
      if (navigator.userAgent) sessionStorage.setItem('user_agent', navigator.userAgent);
      
      const clientIpAddress = await getClientIp();
      if(clientIpAddress) sessionStorage.setItem('client_ip', clientIpAddress);


      sendN8NEvent({
        eventName: 'PageView',
        eventTime: Math.floor(Date.now() / 1000),
        userData: {
          external_id: sessionId,
          fbc: fbc,
          fbp: getCookie('_fbp'),
          client_ip_address: clientIpAddress,
          client_user_agent: sessionStorage.getItem('user_agent'),
          ad_id: localStorage.getItem('ad_id'),
          adset_id: localStorage.getItem('adset_id'),
          campaign_id: localStorage.getItem('campaign_id'),
        },
        event_source_url: window.location.href,
        action_source: 'website',
      });
    }

    trackUser();

  }, [pathname, searchParams]);

  return null;
}
