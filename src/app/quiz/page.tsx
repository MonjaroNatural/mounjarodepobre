
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { quizQuestions, QuizQuestion, Answer } from '@/data/quiz';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { ChevronRight, ChevronLeft, Camera, HeartCrack, Frown, Hand, Clock, Lock } from 'lucide-react';

const iconMap: { [key: string]: React.ElementType } = {
  Camera: Camera,
  HeartCrack: HeartCrack,
  Frown: Frown,
  Hand: Hand,
  Clock: Clock,
};


export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    // When step changes, try to find a previous answer for this step
    const previousAnswer = answers.find(a => a.questionId === quizQuestions[currentStep].id);
    if (previousAnswer) {
      setCurrentAnswer(previousAnswer.value);
    } else {
      const question = quizQuestions[currentStep];
      // For multiple choice, initialize with an empty array
      if (question.type === 'multiple-choice') {
        setCurrentAnswer([]);
      } else {
        setCurrentAnswer(null); // Reset for other types
      }
    }
  }, [currentStep, answers]);


  const handleNext = () => {
    const question = quizQuestions[currentStep];
    // For promise type, we just advance
    if (question.type === 'promise' || question.type === 'testimonial' || question.type === 'loading') {
       if (currentStep < quizQuestions.length - 1) {
            setCurrentStep(currentStep + 1);
        }
        return;
    }
    
    if (currentAnswer !== null && currentAnswer !== '' && (!Array.isArray(currentAnswer) || currentAnswer.length > 0)) {
      // Filter out any previous answer for this question before adding the new one
      const otherAnswers = answers.filter(a => a.questionId !== quizQuestions[currentStep].id);
      const newAnswers = [...otherAnswers, { questionId: quizQuestions[currentStep].id, value: currentAnswer }];
      setAnswers(newAnswers);
    } else {
       // Maybe show a message to the user that an answer is required for this question type
       if(question.type === 'text' || question.type === 'number' || question.type === 'multiple-choice'){
         // You could show a toast or alert here
         console.warn("Answer is required");
         return;
       }
    }

    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // TODO: Handle quiz completion, maybe redirect to a results page
      console.log('Quiz finished', answers);
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
        // Filter out any previous answer for this question before adding the new one
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
       case 'number':
         return (
          <div className="w-full max-w-md flex flex-col items-center gap-4">
             {question.id === 4 ? (
               <>
                 <Input 
                   type="text"
                   placeholder={question.placeholder} 
                   value={typeof currentAnswer === 'string' ? currentAnswer : ''}
                   onChange={(e) => setCurrentAnswer(e.target.value)}
                   className="h-12 text-lg"
                   required
                 />
                 <p className="text-center text-sm text-gray-600">
                   {question.subtitle}
                 </p>
               </>
             ) : (
               <>
                  <Input 
                    type={question.type === 'number' ? 'number' : 'text'}
                    placeholder={question.placeholder} 
                    value={typeof currentAnswer === 'string' ? currentAnswer : ''}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    className="h-12 text-lg"
                    required
                  />
                  {question.subtitle && 
                     <p className="text-center text-sm text-gray-600 flex items-center gap-1">
                         {question.subtitle}
                     </p>}
                </>
              )}
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
  
  const needsAnswer = ['text', 'number', 'multiple-choice'].includes(question.type);
  const isButtonDisabled = needsAnswer && (currentAnswer === null || currentAnswer === '' || (Array.isArray(currentAnswer) && currentAnswer.length === 0));
  const showButton = question.buttonText && (question.type !== 'single-choice' && question.type !== 'single-choice-column');

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
          return <>Qual seu <span style={{ fontWeight: 'bold' }}>nome?</span></>;
        case 'Você está realmente feliz com sua aparência?':
          return <>Você está realmente <span style={{ color: '#6c9a42' }}>feliz</span> com <span style={{ color: '#e53935' }}>sua aparência?</span></>;
        case 'O que mais te impede de perder peso?':
           return <>O que mais te <span style={{ color: '#e53935' }}>impede de perder peso?</span></>;
        case 'Quais desses benefícios você gostaria de ter?':
          return <>
            <span style={{ color: '#28a745' }}>Quais desses benefícios</span>
            <span style={{ color: '#000000' }}> você gostaria de ter?</span>
          </>;
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
      if (!question.subtitle) return null;
      if (['promise', 'text', 'number'].includes(question.type)) return null;

      const subtitleAlignmentClass = question.type === 'testimonial' ? 'text-left' : 'text-center justify-center';
      
      return (
          <div className={`mb-6 ${subtitleAlignmentClass}`}>
            <p className="mt-4 text-muted-foreground md:text-lg flex items-center gap-2">
              {question.subtitle}
            </p>
          </div>
      );
  }


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="fixed top-0 left-0 right-0 z-10 bg-background pt-2">
         {currentStep > 0 && (
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
        <Progress value={progress} className="h-2 w-full max-w-xs mx-auto" style={{backgroundColor: '#e0e0e0'}} />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-4 mt-20">
        <div className="mx-auto w-full max-w-md">
           {getQuestionTitle()}
           {getSubtitle()}

          <div className={`flex items-center justify-center ${question.type === 'text' || question.type === 'number' || question.type === 'testimonial' ? 'flex-col' : ''}`}>
            {renderQuestion()}
          </div>
          
          {showButton && (
             <div className="text-center mt-8">
               <Button 
                 onClick={handleNext} 
                 disabled={isButtonDisabled && !(question.type === 'promise' || question.type === 'testimonial')}
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

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onComplete();
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="w-full max-w-md">
      <Progress value={progress} />
    </div>
  );
}
