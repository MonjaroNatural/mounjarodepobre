import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="bg-white">
      <main className="container mx-auto flex max-w-2xl flex-col items-center space-y-6 px-4 py-8 text-center">
        
        <Image 
          src="/pobrelogo.png" 
          alt="Logo Mounjaro de Pobre"
          width={200}
          height={100}
          className="h-auto"
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
          <strong className="text-red-500">Atenção:</strong> Oferecemos apenas <strong>uma consulta por pessoa</strong>. Se você sair, perderá a sua vez. Aproveite essa oportunidade exclusiva!
        </p>
        
        <Link href="/quiz" className="w-full max-w-md">
          <Button 
            size="lg" 
            className="h-auto w-full bg-[#00D053] py-4 text-xl font-bold text-white hover:bg-[#00D053]/90"
          >
            QUERO ESSA RECEITA
          </Button>
        </Link>

        {/* Seção de Depoimento */}
        <div className="mt-8 pt-8 border-t border-gray-200 w-full max-w-sm">
          <p className="text-lg font-semibold text-gray-800 mb-2">Andreia cazonato - São Paulo</p>
          <Image
            src="/deponovo.webp"
            alt="Depoimento de antes e depois"
            width={500}
            height={300}
            className="h-auto w-full rounded-lg shadow-md"
            data-ai-hint="woman before after weight loss"
          />
          <p className="mt-4 text-base italic text-gray-700">
            &quot;Comecei a usar a receita do mounjaro de pobre toda noite. Em 7 dias vi o ponteiro da balança baixar 5 kg, eu perdi muito inchaço, minha cintura reduziu 15 cm. Foi o empurrão que eu precisava pra manter o foco!&quot;
          </p>
        </div>
      </main>
    </div>
  );
}
