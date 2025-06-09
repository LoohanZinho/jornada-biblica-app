
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
  onContentLoadStateChange: (isContentLoaded: boolean) => void;
}

export function ExplanationDialog({ 
  isOpen, 
  onClose, 
  quizQuestion, 
  userAnswer, 
  correctAnswer, 
  explanationContext,
  onContentLoadStateChange 
}: ExplanationDialogProps) {
  const [explanation, setExplanation] = useState<ExplainAnswerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  
  const initiatedFetchForKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const currentKey = `${quizQuestion}-${userAnswer}-${correctAnswer}-${explanationContext}`;

      if (userAnswer === correctAnswer) {
        setFeedbackMessage("Sua resposta está correta!");
      } else {
        setFeedbackMessage(`Sua resposta está incorreta. A resposta correta é: ${correctAnswer}.`);
      }

      if (initiatedFetchForKeyRef.current !== currentKey) {
        initiatedFetchForKeyRef.current = currentKey; 

        setIsLoading(true);
        onContentLoadStateChange(false); // Indicate content is now loading
        setError(null);
        setExplanation(null); 

        const input: ExplainAnswerInput = {
          question: quizQuestion,
          answer: userAnswer,
          correctAnswer: correctAnswer,
          explanationContext: explanationContext,
        };

        explainAnswer(input)
          .then(response => {
            if (initiatedFetchForKeyRef.current === currentKey) {
              setExplanation(response);
            }
          })
          .catch(err => {
            console.error("Erro ao buscar explicação:", err);
            if (initiatedFetchForKeyRef.current === currentKey) {
              setError("Desculpe, não conseguimos buscar uma explicação no momento.");
            }
          })
          .finally(() => {
            if (initiatedFetchForKeyRef.current === currentKey) {
              setIsLoading(false);
              onContentLoadStateChange(true); // Indicate content has loaded (or failed)
            }
          });
      } else {
        // Not fetching new data, content state depends on internal isLoading
        if (!isLoading) {
          onContentLoadStateChange(true); // Assumed ready if not internally loading
        } else {
           // This case should ideally not happen if logic is correct, but as a safeguard:
          onContentLoadStateChange(false);
        }
      }
    } else {
      initiatedFetchForKeyRef.current = null;
    }
  }, [isOpen, quizQuestion, userAnswer, correctAnswer, explanationContext, onContentLoadStateChange, isLoading]);

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
          <ScrollArea className="h-[350px] rounded-md border p-4 bg-background shadow-inner space-y-4">
            {feedbackMessage && (
              <p className={cn(
                "font-semibold text-md text-center pb-2 mb-3 border-b",
                userAnswer === correctAnswer ? "text-primary" : "text-destructive"
              )}>
                {feedbackMessage}
              </p>
            )}
            
            {isLoading && <LoadingIndicator text="Gerando explicação..." />}
            {error && <p className="text-destructive text-center">{error}</p>}
            
            {!isLoading && !error && explanation && (
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
            {!isLoading && !error && !explanation && !feedbackMessage && (
                 <p className="text-muted-foreground text-center">Aguardando dados da pergunta...</p>
            )}
          </ScrollArea>
        </div>

        {!isLoading && (
          <DialogFooter className="sm:justify-center">
            <Button onClick={onClose} variant="default" className="w-full sm:w-auto">
              Entendi!
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
