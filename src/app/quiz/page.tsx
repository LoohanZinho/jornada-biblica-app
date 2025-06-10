
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; 
import type { QuizQuestionType, QuizSettings, QuizResult } from '@/types';
import { generateQuizQuestions, type GenerateQuizQuestionsInput } from '@/ai/flows/generate-quiz-questions';
import { sampleQuizQuestions } from '@/lib/quizData'; 
import { QuizSetup } from '@/components/quiz/QuizSetup';
import { QuizQuestionDisplay } from '@/components/quiz/QuizQuestionDisplay';
import { ExplanationDialog } from '@/components/quiz/ExplanationDialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, RotateCcw } from 'lucide-react';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { useUser } from '@/hooks/useUser';
import { canUseFeature, recordFeatureUsage, getFeatureLimitConfig, USER_PLANS_CONFIG } from '@/lib/usageLimits';

export default function QuizPage() {
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationData, setExplanationData] = useState<{ question: string; userAnswer: string; correctAnswer: string; explanationContext?: string; } | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isExplanationReady, setIsExplanationReady] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isLoadingUser } = useUser();

  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.push('/login?next=/quiz');
    }
  }, [user, isLoadingUser, router]);

  const handleStartQuiz = useCallback(async (selectedSettings: QuizSettings) => {
    if (!user) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar logado para iniciar um quiz.",
        variant: "destructive",
      });
      router.push('/login?next=/quiz');
      return;
    }

    const userPlan = user.app_metadata.plan || 'free';
    const limitConfig = getFeatureLimitConfig(userPlan, 'quiz');
    let actualNumberOfQuestions = selectedSettings.numberOfQuestions;

    if (limitConfig) {
      if (!canUseFeature(user.id, 'quiz', limitConfig.limit, limitConfig.period)) {
        toast({
          title: "Limite Diário Atingido",
          description: `Você atingiu o limite de ${limitConfig.limit} quizzes por dia para o plano ${USER_PLANS_CONFIG[userPlan]?.name || userPlan}. Considere fazer um upgrade!`,
          variant: "destructive",
          duration: 7000,
          action: (
            <Button onClick={() => router.push('/planos')} size="sm">
              Ver Planos
            </Button>
          ),
        });
        return;
      }
      
      // Ajusta o número de perguntas para usuários 'free' se exceder o limite da funcionalidade
      // (ex: quiz free permite max 5 perguntas mesmo que o plano de quiz diário seja 5 usos)
      const quizFeatureLimitForFree = USER_PLANS_CONFIG.free.limits.quiz; // Assumindo que 'quiz' sempre terá um limite para free
      if (userPlan === 'free' && quizFeatureLimitForFree && actualNumberOfQuestions > quizFeatureLimitForFree.limit) {
         actualNumberOfQuestions = quizFeatureLimitForFree.limit;
         toast({
            title: "Número de Perguntas Ajustado",
            description: `Usuários do plano Free podem jogar com no máximo ${quizFeatureLimitForFree.limit} perguntas. Ajustamos para você.`,
            variant: "default",
            duration: 6000,
         });
      }
    }

    setIsLoadingQuestions(true);
    setSettings(selectedSettings);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizResults([]);
    setQuestions([]); 

    try {
      const aiInput: GenerateQuizQuestionsInput = {
        topic: selectedSettings.topic === "Todos os Tópicos" ? "Bíblia em geral" : selectedSettings.topic,
        difficulty: selectedSettings.difficulty === "todos" ? "médio" : selectedSettings.difficulty,
        numberOfQuestions: actualNumberOfQuestions, // Usa o número ajustado
      };
      const response = await generateQuizQuestions(aiInput);
      
      let generatedQuestions = response.questions as QuizQuestionType[];

      if (!generatedQuestions || generatedQuestions.length === 0) {
        toast({
            title: "IA não Gerou Perguntas",
            description: "A IA não conseguiu gerar perguntas. Usando perguntas de exemplo.",
            variant: "destructive",
        });
        generatedQuestions = sampleQuizQuestions.filter(q => 
            (selectedSettings.topic === "Todos os Tópicos" || q.topic === selectedSettings.topic || aiInput.topic === "Bíblia em geral") &&
            (selectedSettings.difficulty === "todos" || q.difficulty === selectedSettings.difficulty)
        ).slice(0, actualNumberOfQuestions);
      }
      
      let finalQuestions = generatedQuestions.filter(q => q.question && q.options && q.correctAnswer); 

      if (finalQuestions.length < actualNumberOfQuestions) {
        const needed = actualNumberOfQuestions - finalQuestions.length;
        if (needed > 0) {
            const fallbackSample = sampleQuizQuestions.filter(q => 
                (selectedSettings.topic === "Todos os Tópicos" || q.topic === selectedSettings.topic || aiInput.topic === "Bíblia em geral") &&
                (selectedSettings.difficulty === "todos" || q.difficulty === selectedSettings.difficulty) &&
                !finalQuestions.some(fq => fq.id === q.id) 
            ).slice(0, needed);
            finalQuestions = [...finalQuestions, ...fallbackSample];
        }
      }
      
      finalQuestions = finalQuestions.slice(0, actualNumberOfQuestions);

      if (finalQuestions.length === 0) {
         toast({
            title: "Nenhuma Pergunta Encontrada",
            description: "Não foi possível encontrar ou gerar perguntas com os critérios selecionados.",
            variant: "destructive",
        });
        setIsLoadingQuestions(false);
        setQuizStarted(false); 
        return;
      }
      
      setQuestions(finalQuestions);
      setQuizStarted(true);
      // Registra o uso APÓS o quiz ser configurado com sucesso
      if (limitConfig && user) {
        recordFeatureUsage(user.id, 'quiz', limitConfig.period);
      }

    } catch (error) {
      console.error("Erro ao gerar perguntas do quiz:", error);
      toast({
        title: "Erro ao Gerar Perguntas",
        description: `Houve um problema com a IA: ${(error as Error).message}. Usando perguntas de exemplo.`,
        variant: "destructive",
      });
      
      let fallbackQuestions = sampleQuizQuestions.filter(q => 
          (selectedSettings.topic === "Todos os Tópicos" || q.topic === selectedSettings.topic || (selectedSettings.topic === "Todos os Tópicos" && "Bíblia em geral")) &&
          (selectedSettings.difficulty === "todos" || q.difficulty === selectedSettings.difficulty)
      ).slice(0, actualNumberOfQuestions);
        
      if (fallbackQuestions.length === 0) {
           toast({
              title: "Nenhuma Pergunta de Exemplo",
              description: "Não foi possível encontrar perguntas de exemplo com os critérios selecionados.",
              variant: "destructive",
          });
          setQuizStarted(false); 
      } else {
        setQuestions(fallbackQuestions);
        setQuizStarted(true);
        // Registra o uso APÓS o quiz ser configurado com sucesso (mesmo com fallback)
        if (limitConfig && user) {
          recordFeatureUsage(user.id, 'quiz', limitConfig.period);
        }
      }
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [toast, user, router]);

  const handleAnswer = (selectedAnswer: string, isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    const currentQ = questions[currentQuestionIndex];

    setQuizResults(prev => [...prev, {
      question: currentQ.question,
      selectedAnswer,
      correctAnswer: currentQ.correctAnswer,
      isCorrect
    }]);
    
    setExplanationData({
      question: currentQ.question,
      userAnswer: selectedAnswer,
      correctAnswer: currentQ.correctAnswer,
      explanationContext: currentQ.explanationContext,
    });
    setIsExplanationReady(false); 
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

  if (isLoadingUser) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <LoadingIndicator text="Carregando dados do usuário..." size={48} />
      </div>
    );
  }
  
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
          explanationContext={explanationData.explanationContext}
          onContentLoadStateChange={setIsExplanationReady}
        />
      )}
      
      {showExplanation && isExplanationReady && (
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
