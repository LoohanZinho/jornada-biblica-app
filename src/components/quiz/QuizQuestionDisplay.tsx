
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
  const currentQuestionIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Só busca nova imagem se o ID da pergunta mudou ou se não há imagem e não está carregando
    if (questionData.id && (questionData.id !== currentQuestionIdRef.current || (!imageUrl && !imageLoading))) {
      setSelectedAnswer(null);
      setIsAnswered(false);
      setImageUrl(null);
      setImageLoading(true);
      setImageError(false);
      currentQuestionIdRef.current = questionData.id;

      generateImageFromQuestion({ questionText: questionData.question })
        .then(response => {
          // Verifica se a pergunta ainda é a mesma para evitar setar imagem de pergunta anterior
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
        });
    } else if (!questionData.id) {
        // Se não houver dados da pergunta, considera um erro de imagem.
        setImageLoading(false);
        setImageError(true);
    }
  }, [questionData.id, questionData.question, imageUrl, imageLoading]); 

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    const isCorrect = option === questionData.correctAnswer;
    onAnswer(option, isCorrect);
  };

  const getButtonClass = (option: string) => {
    if (!isAnswered) return '';
    if (option === questionData.correctAnswer) return 'bg-green-500 hover:bg-green-600 text-white border-green-500';
    if (option === selectedAnswer && option !== questionData.correctAnswer) return 'bg-red-500 hover:bg-red-600 text-white border-red-500';
    return '';
  };

  return (
    <Card className="w-full animate-fade-in shadow-lg">
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
