
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LockKeyhole, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';

export default function AuthRequiredPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');

  useEffect(() => {
    if (next) {
      console.log("Redirecionar para:", next, "após autenticação.");
    }
  }, [next]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12 animate-fade-in">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <LockKeyhole className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl md:text-4xl font-headline">Acesso Restrito</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Para continuar sua jornada e acessar este recurso, você precisa estar conectado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-foreground/90">
            Faça login se você já tem uma conta, ou crie uma nova para começar a explorar todos os recursos da Jornada Bíblica!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
              <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}>
                <LogIn className="mr-2 h-5 w-5" /> Fazer Login
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto" size="lg">
               <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`}>
                <UserPlus className="mr-2 h-5 w-5" /> Criar Conta
              </Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => router.push('/')} className="text-sm text-muted-foreground">
            Voltar para a Página Inicial
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
