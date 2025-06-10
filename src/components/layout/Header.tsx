
"use client";

import Link from 'next/link';
import { AppLogo } from '@/components/icons/AppLogo';
import { Button } from '@/components/ui/button';
import { Menu, Home, ListChecks, BookOpenText, MessageSquareQuote, Quote, CheckSquare, LayoutList, User as UserIconLucide, LogOut, Star } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { useUser } from '@/hooks/useUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';

const baseNavItems = [
  { href: '/', label: 'Início', icon: <Home className="h-5 w-5" /> },
  { href: '/quiz', label: 'Quiz Bíblico', icon: <ListChecks className="h-5 w-5" /> },
  { href: '/guess-the-text', label: 'Qual é o Texto?', icon: <MessageSquareQuote className="h-5 w-5" /> },
  { href: '/who-said-this', label: 'Quem Disse Isso?', icon: <Quote className="h-5 w-5" /> },
  { href: '/true-false-quiz', label: 'Verdadeiro ou Falso?', icon: <CheckSquare className="h-5 w-5" /> },
  { href: '/daily-verse', label: 'Versículo do Dia', icon: <BookOpenText className="h-5 w-5" /> },
  { href: '/planos', label: 'Planos', icon: <LayoutList className="h-5 w-5" /> },
];

export function Header() {
  const { user, signOut, isLoading } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const getInitials = (email?: string | null, name?: string | null) => {
    if (name) {
      const parts = name.trim().split(' ').filter(part => part.length > 0);
      if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      if (parts[0] && parts[0].length >=2) return parts[0].substring(0, 2).toUpperCase();
      if (parts[0]) return parts[0][0].toUpperCase();
    }
    if (email && email.includes('@')) {
      const firstLetter = email[0];
      const partBeforeAt = email.split('@')[0];
      if (partBeforeAt.length > 1 && partBeforeAt.includes('.')) {
        const nameParts = partBeforeAt.split('.');
        if (nameParts[0] && nameParts[1]) {
           return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
        }
      }
      if (partBeforeAt.length > 1 && !partBeforeAt.includes('.')){
         return email.substring(0, 2).toUpperCase();
      }
      return firstLetter.toUpperCase();
    }
    if (email && email.length >= 2) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'JB';
  };

  const currentNavItems = [...baseNavItems];
  const mobileNavItems = [...baseNavItems];
  if (user) {
    mobileNavItems.push({ href: '/profile', label: 'Meu Perfil', icon: <UserIconLucide className="h-5 w-5" /> });
  }

  return (
 <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-8 flex items-center gap-2" aria-label="Página Inicial da Jornada Bíblica">
          <AppLogo />
          <span className="font-headline text-xl font-bold text-primary">Jornada Bíblica</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {currentNavItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-2 transition-colors hover:text-primary text-foreground/80"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.user_metadata?.avatar_url || undefined} alt={user.user_metadata?.full_name || user.email || 'User Avatar'} />
                    <AvatarFallback>{getInitials(user.email, user.user_metadata?.full_name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none truncate">
                      {user.user_metadata?.full_name || 'Usuário'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center cursor-pointer w-full">
                    <UserIconLucide className="mr-2 h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                {user && (
                  <>
                    <DropdownMenuItem asChild >
                      <Link href="/planos" className="flex items-center w-full">
                        <Star className="mr-2 h-4 w-4 text-yellow-500" />
                        Upgrade
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <div className="hidden md:flex items-center space-x-2">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                    <Link href="/signup">Criar Conta</Link>
                </Button>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-primary">
                <Menu />
                <span className="sr-only">Abrir Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px] bg-background p-6 flex flex-col">
              <SheetHeader className="mb-6 text-left">
                <SheetTitle asChild>
                  <Link href="/" className="flex items-center gap-2">
                    <AppLogo />
                    <span className="font-headline text-xl font-bold text-primary">Jornada Bíblica</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-1 flex-grow">
                {mobileNavItems.map((item) => (
                  <SheetClose asChild key={item.label}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 rounded-md px-3 py-3 text-lg font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
                 {user && (
                   <SheetClose asChild key="upgrade-mobile">
                     <Link
                       href="/planos"
                       className="flex items-center gap-3 rounded-md px-3 py-3 text-lg font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                     >
                       <Star className="mr-3 h-5 w-5 text-yellow-500" />
                       Upgrade
                      </Link>
                   </SheetClose>
                 )}
              </nav>
              <div className="mt-auto pt-6 border-t">
                {user ? (
                    <SheetClose asChild>
                        <Button onClick={handleSignOut} variant="outline" className="w-full justify-start text-lg py-3">
                            <LogOut className="mr-3 h-5 w-5" />Sair da Conta
                        </Button>
                    </SheetClose>
                ) : (
                    <div className="space-y-2">
                        <SheetClose asChild>
                             <Link href="/login" className="w-full">
                                <Button variant="ghost" className="w-full justify-start text-lg py-3">
                                    <UserIconLucide className="mr-3 h-5 w-5" />Fazer Login
                                </Button>
                            </Link>
                        </SheetClose>
                        <SheetClose asChild>
                            <Link href="/signup" className="w-full">
                                <Button variant="default" className="w-full justify-start text-lg py-3">
                                    <UserIconLucide className="mr-3 h-5 w-5" />Criar Conta
                                </Button>
                            </Link>
                        </SheetClose>
                    </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
