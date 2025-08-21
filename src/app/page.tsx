import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function QuizPage() {
  return (
    <div className="bg-white">
      <main className="container mx-auto flex max-w-2xl flex-col items-center space-y-5 px-4 py-8 text-center md:px-10 md:py-12">
        
        <Image 
          src="https://placehold.co/541x513.png" 
          alt="BBC News Brasil Logo" 
          width={541} 
          height={513} 
          className="h-auto w-32 md:w-40"
          data-ai-hint="logo bbc"
        />
        
        <p className="text-sm tracking-[0.5px] text-[#333333]">
          Noticias Brasil Internacional Economia Sat
        </p>

        <h1 className="text-2xl font-bold text-black">
          A formula europeia mais desejada
          <br />
          do momento chegou com tudo!
        </h1>

        <h2 className="text-lg font-bold text-black">
          "Mounjaro Natural" esta mudando
          <br />
          vidas, sem agulhas, sem efeitos
          <br />
          colaterais e sem receita!
        </h2>

        <div className="w-full border border-black bg-accent p-6">
          <p className="text-base font-bold uppercase text-black">
            DESTAQUE POR OFERECER OS MESMOS EFEITOS DO
            <br />
            MEDICAMENTO,FICOU CONHECIDO POR
            <br />
            "MOUNJARODE POBRE"AGE COMO CONTROLE DE
            <br />
            APETITE E PERDA DE PESO,ATIVANDO O HORMONIO
            <br />
            GLP-I,MAS DE FORMA ACESSIVEL E SEM INJECOES
          </p>
        </div>

        <p className="text-xl font-bold text-destructive">
          Últimos Dias Antes Que Retirem do Ar: A Fórmula Natural que Imita o Mounjaro e Está Secando em Tempo Recorde”
        </p>
        
        <p className="text-lg font-bold text-black">
          A indústria do emagrecimento NÃO quer que você veja isso! o Protocolo barato que entrega o que remédio de R$1.200 promete!
        </p>

        <p className="text-sm italic text-[#555555]">
          Atenção: oferecemos apenas uma consulta por pessoa. Se você sair, perderá a sua vez. Aproveite essa oportunidade exclusiva!
        </p>
        
        <Link href="/quiz" className="w-full max-w-xs">
          <Button size="lg" className="h-auto w-full px-[30px] py-[15px] text-lg font-bold rounded-[5px]">
            Iniciar teste grátis
          </Button>
        </Link>
      </main>
    </div>
  );
}
