
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
import { explainAnswer, type ExplainAnswerInput, type ExplainAnswerOutput } from '@/ai/flows/explain-answer'; 
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { Lightbulb, BookText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExplanationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  quizQuestion: string; 
  userAnswer: string; 
  correctAnswer: string; 
  explanationContext?: string;
}

export function ExplanationDialog({ isOpen, onClose, quizQuestion, userAnswer, correctAnswer, explanationContext }: ExplanationDialogProps) {
  const [explanation, setExplanation] = useState<ExplainAnswerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const isFetchingExplanationRef = useRef(false);
  const currentExplanationKeyRef = useRef<string | null>(null); 

  useEffect(() => {
    const explanationKey = `${quizQuestion}-${userAnswer}-${correctAnswer}-${explanationContext}`;

    if (isOpen) {
      if (userAnswer === correctAnswer) {
        setFeedbackMessage("Sua resposta está correta!");
      } else {
        setFeedbackMessage(`Sua resposta está incorreta. A resposta correta é: ${correctAnswer}.`);
      }
      
      if ((currentExplanationKeyRef.current !== explanationKey || !explanation) && !isFetchingExplanationRef.current) {
        currentExplanationKeyRef.current = explanationKey; 
        setIsLoading(true);
        setError(null);
        setExplanation(null); 
        isFetchingExplanationRef.current = true;
        
        const input: ExplainAnswerInput = {
          question: quizQuestion,
          answer: userAnswer,
          correctAnswer: correctAnswer,
          explanationContext: explanationContext,
        };

        explainAnswer(input)
          .then(response => {
            if (currentExplanationKeyRef.current === explanationKey) {
              setExplanation(response);
            }
          })
          .catch(err => {
            console.error("Erro ao buscar explicação:", err);
            if (currentExplanationKeyRef.current === explanationKey) {
              setError("Desculpe, não conseguimos buscar uma explicação no momento. Tente novamente mais tarde.");
            }
          })
          .finally(() => {
            if (currentExplanationKeyRef.current === explanationKey) {
              setIsLoading(false);
            }
            isFetchingExplanationRef.current = false;
          });
      }
    } else {
      // Reset when dialog is closed
      // setFeedbackMessage(null); // Keep feedback message for next opening if same question
      // setExplanation(null); // Keep explanation if same question for quicker display
      // setIsLoading(false); // Reset loading
      // setError(null); // Reset error
      // isFetchingExplanationRef.current = false; 
      // currentExplanationKeyRef.current = null; // This would force refetch next time
    }
  }, [isOpen, quizQuestion, userAnswer, correctAnswer, explanationContext, explanation]);

  // Reset states if the core data changes while the dialog is trying to open or is open
  useEffect(() => {
    if (isOpen) {
        setFeedbackMessage(null);
        setExplanation(null);
        setIsLoading(false);
        setError(null);
        isFetchingExplanationRef.current = false;
        currentExplanationKeyRef.current = null;
    }
  }, [quizQuestion, userAnswer, correctAnswer, explanationContext]);


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card text-card-foreground shadow-xl rounded-lg">
        <DialogHeader className="text-center">
          <Lightbulb className="h-10 w-10 text-primary mx-auto mb-2" />
          <DialogTitle className="text-2xl font-headline">Aprofunde seu Conhecimento</DialogTitle>
          <DialogDescription className="text-md">
            Entenda melhor a resposta e seu contexto bíblico.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          {isLoading && <LoadingIndicator text="Gerando explicação..." />}
          {error && <p className="text-destructive text-center">{error}</p>}
          
          {!isLoading && !error && (
            <ScrollArea className="h-[350px] rounded-md border p-4 bg-background shadow-inner space-y-4">
              {feedbackMessage && (
                <p className={cn(
                  "font-semibold text-md text-center pb-2 mb-3 border-b",
                  userAnswer === correctAnswer ? "text-primary" : "text-destructive"
                )}>
                  {feedbackMessage}
                </p>
              )}

              {explanation && (
                <>
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-1">Contexto:</h4>
                    <p className="text-xs whitespace-pre-wrap font-body leading-relaxed text-foreground/80">
                      {explanation.briefContext}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-1">Explicação:</h4>
                    <p className="text-xs whitespace-pre-wrap font-body leading-relaxed text-foreground/80">
                      {explanation.coreExplanation}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-1 flex items-center">
                      <BookText className="w-3 h-3 mr-1.5"/>
                      Passagem Bíblica:
                    </h4>
                    <blockquote className="text-xs italic border-l-2 border-primary pl-2 py-1 my-1 bg-muted/30">
                      <p className="whitespace-pre-wrap font-body leading-relaxed">
                        &ldquo;{explanation.bibleVerseText}&rdquo;
                      </p>
                      <footer className="text-right not-italic font-semibold text-primary/90 text-[0.7rem] mt-1">
                        &mdash; {explanation.bibleVerseReference}
                      </footer>
                    </blockquote>
                  </div>
                </>
              )}
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
