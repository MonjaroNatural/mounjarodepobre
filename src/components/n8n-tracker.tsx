
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function N8NTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        function getCookie(name: string): string | null {
            if (typeof document === 'undefined') return null;
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
            return null;
        }

        function setCookie(name: string, value: string, days: number): void {
            if (typeof document === 'undefined') return;
            let expires = "";
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "")  + expires + "; path=/";
        }

        function generateUUID(): string {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        }
        
        async function sendPageViewEvent() {
            const sessionId = getCookie('my_session_id') || generateUUID();
            if (!getCookie('my_session_id')) {
                setCookie('my_session_id', sessionId, 30); 
            }
            
            const N8N_WEBHOOK_URL = "https://redis-n8n.rzilkp.easypanel.host/webhook-test/pageviewfb";

            const currentParams = new URLSearchParams(window.location.search);

            const fbcCookie = getCookie('_fbc');
            const fbpCookie = getCookie('_fbp');

            const payload = {
                eventName: 'PageView',
                eventTime: Math.floor(Date.now() / 1000),
                userData: {
                    external_id: sessionId,
                    fbc: fbcCookie,
                    fbp: fbpCookie,
                    client_user_agent: navigator.userAgent,
                },
                customData: {
                    ad_id: currentParams.get('utm_source') || null,
                    adset_id: currentParams.get('utm_medium') || null,
                    campaign_id: currentParams.get('utm_campaign') || null,
                },
                event_source_url: window.location.href,
                action_source: 'website' as const,
            };
            
            try {
                fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    keepalive: true
                });
            } catch (error) {
                console.error('Erro ao enviar evento PageView para N8N:', error);
            }
        }
        
        const timer = setTimeout(() => {
            sendPageViewEvent();
        }, 4000);

        return () => clearTimeout(timer);

    }, [pathname, searchParams]);

    return null;
}
