'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Meter } from '@/components/ui/meter';
import { getCookie, generateEventId } from '@/lib/tracking';
import { sendN8NEvent } from '@/app/actions';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

const faqData = [
  {
    question: '❓Isso realmente funciona ou é só mais uma promessa falsa?',
    answer:
      'Sim, funciona — e não é mais uma promessa vazia. O protocolo que a gente desenvolveu foi feito pra quem já tentou de tudo e nunca teve resultado. É direto, simples e baseado nas estratégias mais eficazes que realmente ativam a queima de gordura sem você precisar viver de dieta ou remédio caro.',
  },
  {
    question: '🕒Em quanto tempo eu começo a ver resultado?',
    answer:
      'Muita gente começa a ver diferença nas primeiras 2 semanas — seja no peso, nas roupas ou no espelho. Mas o protocolo completo é pensado pra 4 semanas de transformação, com metas realistas e atingíveis. Você vai se surpreender com o que é possível quando faz do jeito certo.',
  },
  {
    question: '🙋‍♀️Mesmo comigo que já tentei de tudo?',
    answer:
      'Principalmente você. Esse plano foi feito justamente pra quem já cansou de tentar mil dietas, remédios e treinos que não funcionam. A maioria das mulheres que tiveram resultado com o protocolo já estavam desacreditadas antes. O diferencial é a forma como a gente aplica o método, respeitando sua realidade.',
  },
  {
    question: '❤️Isso faz mal pra saúde?',
    answer:
      'De forma nenhuma. O protocolo foi pensado pra ser o mais seguro possível. Nada de remédio agressivo, efeito colateral ou restrição maluca. Tudo é feito respeitando o seu corpo, sua rotina e seu bem-estar. A ideia aqui é emagrecer de forma saudável, sem perder massa muscular e sem acabar com sua energia.',
  },
  {
    question: '⚠️Tem efeito colateral?',
    answer:
      'Não. Como o protocolo não envolve uso de remédios perigosos, você não precisa se preocupar com efeitos colaterais. É um método que você pode aplicar com tranquilidade e que se adapta à sua rotina — sem te deixar mal, sem te dar dor de cabeça e sem prejudicar sua saúde.',
  },
  {
    question: '🌿É natural ou tem algum remédio envolvido?',
    answer:
      'É 100% natural. O “Mounjaro de Pobre” é um nome simbólico pra um protocolo inteligente que simula os efeitos positivos dos remédios caríssimos — só que com alimentos acessíveis, estratégias comprovadas e uma abordagem totalmente segura. Nada de remédio.',
  },
  {
    question: '📚Tem base científica ou é só “achismo”?',
    answer:
      'Tem base sim. O protocolo foi montado com base em descobertas recentes de universidades como Harvard, que revelaram os verdadeiros mecanismos que ativam a perda de gordura. O que a gente fez foi traduzir tudo isso pra uma linguagem simples e prática — sem enrolação e com essa coisa difícil de seguir.',
  },
  {
    question: '🧩Esse plano serve pra mim? É adaptado pro meu caso?',
    answer:
      'Sim. Quando você compra, a gente monta o plano com base nas suas informações, objetivos e rotina. Ou seja: não é algo genérico. Ele é adaptado pra funcionar no seu dia a dia, com o que você gosta de comer e com o tempo que você tem.',
  },
  {
    question: '🛡️Tem garantia? E se eu não gostar?',
    answer:
      'Tem garantia total. Se você aplicar o que tá no plano e não tiver resultado, é só mandar um e-mail que devolvemos seu dinheiro. Simples assim. A ideia é te entregar algo que realmente funcione — e se não funcionar pra você, você não paga por isso.',
  },
  {
    question: '📦Como funciona a entrega do plano?',
    answer:
      'Assim que a compra for aprovada, o plano chega automaticamente no seu e-mail. Tudo é digital e entregue na hora, então você já pode começar no mesmo dia. É só abrir, seguir as instruções e começar sua transformação.',
  },
];

