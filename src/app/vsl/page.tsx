
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


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <div 
          dangerouslySetInnerHTML={{
            __html: `
              <vturb-smartplayer 
                id="vid-68b7c566d95b2222fd24bec2" 
                style="display: block; margin: 0 auto; width: 100%; max-width: 800px; aspect-ratio: 16/9;">
              </vturb-smartplayer>
              <script type="text/javascript">
                var s=document.createElement("script");
                s.src="https://scripts.converteai.net/ac8b95fd-dbe1-4fe7-aa68-0fad06c9ea3d/players/68b7c566d95b2222fd24bec2/v4/player.js";
                s.async=true;
                document.head.appendChild(s);
              </script>
            `
          }}
        />
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
