
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useState, useEffect, useRef } from 'react';
import { explainAnswer } from '@/ai/flows/explain-answer'; 
import type { ExplainAnswerInput } from '@/ai/flows/explain-answer';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { Lightbulb } from "lucide-react";

interface ExplanationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  quizQuestion: string; 
  userAnswer: string; 
  correctAnswer: string; 
}

export function ExplanationDialog({ isOpen, onClose, quizQuestion, userAnswer, correctAnswer }: ExplanationDialogProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFetchingExplanationRef = useRef(false);
  const currentExplanationKeyRef = useRef<string | null>(null); // To track the question key for the current explanation

  useEffect(() => {
    const explanationKey = `${quizQuestion}-${userAnswer}-${correctAnswer}`;

    if (isOpen) {
      // If it's a new question combination or no explanation yet, and not currently fetching.
      if ((currentExplanationKeyRef.current !== explanationKey || !explanation) && !isFetchingExplanationRef.current) {
        currentExplanationKeyRef.current = explanationKey; // Mark this combination as being processed
        setIsLoading(true);
        setError(null);
        setExplanation(null); // Clear previous explanation if any for new key
        isFetchingExplanationRef.current = true;
        
        const input: ExplainAnswerInput = {
          question: quizQuestion,
          answer: userAnswer,
          correctAnswer: correctAnswer,
        };

        explainAnswer(input)
          .then(response => {
            // Only set explanation if it's for the current key we requested
            if (currentExplanationKeyRef.current === explanationKey) {
              setExplanation(response.explanation);
            }
          })
          .catch(err => {
            console.error("Erro ao buscar explicação:", err);
            if (currentExplanationKeyRef.current === explanationKey) {
              setError("Desculpe, não conseguimos buscar uma explicação no momento. Tente novamente mais tarde.");
            }
          })
          .finally(() => {
            // Only update loading state if it's for the current key
            if (currentExplanationKeyRef.current === explanationKey) {
              setIsLoading(false);
            }
            isFetchingExplanationRef.current = false;
          });
      }
    } else {
      // Reset state when the dialog is closed
      setExplanation(null);
      setIsLoading(false);
      setError(null);
      isFetchingExplanationRef.current = false; 
      currentExplanationKeyRef.current = null; // Reset key when closed
    }
  }, [isOpen, quizQuestion, userAnswer, correctAnswer, explanation]); // explanation is in deps to allow re-evaluation of !explanation

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card text-card-foreground shadow-xl rounded-lg">
        <DialogHeader className="text-center">
          <Lightbulb className="h-10 w-10 text-primary mx-auto mb-2" />
          <DialogTitle className="text-2xl font-headline">Saiba Mais!</DialogTitle>
          <DialogDescription className="text-md">
            Descubra um fato interessante sobre a pergunta.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 min-h-[150px]">
          {isLoading && <LoadingIndicator text="Gerando explicação..." />}
          {error && <p className="text-destructive text-center">{error}</p>}
          {explanation && !isLoading && (
            <ScrollArea className="h-[250px] rounded-md border p-4 bg-background shadow-inner">
              <p className="text-sm whitespace-pre-wrap font-body leading-relaxed">{explanation}</p>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose} variant="default" className="w-full sm:w-auto">
            Entendi!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
