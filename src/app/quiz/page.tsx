
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { QuizQuestionType, QuizSettings, QuizResult } from '@/types';
import { generateQuizQuestions, type GenerateQuizQuestionsInput } from '@/ai/flows/generate-quiz-questions';
import { sampleQuizQuestions } from '@/lib/quizData'; // For fallback
import { QuizSetup } from '@/components/quiz/QuizSetup';
import { QuizQuestionDisplay } from '@/components/quiz/QuizQuestionDisplay';
import { ExplanationDialog } from '@/components/quiz/ExplanationDialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, RotateCcw } from 'lucide-react';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';

export default function QuizPage() {
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationData, setExplanationData] = useState<{ question: string; userAnswer: string; correctAnswer: string } | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const handleStartQuiz = useCallback(async (selectedSettings: QuizSettings) => {
    setIsLoadingQuestions(true);
    setSettings(selectedSettings);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizResults([]);

    try {
      const aiInput: GenerateQuizQuestionsInput = {
        topic: selectedSettings.topic === "Todos os Tópicos" ? "Bíblia em geral" : selectedSettings.topic,
        difficulty: selectedSettings.difficulty === "todos" ? "médio" : selectedSettings.difficulty,
        numberOfQuestions: selectedSettings.numberOfQuestions,
      };
      const response = await generateQuizQuestions(aiInput);
      
      let generatedQuestions = response.questions as QuizQuestionType[];

      if (!generatedQuestions || generatedQuestions.length === 0) {
        toast({
            title: "Nenhuma Pergunta Gerada",
            description: "A IA não conseguiu gerar perguntas. Usando perguntas de exemplo.",
            variant: "destructive",
        });
        generatedQuestions = sampleQuizQuestions.filter(q => 
            (selectedSettings.topic === "Todos os Tópicos" || q.topic === selectedSettings.topic) &&
            (selectedSettings.difficulty === "todos" || q.difficulty === selectedSettings.difficulty)
        ).slice(0, selectedSettings.numberOfQuestions);

        if (generatedQuestions.length === 0) {
             toast({
                title: "Nenhuma Pergunta Encontrada",
                description: "Não foi possível encontrar perguntas com os critérios selecionados, nem mesmo nos exemplos.",
                variant: "destructive",
            });
            setIsLoadingQuestions(false);
            return;
        }
      }
      
      const finalQuestions = generatedQuestions.slice(0, selectedSettings.numberOfQuestions);
      if (finalQuestions.length < selectedSettings.numberOfQuestions && response.questions?.length > 0) { // only show if AI generated something but less
         toast({
            title: "Menos Perguntas Geradas",
            description: `A IA gerou ${finalQuestions.length} perguntas. Ajustando o tamanho do quiz.`,
            variant: "default",
        });
      }

      setQuestions(finalQuestions);
      setQuizStarted(true);

    } catch (error) {
      console.error("Erro ao gerar perguntas do quiz:", error);
      toast({
        title: "Erro ao Gerar Perguntas",
        description: "Houve um problema com a IA. Usando perguntas de exemplo.",
        variant: "destructive",
      });
      // Fallback to sample questions
        let fallbackQuestions = sampleQuizQuestions.filter(q => 
            (selectedSettings.topic === "Todos os Tópicos" || q.topic === selectedSettings.topic) &&
            (selectedSettings.difficulty === "todos" || q.difficulty === selectedSettings.difficulty)
        ).slice(0, selectedSettings.numberOfQuestions);
        
        if (fallbackQuestions.length === 0) {
             toast({
                title: "Nenhuma Pergunta Encontrada",
                description: "Não foi possível encontrar perguntas com os critérios selecionados, nem mesmo nos exemplos.",
                variant: "destructive",
            });
            setIsLoadingQuestions(false);
            return;
        }
        setQuestions(fallbackQuestions);
        setQuizStarted(true);
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [toast]);

  const handleAnswer = (selectedAnswer: string, isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prev => prev + 1);
       toast({
        title: "Correto!",
        description: "Muito bem!",
        variant: "default",
        duration: 2000,
      });
    } else {
        toast({
        title: "Incorreto",
        description: `A resposta correta era: ${questions[currentQuestionIndex].correctAnswer}`,
        variant: "destructive",
        duration: 3000,
      });
    }

    const currentQuestionText = questions[currentQuestionIndex].question;
    const correctAnswerText = questions[currentQuestionIndex].correctAnswer;

    setQuizResults(prev => [...prev, {
      question: currentQuestionText,
      selectedAnswer,
      correctAnswer: correctAnswerText,
      isCorrect
    }]);
    
    setExplanationData({
      question: currentQuestionText,
      userAnswer: selectedAnswer,
      correctAnswer: correctAnswerText,
    });
    setShowExplanation(true); 
  };

  const handleNextAfterExplanation = () => {
    setShowExplanation(false);
    setExplanationData(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      localStorage.setItem('quizResults', JSON.stringify({ score, totalQuestions: questions.length, results: quizResults, areasOfInterest: settings?.topic || 'Conhecimento Geral' }));
      router.push(`/quiz/results`);
    }
  };
  
  const resetQuiz = () => {
    setQuizStarted(false);
    setSettings(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizResults([]);
    setIsLoadingQuestions(false);
  };

  if (isLoadingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <LoadingIndicator text="Gerando suas perguntas com IA..." size={48} />
        <p className="mt-4 text-muted-foreground">Isso pode levar alguns segundos...</p>
      </div>
    );
  }

  if (!quizStarted || !settings) {
    return <QuizSetup onStartQuiz={handleStartQuiz} />;
  }

  if (questions.length === 0 && !isLoadingQuestions) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground mb-4">Nenhuma pergunta disponível para os critérios selecionados.</p>
        <Button onClick={resetQuiz} variant="outline">Tentar Configurações Diferentes</Button>
      </div>
    );
  }
  
  const currentQuestionData = questions[currentQuestionIndex];
  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary font-headline">Jornada Bíblica</h2>
        <Button onClick={resetQuiz} variant="outline" size="sm">
          <RotateCcw className="mr-2 h-4 w-4" /> Reiniciar Quiz
        </Button>
      </div>
      <Progress value={progressPercentage} className="w-full h-3" />
      
      {currentQuestionData && (
        <QuizQuestionDisplay
          questionData={currentQuestionData}
          onAnswer={handleAnswer}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />
      )}

      {explanationData && (
        <ExplanationDialog
          isOpen={showExplanation}
          onClose={handleNextAfterExplanation}
          quizQuestion={explanationData.question}
          userAnswer={explanationData.userAnswer}
          correctAnswer={explanationData.correctAnswer}
        />
      )}
      
      {showExplanation && (
         <div className="text-center mt-6">
            <Button onClick={handleNextAfterExplanation} size="lg">
                {currentQuestionIndex < questions.length - 1 ? "Próxima Pergunta" : "Ver Resultados"}
                <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
         </div>
      )}
    </div>
  );
}

    