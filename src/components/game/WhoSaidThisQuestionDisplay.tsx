
"use client";

import type { WhoSaidThisQuestionType } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateImageFromQuestion } from '@/ai/flows/generate-image-from-question';
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, MessageCircleQuestion, XCircle, Lightbulb, UserCheck } from 'lucide-react';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { Alert, AlertDescription as UIDialogAlertDescription } from "@/components/ui/alert";

interface WhoSaidThisQuestionDisplayProps {
  questionData: WhoSaidThisQuestionType;
  onAnswer: (selectedCharacter: string, isCorrect: boolean) => void;
  questionNumber: number;
  totalQuestions: number;
}

export function WhoSaidThisQuestionDisplay({ questionData, onAnswer, questionNumber, totalQuestions }: WhoSaidThisQuestionDisplayProps) {
  const [selectedCharacterByUser, setSelectedCharacterByUser] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentQuestionKeyRef = useRef<string | null>(null);
  const isFetchingImageRef = useRef(false);

  useEffect(() => {
    setShowCorrectAnimation(false);
    setShowHint(false);

    if (!questionData || !questionData.id || !questionData.quote) {
        setImageUrl(null);
        setImageLoading(false);
        setImageError(true);
        currentQuestionKeyRef.current = null;
        isFetchingImageRef.current = false;
        return;
    }

    const uniqueQuestionKey = `${questionData.id}||${questionData.quote}`;

    if (currentQuestionKeyRef.current !== uniqueQuestionKey) {
        currentQuestionKeyRef.current = uniqueQuestionKey;
        setSelectedCharacterByUser(null);
        setIsAnswered(false);
        setImageUrl(null);
        setImageLoading(true);
        setImageError(false);
        isFetchingImageRef.current = false;
    }

    const imagePrompt = questionData.imageHint || `Personagem bíblico dizendo: "${questionData.quote.substring(0, 50)}..."`;

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
                console.error("Erro ao gerar imagem para 'Quem Disse Isso?':", err);
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

  const handleOptionClick = (characterClicked: string) => {
    if (isAnswered) return;
    setSelectedCharacterByUser(characterClicked);
    setIsAnswered(true);
    
    const clicked = characterClicked?.trim();
    const correct = questionData.correctCharacter?.trim();
    const isChoiceCorrect = !!(clicked && correct && clicked === correct);

    console.log("--- [WhoSaidThisQuestionDisplay] ---");
    console.log("Character Clicked (trimmed):", clicked);
    console.log("Correct Character (trimmed from data):", correct);
    console.log("Question Data Object:", JSON.parse(JSON.stringify(questionData)));
    console.log("Is Choice Correct?:", isChoiceCorrect);
    console.log("------------------------------------");


    if (isChoiceCorrect) {
      setShowCorrectAnimation(true);
    }
    onAnswer(characterClicked, isChoiceCorrect);
  };

  const getButtonClass = (buttonCharacterOption: string) => {
    if (!isAnswered) return '';
    const correctCharTrimmed = questionData.correctCharacter?.trim();
    const optionTrimmed = buttonCharacterOption?.trim();
    const selectedTrimmed = selectedCharacterByUser?.trim();

    if (optionTrimmed === correctCharTrimmed) {
      return 'bg-green-500 hover:bg-green-600 text-white border-green-500';
    }
    if (optionTrimmed === selectedTrimmed && optionTrimmed !== correctCharTrimmed) {
      return 'bg-red-500 hover:bg-red-600 text-white border-red-500';
    }
    return '';
  };
  
  const getHintText = () => {
    if (questionData.contextForExplanation) {
      return `Dica de Contexto: ${questionData.contextForExplanation}`;
    }
    if (questionData.topic && questionData.topic !== "Bíblia em geral") {
      return `Dica de Tópico: A citação é sobre "${questionData.topic}".`;
    }
    return "Dica: Pense sobre o estilo da linguagem e os temas comuns associados a diferentes personagens bíblicos.";
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
                <Image src={`https://placehold.co/600x400.png`} alt="Erro ao carregar ilustração" layout="fill" objectFit="cover" data-ai-hint={questionData.imageHint || "biblical character speech"} />
            </div>
          )}
          {!imageLoading && !imageError && imageUrl && (
            <Image src={imageUrl} alt={`Ilustração para citação: ${questionData.quote.substring(0,30)}...`} layout="fill" objectFit="cover" data-ai-hint={questionData.imageHint || "biblical character speech"} />
          )}
          {!imageLoading && !imageError && !imageUrl && (
             <Image src={`https://placehold.co/600x400.png`} alt="Ilustração para o desafio" layout="fill" objectFit="cover" data-ai-hint={questionData.imageHint || "biblical character speech"} />
          )}
        </div>

        <CardDescription className="text-lg md:text-xl font-body min-h-[3em] text-center mb-6 p-4 bg-secondary/30 rounded-md">
            <MessageCircleQuestion className="inline-block h-5 w-5 mr-2 align-middle text-primary" />
            <span className="italic">&ldquo;{questionData.quote}&rdquo;</span>
        </CardDescription>

        <p className="text-center text-muted-foreground mb-4">Quem disse isso?</p>

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
              <UIDialogAlertDescription>{getHintText()}</UIDialogAlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questionData.options.map((optionText, index) => ( 
            <Button
              key={index}
              variant="outline"
              className={cn(
                "w-full h-auto py-3 text-base justify-start text-left whitespace-normal transition-all duration-300 ease-in-out transform hover:scale-105",
                getButtonClass(optionText)
              )}
              onClick={() => handleOptionClick(optionText)}
              disabled={isAnswered && selectedCharacterByUser?.trim() !== optionText?.trim() && optionText?.trim() !== questionData.correctCharacter?.trim()}
              aria-pressed={selectedCharacterByUser === optionText}
            >
              <UserCheck className="mr-3 h-5 w-5 text-primary/80" />
              {optionText}
              {isAnswered && optionText?.trim() === questionData.correctCharacter?.trim() && <CheckCircle2 className="ml-auto h-5 w-5 text-white" />}
              {isAnswered && selectedCharacterByUser?.trim() === optionText?.trim() && optionText?.trim() !== questionData.correctCharacter?.trim() && <XCircle className="ml-auto h-5 w-5 text-white" />}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
