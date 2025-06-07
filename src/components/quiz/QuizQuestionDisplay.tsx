
"use client";

import type { QuizQuestionType } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateImageFromQuestion } from '@/ai/flows/generate-image-from-question'; 
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface QuizQuestionDisplayProps {
  questionData: QuizQuestionType; 
  onAnswer: (answer: string, isCorrect: boolean) => void;
  questionNumber: number;
  totalQuestions: number;
}

export function QuizQuestionDisplay({ questionData, onAnswer, questionNumber, totalQuestions }: QuizQuestionDisplayProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  
  const currentQuestionIdRef = useRef<string | null>(null); 
  const isFetchingImageRef = useRef(false); 

  useEffect(() => {
    setShowCorrectAnimation(false); // Reset animation state for new questions

    if (!questionData || !questionData.id || !questionData.question) {
        setImageUrl(null);
        setImageLoading(false);
        setImageError(true);
        currentQuestionIdRef.current = null;
        isFetchingImageRef.current = false;
        return;
    }

    const uniqueQuestionKey = `${questionData.id}||${questionData.question}`;

    if (currentQuestionIdRef.current !== uniqueQuestionKey) {
        currentQuestionIdRef.current = uniqueQuestionKey;
        setSelectedAnswer(null);
        setIsAnswered(false);
        setImageUrl(null);
        setImageLoading(true); 
        setImageError(false);
        isFetchingImageRef.current = false; 
    }

    if (currentQuestionIdRef.current === uniqueQuestionKey && (!imageUrl || imageError) && !isFetchingImageRef.current) {
        isFetchingImageRef.current = true;
        setImageLoading(true); 
        setImageError(false); 

        generateImageFromQuestion({ questionText: questionData.question })
            .then(response => {
                if (currentQuestionIdRef.current === uniqueQuestionKey) { 
                    setImageUrl(response.imageUrl);
                }
            })
            .catch(err => {
                console.error("Erro ao gerar imagem:", err);
                if (currentQuestionIdRef.current === uniqueQuestionKey) { 
                    setImageError(true);
                }
            })
            .finally(() => {
                if (currentQuestionIdRef.current === uniqueQuestionKey) { 
                    setImageLoading(false);
                }
                // Don't reset isFetchingImageRef.current here if the fetch was for the current question,
                // to prevent re-fetch if component re-renders before image is fully set.
                // It gets reset when a new question arrives (uniqueQuestionKey changes).
                // Or reset it if the specific fetch completed (success or error) for this question.
                 if (currentQuestionIdRef.current === uniqueQuestionKey) {
                    isFetchingImageRef.current = false;
                 }
            });
    }
  }, [questionData]); 

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    const isCorrect = option === questionData.correctAnswer;
    if (isCorrect) {
      setShowCorrectAnimation(true);
      setTimeout(() => {
        setShowCorrectAnimation(false); 
      }, 800); 
    }
    onAnswer(option, isCorrect);
  };

  const getButtonClass = (option: string) => {
    if (!isAnswered) return '';
    if (option === questionData.correctAnswer) return 'bg-green-500 hover:bg-green-600 text-white border-green-500';
    if (option === selectedAnswer && option !== questionData.correctAnswer) return 'bg-red-500 hover:bg-red-600 text-white border-red-500';
    return '';
  };

  return (
    <Card className={cn(
        "w-full shadow-lg",
        showCorrectAnimation ? 'animate-correct-border-pulse' : 'animate-fade-in'
      )}>
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-2xl md:text-3xl font-headline">{`Pergunta ${questionNumber}/${totalQuestions}`}</CardTitle>
          <span className="text-sm text-muted-foreground font-medium capitalize">{questionData.topic} - {questionData.difficulty}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 aspect-video w-full relative overflow-hidden rounded-lg shadow-md bg-muted">
          {imageLoading && <LoadingIndicator text="Gerando ilustração..." className="absolute inset-0"/>}
          {imageError && !imageLoading && (
             <div className="w-full h-full flex flex-col items-center justify-center bg-secondary">
                <AlertCircle className="w-16 h-16 text-destructive mb-2" />
                <p className="text-destructive-foreground">Não foi possível carregar a ilustração.</p>
                <Image src={`https://placehold.co/600x400.png`} alt="Erro ao carregar ilustração" layout="fill" objectFit="cover" data-ai-hint={questionData.imageHint || "biblical scene"} />
            </div>
          )}
          {!imageLoading && !imageError && imageUrl && (
            <Image src={imageUrl} alt={`Ilustração para: ${questionData.question}`} layout="fill" objectFit="cover" data-ai-hint={questionData.imageHint || "bible scene"} />
          )}
          {!imageLoading && !imageError && !imageUrl && ( 
             <Image src={`https://placehold.co/600x400.png`} alt="Ilustração para a pergunta" layout="fill" objectFit="cover" data-ai-hint={questionData.imageHint || "bible scene"} />
          )}
        </div>
        
        <div className="flex items-start justify-center text-center mb-6">
            <CardDescription className="text-lg md:text-xl font-body min-h-[3em] text-center flex-grow">
                {questionData.question}
            </CardDescription>
            {questionData.hintText && !isAnswered && (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-2 shrink-0 text-primary hover:bg-primary/10">
                            <Lightbulb className="h-5 w-5" />
                            <span className="sr-only">Mostrar dica</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto max-w-xs sm:max-w-sm text-sm p-3 bg-card shadow-lg rounded-md border">
                        <p className="font-semibold text-primary mb-1">Dica:</p>
                        {questionData.hintText}
                    </PopoverContent>
                </Popover>
            )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questionData.options.map((option, index) => (
            <Button
              key={index}
              variant="outline" 
              className={cn(
                "w-full h-auto py-3 text-base justify-start text-left whitespace-normal transition-all duration-300 ease-in-out transform hover:scale-105",
                getButtonClass(option)
              )}
              onClick={() => handleOptionClick(option)}
              disabled={isAnswered && selectedAnswer !== option && option !== questionData.correctAnswer}
              aria-pressed={selectedAnswer === option}
            >
              <span className="mr-2 font-bold">{String.fromCharCode(65 + index)}.</span>
              {option}
              {isAnswered && option === questionData.correctAnswer && <CheckCircle2 className="ml-auto h-5 w-5 text-white" />}
              {isAnswered && selectedAnswer === option && option !== questionData.correctAnswer && <XCircle className="ml-auto h-5 w-5 text-white" />}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
