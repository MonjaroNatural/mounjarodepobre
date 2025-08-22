
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Siren, Lightbulb, XCircle } from 'lucide-react';

function ResultsContent() {
  const searchParams = useSearchParams();

  const weightStr = searchParams.get('weight') || '70kg';
  const heightStr = searchParams.get('height') || '165cm';

  const parseValue = (str: string) => parseFloat(str.replace(/[a-zA-Z]/g, ''));

  let weightInKg = parseValue(weightStr);
  if (weightStr.includes('lb')) {
    weightInKg *= 0.453592;
  }

  let heightInCm = parseValue(heightStr);
  if (heightStr.includes('pol')) {
    heightInCm *= 2.54;
  }

  const heightInM = heightInCm / 100;
  const imc = parseFloat((weightInKg / (heightInM * heightInM)).toFixed(1));

  let imcCategory: 'Abaixo do peso' | 'Normal' | 'Sobrepeso' | 'Obesidade';
  let categoryPercentage: number;

  if (imc < 18.5) {
    imcCategory = 'Abaixo do peso';
    categoryPercentage = (imc / 18.5) * 25;
  } else if (imc < 25) {
    imcCategory = 'Normal';
    categoryPercentage = 25 + ((imc - 18.5) / (25 - 18.5)) * 25;
  } else if (imc < 30) {
    imcCategory = 'Sobrepeso';
    categoryPercentage = 50 + ((imc - 25) / (30 - 25)) * 25;
  } else {
    imcCategory = 'Obesidade';
    categoryPercentage = 75 + Math.min(((imc - 30) / (40 - 30)) * 25, 25);
  }
  categoryPercentage = Math.max(5, Math.min(95, categoryPercentage));

  return (
    <main className="container mx-auto max-w-2xl bg-white p-4 text-center">
      
      {/* Seção A: Introdução e Prova Social */}
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Veja a transformação da Silvia!</h1>
        <Image
          src="https://placehold.co/600x400.png"
          alt="Transformação da Silvia"
          width={580}
          height={400}
          className="mx-auto rounded-lg"
          data-ai-hint="woman before after weight loss"
        />
        <p className="text-gray-600">
          A partir dos dados coletados e do resultado do seu IMC, nós elaboramos um programa de acompanhamento individual para que você alcance seus resultados no menor tempo possível, com a melhor qualidade de vida projetada de acordo com seus objetivos — em apenas 4 semanas.
        </p>

        <div className="rounded-lg border bg-gray-50 p-4 text-left">
          <p className="font-bold">Nível de Sucesso com o Mounjaro dos Pobres</p>
          <p className="text-sm text-gray-500">Baseado nos dados de clientes do Mounjaro dos Pobres que registram seu progresso no aplicativo.</p>
          <div className="mt-2 flex items-center gap-2">
            <Progress value={93} className="h-4 flex-1" style={{ backgroundColor: '#e0e0e0' }} />
            <span className="font-bold text-green-700">93%</span>
          </div>
        </div>
      </div>

      {/* Seção B: Análise Detalhada do Perfil */}
      <div className="mt-10 space-y-6">
        <h2 className="text-left text-xl font-bold">4, aqui está a análise do seu perfil:</h2>

        <div className="rounded-lg bg-[#e8f5e9] p-4 text-center">
          <p className="font-medium">Seu IMC (Índice de Massa Corporal) é: <span className="font-bold">{imc}</span></p>
        </div>

        <div className="w-full text-left">
           <div className="relative w-full">
            <div className="absolute top-0 left-0 right-0 flex justify-between text-xs text-gray-500">
                <span className="text-yellow-500 font-bold">Zona de Alerta</span>
                <span className="text-red-500 font-bold">65%</span>
            </div>
            <div className="mt-6 h-4 w-full flex rounded-full overflow-hidden">
                <div className="w-1/4 bg-yellow-400"></div>
                <div className="w-1/4 bg-green-500"></div>
                <div className="w-1/4 bg-orange-400"></div>
                <div className="w-1/4 bg-red-500"></div>
            </div>
            <div className="relative h-4" style={{ left: `${categoryPercentage}%`, transform: 'translateX(-50%)' }}>
                <div className="absolute top-0 flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-black"></div>
                    <div className="mt-1 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white">
                        Você está aqui
                    </div>
                </div>
            </div>
            <div className="mt-8 flex justify-between text-xs text-gray-500">
                <span>Abaixo do peso</span>
                <span>Normal</span>
                <span>Sobrepeso</span>
                <span>Obesidade</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-4 rounded-lg bg-[#fff9c4] p-4 text-left">
          <AlertCircle className="mt-1 h-6 w-6 shrink-0 text-yellow-600" />
          <div>
            <h3 className="font-bold">Seu metabolismo pode estar te sabotando sem que você perceba!</h3>
            <p className="text-sm text-gray-700">
              Mesmo estando em um peso normal, seu corpo pode estar retendo toxinas que inflamam suas células e dificultam a queima de gordura, especialmente na região abdominal. Isso pode levar ao acúmulo de gordura visceral, a mais perigosa para a saúde.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-lg bg-[#ffebee] p-4 text-left">
          <Siren className="mt-1 h-6 w-6 shrink-0 text-red-600" />
          <div>
            <h3 className="font-bold">Alguns sinais de alerta:</h3>
            <ul className="mt-2 space-y-1 text-sm">
                <li className="flex items-center gap-2 font-bold text-red-800"><XCircle className="h-4 w-4" />Metabolismo lento e dificuldade para perder peso</li>
                <li className="flex items-center gap-2 font-bold text-red-800"><XCircle className="h-4 w-4" />Cansaço constante e falta de energia</li>
                <li className="flex items-center gap-2 font-bold text-red-800"><XCircle className="h-4 w-4" />Acúmulo de gordura, principalmente na barriga</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-lg bg-[#e3f2fd] p-4 text-left">
          <Lightbulb className="mt-1 h-6 w-6 shrink-0 text-blue-600" />
          <div>
            <h3 className="font-bold">Com o Mounjaro dos Pobres, seu corpo acelera a queima de gordura de forma natural.</h3>
            <p className="text-sm text-gray-700">
              A combinação ideal de ingredientes da nossa fórmula <span className="font-bold text-blue-800">pode ativar seu metabolismo, reduzir a retenção de líquidos e aumentar sua energia</span>, promovendo a queima da gordura visceral e uma desintoxicação completa do organismo.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}


export default function ResultsPage() {
    return (
        <Suspense fallback={<div>Carregando resultados...</div>}>
            <ResultsContent />
        </Suspense>
    )
}
