"use client";

import type { GuessTheTextQuestionType } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateImageFromQuestion } from '@/ai/flows/generate-image-from-question';
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, FileText, XCircle, Lightbulb } from 'lucide-react'; // Import Lightbulb
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { Alert, AlertDescription } from "@/components/ui/alert"; // Import Alert components

interface GuessTheTextQuestionDisplayProps {
  questionData: GuessTheTextQuestionType;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  questionNumber: number;
  totalQuestions: number;
}

export function GuessTheTextQuestionDisplay({ questionData, onAnswer, questionNumber, totalQuestions }: GuessTheTextQuestionDisplayProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [showHint, setShowHint] = useState(false); // State for hint visibility

  const currentQuestionKeyRef = useRef<string | null>(null);
  const isFetchingImageRef = useRef(false);

  useEffect(() => {
    setShowCorrectAnimation(false);
    setShowHint(false); // Reset hint visibility on new question

    if (!questionData || !questionData.id || !questionData.textSnippet) {
        setImageUrl(null);
        setImageLoading(false);
        setImageError(true);
        currentQuestionKeyRef.current = null;
        isFetchingImageRef.current = false;
        return;
    }

    const uniqueQuestionKey = `${questionData.id}||${questionData.textSnippet}`;

    if (currentQuestionKeyRef.current !== uniqueQuestionKey) {
        currentQuestionKeyRef.current = uniqueQuestionKey;
        setSelectedAnswer(null);
        setIsAnswered(false);
        setImageUrl(null);
        setImageLoading(true);
        setImageError(false);
        isFetchingImageRef.current = false;
    }

    const imagePrompt = questionData.imageHint || `Imagem para o texto bíblico: "${questionData.textSnippet.substring(0, 50)}..."`;

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
                console.error("Erro ao gerar imagem para 'Qual é o Texto?':", err);
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

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    const isCorrect = option === questionData.correctAnswer;
    if (isCorrect) {
      setShowCorrectAnimation(true);
    }
    onAnswer(option, isCorrect);
  };

  const getButtonClass = (option: string) => {
    if (!isAnswered) return '';
    if (option === questionData.correctAnswer) return 'bg-green-500 hover:bg-green-600 text-white border-green-500';
    if (option === selectedAnswer && option !== questionData.correctAnswer) return 'bg-red-500 hover:bg-red-600 text-white border-red-500';
    return '';
  };

  const getHintText = () => {
    if (questionData.topic && questionData.topic !== "Bíblia em geral") {
      return `Dica: O tema deste versículo é "${questionData.topic}". Tente lembrar de passagens relacionadas a este tema.`;
    }
    return "Dica: Pense no contexto geral em que este tipo de mensagem apareceria. Qual livro ou autor poderia ter escrito isso?";
  };

  return (
    <Card className={cn(
        "w-full shadow-lg animate-fade-in",
        showCorrectAnimation ? 'animate-correct-border-pulse' : ''
      )}>
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-2xl md:text-3xl font-headline">{`Desafio ${questionNumber}/${totalQuestions}`}</CardTitle>
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
            <Image src={imageUrl} alt={`Ilustração para: ${questionData.textSnippet}`} layout="fill" objectFit="cover" data-ai-hint={questionData.imageHint || "bible passage"} />
          )}
          {!imageLoading && !imageError && !imageUrl && (
             <Image src={`https://placehold.co/600x400.png`} alt="Ilustração para o desafio" layout="fill" objectFit="cover" data-ai-hint={questionData.imageHint || "bible passage"} />
          )}
        </div>

        <CardDescription className="text-lg md:text-xl font-body min-h-[3em] text-center mb-6 p-4 bg-secondary/30 rounded-md">
            <FileText className="inline-block h-5 w-5 mr-2 align-middle text-primary" />
            <span className="italic">&ldquo;{questionData.textSnippet}&rdquo;</span>
        </CardDescription>

        <p className="text-center text-muted-foreground mb-4">Qual é a referência correta para este trecho?</p>

        {/* Hint Button and Alert Section */}
        <div className="mb-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHint(!showHint)}
            disabled={isAnswered}
            aria-pressed={showHint}
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            {showHint ? "Ocultar Dica" : "Ver Dica"}
          </Button>
          {showHint && (
            <Alert className="mt-2 text-left text-sm bg-secondary/50">
              <AlertDescription>{getHintText()}</AlertDescription>
            </Alert>
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
