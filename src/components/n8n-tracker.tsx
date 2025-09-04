
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
        console.log('[N8N TRACKER] Erro ao ler campaign_params do localStorage.');
        return {};
    }
}

async function getClientIp(): Promise<string | null> {
    console.log('[N8N TRACKER] Buscando IP do cliente...');
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) {
            console.error("[N8N TRACKER] Falha ao buscar IP: Resposta não OK.");
            return null;
        }
        const data = await response.json();
        console.log('[N8N TRACKER] IP do cliente obtido:', data.ip);
        return data.ip || null;
    } catch (error) {
        console.error("[N8N TRACKER] Erro ao buscar IP do cliente.", error);
        return null;
    }
}

export function N8NTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [ipAddress, setIpAddress] = useState<string | null>(null);

    useEffect(() => {
        console.log('[N8N TRACKER] Componente montado.');
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
          const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
          console.log('[N8N TRACKER] UUID gerado:', uuid);
          return uuid;
        }
        
        const ad_id = searchParams.get('utm_source');
        const adset_id = searchParams.get('utm_medium');
        const campaign_id = searchParams.get('utm_campaign');

        if (ad_id || adset_id || campaign_id) {
            console.log('[N8N TRACKER] Parâmetros UTM encontrados na URL. Salvando no localStorage.');
            const campaignParams = {
                ad_id: ad_id || undefined,
                adset_id: adset_id || undefined,
                campaign_id: campaign_id || undefined,
            };
            localStorage.setItem('campaign_params', JSON.stringify(campaignParams));
        }

        let sessionId = getCookie('my_session_id');
        if (!sessionId) {
            console.log('[N8N TRACKER] Session ID não encontrado. Criando um novo.');
            sessionId = generateUUID();
            setCookie('my_session_id', sessionId, 30); 
        } else {
            console.log('[N8N TRACKER] Session ID encontrado:', sessionId);
        }

        async function sendEvents(sid: string, ip: string) {
            console.log('[N8N TRACKER] Função sendEvents chamada.');
            const campaignParams = getCampaignParams();

            // Track First Quiz Step
            const firstStepSent = sessionStorage.getItem('firstQuizStepSent');
            if (!firstStepSent) {
                const quizStepPayload = {
                    eventName: 'QuizStep' as const,
                    eventTime: Math.floor(Date.now() / 1000),
                    userData: {
                        external_id: sid,
                        client_user_agent: navigator.userAgent,
                        client_ip_address: ip,
                    },
                    customData: {
                        quiz_step: 1,
                        quiz_question: 'Início do Funil',
                        quiz_answer: 'Usuário chegou na página inicial',
                    },
                    event_source_url: window.location.href,
                    action_source: 'website' as const,
                };
                console.log('[N8N TRACKER] Preparando para enviar evento QuizStep (Etapa 1). Payload:', JSON.stringify(quizStepPayload, null, 2));
                await trackEvent(quizStepPayload);
                sessionStorage.setItem('firstQuizStepSent', 'true');
                console.log('[N8N TRACKER] Flag "firstQuizStepSent" setada no sessionStorage.');
            } else {
                console.log('[N8N TRACKER] Evento QuizStep (Etapa 1) já foi enviado nesta sessão.');
            }


            // Track Page View
            const pageViewSent = sessionStorage.getItem('homePageViewSent');
            if (!pageViewSent) {
                console.log('[N8N TRACKER] Agendando envio do evento HomePageView para daqui a 4 segundos.');
                setTimeout(async () => {
                    const fbc = getCookie('_fbc');
                    const fbp = getCookie('_fbp');
                    console.log(`[N8N TRACKER] Cookies da Meta lidos: _fbc=${fbc}, _fbp=${fbp}`);

                    const pageViewPayload = {
                        eventName: 'HomePageView' as const,
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
                    };
                    console.log('[N8N TRACKER] Preparando para enviar evento HomePageView. Payload:', JSON.stringify(pageViewPayload, null, 2));
                    await trackEvent(pageViewPayload);
                }, 4000); 
                sessionStorage.setItem('homePageViewSent', 'true');
                console.log('[N8N TRACKER] Flag "homePageViewSent" setada no sessionStorage.');
            } else {
                 console.log('[N8N TRACKER] Evento HomePageView já foi enviado nesta sessão.');
            }
        }
        
        if (pathname === '/') {
            console.log('[N8N TRACKER] Está na página inicial ("/").');
            if (ipAddress && sessionId) {
                 console.log('[N8N TRACKER] IP e Session ID estão disponíveis. Chamando sendEvents.');
                 sendEvents(sessionId, ipAddress);
            } else {
                console.log('[N8N TRACKER] Aguardando IP e Session ID para chamar sendEvents.');
            }
        } else {
             console.log(`[N8N TRACKER] Não está na página inicial (pathname: ${pathname}). Nenhum evento será enviado daqui.`);
        }

    }, [pathname, ipAddress, searchParams]);

    return null;
}
