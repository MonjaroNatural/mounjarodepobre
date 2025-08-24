'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
} from 'lucide-react';
import { Meter } from '@/components/ui/meter';

const iconMap: { [key: string]: React.ElementType } = {
  Camera: Camera,
  HeartCrack: HeartCrack,
  Frown: Frown,
  Hand: Hand,
  GlassWater: GlassWater,
};

type ImcCategory = 'Abaixo do peso' | 'Normal' | 'Sobrepeso' | 'Obesidade';

const getImcCategory = (imc: number): ImcCategory => {
  if (imc < 18.5) return 'Abaixo do peso';
  if (imc < 25) return 'Normal';
  if (imc < 30) return 'Sobrepeso';
  return 'Obesidade';
};

const calculateImc = (answers: Answer[]): { imc: number; category: ImcCategory } => {
    const weightStr = (answers.find((a) => a.questionId === 11)?.value as string) || '70kg';
    const heightStr = (answers.find((a) => a.questionId === 12)?.value as string) || '165cm';

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


function QuizComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL or to default
  const initialStep = searchParams.has('step') ? parseInt(searchParams.get('step') as string, 10) : 0;
  const [currentStep, setCurrentStep] = useState(initialStep);
  
  const [answers, setAnswers] = useState<Answer[]>(() => {
    if (typeof window !== 'undefined') {
      const savedAnswers = localStorage.getItem('quizAnswers');
      return savedAnswers ? JSON.parse(savedAnswers) : [];
    }
    return [];
  });
  
  const [currentAnswer, setCurrentAnswer] = useState< string | string[] | number | null >(null);
  const [weight, setWeight] = useState(70);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [height, setHeight] = useState(165);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'pol'>('cm');

  useEffect(() => {
    // Save answers to localStorage whenever they change
    if (typeof window !== 'undefined') {
      localStorage.setItem('quizAnswers', JSON.stringify(answers));
    }
  }, [answers]);
  
  // Effect to update URL when step changes
  useEffect(() => {
    const question = quizQuestions[currentStep];
    if (!question) return;

    let url = `/quiz?step=${currentStep}`;
    if (question.type === 'results') {
        const { category } = calculateImc(answers);
        url += `&imcCategory=${encodeURIComponent(category)}`;
    }
    router.replace(url, { scroll: false });
    
  }, [currentStep, answers, router]);

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
        handleNext();
      }, 11000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleNext = () => {
    const question = quizQuestions[currentStep];
    let answerToStore: Answer | null = null;

    if (question.type === 'weight-slider') {
      const value = `${weight}${weightUnit}`;
      answerToStore = { questionId: question.id, value };
    } else if (question.type === 'height-slider') {
      const value = `${height}${heightUnit}`;
      answerToStore = { questionId: question.id, value };
    } else if (
      currentAnswer !== null &&
      currentAnswer !== '' &&
      (!Array.isArray(currentAnswer) || currentAnswer.length > 0)
    ) {
      answerToStore = { questionId: question.id, value: currentAnswer };
    } else {
      if (
        question.type === 'text' ||
        question.type === 'number' ||
        question.type === 'multiple-choice'
      ) {
        console.warn('Answer is required');
        return;
      }
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
      // Last step, navigate to offer
      const nameAnswer =
        (newAnswers.find((a) => a.questionId === 4)?.value as string) || '';
      const currentWeightAnswer =
        (newAnswers.find((a) => a.questionId === 11)?.value as string) || '';
      const desiredWeightAnswer =
        (newAnswers.find((a) => a.questionId === 13)?.value as string) || '';
      
      const queryParams = new URLSearchParams({
          name: nameAnswer,
          currentWeight: currentWeightAnswer,
          desiredWeight: desiredWeightAnswer
      });
      
      router.push(`/offer?${queryParams.toString()}`);
    }
  };

  const handleSingleChoice = (value: string) => {
    const question = quizQuestions[currentStep];
    setCurrentAnswer(value);
    const questionId = question.id;
    const otherAnswers = answers.filter((a) => a.questionId !== questionId);
    const newAnswers = [...otherAnswers, { questionId: questionId, value: value }];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (question.id === 16) {
         const nameAnswer = (newAnswers.find((a) => a.questionId === 4)?.value as string) || '';
         const currentWeightAnswer = (newAnswers.find((a) => a.questionId === 11)?.value as string) || '';
         const desiredWeightAnswer = (newAnswers.find((a) => a.questionId === 13)?.value as string) || '';

         const queryParams = new URLSearchParams({
             name: nameAnswer,
             currentWeight: currentWeightAnswer,
             desiredWeight: desiredWeightAnswer
         });
         
         router.push(`/offer?${queryParams.toString()}`);
         return;
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

        router.push(`/offer?${queryParams.toString()}`);
      }
    }, 150);
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
              className="flex flex-wrap justify-center gap-4"
            >
              {question.options?.map((option) => (
                <div key={option.label} className="w-full max-w-[150px]">
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
                        width={120}
                        height={120}
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
                <Label
                  key={option.label}
                  htmlFor={option.label}
                  data-state={isChecked ? 'checked' : 'unchecked'}
                  className="flex h-full cursor-pointer items-center justify-between rounded-md border-2 border-primary bg-[#e8f5e9] p-4 text-lg transition-all hover:bg-primary/20 data-[state=checked]:border-green-800 data-[state=checked]:bg-green-800 data-[state=checked]:text-white active:scale-[0.98] active:bg-green-800 active:text-white"
                  onClick={() => handleMultipleChoice(option.label)}
                >
                  <div className="flex items-center gap-4">
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
                  <Checkbox
                    id={option.label}
                    checked={isChecked}
                    className="h-6 w-6 shrink-0 rounded-md border-2 border-primary bg-white data-[state=checked]:bg-white data-[state=checked]:text-green-800"
                  />
                </Label>
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
                className="mx-auto"
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
                className="mx-auto rounded-lg"
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
        return <LoadingStep onComplete={handleNext} />;
      case 'results':
        const imcCategory = searchParams.get('imcCategory') as ImcCategory | null;
        return <ResultsStep answers={answers} onNext={handleNext} imcCategory={imcCategory} />;
      default:
        return null;
    }
  };

  const isButtonDisabled = () => {
    if (
      question.type === 'promise' ||
      question.type === 'testimonial' ||
      question.type === 'results'
    ) {
      return false;
    }
    if (question.type === 'loading') {
      return true; // Always disable for loading
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
          />
          {(question.type !== 'loading' && question.type !== 'results') && (
            <Progress
              value={progress}
              className="h-2 w-full max-w-xs mt-2"
              style={{ backgroundColor: '#e0e0e0' }}
            />
          )}
          {question.type === 'results' && (
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
              : question.type === 'results'
              ? 'max-w-2xl'
              : 'max-w-md'
          }`}
        >
          {question.type !== 'loading' &&
            question.type !== 'results' &&
            getQuestionTitle()}
          {question.type !== 'loading' &&
            question.type !== 'results' &&
            getSubtitle()}

          <div
            className={`flex items-center justify-center ${
              [
                'text',
                'number',
                'testimonial',
                'weight-slider',
                'height-slider',
                'results',
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

export default function QuizPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <QuizComponent />
    </Suspense>
  );
}

function LoadingStep({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  const testimonials = [
    { src: '/dep1.webp', text: 'Muito bom! Recomendo, meu apetite diminui muito e já perdi 7kg nos últimos 11 dias.' },
    { src: '/dep2.webp', text: 'Pra mim valeu a pena, pq eu tinha muito inchaço na barriga, usei por 1 mês e a pochete foi embora! O produto maravilhoso meu Deus 🥺' },
    { src: '/dep33.webp', text: 'Sou muito ansiosa e já tentei de tudo pra emagrecer. Já fiz treino em casa, tomei pílulas mas nunca adiantava, o pouco que perdia voltava muito rápido. Vi esse mounjaro dos pobres Instagram e comecei a tomar todos os dias do jeito certo, só ai que comecei a emagrecer de verdade. Perdi 15 kg em menos de 3 meses, sem passar fome e sem ter que ficar fazendo exercício igual uma louca. E ainda melhorou minha ansiedade, parei de descontar na comida e hoje consigo me controlar totalmente. Super recomendo!!😘😘' },
    { src: '/dep4.webp', text: 'depois do mounjaro dos pobres, parece até que eu rejuvenesci 20 anos kkkk me sinto ótima, valeu super a pena, vcs tão de parabéns!' },
    { src: '/dep5.webp', text: 'perdi 16kg em 2 meses! 😍 😍 feliz demais, pra mim valeu a pena KKKKK' },
    { src: '/dep6.webp', text: 'A maior motivação é ver aquela roupa que não cabia mais em você voltar a caber, sério, sua autoestima vai pra lua, recomendo demais meninas.' },
    { src: '/dep7.webp', text: 'Eu achava quase impossível eu perder peso depois dos 30. Mas ai eu conheci essa receita do mounjaro de pobre, resultado depois de 5 meses? perdi 37 kilos! Fiquei parecendo uma menininha😊❤' },
    { src: '/dep8.webp', text: 'perdi 16 kilos usando o mounjaro de pobre, fiquei assustada com o tanto que emagreci em 1 mês' },
  ];

  useEffect(() => {
    const totalDuration = 11000; // 11 seconds
    const intervalTime = 100; // update every 100ms
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

function ResultsStep({ answers, onNext, imcCategory }: { answers: Answer[]; onNext: () => void; imcCategory: ImcCategory | null }) {
  const name = (answers.find((a) => a.questionId === 4)?.value as string) || 'Olá';
  const { imc, category } = calculateImc(answers);
  const finalCategory = imcCategory || category;

  const markerPositions: Record<ImcCategory, string> = {
    'Abaixo do peso': '12.5%',
    'Normal': '37.5%',
    'Sobrepeso': '62.5%',
    'Obesidade': '87.5%',
  };

  const markerPosition = markerPositions[finalCategory];

  return (
    <div className="container mx-auto max-w-2xl bg-white p-4 text-center">
      <div className="space-y-6">
        <h2 className="text-left text-xl font-bold">
          {name}, aqui está a análise do seu perfil:
        </h2>

        <div className="rounded-lg bg-[#e8f5e9] p-4 text-center">
          <p className="font-medium">
            Seu IMC (Índice de Massa Corporal) é:{' '}
            <span className="font-bold">{imc}</span> -{' '}
            <span className="font-bold">{finalCategory}</span>
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
        <h1 className="text-2xl font-bold">Veja a transformação da Silvia!</h1>
        <Image
          src="/silvia.webp"
          alt="Transformação da Silvia"
          width={580}
          height={400}
          className="mx-auto rounded-lg"
          data-ai-hint="woman before after weight loss"
        />
        <p className="text-gray-600">
          A partir dos dados coletados e do resultado do seu IMC, nós elaboramos
          um programa de acompanhamento individual para que você alcance seus
          resultados no menor tempo possível, com a melhor qualidade de vida
          projetada de acordo com seus objetivos — em apenas 4 semanas.
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
      </div>
       <div className="text-center mt-8">
        <Button
          onClick={onNext}
          size="lg"
          className="w-full max-w-xs h-14 text-lg bg-[#5a8230] hover:bg-[#5a8230]/90"
        >
          Continuar
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
