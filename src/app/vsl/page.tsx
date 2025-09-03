
'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import Script from 'next/script';

declare global {
    interface Window {
        vturbPlayer?: any;
    }
}

function VslContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const name = searchParams.get('name') || '';
  const currentWeight = searchParams.get('currentWeight') || '';
  const desiredWeight = searchParams.get('desiredWeight') || '';

  const handleGoToOffer = () => {
    const queryParams = new URLSearchParams({
      ...(name && { name }),
      ...(currentWeight && { currentWeight }),
      ...(desiredWeight && { desiredWeight }),
    });
    router.push(`/offer?${queryParams.toString()}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="w-full max-w-4xl space-y-6">
        
        <h1 className="text-2xl font-bold md:text-4xl">
          {name ? `${name}, seu` : 'Seu'} plano personalizado foi feito com sucesso!
        </h1>
        
        <p className="text-lg text-gray-600">
          Assista ao vídeo abaixo com as instruções completas sobre seu plano
        </p>

        {/* Container do vídeo Vturb */}
        <div 
          id="vid_68b7c566d95b2222fd24bec2" 
          style={{ 
            width: '100%', 
            aspectRatio: '16/9', 
            margin: '0 auto',
            backgroundColor: '#000' // Fundo preto enquanto carrega
          }}
          className="rounded-lg shadow-lg"
        />

        {/* Botão de CTA */}
        <div className="flex animate-pulse justify-center pt-4">
          <Button
            onClick={handleGoToOffer}
            size="lg"
            className="h-auto w-full max-w-lg bg-green-600 py-4 text-xl font-bold text-white hover:bg-green-700 transition-colors"
          >
            EU QUERO MEU PLANO PERSONALIZADO!
            <ChevronRight className="ml-2 h-6 w-6" />
          </Button>
        </div>

        {/* Texto de urgência */}
        <p className="text-xs text-gray-500 mt-4">
          Não feche essa página pois sua vaga será perdida e você não poderá receber outro plano especial.
        </p>
      </div>

      {/* Script do Player Vturb */}
      <Script
        src="https://scripts.converteai.net/ac8b95fd-dbe1-4fe7-aa68-0fad06c9ea3d/players/68b7c566d95b2222fd24bec2/v4/player.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Força a reinicialização do player se necessário
          if (window.vturbPlayer) {
            window.vturbPlayer.init();
          }
        }}
      />
    </div>
  );
}

export default function VslPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Carregando seu vídeo personalizado...</div>
      </div>
    }>
      <VslContent />
    </Suspense>
  );
}
