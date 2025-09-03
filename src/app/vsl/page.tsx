
'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function VslContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name');

  useEffect(() => {
    const scriptId = 'vturb-player-script';
    // Evita adicionar o script múltiplas vezes se o componente re-renderizar
    if (document.getElementById(scriptId)) {
      return;
    }

    const s = document.createElement('script');
    s.id = scriptId;
    s.src =
      'https://scripts.converteai.net/ac8b95fd-dbe1-4fe7-aa68-0fad06c9ea3d/players/68b7c566d95b2222fd24bec2/v4/player.js';
    s.async = true;
    document.head.appendChild(s);

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
        <h1 className="text-2xl font-bold md:text-4xl">
            {name ? `${name}, seu` : 'Seu'} plano personalizado foi feito com sucesso!
        </h1>
        <p className="text-lg text-gray-700">
            Assista ao vídeo abaixo com as instruções completas sobre seu plano
        </p>

        {/* O player da Vturb será inserido aqui pelo script */}
        <div
            dangerouslySetInnerHTML={{
            __html: `<vturb-smartplayer id="vid-68b7c566d95b2222fd24bec2" style="display: block; margin: 0 auto; width: 100%; aspect-ratio: 16/9;"></vturb-smartplayer>`,
            }}
        />
       </div>
    </div>
  );
}

export default function VslPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Carregando seu plano...</div>}>
            <VslContent />
        </Suspense>
    )
}
