
"use client";

import type { QuizSettings } from '@/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { quizDifficulties } from '@/lib/quizData';
import { CheckSquare, XSquare } from 'lucide-react';

const gameSettingsSchema = z.object({
  topic: z.string().min(1, "Por favor, digite um tópico.").max(100, "O tópico deve ter no máximo 100 caracteres."),
  difficulty: z.enum(["todos", "fácil", "médio", "difícil"]),
  numberOfQuestions: z.number().min(1).max(15), 
});

interface TrueFalseQuizSetupProps {
  onStartGame: (settings: QuizSettings) => void;
}

export function TrueFalseQuizSetup({ onStartGame }: TrueFalseQuizSetupProps) {
  const { control, handleSubmit, register, formState: { errors } } = useForm<QuizSettings>({
    resolver: zodResolver(gameSettingsSchema),
    defaultValues: {
      topic: "Bíblia em geral", 
      difficulty: 'médio',
      numberOfQuestions: 5,
    },
  });

  const onSubmit = (data: QuizSettings) => {
    onStartGame(data);
  };

  const questionCounts = [3, 5, 7, 10, 15];

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl animate-fade-in">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
            <CheckSquare className="h-10 w-10 text-primary" />
            <XSquare className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-3xl font-headline">Quiz Verdadeiro ou Falso</CardTitle>
        <CardDescription>Configure seu desafio e teste seus conhecimentos bíblicos.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic" className="font-semibold">Tópico das Afirmações</Label>
            <Input
              id="topic"
              aria-label="Digite o tópico para as afirmações"
              placeholder="Ex: Vida de Jesus, Antigo Testamento"
              {...register("topic")}
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
            <Label htmlFor="numberOfQuestions" className="font-semibold">Número de Afirmações</Label>
            <Controller
              name="numberOfQuestions"
              control={control}
              render={({ field }) => (
                <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)}>
                  <SelectTrigger id="numberOfQuestions" aria-label="Selecionar número de afirmações">
                    <SelectValue placeholder="Selecione a quantidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionCounts.map((count) => (
                      <SelectItem key={count} value={String(count)}>
                        {count} Afirmações
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
            Começar o Quiz
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
