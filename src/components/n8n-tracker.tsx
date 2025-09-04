
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent } from '@/app/actions';

function getCampaignParams() {
    if (typeof window === 'undefined') return {};
    try {
        const storedParams = localStorage.getItem('campaign_params');
        return storedParams ? JSON.parse(storedParams) : {};
    } catch (e) {
        return {};
    }
}

async function getClientIp(): Promise<string | null> {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) return null;
        const data = await response.json();
        return data.ip || null;
    } catch (error) {
        console.error("Could not fetch IP address.", error);
        return null;
    }
}

export function N8NTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [ipAddress, setIpAddress] = useState<string | null>(null);

    useEffect(() => {
        getClientIp().then(setIpAddress);
    }, []);

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
        
        // Capture and store campaign params from URL
        const ad_id = searchParams.get('utm_source');
        const adset_id = searchParams.get('utm_medium');
        const campaign_id = searchParams.get('utm_campaign');

        if (ad_id || adset_id || campaign_id) {
            const campaignParams = {
                ad_id: ad_id || undefined,
                adset_id: adset_id || undefined,
                campaign_id: campaign_id || undefined,
            };
            localStorage.setItem('campaign_params', JSON.stringify(campaignParams));
        }

        // Set session ID cookie if it doesn't exist
        let sessionId = getCookie('my_session_id');
        if (!sessionId) {
            sessionId = generateUUID();
            setCookie('my_session_id', sessionId, 30); 
        }

        async function sendHomePageViewEvent(sid: string, ip: string | null) {
            const campaignParams = getCampaignParams();

            // Wait 4 seconds for Meta Pixel to set cookies
            setTimeout(async () => {
                const fbc = getCookie('_fbc');
                const fbp = getCookie('_fbp');

                await trackEvent({
                    eventName: 'HomePageView',
                    eventTime: Math.floor(Date.now() / 1000),
                    userData: {
                        external_id: sid,
                        client_user_agent: navigator.userAgent,
                        client_ip_address: ip,
                        fbc: fbc,
                        fbp: fbp
                    },
                    customData: {
                        ad_id: campaignParams.ad_id || null,
                        adset_id: campaignParams.adset_id || null,
                        campaign_id: campaignParams.campaign_id || null,
                    },
                    event_source_url: window.location.href,
                    action_source: 'website' as const,
                });
            }, 4000); // 4-second delay
        }
        
        // Only run on the initial page ('/') and when ipAddress is available
        if (pathname === '/' && ipAddress) {
            // Check if we've already sent this event for this session
            const eventSent = sessionStorage.getItem('homePageViewSent');
            if (!eventSent && sessionId) {
                sendHomePageViewEvent(sessionId, ipAddress);
                sessionStorage.setItem('homePageViewSent', 'true');
            }
        }

    }, [pathname, ipAddress, searchParams]);

    return null;
}
