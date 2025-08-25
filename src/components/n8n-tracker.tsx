
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getCookie, setCookie, generateUUID } from '@/lib/tracking';

export function N8NTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Aguarda um momento para garantir que o pixel do Facebook tenha tempo de processar a URL
        // e criar o cookie _fbc se o parâmetro fbclid estiver presente.
        const timer = setTimeout(async () => {
            const N8N_WEBHOOK_URL = "https://redis-n8n.rzilkp.easypanel.host/webhook-test/pageviewfb";

            // 1. Garante que temos um ID de sessão.
            const sessionId = getCookie('my_session_id') || generateUUID();
            setCookie('my_session_id', sessionId, 30); // Cookie de sessão válido por 30 dias.

            // 2. Lê os parâmetros da URL atual
            const currentParams = new URLSearchParams(window.location.search);

            // 3. Coleta todos os dados para o payload.
            // O getCookie('_fbc') agora deve funcionar porque demos tempo ao script do FB.
            const payload = {
                eventName: 'PageView',
                eventTime: Math.floor(Date.now() / 1000),
                userData: {
                    external_id: sessionId,
                    fbc: getCookie('_fbc') || null,
                    fbp: getCookie('_fbp') || null,
                    client_user_agent: navigator.userAgent,
                    client_ip_address: null, // O IP será adicionado pelo N8N/servidor
                },
                customData: {
                    ad_id: currentParams.get('utm_source') || null,
                    adset_id: currentParams.get('utm_medium') || null,
                    campaign_id: currentParams.get('utm_campaign') || null,
                },
                event_source_url: window.location.href,
                action_source: 'website'
            };

            // 4. Envia os dados para o webhook.
            try {
                await fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } catch (error) {
                console.error('Erro de rede ao enviar evento PageView para o N8N:', error);
            }

        }, 500); // Atraso de 500ms é a chave.

        return () => clearTimeout(timer);

    }, [pathname, searchParams]);

    return null; // O componente não renderiza nada visível.
}
