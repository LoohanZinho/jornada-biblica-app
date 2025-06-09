
"use client";

import type { TrueFalseQuestionType } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateImageFromQuestion } from '@/ai/flows/generate-image-from-question';
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react'; 
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { playSound } from '@/lib/audioUtils';

interface TrueFalseQuizQuestionDisplayProps {
  questionData: TrueFalseQuestionType;
  onAnswer: (selectedAnswer: boolean, isCorrect: boolean) => void;
  questionNumber: number;
  totalQuestions: number;
}

export function TrueFalseQuizQuestionDisplay({ questionData, onAnswer, questionNumber, totalQuestions }: TrueFalseQuizQuestionDisplayProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);

  const currentQuestionKeyRef = useRef<string | null>(null);
  const isFetchingImageRef = useRef(false);

  useEffect(() => {
    setShowCorrectAnimation(false);

    if (!questionData || !questionData.id || !questionData.statement) {
        setImageUrl(null);
        setImageLoading(false);
        setImageError(true);
        currentQuestionKeyRef.current = null;
        isFetchingImageRef.current = false;
        return;
    }

    const uniqueQuestionKey = `${questionData.id}||${questionData.statement}`;

    if (currentQuestionKeyRef.current !== uniqueQuestionKey) {
        currentQuestionKeyRef.current = uniqueQuestionKey;
        setSelectedAnswer(null);
        setIsAnswered(false);
        setImageUrl(null);
        setImageLoading(true);
        setImageError(false);
        isFetchingImageRef.current = false;
    }

    const imagePrompt = questionData.imageHint || `Imagem para a afirmação bíblica: "${questionData.statement.substring(0, 70)}..."`;

    if (currentQuestionKeyRef.current === uniqueQuestionKey && !imageUrl && !isFetchingImageRef.current && !imageError) {
        isFetchingImageRef.current = true;
        setImageLoading(true);
        setImageError(false);

        generateImageFromQuestion({ questionText: imagePrompt })
            .then(response => {
                if (currentQuestionKeyRef.current === uniqueQuestionKey) {
                    setImageUrl(response.imageUrl);
                }
            })
            .catch(err => {
                if (currentQuestionKeyRef.current === uniqueQuestionKey) {
                    setImageError(true);
                }
            })
            .finally(() => {
                 if (currentQuestionKeyRef.current === uniqueQuestionKey) {
                    setImageLoading(false);
                 }
                 isFetchingImageRef.current = false;
            });
    } else if (!isFetchingImageRef.current && !imageUrl && imageError) {
      setImageLoading(false);
    } else if (!isFetchingImageRef.current && imageUrl) {
      setImageLoading(false);
    }

  }, [questionData, imageUrl, imageError]);

  const handleOptionClick = (answer: boolean) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);
    const isCorrect = answer === questionData.correctAnswer;
    if (isCorrect) {
      setShowCorrectAnimation(true);
      playSound('correct.mp3'); 
    } else {
      playSound('incorrect.mp3'); 
    }
    onAnswer(answer, isCorrect);
  };

  const getButtonClass = (isTrueButton: boolean) => {
    if (!isAnswered) return 'animate-button-press'; 
    // Se este botão (Verdadeiro ou Falso) corresponde à resposta correta
    if (isTrueButton === questionData.correctAnswer) {
        return 'bg-green-500 hover:bg-green-600 text-white border-green-500';
    }
    // Se este botão foi o selecionado E estava incorreto
    if (selectedAnswer === isTrueButton && isTrueButton !== questionData.correctAnswer) {
        return 'bg-red-500 hover:bg-red-600 text-white border-red-500';
    }
    return '';
  };

  return (
    <Card className={cn(
        "w-full shadow-lg animate-fade-in",
        showCorrectAnimation ? 'animate-correct-border-pulse' : ''
      )}>
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-2xl md:text-3xl font-headline">{`Afirmação ${questionNumber}/${totalQuestions}`}</CardTitle>
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
                <Image src={`https://placehold.co/600x400.png`} alt="Erro ao carregar ilustração" layout="fill" objectFit="cover" data-ai-hint={questionData.imageHint || "biblical context"} />
            </div>
          )}
          {!imageLoading && !imageError && imageUrl && (
            <Image src={imageUrl} alt={`Ilustração para: ${questionData.statement.substring(0,50)}...`} layout="fill" objectFit="cover" data-ai-hint={questionData.imageHint || "biblical theme"} />
          )}
          {!imageLoading && !imageError && !imageUrl && (
             <Image src={`https://placehold.co/600x400.png`} alt="Ilustração para o desafio" layout="fill" objectFit="cover" data-ai-hint={questionData.imageHint || "biblical theme"} />
          )}
        </div>

        <CardDescription className="text-lg md:text-xl font-body min-h-[3em] text-center mb-8 p-4 bg-secondary/30 rounded-md">
            {questionData.statement}
        </CardDescription>

        <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className={cn(
                "w-full h-auto py-4 text-lg justify-center items-center transition-all duration-300 ease-in-out transform hover:scale-105",
                getButtonClass(true) // Se este é o botão "Verdadeiro"
              )}
              onClick={() => handleOptionClick(true)}
              disabled={isAnswered && (selectedAnswer !== true && true !== questionData.correctAnswer)}
              aria-pressed={selectedAnswer === true}
            >
              <ThumbsUp className="mr-2 h-5 w-5" />
              Verdadeiro
              {isAnswered && true === questionData.correctAnswer && <CheckCircle2 className="ml-auto h-5 w-5 text-white" />}
              {isAnswered && selectedAnswer === true && true !== questionData.correctAnswer && <XCircle className="ml-auto h-5 w-5 text-white" />}
            </Button>
            <Button
              variant="outline"
              className={cn(
                "w-full h-auto py-4 text-lg justify-center items-center transition-all duration-300 ease-in-out transform hover:scale-105",
                getButtonClass(false) // Se este é o botão "Falso"
              )}
              onClick={() => handleOptionClick(false)}
              disabled={isAnswered && (selectedAnswer !== false && false !== questionData.correctAnswer)}
              aria-pressed={selectedAnswer === false}
            >
              <ThumbsDown className="mr-2 h-5 w-5" />
              Falso
              {isAnswered && false === questionData.correctAnswer && <CheckCircle2 className="ml-auto h-5 w-5 text-white" />}
              {isAnswered && selectedAnswer === false && false !== questionData.correctAnswer && <XCircle className="ml-auto h-5 w-5 text-white" />}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
