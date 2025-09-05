
'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircle,
  Siren,
  Lightbulb,
  XCircle,
  ChevronRight,
} from 'lucide-react';

function setCookie(name: string, value: string, days: number): void {
    if (typeof document === 'undefined') return;
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
}

function getCampaignParams() {
    if (typeof window === 'undefined') return {};
    try {
        const storedParams = localStorage.getItem('campaign_params');
        return storedParams ? JSON.parse(storedParams) : {};
    } catch (e) {
        return {};
    }
}

type ImcCategory = 'Abaixo do peso' | 'Normal' | 'Sobrepeso' | 'Obesidade';

const getImcCategory = (imc: number): ImcCategory => {
  if (imc < 18.5) return 'Abaixo do peso';
  if (imc < 25) return 'Normal';
  if (imc < 30) return 'Sobrepeso';
  return 'Obesidade';
};

const calculateImc = (weightStr: string, heightStr: string): { imc: number; category: ImcCategory } => {
    const parseValue = (str: string) => {
        const match = str.match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[0]) : 0;
    };

    let weightInKg = parseValue(weightStr);
    if (weightStr.includes('lb')) {
        weightInKg *= 0.453592;
    }

    let heightInCm = parseValue(heightStr);
    if (heightStr.includes('pol')) {
        heightInCm *= 2.54;
    }

    const heightInM = heightInCm / 100;
    const imc = heightInM > 0 ? parseFloat((weightInKg / (heightInM * heightInM)).toFixed(1)) : 0;
    const category = getImcCategory(imc);
    
    return { imc, category };
}


function ResultsComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const name = searchParams.get('name') || 'Olá';
  const currentWeight = searchParams.get('currentWeight') || '70kg';
  const desiredWeight = searchParams.get('desiredWeight') || '65kg';
  const height = searchParams.get('height') || '165cm';

  useEffect(() => {
    const quizData = {
      name: name,
      currentWeight: currentWeight,
      desiredWeight: desiredWeight,
    };
    setCookie('quiz_data', JSON.stringify(quizData), 1); // Salva o cookie por 1 dia
  }, [name, currentWeight, desiredWeight]);


  const { imc, category } = calculateImc(currentWeight, height);

  const handleNext = () => {
     const queryParams = new URLSearchParams({
          name: name,
          currentWeight: currentWeight,
          desiredWeight: desiredWeight
      });
      router.push(`/offer?${queryParams.toString()}`);
  }

  const markerPositions: Record<ImcCategory, string> = {
    'Abaixo do peso': '12.5%',
    'Normal': '37.5%',
    'Sobrepeso': '62.5%',
    'Obesidade': '87.5%',
  };

  const markerPosition = markerPositions[category] || '37.5%';

  return (
     <div className="flex min-h-screen flex-col bg-background">
       <div className="fixed top-0 left-0 right-0 z-10 bg-background p-4">
        <div className="flex flex-col items-center justify-center">
          <Image
            src="/logonov1a.webp"
            alt="Mounjaro de Pobre Logo"
            width={50}
            height={50}
            className="h-auto w-auto"
          />
          <Progress
            value={100}
            className="h-2 w-full max-w-xs mt-2"
            style={{ backgroundColor: '#e0e0e0' }}
          />
        </div>
      </div>
        <div className="flex flex-1 flex-col items-center justify-center p-4 mt-24">
            <div className="container mx-auto max-w-2xl bg-white p-4 text-center">
            <div className="space-y-6">
                <h2 className="text-left text-xl font-bold">
                {name}, aqui está a análise do seu perfil:
                </h2>

                <div className="rounded-lg bg-[#e8f5e9] p-4 text-center">
                <p className="font-medium">
                    Seu IMC (Índice de Massa Corporal) é:{' '}
                    <span className="font-bold">{imc}</span> -{' '}
                    <span className="font-bold">{category}</span>
                </p>
                </div>

                <div className="w-full text-left">
                <div className="relative w-full pt-8">
                    <div className="h-4 w-full flex rounded-full overflow-hidden">
                    <div className="w-1/4 bg-yellow-400"></div>
                    <div className="w-1/4 bg-green-500"></div>
                    <div className="w-1/4 bg-orange-400"></div>
                    <div className="w-1/4 bg-red-500"></div>
                    </div>
                    <div
                    className="absolute top-0 h-full transition-all duration-500"
                    style={{
                        left: markerPosition,
                        transform: 'translateX(-50%)',
                    }}
                    >
                    <div className="relative flex flex-col items-center">
                        <div className="whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white shadow-lg z-10">
                        Você está aqui
                        </div>
                        <div className="h-3 w-3 -mt-1 rotate-45 transform bg-black"></div>
                    </div>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span className="w-1/4 text-center">Abaixo do peso</span>
                    <span className="w-1/4 text-center">Normal</span>
                    <span className="w-1/4 text-center">Sobrepeso</span>
                    <span className="w-1/4 text-center">Obesidade</span>
                    </div>
                </div>
                </div>

                <div className="flex items-start gap-4 rounded-lg bg-[#fff9c4] p-4 text-left">
                <AlertCircle className="mt-1 h-6 w-6 shrink-0 text-yellow-600" />
                <div>
                    <h3 className="font-bold">
                    Seu metabolismo pode estar te sabotando sem que você perceba!
                    </h3>
                    <p className="text-sm text-gray-700">
                    Mesmo estando em um peso normal, seu corpo pode estar retendo
                    toxinas que inflamam suas células e dificultam a queima de gordura,
                    especialmente na região abdominal. Isso pode levar ao acúmulo de
                    gordura visceral, a mais perigosa para a saúde.
                    </p>
                </div>
                </div>

                <div className="flex items-start gap-4 rounded-lg bg-[#ffebee] p-4 text-left">
                <Siren className="mt-1 h-6 w-6 shrink-0 text-red-600" />
                <div>
                    <h3 className="font-bold">Alguns sinais de alerta:</h3>
                    <ul className="mt-2 space-y-1 text-sm">
                    <li className="flex items-center gap-2 font-bold text-red-800">
                        <XCircle className="h-4 w-4" />
                        Metabolismo lento e dificuldade para perder peso
                    </li>
                    <li className="flex items-center gap-2 font-bold text-red-800">
                        <XCircle className="h-4 w-4" />
                        Cansaço constante e falta de energia
                    </li>
                    <li className="flex items-center gap-2 font-bold text-red-800">
                        <XCircle className="h-4 w-4" />
                        Acúmulo de gordura, principalmente na barriga
                    </li>
                    </ul>
                </div>
                </div>

                <div className="flex items-start gap-4 rounded-lg bg-[#e3f2fd] p-4 text-left">
                <Lightbulb className="mt-1 h-6 w-6 shrink-0 text-blue-600" />
                <div>
                    <h3 className="font-bold">
                    Com o Mounjaro dos Pobres, seu corpo acelera a queima de gordura de
                    forma natural.
                    </h3>
                    <p className="text-sm text-gray-700">
                    A combinação ideal de ingredientes da nossa fórmula{' '}
                    <span className="font-bold text-blue-800">
                        pode ativar seu metabolismo, reduzir a retenção de líquidos e
                        aumentar sua energia
                    </span>
                    , promovendo a queima da gordura visceral e uma desintoxicação
                    completa do organismo.
                    </p>
                </div>
                </div>
            </div>

            <div className="space-y-6 mt-10">
                <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
                    <h1 className="text-2xl font-bold">Veja a transformação da Silvia!</h1>
                    <Image
                    src="/silvia.webp"
                    alt="Transformação da Silvia"
                    width={580}
                    height={400}
                    className="mx-auto rounded-lg h-auto w-auto"
                    data-ai-hint="woman before after weight loss"
                    />
                    <p className="text-gray-600 text-left italic">
                    "Oiii comprei porque uma amiga me indicou... O resultado é incrível 😅
                    Recomendo muito. estou a 1 mês e estou com muito menos vontade de comer
                    besteiras, perdi peso e desinchei bastante! Meu maior medo era ficar com
                    flacidez, morria de medo disso, mas graças a Deus isso não aconteceu e
                    to emagrecendo com muita saude, obrigada, recuperei minha autoestima,
                    me sinto jovem de novo!"
                    </p>
                </div>

                <p className="text-gray-800 text-left">
                    A partir dos dados coletados e do resultado do seu IMC, nós elaboramos um programa de acompanhamento individual para que você alcance seus resultados no menor tempo possível, com a melhor qualidade de vida projetada de acordo com seus objetivos — em apenas 4 semanas.
                </p>

                <div className="rounded-lg border bg-gray-50 p-4 text-left">
                <p className="font-bold">
                    Nível de Sucesso com o Mounjaro dos Pobres
                </p>
                <p className="text-sm text-gray-500">
                    Baseado nos dados de clientes do Mounjaro dos Pobres que registram
                    seu progresso no aplicativo.
                </p>
                <div className="mt-2 flex items-center gap-2">
                    <Progress
                    value={93}
                    className="h-4 flex-1"
                    style={{ backgroundColor: '#e0e0e0' }}
                    />
                    <span className="font-bold text-green-700">93%</span>
                </div>
                </div>
                <Button
                    onClick={handleNext}
                    size="lg"
                    className="w-full max-w-md h-14 text-lg bg-[#5a8230] hover:bg-[#5a8230]/90"
                >
                    Gerar meu plano personalizado
                    <ChevronRight className="h-6 w-6" />
                </Button>
            </div>
            </div>
        </div>
    </div>
  );
}


export default function ResultsPage() {
    return (
        <Suspense fallback={<div>Carregando resultados...</div>}>
            <ResultsComponent />
        </Suspense>
    )
}
