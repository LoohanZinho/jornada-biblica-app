
"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { UserPlus, Mail, KeyRound, UserCircle, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const nextUrl = searchParams.get('next');

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName, // Armazena o nome completo nos metadados do usuário
        },
      },
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Erro no Cadastro",
        description: error.message || "Não foi possível criar a conta. Tente novamente.",
        variant: "destructive",
      });
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      // Caso de confirmação de e-mail pendente, mas o usuário já existe sem estar confirmado.
       toast({
        title: "Usuário Já Existe",
        description: "Este e-mail já está cadastrado, mas a confirmação está pendente. Verifique seu e-mail ou tente fazer login.",
        variant: "default",
      });
       router.push(`/login${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ''}`);
    } else if (data.session) {
       // Cadastro bem-sucedido e sessão criada (login automático)
      toast({
        title: "Cadastro Bem-Sucedido!",
        description: "Sua conta foi criada e você está logado. Redirecionando...",
      });
      router.push(nextUrl || '/');
      router.refresh();
    } else if (data.user) {
        // Cadastro bem-sucedido, mas precisa de confirmação de e-mail (Supabase padrão)
        toast({
            title: "Verifique seu E-mail",
            description: "Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada e spam.",
            duration: 10000, // Toast mais longo
        });
        // Não redireciona automaticamente, usuário precisa confirmar o e-mail
        // Poderia redirecionar para uma página de "verifique seu email" se desejado
        router.push(`/login${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ''}`);
    } else {
         toast({
            title: "Algo Deu Errado",
            description: "Não foi possível completar o cadastro. Tente novamente.",
            variant: "destructive",
        });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-12 animate-fade-in">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <UserPlus className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-headline">Criar Nova Conta</CardTitle>
          <CardDescription>
            Junte-se à Jornada Bíblica e comece a explorar.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="font-semibold flex items-center">
                <UserCircle className="mr-2 h-4 w-4 text-primary/80" /> Nome Completo
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
                required
                className="text-base h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold flex items-center">
                <Mail className="mr-2 h-4 w-4 text-primary/80" /> E-mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
                className="text-base h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold flex items-center">
                <KeyRound className="mr-2 h-4 w-4 text-primary/80" /> Senha
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha forte"
                required
                minLength={6} // Supabase exige no mínimo 6 caracteres por padrão
                className="text-base h-12"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Criando Conta...
                </>
              ) : (
                "Criar Conta"
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href={`/login${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ''}`} className="font-semibold text-primary hover:underline">
                Faça Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
