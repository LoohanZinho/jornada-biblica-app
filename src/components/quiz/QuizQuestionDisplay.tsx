
"use client";

import type { QuizQuestionType } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateImageFromQuestion } from '@/ai/flows/generate-image-from-question'; 
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';

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
    // Reset animation state when question changes
    setShowCorrectAnimation(false);

    if (questionData.id) {
      // Only fetch if the question ID has changed
      if (questionData.id !== currentQuestionIdRef.current) {
        if (isFetchingImageRef.current) return; // Avoid concurrent fetches for the same new ID

        setSelectedAnswer(null);
        setIsAnswered(false);
        setImageUrl(null);
        setImageLoading(true);
        setImageError(false);
        
        currentQuestionIdRef.current = questionData.id;
        isFetchingImageRef.current = true;

        generateImageFromQuestion({ questionText: questionData.question })
          .then(response => {
            // Ensure this update is for the current question
            if (questionData.id === currentQuestionIdRef.current) {
              setImageUrl(response.imageUrl);
            }
          })
          .catch(err => {
            console.error("Erro ao gerar imagem:", err);
            if (questionData.id === currentQuestionIdRef.current) {
              setImageError(true);
            }
          })
          .finally(() => {
            if (questionData.id === currentQuestionIdRef.current) {
              setImageLoading(false);
            }
            isFetchingImageRef.current = false;
          });
      }
    } else {
      setImageLoading(false);
      setImageError(true);
    }
  // Effect dependencies: only re-run if the question content itself changes.
  }, [questionData.id, questionData.question]); 

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    const isCorrect = option === questionData.correctAnswer;
    if (isCorrect) {
      setShowCorrectAnimation(true);
      setTimeout(() => {
        setShowCorrectAnimation(false);
      }, 800); // Duration of the animation
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
                <p className="text-destructive-foreground">Não foi possível carregar a imagem.</p>
                <Image src="https://placehold.co/600x400.png" alt="Erro ao carregar imagem" layout="fill" objectFit="cover" data-ai-hint="error illustration" />
            </div>
          )}
          {!imageLoading && !imageError && imageUrl && (
            <Image src={imageUrl} alt={`Ilustração para: ${questionData.question}`} layout="fill" objectFit="cover" data-ai-hint={questionData.imageHint || "bible scene"} />
          )}
          {!imageLoading && !imageError && !imageUrl && (
             <Image src="https://placehold.co/600x400.png" alt="Imagem de placeholder para a pergunta" layout="fill" objectFit="cover" data-ai-hint={questionData.imageHint || "bible scene"} />
          )}
        </div>
        
        <CardDescription className="text-lg md:text-xl font-body min-h-[3em] mb-6 text-center">{questionData.question}</CardDescription>
        
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
