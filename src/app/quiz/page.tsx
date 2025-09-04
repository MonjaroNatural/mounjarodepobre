
'use client';

import { useState, useEffect, Suspense } from 'react';
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import {
  ChevronRight,
  Camera,
  HeartCrack,
  Frown,
  Hand,
  GlassWater,
  AlertCircle,
  Siren,
  Lightbulb,
  XCircle,
  Check,
} from 'lucide-react';
import { Meter } from '@/components/ui/meter';
import { trackEvent } from '@/app/actions';

const iconMap: { [key: string]: React.ElementType } = {
  Camera: Camera,
  HeartCrack: HeartCrack,
  Frown: Frown,
  Hand: Hand,
  GlassWater: GlassWater,
};

async function getClientIp(): Promise<string | null> {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) return null;
        const data = await response.json();
        return data.ip || null;
    } catch (error) {
        console.error("Could not fetch IP address.", error);
        return null;
    }
}

function QuizComponent() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  
  const [answers, setAnswers] = useState<Answer[]>(() => {
    if (typeof window !== 'undefined') {
      const savedAnswers = localStorage.getItem('quizAnswers');
      if (savedAnswers) {
        try {
          const parsed = JSON.parse(savedAnswers);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch (e) {
          localStorage.removeItem('quizAnswers');
        }
      }
    }
    return [];
  });
  
  const [currentAnswer, setCurrentAnswer] = useState< string | string[] | number | null >(null);
  const [weight, setWeight] = useState(70);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [height, setHeight] = useState(165);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'pol'>('cm');

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  useEffect(() => {
    getClientIp().then(setIpAddress);
  }, []);

  useEffect(() => {
    if (!ipAddress) return;

    // Just track the start of the quiz
    const sessionId = getCookie('my_session_id');
    trackEvent({
      eventName: 'QuizStep',
      eventTime: Math.floor(Date.now() / 1000),
      userData: {
        external_id: sessionId,
        client_user_agent: navigator.userAgent,
        client_ip_address: ipAddress
      },
      customData: {
        quiz_step: 2, // HomepageView is step 1, so quiz starts at 2
        quiz_question: 'Início do Quiz',
        quiz_answer: 'Usuário chegou na página do quiz'
      },
      event_source_url: window.location.href,
      action_source: 'website'
    });
  }, [ipAddress]);


  const sendQuizStepEvent = (question: QuizQuestion, answer: any) => {
    const external_id = getCookie('my_session_id');
    if (!external_id || !ipAddress) return;

    let formattedAnswer: string;
    if (Array.isArray(answer)) {
      formattedAnswer = answer.join(', ');
    } else {
      formattedAnswer = String(answer);
    }

    trackEvent({
      eventName: 'QuizStep',
      eventTime: Math.floor(Date.now() / 1000),
      userData: {
        external_id: external_id,
        client_user_agent: navigator.userAgent,
        client_ip_address: ipAddress,
      },
      customData: {
        quiz_step: currentStep + 3, // +3 because homepage=1, quiz-start=2, first-q=3
        quiz_question: question.question,
        quiz_answer: formattedAnswer,
      },
      event_source_url: window.location.href,
      action_source: 'website' as const,
    });
  };


  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('quizAnswers', JSON.stringify(answers));
    }
  }, [answers]);
  
  useEffect(() => {
    const question = quizQuestions[currentStep];
    if (!question) return;

    const previousAnswer = answers.find((a) => a.questionId === question.id);

    if (previousAnswer) {
      if (
        question.type === 'weight-slider' ||
        question.type === 'height-slider'
      ) {
        const value = previousAnswer.value as string;
        const matchedValue = value.match(/(\d+)/);
        if (matchedValue) {
          if (question.type === 'weight-slider') {
            setWeight(parseInt(matchedValue[0], 10));
            if (value.includes('lb')) setWeightUnit('lb');
            else setWeightUnit('kg');
          } else {
            setHeight(parseInt(matchedValue[0], 10));
            if (value.includes('pol')) setHeightUnit('pol');
            else setHeightUnit('cm');
          }
        }
      } else {
        setCurrentAnswer(previousAnswer.value);
      }
    } else {
      if (question.type === 'multiple-choice') {
        setCurrentAnswer([]);
      } else if (question.type === 'weight-slider') {
        setWeight(question.id === 11 ? 70 : question.id === 13 ? 70 : 70);
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

  useEffect(() => {
    const question = quizQuestions[currentStep];
    if (question?.type === 'loading') {
      const timer = setTimeout(() => {
        handleNext(true); // Pass a flag to indicate it's from loading
      }, 11000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleNext = (fromLoading = false) => {
    const question = quizQuestions[currentStep];
    let answerToStore: Answer | null = null;
    let answerForWebhook: any = null;

    if (question.type === 'weight-slider') {
      const value = `${weight}${weightUnit}`;
      answerToStore = { questionId: question.id, value };
      answerForWebhook = value;
    } else if (question.type === 'height-slider') {
      const value = `${height}${heightUnit}`;
      answerToStore = { questionId: question.id, value };
      answerForWebhook = value;
    } else if (
      currentAnswer !== null &&
      currentAnswer !== '' &&
      (!Array.isArray(currentAnswer) || currentAnswer.length > 0)
    ) {
      answerToStore = { questionId: question.id, value: currentAnswer };
      answerForWebhook = currentAnswer;
    } else {
      if (
        question.type === 'text' ||
        question.type === 'number' ||
        question.type === 'multiple-choice'
      ) {
        // Only block if there's no auto-advance logic
        if (!fromLoading) {
            console.warn('Answer is required');
            return;
        }
      }
    }

    if (!fromLoading) {
      sendQuizStepEvent(question, answerForWebhook);
    }

    let newAnswers = answers;
    if (answerToStore) {
      const otherAnswers = answers.filter((a) => a.questionId !== question.id);
      newAnswers = [...otherAnswers, answerToStore];
      setAnswers(newAnswers);
    }

    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const nameAnswer = (newAnswers.find((a) => a.questionId === 4)?.value as string) || '';
      const currentWeightAnswer = (newAnswers.find((a) => a.questionId === 11)?.value as string) || '';
      const desiredWeightAnswer = (newAnswers.find((a) => a.questionId === 13)?.value as string) || '';
      
      const queryParams = new URLSearchParams({
          name: nameAnswer,
          currentWeight: currentWeightAnswer,
          desiredWeight: desiredWeightAnswer
      });
      
      router.push(`/results?${queryParams.toString()}`);
    }
  };

  const handleSingleChoice = (value: string) => {
    const question = quizQuestions[currentStep];
    setCurrentAnswer(value);
    sendQuizStepEvent(question, value);

    const questionId = question.id;
    
    const otherAnswers = answers.filter((a) => a.questionId !== questionId);
    const newAnswers = [...otherAnswers, { questionId: questionId, value: value }];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentStep < quizQuestions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
         const nameAnswer = (newAnswers.find((a) => a.questionId === 4)?.value as string) || '';
        const currentWeightAnswer = (newAnswers.find((a) => a.questionId === 11)?.value as string) || '';
        const desiredWeightAnswer = (newAnswers.find((a) => a.questionId === 13)?.value as string) || '';
        
        const queryParams = new URLSearchParams({
            name: nameAnswer,
            currentWeight: currentWeightAnswer,
            desiredWeight: desiredWeightAnswer
        });
        
        router.push(`/results?${queryParams.toString()}`);
      }
    }, 150);
  };

  const handleMultipleChoice = (value: string) => {
    setCurrentAnswer((prev) => {
      const newAnswers = Array.isArray(prev) ? [...prev] : [];
      if (newAnswers.includes(value)) {
        return newAnswers.filter((v) => v !== value);
      } else {
        return [...newAnswers, value];
      }
    });
  };

  const question = quizQuestions[currentStep];
  if (!question) {
    return <div>Carregando...</div>;
  }
  const progress = ((currentStep + 1) / quizQuestions.length) * 100;

  const renderQuestion = () => {
    switch (question.type) {
      case 'single-choice':
      case 'single-choice-column':
        return (
          <div className="w-full">
            <RadioGroup
              value={typeof currentAnswer === 'string' ? currentAnswer : ''}
              className={`flex ${
                question.type === 'single-choice-column'
                  ? 'flex-col'
                  : 'flex-wrap'
              } justify-center gap-4`}
            >
              {question.options?.map((option) => {
                const IconComponent =
                  option.icon && iconMap[option.icon]
                    ? iconMap[option.icon]
                    : null;
                return (
                  <div key={option.label} className="w-full">
                    <RadioGroupItem
                      value={option.label}
                      id={option.label}
                      className="peer sr-only"
                    />
                    <Label
                      onClick={() => handleSingleChoice(option.label)}
                      htmlFor={option.label}
                      className="flex h-full cursor-pointer items-center justify-between rounded-md border-2 border-primary bg-[#e8f5e9] p-4 text-lg text-primary-foreground transition-all peer-data-[state=checked]:border-green-800 peer-data-[state=checked]:bg-green-800 peer-data-[state=checked]:text-white active:scale-[0.98] active:bg-green-800 active:text-white [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="flex items-center gap-4">
                        {IconComponent && (
                          <IconComponent className="h-6 w-6 text-primary peer-data-[state=checked]:text-white" />
                        )}
                        {option.emoji && (
                          <span className="text-2xl">{option.emoji}</span>
                        )}
                        {option.imageUrl && (
                          <Image
                            src={option.imageUrl}
                            alt={option.label}
                            width={60}
                            height={60}
                            className="h-auto w-16 rounded-md object-contain"
                          />
                        )}
                        <div className="flex-1 text-left text-black peer-data-[state=checked]:text-white">
                          <span className={option.sublabel ? 'font-bold' : ''}>
                            {option.label}
                          </span>
                          {option.sublabel && (
                            <p className="text-sm font-normal">
                              {option.sublabel}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white peer-data-[state=checked]:bg-white">
                        <ChevronRight className="h-4 w-4 text-primary peer-data-[state=checked]:text-green-800" />
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        );
      case 'single-choice-image':
        return (
          <div className="w-full">
            <RadioGroup
              value={typeof currentAnswer === 'string' ? currentAnswer : ''}
              className="flex justify-center gap-4"
            >
              {question.options?.map((option) => (
                <div key={option.label} className="flex-1">
                  <RadioGroupItem
                    value={option.label}
                    id={option.label}
                    className="peer sr-only"
                  />
                  <Label
                    onClick={() => handleSingleChoice(option.label)}
                    htmlFor={option.label}
                    className="flex h-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-[#e0eede] bg-white p-4 text-lg transition-all hover:bg-primary/10 peer-data-[state=checked]:border-green-800 peer-data-[state=checked]:bg-green-800 peer-data-[state=checked]:text-white active:scale-[0.98] active:bg-green-800 active:text-white [&:has([data-state=checked])]:border-primary"
                  >
                    {option.imageUrl && (
                      <Image
                        src={option.imageUrl}
                        alt={option.label}
                        width={200}
                        height={200}
                        className="h-auto w-full rounded-md object-contain"
                      />
                    )}
                    <span className="mt-2 text-center text-base font-medium text-black peer-data-[state=checked]:text-white">
                      {option.label}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      case 'multiple-choice':
        return (
          <div className="w-full space-y-4">
            {question.options?.map((option) => {
              const isChecked = Array.isArray(currentAnswer) && currentAnswer.includes(option.label);
              return (
                <div key={option.label}>
                  <Label
                    htmlFor={option.label}
                    data-state={isChecked ? 'checked' : 'unchecked'}
                    className="flex h-full cursor-pointer items-center justify-between rounded-md border-2 border-primary bg-[#e8f5e9] p-4 text-lg transition-all hover:bg-primary/20 data-[state=checked]:border-green-800 data-[state=checked]:bg-green-800 data-[state=checked]:text-white active:scale-[0.98] active:bg-green-800 active:text-white"
                  >
                     <div className="flex items-center gap-4">
                        <Checkbox
                          id={option.label}
                          checked={isChecked}
                          onCheckedChange={() => handleMultipleChoice(option.label)}
                          className="sr-only peer"
                        />
                        {option.emoji && (
                          <span className="text-2xl">{option.emoji}</span>
                        )}
                        {option.imageUrl && (
                          <Image
                            src={option.imageUrl}
                            alt={option.label}
                            width={60}
                            height={60}
                            className="h-auto w-16 rounded-md object-contain"
                          />
                        )}
                        <span className={`flex-1 text-left ${isChecked ? 'text-white' : 'text-black'}`}>{option.label}</span>
                     </div>
                     <div className="flex h-6 w-6 items-center justify-center rounded-md border-2 border-primary bg-white peer-data-[state=checked]:bg-white data-[state=checked]:bg-white data-[state=checked]:text-green-800">
                        <Check className={`h-4 w-4 ${isChecked ? 'text-green-800' : 'text-transparent'}`} />
                      </div>
                  </Label>
                </div>
              )
            })}
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
              <Label
                htmlFor="kg"
                className={`cursor-pointer rounded-full px-6 py-2 transition-colors ${
                  weightUnit === 'kg'
                    ? 'bg-[#5a8230] text-white'
                    : 'bg-transparent text-black'
                }`}
              >
                kg
              </Label>
              <RadioGroupItem value="lb" id="lb" className="sr-only" />
              <Label
                htmlFor="lb"
                className={`cursor-pointer rounded-full px-6 py-2 transition-colors ${
                  weightUnit === 'lb'
                    ? 'bg-[#5a8230] text-white'
                    : 'bg-transparent text-black'
                }`}
              >
                lb
              </Label>
            </RadioGroup>
            <div className="text-5xl font-bold text-black">
              {weight}
              {weightUnit}
            </div>
            <Slider
              value={[weight]}
              onValueChange={(value) => setWeight(value[0])}
              min={minWeight}
              max={maxWeight}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-gray-500">Arraste para ajustar</p>
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
              <Label
                htmlFor="cm"
                className={`cursor-pointer rounded-full px-6 py-2 transition-colors ${
                  heightUnit === 'cm'
                    ? 'bg-[#5a8230] text-white'
                    : 'bg-transparent text-black'
                }`}
              >
                cm
              </Label>
              <RadioGroupItem value="pol" id="pol" className="sr-only" />
              <Label
                htmlFor="pol"
                className={`cursor-pointer rounded-full px-6 py-2 transition-colors ${
                  heightUnit === 'pol'
                    ? 'bg-[#5a8230] text-white'
                    : 'bg-transparent text-black'
                }`}
              >
                pol
              </Label>
            </RadioGroup>
            <div className="text-5xl font-bold text-black">
              {height}
              {heightUnit}
            </div>
            <Slider
              value={[height]}
              onValueChange={(value) => setHeight(value[0])}
              min={140}
              max={220}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-gray-500">
              {question.options?.[1]?.sublabel}
            </p>
          </div>
        );
      case 'promise':
        return (
          <div className="w-full text-center flex flex-col items-center gap-6">
            {question.imageUrl && (
              <Image
                src={question.imageUrl}
                alt="Promise Image"
                width={502}
                height={497}
                className="mx-auto h-auto w-auto"
                data-ai-hint="woman celebrating"
              />
            )}
            <p className="text-lg">
              O Mounjaro dos Pobres age enquanto{' '}
              <span style={{ color: '#0000FF' }}>você dorme</span>,{' '}
              <span style={{ color: '#e53935' }}>queimando gordura</span> de
              forma acelerada.
            </p>
          </div>
        );
      case 'testimonial':
        return (
          <div className="w-full max-w-lg flex flex-col gap-4 text-left">
            {question.imageUrl && (
              <Image
                src={question.imageUrl}
                alt="Testimonial Image"
                width={580}
                height={476}
                className="mx-auto rounded-lg h-auto w-auto"
                data-ai-hint="woman smiling"
              />
            )}
            <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
              <div className="flex mb-2">
                {'★★★★★'.split('').map((star, i) => (
                  <span key={i} className="text-yellow-400">
                    {star}
                  </span>
                ))}
              </div>
              <p className="font-bold">{question.testimonial?.name}</p>
              <p className="text-sm text-muted-foreground mb-2">
                {question.testimonial?.handle}
              </p>
              <p className="text-sm">{question.testimonial?.text}</p>
            </div>
          </div>
        );
      case 'loading':
        return <LoadingStep />;
      default:
        return null;
    }
  };

  const isButtonDisabled = () => {
    if (
      question.type === 'promise' ||
      question.type === 'testimonial'
    ) {
      return false;
    }
    if (question.type === 'loading') {
      return true;
    }
    if (['text', 'number', 'multiple-choice'].includes(question.type)) {
      return (
        currentAnswer === null ||
        currentAnswer === '' ||
        (Array.isArray(currentAnswer) && currentAnswer.length === 0)
      );
    }
    return false;
  };

  const showButton =
    question.buttonText &&
    !['single-choice', 'single-choice-column', 'single-choice-image', 'loading'].includes(
      question.type,
    );

  const getQuestionTitle = () => {
    const titleAlignmentClass =
      question.type === 'testimonial' ? 'text-left' : 'text-center';

    const titleContent = (() => {
      switch (question.question) {
        case 'Nosso protocolo Resolve isso para você!':
          return (
            <>
              <span style={{ color: '#000000', fontWeight: 'bold' }}>
                Nosso protocolo
              </span>
              <br />
              <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                Resolve isso para você!
              </span>
            </>
          );
        case 'Como o seu peso impacta sua vida?':
          return (
            <>
              Como o seu peso{' '}
              <span style={{ color: '#6c9a42' }}>impacta sua vida?</span>
            </>
          );
        case 'Qual seu nome?':
          return <span style={{ fontWeight: 'bold' }}>Qual seu nome?</span>;
        case 'Você está realmente feliz com sua aparência?':
          return (
            <>
              Você está realmente{' '}
              <span style={{ color: '#6c9a42' }}>feliz</span> com{' '}
              <span style={{ color: '#e53935' }}>sua aparência?</span>
            </>
          );
        case 'O que mais te impede de perder peso?':
          return (
            <>
              O que mais te{' '}
              <span style={{ color: '#e53935' }}>impede de perder peso?</span>
            </>
          );
        case 'Quais desses benefícios você gostaria de ter?':
          return (
            <>
              <span style={{ color: '#28a745' }}>
                Quais desses benefícios
              </span>
              <span style={{ color: '#000000' }}>
                {' '}
                você gostaria de ter?
              </span>
            </>
          );
        case 'Qual é o seu peso atual?':
          return (
            <>
              Qual é o seu{' '}
              <span style={{ color: '#28a745' }}>peso atual?</span>
            </>
          );
        case 'Qual é a sua altura?':
          return (
            <>
              Qual é a <span style={{ color: '#28a745' }}>sua altura?</span>
            </>
          );
        case 'Qual é o seu objetivo de peso (desejado)?':
          return (
            <>
              Qual é o <span style={{ color: '#28a745' }}>seu objetivo</span>
              <br />
              de peso <span style={{ color: '#28a745' }}>(desejado)?</span>
            </>
          );
        case 'Quantas horas você dorme por noite?':
          return (
            <>
              Quantas <span style={{ color: '#28a745' }}>horas</span> você dorme
              por noite?
            </>
          );
        case 'Quantos copos de água você bebe por dia?':
          return (
            <>
              Quantos <span style={{ color: '#28a745' }}>copos de água</span>{' '}
              você bebe por dia?
            </>
          );
        case 'Qual é o corpo dos seus sonhos?':
          return (
            <>
              Qual é o{' '}
              <span style={{ color: '#28a745' }}>corpo dos seus sonhos?</span>
            </>
          );
        case '🔥 Histórias Reais de Transformação!':
          return (
            <>
              <span className="text-2xl">🔥</span>{' '}
              {question.question.substring(2)}
            </>
          );
        default:
          return question.question;
      }
    })();

    return (
      <div className={`mb-6 ${titleAlignmentClass}`}>
        <h1 className="text-3xl font-bold md:text-4xl">{titleContent}</h1>
      </div>
    );
  };

  const getSubtitle = () => {
    if (
      !question.subtitle &&
      !(
        question.type === 'weight-slider' || question.type === 'height-slider'
      )
    )
      return null;

    let subtitleText = question.subtitle;
    if (
      question.type === 'weight-slider' ||
      question.type === 'height-slider'
    ) {
      subtitleText = question.options?.[0]?.sublabel;
    }

    if (!subtitleText) return null;

    const subtitleAlignmentClass =
      question.type === 'testimonial'
        ? 'text-left'
        : 'text-center justify-center';

    const subtitleContent = subtitleText.startsWith('📌') ? (
      <>
        <span className="text-2xl">📌</span> {subtitleText.substring(1)}
      </>
    ) : subtitleText.startsWith('📍') ? (
      <>
        <span className="text-2xl">📍</span> {subtitleText.substring(2)}
      </>
    ) : (
      subtitleText
    );

    return (
      <div className={`mb-6 ${subtitleAlignmentClass}`}>
        <p className="mt-4 text-muted-foreground md:text-lg flex items-center gap-2">
          {subtitleContent}
        </p>
      </div>
    );
  };

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
          {(question.type !== 'loading') && (
            <Progress
              value={progress}
              className="h-2 w-full max-w-xs mt-2"
              style={{ backgroundColor: '#e0e0e0' }}
            />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-4 mt-24">
        <div
          className={`mx-auto w-full ${
            question.type === 'text'
              ? 'max-w-xs'
              : question.type === 'single-choice-image' ? 'max-w-xl' : 'max-w-md'
          }`}
        >
          {question.type !== 'loading' && getQuestionTitle()}
          {question.type !== 'loading' && getSubtitle()}

          <div
            className={`flex items-center justify-center ${
              [
                'text',
                'number',
                'testimonial',
                'weight-slider',
                'height-slider',
              ].includes(question.type)
                ? 'flex-col'
                : ''
            }`}
          >
            {renderQuestion()}
          </div>

          {showButton && (
            <div className="text-center mt-8">
              <Button
                onClick={() => handleNext()}
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

export default function QuizPage() {
  return (
    <Suspense fallback={<div>Carregando quiz...</div>}>
      <QuizComponent />
    </Suspense>
  );
}

function LoadingStep() {
  const [progress, setProgress] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  const testimonials = [
    { src: '/dep1.webp', text: 'Muito bom! Recomendo, meu apetite diminui muito e já perdi 7kg nos últimos 11 dias.' },
    { src: '/dep4.webp', text: 'depois do mounjaro dos pobres, parece até que eu rejuvenesci 20 anos kkkk me sinto ótima, valeu super a pena, vcs tão de parabéns!' },
    { src: '/dep2.webp', text: 'Pra mim valeu a pena, pq eu tinha muito inchaço na barriga, usei por 1 mês e a pochete foi embora! O produto maravilhoso meu Deus 🥺' },
  ];

  useEffect(() => {
    const totalDuration = 11000;
    const intervalTime = 100;
    let elapsedTime = 0;

    const interval = setInterval(() => {
      elapsedTime += intervalTime;
      const newProgress = (elapsedTime / totalDuration) * 100;

      if (newProgress >= 100) {
        setProgress(100);
        clearInterval(interval);
      } else {
        setProgress(newProgress);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    const autoplay = setInterval(() => {
      api.scrollNext();
    }, 2000);

    api.on('select', () => {
      setCurrentSlide(api.selectedScrollSnap());
    });

    return () => {
      clearInterval(autoplay);
    };
  }, [api]);

  return (
    <div className="w-full max-w-md flex flex-col items-center text-center gap-6">
      <h2 className="text-xl font-bold">
        Aguarde enquanto preparamos o seu Mounjaro dos Pobres...
      </h2>
      <p className="text-muted-foreground">Analisando as suas respostas...</p>

      <div className="w-full flex items-center gap-2">
        <Progress
          value={progress}
          className="h-4 flex-1"
          style={{ backgroundColor: '#e0e0e0' }}
        />
        <span className="font-bold text-gray-600">
          {Math.round(progress)}%
        </span>
      </div>

      <Carousel setApi={setApi} className="w-full max-w-xs">
        <CarouselContent>
          {testimonials.map((testimonial, index) => (
            <CarouselItem key={index}>
              <div className="p-1 flex flex-col items-center gap-4">
                <Image
                  src={testimonial.src}
                  alt={`Depoimento ${index + 1}`}
                  width={400}
                  height={200}
                  className="w-full h-auto rounded-lg"
                />
                <p className="text-sm text-gray-700 italic">"{testimonial.text}"</p>
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
