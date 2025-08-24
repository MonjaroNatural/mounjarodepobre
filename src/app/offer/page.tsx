'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Meter } from '@/components/ui/meter';
import { getCookie, generateEventId } from '@/lib/tracking';
import { sendN8NEvent } from '@/app/actions';

function OfferContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Seu Plano';
  const externalId = getCookie('my_session_id');

  const handleCheckoutClick = () => {
    const checkoutUrl = `https://pay.hotmart.com/G93148123M?sck=${externalId}`;
    
    // Dispara o evento InitiateCheckout
    const eventId = generateEventId('InitiateCheckout', externalId ?? '');
    
    if (window.fbq) {
        window.fbq('track', 'InitiateCheckout', {}, { event_id: eventId });
    }

    sendN8NEvent({
        eventName: 'InitiateCheckout',
        eventId: eventId,
        eventTime: Math.floor(Date.now() / 1000),
        userData: {
            external_id: externalId,
            fbc: getCookie('_fbc'),
            fbp: getCookie('_fbp'),
        },
        event_source_url: window.location.href,
        action_source: 'website',
    });

    router.push(checkoutUrl);
  };

   useEffect(() => {
    // Dispara o evento AddToCart quando a página de oferta é exibida
    const eventId = generateEventId('AddToCart', externalId ?? '');
    
    if (window.fbq) {
        window.fbq('track', 'AddToCart', {}, { event_id: eventId });
    }
    
    sendN8NEvent({
        eventName: 'AddToCart',
        eventId: eventId,
        eventTime: Math.floor(Date.now() / 1000),
        userData: {
            external_id: externalId,
            fbc: getCookie('_fbc'),
            fbp: getCookie('_fbp'),
        },
        event_source_url: window.location.href,
        action_source: 'website',
    });
  }, [externalId]);


  return (
    <div className="bg-white text-black">
      <main className="container mx-auto max-w-2xl flex-col items-center space-y-8 px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">
          {name}, seu Plano Exclusivo de Emagrecimento com o Mounjaro dos Pobres
          está pronto.
        </h1>

        <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 text-left text-sm">
          {/* Coluna Antes */}
          <div className="space-y-3">
            <div className="rounded-md bg-[#ffebee] p-2 text-center font-bold text-red-800">
              Antes do Mounjaro dos Pobres
            </div>
            <Image
              src="/antes11.webp"
              alt="Mulher antes de usar o produto"
              width={250}
              height={300}
              className="mx-auto rounded-lg"
              data-ai-hint="woman overweight sad"
            />
            <div className="space-y-1">
              <p>Metabolismo lento</p>
              <Meter value={1} max={5} variant="destructive" />
            </div>
            <div className="space-y-1">
              <p>Corpo constantemente inchado.</p>
              <Meter value={2} max={5} variant="destructive" />
            </div>
            <div className="space-y-1">
              <p>Ansiedade que leva a comer sem controle.</p>
              <Meter value={2} max={5} variant="destructive" />
            </div>
            <div className="space-y-1">
              <p>Desequilíbrio hormonal</p>
              <Meter value={3} max={5} variant="destructive" />
            </div>
          </div>

          {/* Coluna Depois */}
          <div className="space-y-3">
            <div className="rounded-md bg-[#e3f2fd] p-2 text-center font-bold text-blue-800">
              Depois do Mounjaro dos Pobres
            </div>
             <Image
              src="/depois.webp"
              alt="Mulher depois de usar o produto"
              width={250}
              height={300}
              className="mx-auto rounded-lg"
              data-ai-hint="woman fit happy"
            />
            <div className="space-y-1">
              <p>Metabolismo acelerado</p>
              <Meter value={4} max={5} variant="constructive" />
            </div>
            <div className="space-y-1">
              <p>Corpo leve e desinchado.</p>
              <Meter value={4} max={5} variant="constructive" />
            </div>
            <div className="space-y-1">
              <p>Sensação de saciedade e autocontrole.</p>
              <Meter value={5} max={5} variant="constructive" />
            </div>
            <div className="space-y-1">
              <p>Equilíbrio hormonal natural</p>
              <Meter value={5} max={5} variant="constructive" />
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-lg bg-gray-100 p-6">
          <h2 className="text-xl font-bold">Como funciona o plano?</h2>
          <p>
            Com base nas suas{' '}
            <span className="font-bold text-green-600">
              informações pessoais
            </span>{' '}
            e nos seus{' '}
            <span className="font-bold text-green-600">objetivos</span>, criamos
            um{' '}
            <span className="font-bold text-green-600">
              plano 100% personalizado para você
            </span>{' '}
            utilizar o Mounjaro dos Pobres.
          </p>
        </div>

        <div className="space-y-4 rounded-lg border p-6 text-left">
          <p>
            Nossa abordagem estratégica foi desenvolvida para te ajudar a{' '}
            <span className="font-bold">
              potencializar a perda de peso em apenas 4 semanas
            </span>
            , respeitando seu estilo de vida, sua rotina e suas preferências
            alimentares.
          </p>
          <div className="rounded-md bg-[#28a745] py-2 text-center font-bold text-white">
            Seu plano inclui:
          </div>
          <ul className="space-y-3 text-sm">
            <li>
              <p className="font-bold">
                Como usar o Mounjaro da Forma Correta:
              </p>
              <p className="text-green-700">
                Com base em pesquisas, a forma de uso do Mounjaro dos Pobres
                pode variar de acordo com o seu corpo e objetivo.
              </p>
            </li>
            <li>
              <p className="font-bold">Definição de metas diárias.</p>
              <p className="text-green-700">
                Para que você se mantenha focada, vamos traçar juntas um plano
                de metas diárias.
              </p>
            </li>
            <li>
              <p className="font-bold">Planilha de acompanhamento:</p>
              <p className="text-green-700">
                Você saberá com clareza a sua evolução diária através de uma
                planilha simples de acompanhamento.
              </p>
            </li>
          </ul>
          <p className="text-center font-bold text-green-800">
            + 4 Bônus Exclusivos
          </p>
        </div>

        <p className="text-lg">
          Ao garantir o seu Mounjaro dos Pobres hoje,{' '}
          <span className="text-green-600">
            você recebe todos os bônus de presente!
          </span>
        </p>

        <Button
          size="lg"
          className="h-auto w-full max-w-md bg-[#28a745] py-4 text-xl font-bold text-white hover:bg-[#28a745]/90"
          onClick={handleCheckoutClick}
        >
          SIM, QUERO MEU PLANO PERSONALIZADO!
        </Button>
      </main>
    </div>
  );
}

export default function OfferPage() {
  return (
    <Suspense fallback={<div>Carregando oferta...</div>}>
      <OfferContent />
    </Suspense>
  );
}
