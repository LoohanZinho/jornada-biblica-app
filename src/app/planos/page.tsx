
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Award, Star, Zap, ShoppingCart, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

const plans = [
  {
    name: "Usuário Free",
    price: "Grátis",
    priceDetails: "",
    features: [
      "Quiz Bíblico: Acesso limitado (5 perguntas/dia, tópicos selecionados)",
      "Qual é o Texto?: Acesso limitado (3 desafios/dia)",
      "Quem Disse Isso?: Acesso limitado (3 desafios/dia)",
      "Verdadeiro ou Falso?: Acesso limitado (3 desafios/dia)",
      "Versículo do Dia: Acesso completo",
      "Orações Personalizadas: 1 por semana (após quiz)",
    ],
    cta: "Começar Agora",
    icon: <Star className="h-10 w-10 text-primary mb-4" />,
    href: "/quiz" // Ou para uma página de registro/login se tiver
  },
  {
    name: "Peregrino Digital",
    price: "R$ 9,90",
    priceDetails: "/mês",
    features: [
      "Todos os benefícios do Free, MAIS:",
      "Quiz Bíblico: Acesso ilimitado",
      "Qual é o Texto?: Acesso ilimitado",
      "Quem Disse Isso?: Acesso ilimitado",
      "Verdadeiro ou Falso?: Acesso ilimitado",
      "Orações Personalizadas: 1 por dia",
      "Experiência sem anúncios",
      "Acesso antecipado a novos recursos",
    ],
    cta: "Assinar Peregrino",
    icon: <Award className="h-10 w-10 text-primary mb-4" />,
    planIdentifier: "peregrino_digital",
    priceValue: 9.90
  },
  {
    name: "Mestre das Escrituras",
    price: "R$ 19,90",
    priceDetails: "/mês",
    features: [
      "Todos os benefícios do Peregrino Digital, MAIS:",
      "Orações Personalizadas: Acesso ilimitado",
      "Conteúdo Exclusivo: Estudos bíblicos aprofundados, guias",
      "Imagens Geradas por IA: Qualidade superior (se aplicável)",
      "Suporte prioritário",
    ],
    cta: "Assinar Mestre",
    icon: <Zap className="h-10 w-10 text-primary mb-4" />,
    planIdentifier: "mestre_escrituras",
    priceValue: 19.90
  }
];

export default function PlanosPage() {
  const router = useRouter();

  const handleSubscription = (planName: string, planPrice: number) => {
    router.push(`/checkout-mp?planName=${encodeURIComponent(planName)}&planPrice=${planPrice}`);
  };

  return (
    <div className="flex flex-col items-center space-y-12 py-10 animate-fade-in">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-headline">
          Escolha seu Plano na Jornada Bíblica
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Desbloqueie mais recursos e aprofunde seu conhecimento com nossos planos de assinatura.
        </p>
      </section>

      <section className="w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className="shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col animate-slide-in-from-bottom"
              style={{animationDelay: `${index * 150}ms`}}
            >
              <CardHeader className="items-center text-center bg-card-foreground/5 dark:bg-card-foreground/10 rounded-t-lg">
                {plan.icon}
                <CardTitle className="text-2xl font-headline text-primary">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-accent">
                  {plan.price}
                  {plan.priceDetails && <span className="text-sm font-normal text-muted-foreground">{plan.priceDetails}</span>}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow p-6 space-y-4">
                <ul className="space-y-2 text-sm text-foreground/90 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-6 border-t mt-auto">
                {plan.planIdentifier && plan.priceValue ? (
                  <Button 
                    onClick={() => handleSubscription(plan.name, plan.priceValue as number)} 
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90" 
                    size="lg"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" /> {plan.cta}
                  </Button>
                ) : (
                  <Link href={plan.href || '/'} className="w-full">
                    <Button variant="outline" className="w-full" size="lg">
                      {plan.cta}
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
       <section className="w-full max-w-2xl text-center mt-10 p-6 bg-secondary/30 rounded-lg">
        <Lock className="h-10 w-10 text-primary mx-auto mb-3" />
        <h3 className="text-xl font-semibold mb-2 font-headline">Pagamento Seguro</h3>
        <p className="text-sm text-muted-foreground">
          Todos os pagamentos são processados de forma segura através do Mercado Pago. Seus dados financeiros estão protegidos.
        </p>
      </section>
    </div>
  );
}
