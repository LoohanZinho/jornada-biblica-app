
"use client";

import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { UserCircle, Mail, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoading, signOut } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?next=/profile');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingIndicator text="Carregando perfil..." />
      </div>
    );
  }

  const fullName = user.user_metadata?.full_name || 'Nome não fornecido';
  const userEmail = user.email || 'E-mail não disponível';

  const handleSignOut = async () => {
    await signOut();
    router.push('/'); 
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12 animate-fade-in">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <UserCircle className="h-20 w-20 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl md:text-4xl font-headline">{fullName}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground flex items-center justify-center">
            <Mail className="mr-2 h-5 w-5" /> {userEmail}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-foreground/80">
            Bem-vindo ao seu perfil, {fullName.split(' ')[0]}!
          </p>
          {/* Você pode adicionar mais informações do perfil ou opções de edição aqui no futuro. */}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleSignOut} variant="destructive" size="lg">
            <LogOut className="mr-2 h-5 w-5" /> Sair da Conta
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
