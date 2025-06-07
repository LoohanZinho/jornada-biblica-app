
"use client";

import type { QuizSettings } from '@/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { quizTopics, quizDifficulties } from '@/lib/quizData'; 
import { Wand2 } from 'lucide-react';

const quizSettingsSchema = z.object({
  topic: z.string().min(1, "Por favor, selecione um tópico."),
  difficulty: z.enum(["todos", "fácil", "médio", "difícil"]),
  numberOfQuestions: z.number().min(1).max(20), 
});

interface QuizSetupProps {
  onStartQuiz: (settings: QuizSettings) => void;
}

export function QuizSetup({ onStartQuiz }: QuizSetupProps) {
  const { control, handleSubmit, formState: { errors } } = useForm<QuizSettings>({
    resolver: zodResolver(quizSettingsSchema),
    defaultValues: {
      topic: quizTopics[0], 
      difficulty: 'todos',
      numberOfQuestions: 5,
    },
  });

  const onSubmit = (data: QuizSettings) => {
    onStartQuiz(data);
  };

  const questionCounts = [5, 10, 15, 20];

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl animate-fade-in">
      <CardHeader className="text-center">
        <Wand2 className="h-12 w-12 text-primary mx-auto mb-4" />
        <CardTitle className="text-3xl font-headline">Configure Sua Jornada</CardTitle>
        <CardDescription>Escolha seu desafio e comece sua exploração bíblica.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic" className="font-semibold">Tópico</Label>
            <Controller
              name="topic"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="topic" aria-label="Selecionar tópico">
                    <SelectValue placeholder="Selecione um tópico" />
                  </SelectTrigger>
                  <SelectContent>
                    {quizTopics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.topic && <p className="text-sm text-destructive">{errors.topic.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty" className="font-semibold">Dificuldade</Label>
            <Controller
              name="difficulty"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="difficulty" aria-label="Selecionar dificuldade">
                    <SelectValue placeholder="Selecione a dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    {quizDifficulties.map((level) => (
                      <SelectItem key={level} value={level} className="capitalize">
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
             {errors.difficulty && <p className="text-sm text-destructive">{errors.difficulty.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="numberOfQuestions" className="font-semibold">Número de Perguntas</Label>
            <Controller
              name="numberOfQuestions"
              control={control}
              render={({ field }) => (
                <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)}>
                  <SelectTrigger id="numberOfQuestions" aria-label="Selecionar número de perguntas">
                    <SelectValue placeholder="Selecione a quantidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionCounts.map((count) => (
                      <SelectItem key={count} value={String(count)}>
                        {count} Perguntas
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.numberOfQuestions && <p className="text-sm text-destructive">{errors.numberOfQuestions.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
            Começar Jornada
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

    