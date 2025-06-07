"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { QuizQuestionType, QuizSettings, QuizResult } from '@/types';
import { sampleQuizQuestions } from '@/lib/quizData';
import { QuizSetup } from '@/components/quiz/QuizSetup';
import { QuizQuestionDisplay } from '@/components/quiz/QuizQuestionDisplay';
import { ExplanationDialog } from '@/components/quiz/ExplanationDialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, RotateCcw } from 'lucide-react';

export default function QuizPage() {
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationData, setExplanationData] = useState<{ question: string; userAnswer: string; correctAnswer: string } | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const filterAndSelectQuestions = useCallback((allQuestions: QuizQuestionType[], currentSettings: QuizSettings): QuizQuestionType[] => {
    let filtered = allQuestions;
    if (currentSettings.topic !== "All Topics") {
      filtered = filtered.filter(q => q.topic === currentSettings.topic);
    }
    if (currentSettings.difficulty !== "any") {
      filtered = filtered.filter(q => q.difficulty === currentSettings.difficulty);
    }
    // Shuffle and take N questions
    const shuffled = filtered.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, currentSettings.numberOfQuestions);
  }, []);


  const handleStartQuiz = useCallback((selectedSettings: QuizSettings) => {
    const selectedQuestions = filterAndSelectQuestions(sampleQuizQuestions, selectedSettings);
    
    if (selectedQuestions.length === 0) {
        toast({
            title: "No Questions Found",
            description: "Could not find questions matching your criteria. Please try different settings.",
            variant: "destructive",
        });
        return;
    }
    if (selectedQuestions.length < selectedSettings.numberOfQuestions) {
        toast({
            title: "Fewer Questions Found",
            description: `Only found ${selectedQuestions.length} questions for your criteria. Adjusting quiz length.`,
            variant: "default",
        });
        selectedSettings.numberOfQuestions = selectedQuestions.length;
    }

    setSettings(selectedSettings);
    setQuestions(selectedQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizResults([]);
    setQuizStarted(true);
  }, [toast, filterAndSelectQuestions]);

  const handleAnswer = (selectedAnswer: string, isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prev => prev + 1);
       toast({
        title: "Correct!",
        description: "Well done!",
        variant: "default",
        duration: 2000,
      });
    } else {
        toast({
        title: "Incorrect",
        description: `The correct answer was: ${questions[currentQuestionIndex].correctAnswer}`,
        variant: "destructive",
        duration: 3000,
      });
    }

    setQuizResults(prev => [...prev, {
      question: questions[currentQuestionIndex].question,
      selectedAnswer,
      correctAnswer: questions[currentQuestionIndex].correctAnswer,
      isCorrect
    }]);
    
    setExplanationData({
      question: questions[currentQuestionIndex].question,
      userAnswer: selectedAnswer,
      correctAnswer: questions[currentQuestionIndex].correctAnswer,
    });
    setShowExplanation(true); 
  };

  const handleNextAfterExplanation = () => {
    setShowExplanation(false);
    setExplanationData(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Quiz finished
      localStorage.setItem('quizResults', JSON.stringify({ score, totalQuestions: questions.length, results: quizResults, areasOfInterest: settings?.topic || 'General Knowledge' }));
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
  };

  if (!quizStarted || !settings) {
    return <QuizSetup onStartQuiz={handleStartQuiz} />;
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground mb-4">No questions available for the selected criteria.</p>
        <Button onClick={resetQuiz} variant="outline">Try Different Settings</Button>
      </div>
    );
  }
  
  const currentQuestionData = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary font-headline">Biblical Quest</h2>
        <Button onClick={resetQuiz} variant="outline" size="sm">
          <RotateCcw className="mr-2 h-4 w-4" /> Reset Quiz
        </Button>
      </div>
      <Progress value={progressPercentage} className="w-full h-3" />
      
      <QuizQuestionDisplay
        questionData={currentQuestionData}
        onAnswer={handleAnswer}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
      />

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
                {currentQuestionIndex < questions.length - 1 ? "Next Question" : "View Results"}
                <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
         </div>
      )}
    </div>
  );
}
