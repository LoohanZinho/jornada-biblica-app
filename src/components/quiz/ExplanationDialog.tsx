
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
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      setExplanation(null);
      
      const input: ExplainAnswerInput = {
        question: quizQuestion,
        answer: userAnswer,
        correctAnswer: correctAnswer,
      };

      explainAnswer(input)
        .then(response => {
          setExplanation(response.explanation);
        })
        .catch(err => {
          console.error("Erro ao buscar explicação:", err);
          setError("Desculpe, não conseguimos buscar uma explicação no momento. Tente novamente mais tarde.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, quizQuestion, userAnswer, correctAnswer]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card text-card-foreground shadow-xl rounded-lg">
        <DialogHeader className="text-center">
          <Lightbulb className="h-10 w-10 text-primary mx-auto mb-2" />
          <DialogTitle className="text-2xl font-headline">Explicação da Resposta</DialogTitle>
          <DialogDescription className="text-md">
            Aprofunde-se no contexto da pergunta.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 min-h-[200px]">
          {isLoading && <LoadingIndicator text="Gerando explicação..." />}
          {error && <p className="text-destructive text-center">{error}</p>}
          {explanation && !isLoading && (
            <ScrollArea className="h-[300px] rounded-md border p-4 bg-background shadow-inner">
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

    