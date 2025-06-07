
import Link from 'next/link';
import { AppLogo } from '@/components/icons/AppLogo';
import { Button } from '@/components/ui/button';
import { Menu, Home, ListChecks, BookOpenText, Map } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const navItems = [
  { href: '/', label: 'Início', icon: <Home className="h-5 w-5" /> },
  { href: '/quiz', label: 'Quiz', icon: <ListChecks className="h-5 w-5" /> },
  { href: '/daily-verse', label: 'Versículo do Dia', icon: <BookOpenText className="h-5 w-5" /> },
  { href: '/tours', label: 'Passeios Virtuais', icon: <Map className="h-5 w-5" /> },
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
              key={item.href}
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
                  <SheetClose asChild key={item.href}>
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
