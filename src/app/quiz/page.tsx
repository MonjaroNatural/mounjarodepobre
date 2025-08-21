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

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[] | null>(null);
  const router = useRouter();

  const handleNext = () => {
    if (currentAnswer !== null) {
      const newAnswers = [...answers, { questionId: quizQuestions[currentStep].id, value: currentAnswer }];
      setAnswers(newAnswers);
    }

    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
      setCurrentAnswer(null);
    } else {
      // TODO: Handle quiz completion, maybe redirect to a results page
      console.log('Quiz finished', answers);
    }
  };

  const handleSingleChoice = (value: string) => {
    setCurrentAnswer(value);
    setTimeout(() => {
       if (currentStep < quizQuestions.length - 1) {
        setCurrentStep(currentStep + 1);
        setCurrentAnswer(null);
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

  const renderQuestion = () => {
    switch (question.type) {
      case 'single-choice':
      case 'single-choice-column':
        return (
          <div className="w-full">
            <RadioGroup onValueChange={handleSingleChoice} className={`flex ${question.type === 'single-choice-column' ? 'flex-col' : 'flex-wrap'} justify-center gap-4`}>
              {question.options?.map((option) => (
                <div key={option.label} className="w-full md:w-auto">
                  <RadioGroupItem value={option.label} id={option.label} className="peer sr-only" />
                  <Label
                    htmlFor={option.label}
                    className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    {option.label}
                    {option.sublabel && <span className="mt-2 text-sm text-muted-foreground">{option.sublabel}</span>}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      case 'multiple-choice':
        return (
          <div className="w-full space-y-4">
            {question.options?.map((option) => (
                <div key={option.label} className="flex items-center space-x-2 rounded-md border p-4">
                  <Checkbox 
                    id={option.label} 
                    onCheckedChange={() => handleMultipleChoice(option.label)}
                    checked={Array.isArray(currentAnswer) && currentAnswer.includes(option.label)}
                    />
                  <Label htmlFor={option.label} className="w-full cursor-pointer">{option.label}</Label>
                </div>
              ))}
          </div>
        );
      case 'text':
      case 'number':
        return (
          <Input 
            type={question.type === 'number' ? 'number' : 'text'}
            placeholder={question.placeholder} 
            onChange={(e) => setCurrentAnswer(e.target.value)}
            className="max-w-md text-center"
            />
        );
      case 'promise':
        return (
           <div className="w-full text-center">
            {question.imageUrl && <Image src={question.imageUrl} alt="Promise Image" width={300} height={200} className="mx-auto mb-4" data-ai-hint="woman celebrating" />}
            <p className="text-lg">{question.subtitle}</p>
          </div>
        );
      case 'testimonial':
        return (
          <div className="w-full max-w-lg rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <div className="mb-4 flex justify-between items-center">
               <p className="font-bold text-sm text-muted-foreground">{question.testimonial?.title}</p>
               <div className="flex">
                {'★★★★★'.split('').map((star, i) => <span key={i} className="text-yellow-400">{star}</span>)}
               </div>
            </div>
            <div className="mb-4 flex gap-4">
              <Image src={question.testimonial?.beforeImageUrl || ''} alt="Before" width={150} height={150} className="rounded-md" data-ai-hint="woman portrait" />
              <Image src={question.testimonial?.afterImageUrl || ''} alt="After" width={150} height={150} className="rounded-md" data-ai-hint="fit woman" />
            </div>
            <p className="font-bold">{question.testimonial?.name}</p>
            <p className="text-sm text-muted-foreground mb-2">{question.testimonial?.handle}</p>
            <p className="text-sm">{question.testimonial?.text}</p>
          </div>
        )
      case 'loading':
        return <LoadingStep onComplete={handleNext} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center">
            <h1 className="text-2xl font-bold md:text-3xl">{question.question}</h1>
            {question.subtitle && <p className="mt-2 text-muted-foreground md:text-lg">{question.subtitle}</p>}
        </div>

        <div className="my-8 flex items-center justify-center">
          {renderQuestion()}
        </div>

        {question.buttonText && (
          <div className="text-center">
            <Button onClick={handleNext} disabled={currentAnswer === null || (Array.isArray(currentAnswer) && currentAnswer.length === 0)}>
              {question.buttonText}
            </Button>
          </div>
        )}
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