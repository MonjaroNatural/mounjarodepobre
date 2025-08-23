import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="bg-white">
      <main className="container mx-auto flex max-w-2xl flex-col items-center space-y-6 px-4 py-8 text-center">
        
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
      </main>
    </div>
  );
}
