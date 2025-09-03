
'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

function VslContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Olá';
  const currentWeight = searchParams.get('currentWeight') || '';
  const desiredWeight = searchParams.get('desiredWeight') || '';

  const handleGoToOffer = () => {
    const queryParams = new URLSearchParams({
      name,
      currentWeight,
      desiredWeight,
    });
    router.push(`/offer?${queryParams.toString()}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="w-full max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold md:text-4xl">
          {name}, assista a este vídeo curto para entender como seu plano
          funciona:
        </h1>
        <p className="text-lg text-gray-600">
          Descubra o segredo que vai potencializar seus resultados.
        </p>
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black shadow-2xl">
          {/* 
            Este é um placeholder para o seu vídeo. 
            Você pode usar um serviço como YouTube, Vimeo, ou Panda Video.
            Exemplo com YouTube:
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/SEU_ID_DO_SEU_VIDEO?autoplay=1&rel=0" 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          */}
           <div className="flex h-full w-full items-center justify-center bg-gray-800 text-white">
            <p className="text-2xl">Seu Vídeo VSL Aqui</p>
          </div>
        </div>

        <div className="flex animate-pulse justify-center pt-4">
          <Button
            onClick={handleGoToOffer}
            size="lg"
            className="h-auto w-full max-w-lg bg-green-600 py-4 text-xl font-bold text-white hover:bg-green-700"
          >
            EU QUERO MEU PLANO PERSONALIZADO!
            <ChevronRight className="ml-2 h-6 w-6" />
          </Button>
        </div>
         <p className="text-xs text-gray-500">
          Atenção: Assista até o final para garantir sua condição especial.
        </p>
      </div>
    </div>
  );
}

export default function VslPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <VslContent />
    </Suspense>
  );
}