const testimonials = [
  {
    name: 'Juliana Paes',
    text: 'Eu não acreditava mais que podia emagrecer. Com o protocolo, perdi 8kg em 3 semanas sem sofrimento. Minha autoestima voltou com tudo!',
    image: '/depoimento1.webp',
  },
  {
    name: 'Márcia Oliveira',
    text: 'Finalmente algo que funciona! Perdi medidas, ganhei disposição e o melhor: sem passar fome ou tomar remédios caros. Recomendo demais!',
    image: '/depoimento2.webp',
  },
  {
    name: 'Carla Souza',
    text: 'Em 1 mês, perdi 12kg. Parece mágica, mas é só o método certo. O "Mounjaro de Pobre" mudou a minha vida e a forma como eu me vejo no espelho.',
    image: '/depoimento3.webp',
  },
  {
    name: 'Fernanda Lima',
    text: 'O resultado foi muito além do peso. Me sinto mais leve, desinchada e com uma energia que não tinha há anos. Foi o melhor investimento que fiz em mim.',
    image: '/depoimento4.webp',
  },
];

function OfferContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Seu Plano';
  const currentWeight = searchParams.get('currentWeight') || '';
  const desiredWeight = searchParams.get('desiredWeight') || '';
  const externalId = getCookie('my_session_id');
  const [api, setApi] = useState<CarouselApi>();

  const handleCheckoutClick = () => {
    const checkoutUrl = `https://pay.hotmart.com/G93148123M?sck=${externalId}`;

    // Dispara o evento InitiateCheckout
    const eventId = generateEventId('InitiateCheckout', externalId ?? '');

    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {}, { event_id: eventId });
    }

    sendN8NEvent({
      eventName: 'InitiateCheckout',
      eventId: eventId,
      eventTime: Math.floor(Date.now() / 1000),
      userData: {
        external_id: externalId,
        fbc: getCookie('_fbc'),
        fbp: getCookie('_fbp'),
      },
      event_source_url: window.location.href,
      action_source: 'website',
    });

    router.push(checkoutUrl);
  };

  useEffect(() => {
    // Dispara o evento AddToCart quando a página de oferta é exibida
    const eventId = generateEventId('AddToCart', externalId ?? '');

    if (window.fbq) {
      window.fbq('track', 'AddToCart', {}, { event_id: eventId });
    }

    sendN8NEvent({
      eventName: 'AddToCart',
      eventId: eventId,
      eventTime: Math.floor(Date.now() / 1000),
      userData: {
        external_id: externalId,
        fbc: getCookie('_fbc'),
        fbp: getCookie('_fbp'),
      },
      event_source_url: window.location.href,
      action_source: 'website',
    });
  }, [externalId]);

  return (
    <div className="bg-white text-black">
      <main className="container mx-auto max-w-2xl flex-col items-center space-y-8 px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">
          {name}, seu Plano Exclusivo de Emagrecimento com o Mounjaro dos Pobres
          está pronto.
        </h1>

        <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 text-left text-sm">
          {/* Coluna Antes */}
          <div className="space-y-3">
            <div className="rounded-md bg-[#ffebee] p-2 text-center font-bold text-red-800">
              Antes do Mounjaro dos Pobres
            </div>
            {currentWeight && (
              <div className="text-center">
                <p className="font-bold">Seu peso atual:</p>
                <p className="text-2xl font-bold text-red-600">
                  {currentWeight}
                </p>
              </div>
            )}
            <Image
              src="/antes11.webp"
              alt="Mulher antes de usar o produto"
              width={250}
              height={300}
              className="mx-auto rounded-lg"
              data-ai-hint="woman overweight sad"
            />
            <div className="space-y-1">
              <p>Metabolismo lento</p>
              <Meter value={1} max={5} variant="destructive" />
            </div>
            <div className="space-y-1">
              <p>Corpo constantemente inchado.</p>
              <Meter value={2} max={5} variant="destructive" />
            </div>
            <div className="space-y-1">
              <p>Ansiedade que leva a comer sem controle.</p>
              <Meter value={2} max={5} variant="destructive" />
            </div>
            <div className="space-y-1">
              <p>Desequilíbrio hormonal</p>
              <Meter value={3} max={5} variant="destructive" />
            </div>
          </div>

          {/* Coluna Depois */}
          <div className="space-y-3">
            <div className="rounded-md bg-[#e3f2fd] p-2 text-center font-bold text-blue-800">
              Depois do Mounjaro dos Pobres
            </div>
            {desiredWeight && (
              <div className="text-center">
                <p className="font-bold">Seu peso desejado:</p>
                <p className="text-2xl font-bold text-green-600">
                  {desiredWeight}
                </p>
              </div>
            )}
            <Image
              src="/depois.webp"
              alt="Mulher depois de usar o produto"
              width={250}
              height={300}
              className="mx-auto rounded-lg"
              data-ai-hint="woman fit happy"
            />
            <div className="space-y-1">
              <p>Metabolismo acelerado</p>
              <Meter value={4} max={5} variant="constructive" />
            </div>
            <div className="space-y-1">
              <p>Corpo leve e desinchado.</p>
              <Meter value={4} max={5} variant="constructive" />
            </div>
            <div className="space-y-1">
              <p>Sensação de saciedade e autocontrole.</p>
              <Meter value={5} max={5} variant="constructive" />
            </div>
            <div className="space-y-1">
              <p>Equilíbrio hormonal natural</p>
              <Meter value={5} max={5} variant="constructive" />
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-lg bg-gray-100 p-6">
          <h2 className="text-xl font-bold">Como funciona o plano?</h2>
          <p>
            Com base nas suas{' '}
            <span className="font-bold text-green-600">
              informações pessoais
            </span>{' '}
            e nos seus{' '}
            <span className="font-bold text-green-600">objetivos</span>, criamos
            um{' '}
            <span className="font-bold text-green-600">
              plano 100% personalizado para você
            </span>{' '}
            utilizar o Mounjaro dos Pobres.
          </p>
        </div>

        <div className="space-y-4 rounded-lg border p-6 text-left">
          <p>
            Nossa abordagem estratégica foi desenvolvida para te ajudar a{' '}
            <span className="font-bold">
              potencializar a perda de peso em apenas 4 semanas
            </span>
            , respeitando seu estilo de vida, sua rotina e suas preferências
            alimentares.
          </p>
          <div className="rounded-md bg-[#28a745] py-2 text-center font-bold text-white">
            Seu plano inclui:
          </div>
          <ul className="space-y-3 text-sm">
            <li>
              <p className="font-bold">
                Como usar o Mounjaro da Forma Correta:
              </p>
              <p className="text-green-700">
                Com base em pesquisas, a forma de uso do Mounjaro dos Pobres
                pode variar de acordo com o seu corpo e objetivo.
              </p>
            </li>
            <li>
              <p className="font-bold">Definição de metas diárias.</p>
              <p className="text-green-700">
                Para que você se mantenha focada, vamos traçar juntas um plano
                de metas diárias.
              </p>
            </li>
            <li>
              <p className="font-bold">Planilha de acompanhamento:</p>
              <p className="text-green-700">
                Você saberá com clareza a sua evolução diária através de uma
                planilha simples de acompanhamento.
              </p>
            </li>
          </ul>
          <p className="text-center font-bold text-green-800">
            + 4 Bônus Exclusivos
          </p>
        </div>

        <p className="text-lg">
          Ao garantir o seu Mounjaro dos Pobres hoje,{' '}
          <span className="text-green-600">
            você recebe todos os bônus de presente!
          </span>
        </p>

        <div className="w-full space-y-4 rounded-lg bg-gray-50 p-6">
          <h2 className="text-2xl font-bold">
            Elas usaram e aprovaram o Mounjaro dos Pobres
          </h2>
          <Carousel
            setApi={setApi}
            opts={{
              loop: true,
              align: 'start',
            }}
            plugins={[
              Autoplay({
                delay: 5000,
                stopOnInteraction: false,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-4 md:basis-1/2">
                  <div className="flex h-full flex-col justify-between rounded-lg border bg-white p-6 shadow-md">
                    <div>
                      <div className="flex items-center gap-4">
                        <Image
                          src={testimonial.image}
                          alt={`Foto de ${testimonial.name}`}
                          width={56}
                          height={56}
                          className="h-14 w-14 rounded-full object-cover"
                          data-ai-hint="woman smiling portrait"
                        />
                        <div>
                          <p className="font-bold">{testimonial.name}</p>
                          <div className="flex text-yellow-400">
                            {'★★★★★'.split('').map((s, i) => (
                              <span key={i}>{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="mt-4 text-left text-sm italic text-gray-700">
                        "{testimonial.text}"
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        <div className="w-full space-y-4 rounded-lg border p-6">
          <h2 className="text-2xl font-bold">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="w-full text-left">
            {faqData.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-left font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-gray-700">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <Button
          size="lg"
          className="h-auto w-full max-w-md bg-[#28a745] py-4 text-xl font-bold text-white hover:bg-[#28a745]/90"
          onClick={handleCheckoutClick}
        >
          SIM, QUERO MEU PLANO PERSONALIZADO!
        </Button>
      </main>
    </div>
  );
}

export default function OfferPage() {
  return (
    <Suspense fallback={<div>Carregando oferta...</div>}>
      <OfferContent />
    </Suspense>
  );
}
