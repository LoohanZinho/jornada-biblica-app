"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonalizedPrayerCard } from '@/components/quiz/PersonalizedPrayerCard';
import { Award, CheckCircle2, Home, ListChecks, XCircle } from 'lucide-react';
import type { QuizResult } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StoredResults {
  score: number;
  totalQuestions: number;
  results: QuizResult[];
  areasOfInterest: string;
}

export default function QuizResultsPage() {
  const router = useRouter();
  const [storedResults, setStoredResults] = useState<StoredResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const resultsString = localStorage.getItem('quizResults');
    if (resultsString) {
      try {
        const parsedResults = JSON.parse(resultsString) as StoredResults;
        setStoredResults(parsedResults);
      } catch (error) {
        console.error("Failed to parse quiz results from localStorage", error);
        // Redirect or show error if results are malformed
        router.push('/quiz');
      }
    } else {
      // No results found, redirect to quiz page
      router.push('/quiz');
    }
    setIsLoading(false);
    // Optional: Clear results from localStorage after reading
    // localStorage.removeItem('quizResults');
  }, [router]);

  if (isLoading || !storedResults) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Award className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-xl">Loading results...</p>
      </div>
    );
  }

  const { score, totalQuestions, results, areasOfInterest } = storedResults;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  let performanceMessage = "Good effort! Keep exploring and learning.";
  if (percentage >= 80) {
    performanceMessage = "Excellent! Your knowledge is profound.";
  } else if (percentage >= 50) {
    performanceMessage = "Well done! You have a solid understanding.";
  }

  const quizPerformanceSummary = `Scored ${score} out of ${totalQuestions} (${percentage}%). ${
    results.filter(r => !r.isCorrect).length > 0 ? 
    `Areas for review might include questions like: "${results.find(r => !r.isCorrect)?.question.substring(0,50)}...".` 
    : "All answers were correct!"
  }`;

  return (
    <div className="flex flex-col items-center space-y-8 py-8 animate-fade-in">
      <Card className="w-full max-w-2xl shadow-xl text-center">
        <CardHeader>
          <Award className="h-20 w-20 text-primary mx-auto mb-4" />
          <CardTitle className="text-4xl font-headline">Quest Completed!</CardTitle>
          <CardDescription className="text-lg">{performanceMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-5xl font-bold text-accent">
            {score} / {totalQuestions}
          </p>
          <p className="text-2xl text-primary">{percentage}% Correct</p>
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2 font-headline">Your Answers:</h3>
            <ScrollArea className="h-[200px] border rounded-md p-4 text-left bg-secondary/30">
              {results.map((result, index) => (
                <div key={index} className="mb-3 pb-3 border-b last:border-b-0">
                  <p className="font-medium text-sm text-foreground/90">{index + 1}. {result.question}</p>
                  <p className={`text-xs ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    Your answer: {result.selectedAnswer} 
                    {result.isCorrect ? <CheckCircle2 className="inline ml-1 h-3 w-3" /> : <XCircle className="inline ml-1 h-3 w-3" />}
                  </p>
                  {!result.isCorrect && <p className="text-xs text-muted-foreground">Correct: {result.correctAnswer}</p>}
                </div>
              ))}
            </ScrollArea>
          </div>

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/quiz"><ListChecks className="mr-2 h-4 w-4" />Play Again</Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/"><Home className="mr-2 h-4 w-4" />Back to Home</Link>
          </Button>
        </CardFooter>
      </Card>

      <PersonalizedPrayerCard 
        quizPerformanceSummary={quizPerformanceSummary}
        areasOfInterest={areasOfInterest || "general biblical topics"}
      />
    </div>
  );
}
