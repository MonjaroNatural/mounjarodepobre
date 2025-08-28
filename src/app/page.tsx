'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useEffect, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';

export default function LandingPage() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  return (
    <div className="bg-white">
      <main className="container mx-auto flex max-w-2xl flex-col items-center space-y-6 px-4 py-8 text-center">
        <Image
          src="/pobrelogo.png"
          alt="Logo Mounjaro de Pobre"
          width={200}
          height={100}
          className="h-auto w-auto"
          data-ai-hint="logo"
        />

        <Image
          src="/inicial.webp"
          alt="Anúncio do Mounjaro de Pobre: Elimine até 10kg de gordura em 30 dias com essa nova receita"
          width={500}
          height={500}
          className="h-auto w-full"
          priority
        />

        <p className="text-base text-black md:text-lg">
          <strong className="text-red-500">Atenção:</strong> Oferecemos apenas{' '}
          <strong>uma consulta por pessoa</strong>. Se você sair, perderá a sua
          vez. Aproveite essa oportunidade exclusiva!
        </p>

        <Link href="/quiz" className="w-full max-w-md">
          <Button
            size="lg"
            className="h-auto w-full bg-[#00D053] py-4 text-xl font-bold text-white hover:bg-[#00D053]/90"
          >
            QUERO ESSA RECEITA
          </Button>
        </Link>

        {/* Seção de Depoimento em Carrossel */}
        <div className="mt-8 w-full max-w-[280px] border-t border-gray-200 pt-8">
          <Carousel
            setApi={setApi}
            opts={{
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 3000,
                stopOnInteraction: false,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent>
              <CarouselItem>
                <div className="flex flex-col items-center">
                  <p className="mb-2 text-lg font-semibold text-gray-800">
                    Ana Clara Oliveira - Salvador
                  </p>
                  <Image
                    src="/menopausa.webp"
                    alt="Depoimento de Ana Clara Oliveira"
                    width={500}
                    height={300}
                    className="h-auto w-full rounded-lg shadow-md"
                    data-ai-hint="woman smiling weight loss"
                  />
                  <p className="mt-4 text-base italic text-gray-700">
                    "Depois da menopausa ficou mais difícil emagrecer. Mas com
                    essa receita do mounjaro de pobre, perdi 7 kg em 12 dias e
                    meu apetite noturno diminuiu. Me sinto bem menos inchada, e
                    com mais disposição no dia a dia, me ajudou demais."
                  </p>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="flex flex-col items-center">
                  <p className="mb-2 text-lg font-semibold text-gray-800">
                    Andreia cazonato - São Paulo
                  </p>
                  <Image
                    src="/deponovo.webp"
                    alt="Depoimento de antes e depois"
                    width={500}
                    height={300}
                    className="h-auto w-full rounded-lg shadow-md"
                    data-ai-hint="woman before after weight loss"
                  />
                  <p className="mt-4 text-base italic text-gray-700">
                    "Comecei a usar a receita do mounjaro de pobre toda noite. Em
                    7 dias vi o ponteiro da balança baixar 5 kg, eu perdi muito
                    inchaço, minha cintura reduziu 15 cm. Foi o empurrão que eu
                    precisava pra manter o foco!"
                  </p>
                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
          <div className="mt-4 flex justify-center gap-2">
            <div
              className={`h-2 w-8 rounded-full transition-colors ${
                current === 0 ? 'bg-primary' : 'bg-gray-300'
              }`}
            ></div>
            <div
              className={`h-2 w-8 rounded-full transition-colors ${
                current === 1 ? 'bg-primary' : 'bg-gray-300'
              }`}
            ></div>
          </div>
        </div>
      </main>
    </div>
  );
}
