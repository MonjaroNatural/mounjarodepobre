
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackHomePageView } from '@/app/actions';

function getCampaignParams() {
    if (typeof window === 'undefined') return {};
    try {
        const storedParams = localStorage.getItem('campaign_params');
        return storedParams ? JSON.parse(storedParams) : {};
    } catch (e) {
        return {};
    }
}

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
        
        // Capture and store campaign params
        const currentParams = new URLSearchParams(window.location.search);
        const ad_id = currentParams.get('utm_source');
        const adset_id = currentParams.get('utm_medium');
        const campaign_id = currentParams.get('utm_campaign');

        if (ad_id || adset_id || campaign_id) {
            const campaignParams = {
                ad_id: ad_id || undefined,
                adset_id: adset_id || undefined,
                campaign_id: campaign_id || undefined,
            };
            localStorage.setItem('campaign_params', JSON.stringify(campaignParams));
        }

        async function sendHomePageViewEvent() {
            const sessionId = getCookie('my_session_id') || generateUUID();
            if (!getCookie('my_session_id')) {
                setCookie('my_session_id', sessionId, 30); 
            }
            
            const fbcCookie = getCookie('_fbc');
            const fbpCookie = getCookie('_fbp');
            const campaignParams = getCampaignParams();

            const payload = {
                external_id: sessionId,
                fbc: fbcCookie,
                fbp: fbpCookie,
                client_user_agent: navigator.userAgent,
                ad_id: campaignParams.ad_id || null,
                adset_id: campaignParams.adset_id || null,
                campaign_id: campaignParams.campaign_id || null,
                event_source_url: window.location.href,
            };
            
            // Call the server action
            await trackHomePageView(payload);
        }
        
        // Only run on the initial page ('/')
        if (pathname === '/') {
            const timer = setTimeout(() => {
                sendHomePageViewEvent();
            }, 1500); // Reduced delay for faster tracking on the homepage

            return () => clearTimeout(timer);
        }

    }, [pathname, searchParams]);

    return null;
}
