
'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import Script from 'next/script';

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

  useEffect(() => {
    const scriptId = 'vturb-player-script';
    // Evita adicionar o script múltiplas vezes
    if (document.getElementById(scriptId)) {
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = "https://scripts.converteai.net/ac8b95fd-dbe1-4fe7-aa68-0fad06c9ea3d/players/68b7c566d95b2222fd24bec2/v4/player.js";
    script.async = true;
    document.head.appendChild(script);

    // Função de limpeza para remover o script quando o componente é desmontado
    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-center">
        <div className="w-full max-w-4xl space-y-4">
        
        {/* Container do vídeo Vturb - o script vai procurar por este elemento */}
        <div 
          dangerouslySetInnerHTML={{
            __html: `
              <vturb-smartplayer 
                id="vid-68b7c566d95b2222fd24bec2" 
                style="display: block; margin: 0 auto; width: 100%; aspect-ratio: 16/9;">
              </vturb-smartplayer>
            `
          }}
        />

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
