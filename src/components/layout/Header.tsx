
import Link from 'next/link';
import { AppLogo } from '@/components/icons/AppLogo';
import { Button } from '@/components/ui/button';
import { Menu, Home, ListChecks, BookOpenText, MessageSquareQuote, Quote, CheckSquare, LayoutList } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const navItems = [
  { href: '/', label: 'Início', icon: <Home className="h-5 w-5" /> },
  { href: '/quiz', label: 'Quiz Bíblico', icon: <ListChecks className="h-5 w-5" /> },
  { href: '/guess-the-text', label: 'Qual é o Texto?', icon: <MessageSquareQuote className="h-5 w-5" /> },
  { href: '/who-said-this', label: 'Quem Disse Isso?', icon: <Quote className="h-5 w-5" /> },
  { href: '/true-false-quiz', label: 'Verdadeiro ou Falso?', icon: <CheckSquare className="h-5 w-5" /> },
  { href: '/daily-verse', label: 'Versículo do Dia', icon: <BookOpenText className="h-5 w-5" /> },
  { href: '/planos', label: 'Planos', icon: <LayoutList className="h-5 w-5" /> },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-8 flex items-center gap-2" aria-label="Página Inicial da Jornada Bíblica">
          <AppLogo />
          <span className="font-headline text-xl font-bold text-primary">Jornada Bíblica</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
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
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-primary">
                <Menu />
                <span className="sr-only">Abrir Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px] bg-background p-6">
              <SheetHeader className="mb-6 text-left">
                <SheetTitle asChild>
                  <Link href="/" className="flex items-center gap-2">
                    <AppLogo />
                    <span className="font-headline text-xl font-bold text-primary">Jornada Bíblica</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-1">
                {navItems.map((item) => (
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
