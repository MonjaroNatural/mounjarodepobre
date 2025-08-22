
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { quizQuestions, QuizQuestion, Answer } from '@/data/quiz';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Slider } from '@/components/ui/slider';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { ChevronRight, ChevronLeft, Camera, HeartCrack, Frown, Hand, Clock, GlassWater } from 'lucide-react';

const iconMap: { [key: string]: React.ElementType } = {
  Camera: Camera,
  HeartCrack: HeartCrack,
  Frown: Frown,
  Hand: Hand,
  Clock: Clock,
  GlassWater: GlassWater,
};


export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[] | number | null>(null);
  const [weight, setWeight] = useState(70);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [height, setHeight] = useState(165);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'pol'>('cm');
  const router = useRouter();

  useEffect(() => {
    const question = quizQuestions[currentStep];
    const previousAnswer = answers.find(a => a.questionId === question.id);

    if (previousAnswer) {
      if (question.type === 'weight-slider' || question.type === 'height-slider') {
        const value = previousAnswer.value as string;
        const matchedValue = value.match(/(\d+)/);
        if (matchedValue) {
          if (question.type === 'weight-slider') {
            setWeight(parseInt(matchedValue[0], 10));
            if (value.includes('lb')) setWeightUnit('lb'); else setWeightUnit('kg');
          } else {
            setHeight(parseInt(matchedValue[0], 10));
            if (value.includes('pol')) setHeightUnit('pol'); else setHeightUnit('cm');
          }
        }
      } else {
        setCurrentAnswer(previousAnswer.value);
      }
    } else {
      if (question.type === 'multiple-choice') {
        setCurrentAnswer([]);
      } else if (question.type === 'weight-slider') {
        setWeight(question.id === 11 ? 70 : 60);
        setWeightUnit('kg');
        setCurrentAnswer(null); 
      } else if (question.type === 'height-slider') {
        setHeight(165);
        setHeightUnit('cm');
        setCurrentAnswer(null);
      } else {
        setCurrentAnswer(null);
      }
    }
  }, [currentStep, answers]);


  const handleNext = () => {
    const question = quizQuestions[currentStep];
    let answerToStore: Answer | null = null;
    
    if (question.type === 'weight-slider') {
      const value = `${weight}${weightUnit}`;
      answerToStore = { questionId: question.id, value };
    } else if (question.type === 'height-slider') {
      const value = `${height}${heightUnit}`;
      answerToStore = { questionId: question.id, value };
    } else if (currentAnswer !== null && currentAnswer !== '' && (!Array.isArray(currentAnswer) || currentAnswer.length > 0)) {
       answerToStore = { questionId: question.id, value: currentAnswer };
    } else {
       if(question.type === 'text' || question.type === 'number' || question.type === 'multiple-choice'){
         console.warn("Answer is required");
         return;
       }
    }

    let newAnswers = [...answers];
    if (answerToStore) {
        const otherAnswers = answers.filter(a => a.questionId !== question.id);
        newAnswers = [...otherAnswers, answerToStore];
        setAnswers(newAnswers);
    }
    
    if (question.type === 'promise' || question.type === 'testimonial' || question.type === 'loading') {
       if (currentStep < quizQuestions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
          const weightAnswer = newAnswers.find(a => a.questionId === 11)?.value;
          const heightAnswer = newAnswers.find(a => a.questionId === 12)?.value;
          router.push(`/quiz/results?weight=${weightAnswer}&height=${heightAnswer}`);
        }
        return;
    }

    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
       const weightAnswer = newAnswers.find(a => a.questionId === 11)?.value;
       const heightAnswer = newAnswers.find(a => a.questionId === 12)?.value;
       router.push(`/quiz/results?weight=${weightAnswer}&height=${heightAnswer}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSingleChoice = (value: string) => {
    setCurrentAnswer(value);
    setTimeout(() => {
       if (currentStep < quizQuestions.length - 1) {
        const otherAnswers = answers.filter(a => a.questionId !== quizQuestions[currentStep].id);
        const newAnswers = [...otherAnswers, { questionId: quizQuestions[currentStep].id, value: value }];
        setAnswers(newAnswers);
        setCurrentStep(currentStep + 1);
      }
    }, 500);
  };
  
  const handleMultipleChoice = (value: string) => {
    const newAnswers = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
    if (newAnswers.includes(value)) {
      setCurrentAnswer(newAnswers.filter((v) => v !== value));
    } else {
      setCurrentAnswer([...newAnswers, value]);
    }
  };

  const question = quizQuestions[currentStep];
  const progress = ((currentStep + 1) / quizQuestions.length) * 100;

  const renderQuestion = () => {
    switch (question.type) {
      case 'single-choice':
      case 'single-choice-column':
        return (
          <div className="w-full">
            <RadioGroup onValueChange={handleSingleChoice} value={typeof currentAnswer === 'string' ? currentAnswer : ''} className={`flex ${question.type === 'single-choice-column' ? 'flex-col' : 'flex-wrap'} justify-center gap-4`}>
              {question.options?.map((option) => {
                const IconComponent = option.icon && iconMap[option.icon] ? iconMap[option.icon] : null;
                return (
                  <div key={option.label} className="w-full">
                    <RadioGroupItem value={option.label} id={option.label} className="peer sr-only" />
                    <Label
                      htmlFor={option.label}
                      className="flex h-full cursor-pointer items-center justify-between rounded-md border-2 border-[#6c9a42] bg-[#e8f5e9] p-4 text-lg hover:bg-primary/20 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/20 [&:has([data-state=checked])]:border-primary"
                    >
                       <div className="flex items-center gap-4">
                        {IconComponent && <IconComponent className="h-6 w-6 text-primary" />}
                        {option.emoji && <span className="text-2xl">{option.emoji}</span>}
                        {option.imageUrl && <Image src={option.imageUrl} alt={option.label} width={60} height={60} className="h-auto w-16 rounded-md object-contain" />}
                         <div className="flex-1 text-left">
                          <span className={option.sublabel ? "font-bold" : ""}>{option.label}</span>
                          {option.sublabel && <p className="text-sm font-normal">{option.sublabel}</p>}
                        </div>
                      </div>
                       <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white peer-data-[state=checked]:bg-primary">
                        <ChevronRight className="h-4 w-4 text-primary peer-data-[state=checked]:text-white" />
                      </div>
                    </Label>
                  </div>
                )
            })}
            </RadioGroup>
          </div>
        );
      case 'multiple-choice':
        return (
          <div className="w-full space-y-4">
            {question.options?.map((option) => (
                <Label key={option.label} htmlFor={option.label} className="flex h-full cursor-pointer items-center justify-between rounded-md border-2 border-[#6c9a42] bg-[#e8f5e9] p-4 text-lg hover:bg-primary/20 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/20 [&:has([data-state=checked])]:border-primary">
                   <div className="flex items-center gap-4">
                     {option.emoji && <span className="text-2xl">{option.emoji}</span>}
                     {option.imageUrl && <Image src={option.imageUrl} alt={option.label} width={60} height={60} className="h-auto w-16 rounded-md object-contain" />}
                    <span className="flex-1 text-left">{option.label}</span>
                  </div>
                  <Checkbox 
                    id={option.label} 
                    onCheckedChange={() => handleMultipleChoice(option.label)}
                    checked={Array.isArray(currentAnswer) && currentAnswer.includes(option.label)}
                    className="h-6 w-6 shrink-0 rounded-md border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
                    />
                </Label>
              ))}
          </div>
        );
       case 'text':
         return (
            <div className="w-full flex flex-col items-center gap-4">
              <Input
                type="text"
                placeholder={question.placeholder}
                value={typeof currentAnswer === 'string' ? currentAnswer : ''}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                className="h-12 text-lg text-center"
                required
              />
              <p className="text-center text-sm text-gray-600">
                {question.subtitle?.replace('🔒', '🔒')}
              </p>
            </div>
         );
       case 'number':
         return (
            <Input 
              type={question.type === 'number' ? 'number' : 'text'}
              placeholder={question.placeholder} 
              value={typeof currentAnswer === 'string' ? currentAnswer : ''}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="h-12 text-lg"
              required
            />
         );
      case 'weight-slider':
        const minWeight = question.id === 11 ? 40 : 50;
        const maxWeight = question.id === 11 ? 250 : 150;
        return (
          <div className="w-full max-w-md flex flex-col items-center gap-6 text-center">
              <RadioGroup
                value={weightUnit}
                onValueChange={(value) => setWeightUnit(value as 'kg' | 'lb')}
                className="flex items-center space-x-1 rounded-full border border-gray-300 bg-gray-100 p-1"
              >
                  <RadioGroupItem value="kg" id="kg" className="sr-only" />
                  <Label htmlFor="kg" className={`cursor-pointer rounded-full px-6 py-2 transition-colors ${weightUnit === 'kg' ? 'bg-[#5a8230] text-white' : 'bg-transparent text-black'}`}>
                      kg
                  </Label>
                  <RadioGroupItem value="lb" id="lb" className="sr-only" />
                  <Label htmlFor="lb" className={`cursor-pointer rounded-full px-6 py-2 transition-colors ${weightUnit === 'lb' ? 'bg-[#5a8230] text-white' : 'bg-transparent text-black'}`}>
                      lb
                  </Label>
              </RadioGroup>
              <div className="text-5xl font-bold text-black">{weight}{weightUnit}</div>
              <Slider
                value={[weight]}
                onValueChange={(value) => setWeight(value[0])}
                min={minWeight}
                max={maxWeight}
                step={1}
                className="w-full"
              />
              <p className="text-sm text-gray-500">Arraste para ajustar</p>
              {question.options?.[1]?.sublabel && <p className="text-muted-foreground">{question.options[1].sublabel}</p>}
          </div>
        );
      case 'height-slider':
        return (
          <div className="w-full max-w-md flex flex-col items-center gap-6 text-center">
              <RadioGroup
                value={heightUnit}
                onValueChange={(value) => setHeightUnit(value as 'cm' | 'pol')}
                className="flex items-center space-x-1 rounded-full border border-gray-300 bg-gray-100 p-1"
              >
                  <RadioGroupItem value="cm" id="cm" className="sr-only" />
                  <Label htmlFor="cm" className={`cursor-pointer rounded-full px-6 py-2 transition-colors ${heightUnit === 'cm' ? 'bg-[#5a8230] text-white' : 'bg-transparent text-black'}`}>
                      cm
                  </Label>
                  <RadioGroupItem value="pol" id="pol" className="sr-only" />
                  <Label htmlFor="pol" className={`cursor-pointer rounded-full px-6 py-2 transition-colors ${heightUnit === 'pol' ? 'bg-[#5a8230] text-white' : 'bg-transparent text-black'}`}>
                      pol
                  </Label>
              </RadioGroup>
              <div className="text-5xl font-bold text-black">{height}{heightUnit}</div>
              <Slider
                value={[height]}
                onValueChange={(value) => setHeight(value[0])}
                min={140}
                max={220}
                step={1}
                className="w-full"
              />
              <p className="text-sm text-gray-500">{question.options?.[1]?.sublabel}</p>
          </div>
        );
      case 'promise':
        return (
           <div className="w-full text-center flex flex-col items-center gap-6">
            {question.imageUrl && <Image src={question.imageUrl} alt="Promise Image" width={502} height={497} className="mx-auto" data-ai-hint="woman celebrating" />}
            <p className="text-lg">
                O Mounjaro dos Pobres age enquanto{' '}
                <span style={{ color: '#0000FF' }}>você dorme</span>,{' '}
                <span style={{ color: '#e53935' }}>queimando gordura</span> de forma acelerada.
            </p>
          </div>
        );
      case 'testimonial':
        return (
          <div className="w-full max-w-lg flex flex-col gap-4 text-left">
            {question.imageUrl && <Image src={question.imageUrl} alt="Testimonial Image" width={580} height={476} className="mx-auto rounded-lg" data-ai-hint="woman smiling" />}
            <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                <div className="flex mb-2">
                  {'★★★★★'.split('').map((star, i) => <span key={i} className="text-yellow-400">{star}</span>)}
                </div>
                <p className="font-bold">{question.testimonial?.name}</p>
                <p className="text-sm text-muted-foreground mb-2">{question.testimonial?.handle}</p>
                <p className="text-sm">{question.testimonial?.text}</p>
            </div>
          </div>
        )
      case 'loading':
        return <LoadingStep onComplete={handleNext} />;
      default:
        return null;
    }
  };
  
  const isButtonDisabled = () => {
    if (question.type === 'promise' || question.type === 'testimonial') {
        return false;
    }
    if (question.type === 'loading') {
      return true; // Always disable for loading
    }
    if (['text', 'number', 'multiple-choice'].includes(question.type)) {
      return currentAnswer === null || currentAnswer === '' || (Array.isArray(currentAnswer) && currentAnswer.length === 0);
    }
    return false;
  };

  const showButton = question.buttonText && !['single-choice', 'single-choice-column', 'loading'].includes(question.type);

  const getQuestionTitle = () => {
    const titleAlignmentClass = question.type === 'testimonial' ? 'text-left' : 'text-center';
    
    const titleContent = (() => {
      switch (question.question) {
        case 'Nosso protocolo Resolve isso para você!':
          return (
            <>
              <span style={{ color: '#000000', fontWeight: 'bold' }}>Nosso protocolo</span>
              <br />
              <span style={{ color: '#28a745', fontWeight: 'bold' }}>Resolve isso para você!</span>
            </>
          );
        case 'Como o seu peso impacta sua vida?':
          return <>Como o seu peso <span style={{ color: '#6c9a42' }}>impacta sua vida?</span></>;
        case 'Qual seu nome?':
          return <span style={{ fontWeight: 'bold' }}>Qual seu nome?</span>;
        case 'Você está realmente feliz com sua aparência?':
          return <>Você está realmente <span style={{ color: '#6c9a42' }}>feliz</span> com <span style={{ color: '#e53935' }}>sua aparência?</span></>;
        case 'O que mais te impede de perder peso?':
           return <>O que mais te <span style={{ color: '#e53935' }}>impede de perder peso?</span></>;
        case 'Quais desses benefícios você gostaria de ter?':
          return <>
            <span style={{ color: '#28a745' }}>Quais desses benefícios</span>
            <span style={{ color: '#000000' }}> você gostaria de ter?</span>
          </>;
        case 'Qual é o seu peso atual?':
          return <>Qual é o seu <span style={{ color: '#28a745' }}>peso atual?</span></>;
        case 'Qual é a sua altura?':
          return <>Qual é a <span style={{ color: '#28a745' }}>sua altura?</span></>;
        case 'Qual é o seu objetivo de peso (desejado)?':
          return (
            <>
              Qual é o <span style={{ color: '#28a745' }}>seu objetivo</span>
              <br />
              de peso <span style={{ color: '#28a745' }}>(desejado)?</span>
            </>
          );
        case 'Quantas horas você dorme por noite?':
          return <>Quantas <span style={{ color: '#28a745' }}>horas</span> você dorme por noite?</>;
        case 'Quantos copos de água você bebe por dia?':
            return <><span style={{ color: '#28a745' }}>Quantos copos de água</span> você bebe por dia?</>;
        case '🔥 Histórias Reais de Transformação!':
            return <><span className="text-2xl">🔥</span> {question.question.substring(2)}</>;
        default:
          return question.question;
      }
    })();
    
    return (
        <div className={`mb-6 ${titleAlignmentClass}`}>
            <h1 className="text-3xl font-bold md:text-4xl">
              {titleContent}
            </h1>
        </div>
    );
  };
  
  const getSubtitle = () => {
      if (!question.subtitle && !(question.type === 'weight-slider' || question.type === 'height-slider')) return null;
      
      let subtitleText = question.subtitle;
      if (question.type === 'weight-slider' || question.type === 'height-slider') {
        subtitleText = question.options?.[0]?.sublabel;
      }

      if (!subtitleText) return null;
      if (question.type === 'text' && question.id !== 4) return null;


      const subtitleAlignmentClass = question.type === 'testimonial' ? 'text-left' : 'text-center justify-center';
      
      const subtitleContent = subtitleText.startsWith('📌') 
          ? <><span className="text-2xl">📌</span> {subtitleText.substring(1)}</>
          : subtitleText.startsWith('📍')
          ? <><span className="text-2xl">📍</span> {subtitleText.substring(2)}</>
          : subtitleText;

      return (
          <div className={`mb-6 ${subtitleAlignmentClass}`}>
            <p className="mt-4 text-muted-foreground md:text-lg flex items-center gap-2">
              {subtitleContent}
            </p>
          </div>
      );
  }


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="fixed top-0 left-0 right-0 z-10 bg-background pt-2">
         {currentStep > 0 && question.type !== 'loading' && (
          <button onClick={handleBack} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-primary">
            <ChevronLeft className="h-8 w-8" />
          </button>
        )}
        <div className="flex items-center justify-center">
            <Image
              src="/novologo.webp"
              alt="Mounjaro de Pobre Logo"
              width={70}
              height={70}
            />
        </div>
        {question.type !== 'loading' && (
           <Progress value={progress} className="h-2 w-full max-w-xs mx-auto" style={{backgroundColor: '#e0e0e0'}} />
        )}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-4 mt-20">
        <div className={`mx-auto w-full ${question.type === 'text' ? 'max-w-xs' : 'max-w-md'}`}>
           {question.type !== 'loading' && getQuestionTitle()}
           {question.type !== 'loading' && getSubtitle()}

          <div className={`flex items-center justify-center ${['text', 'number', 'testimonial', 'weight-slider', 'height-slider'].includes(question.type) ? 'flex-col' : ''}`}>
             {renderQuestion()}
          </div>
          
          {showButton && (
             <div className="text-center mt-8">
               <Button 
                 onClick={handleNext} 
                 disabled={isButtonDisabled()}
                 size="lg"
                 className="w-full max-w-xs h-14 text-lg bg-[#5a8230] hover:bg-[#5a8230]/90"
               >
                 {question.buttonText}
                  <ChevronRight className="h-6 w-6" />
               </Button>
             </div>
           )}

        </div>
      </div>
    </div>
  );
}


function LoadingStep({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi>()

  const testimonials = [
    '/dep1.webp',
    '/dep2.webp',
    '/dep3.webp',
    '/dep4.webp',
    '/dep5.webp',
    '/dep6.webp',
  ];

  useEffect(() => {
    const totalDuration = 11000; // 11 seconds
    const intervalTime = 100; // update every 100ms
    const totalSteps = totalDuration / intervalTime;
    const progressIncrement = 100 / totalSteps;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onComplete();
          return 100;
        }
        return prev + progressIncrement;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    if (!api) {
      return
    }

    const autoplay = setInterval(() => {
        api.scrollNext()
    }, 2000)

    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap())
    })

    return () => {
        clearInterval(autoplay)
    }
  }, [api])


  return (
    <div className="w-full max-w-md flex flex-col items-center text-center gap-6">
      <h2 className="text-xl font-bold">Aguarde enquanto preparamos o seu Mounjaro dos Pobres...</h2>
      <p className="text-muted-foreground">Analisando as suas respostas...</p>
      
      <div className="w-full flex items-center gap-2">
        <Progress value={progress} className="h-4 flex-1" style={{backgroundColor: '#e0e0e0'}} />
        <span className="font-bold text-gray-600">{Math.round(progress)}%</span>
      </div>

      <Carousel setApi={setApi} className="w-full max-w-xs">
        <CarouselContent>
          {testimonials.map((src, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                 <Image src={src} alt={`Depoimento ${index + 1}`} width={400} height={200} className="w-full h-auto rounded-lg" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
         <div className="flex justify-center gap-2 mt-4">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                currentSlide === index ? 'bg-[#6c9a42]' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}
