
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { LogIn, Mail, KeyRound, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Erro no Login",
        description: error.message || "Não foi possível fazer login. Verifique suas credenciais.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login Bem-Sucedido!",
        description: "Você será redirecionado em breve.",
      });
      router.push('/'); // Redireciona para a página inicial após o login
      router.refresh(); // Força a atualização do estado de autenticação nos componentes
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-12 animate-fade-in">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <LogIn className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-headline">Acessar Conta</CardTitle>
          <CardDescription>
            Entre com suas credenciais para continuar sua jornada.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6">
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
                placeholder="Sua senha"
                required
                className="text-base h-12"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
