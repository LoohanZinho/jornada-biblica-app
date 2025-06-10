
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { processPaymentWithMercadoPago } from '@/services/mercadoPagoSupabaseService';
import { CreditCard, Loader2 } from 'lucide-react';

interface FormData {
  itemName: string;
  quantity: number;
  unitPrice: number;
  payerEmail: string;
}

export default function CheckoutMercadoPagoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    itemName: 'Assinatura Jornada Bíblica', // Nome do item atualizado aqui
    quantity: 1,
    unitPrice: 10.50,
    payerEmail: 'comprador.teste@email.com',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.unitPrice <= 0 || formData.quantity <= 0) {
        toast({
            title: "Erro de Validação",
            description: "O preço e a quantidade devem ser maiores que zero.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }

    const paymentData = {
      items: [
        {
          id: 'item-biblico-01', // ID de exemplo
          title: formData.itemName,
          quantity: formData.quantity,
          unit_price: formData.unitPrice,
        },
      ],
      payerEmail: formData.payerEmail,
    };

    try {
      const response = await processPaymentWithMercadoPago(paymentData);

      if (response.init_point) {
        toast({
          title: "Redirecionando para o Mercado Pago...",
          description: "Você será levado ao ambiente de pagamento seguro.",
        });
        // router.push(response.init_point); // Redirecionamento Next.js pode ser bloqueado
        window.location.href = response.init_point; // Redirecionamento direto do navegador
      } else if (response.error) {
        console.error("Erro do Mercado Pago Supabase Service:", response.error);
        toast({
          title: "Erro ao Iniciar Pagamento",
          description: response.error,
          variant: "destructive",
        });
      } else {
         toast({
          title: "Erro Desconhecido",
          description: "Não foi possível obter o link de pagamento. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast({
        title: "Erro Crítico",
        description: `Ocorreu um erro inesperado: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start py-8 animate-fade-in">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-headline">Checkout Teste - Mercado Pago</CardTitle>
          <CardDescription>
            Use este formulário para testar a integração com o Mercado Pago via Supabase.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="itemName">Nome do Produto</Label>
              <Input
                id="itemName"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Preço Unitário (R$)</Label>
                <Input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  min="0.01"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payerEmail">Email do Pagador</Label>
              <Input
                id="payerEmail"
                name="payerEmail"
                type="email"
                value={formData.payerEmail}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processando...
                </>
              ) : (
                "Pagar com Mercado Pago"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
