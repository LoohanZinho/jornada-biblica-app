
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { processPaymentWithMercadoPago } from '@/services/mercadoPagoSupabaseService';
import { CreditCard, Loader2, QrCode, Copy, ArrowLeft } from 'lucide-react';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';

interface FormData {
  itemName: string;
  quantity: number;
  unitPrice: number;
  payerEmail: string;
}

interface MercadoPagoResponse {
  init_point?: string;
  qr_code_base64?: string;
  qr_code?: string;
  payment_id?: string;
  error?: string;
}

function CheckoutMercadoPagoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const planNameFromUrl = searchParams.get('planName');
  const planPriceFromUrl = searchParams.get('planPrice');

  const [formData, setFormData] = useState<FormData>({
    itemName: planNameFromUrl || 'Assinatura Jornada Bíblica',
    quantity: 1,
    unitPrice: planPriceFromUrl ? parseFloat(planPriceFromUrl) : 1.00,
    payerEmail: 'seu.email@exemplo.com',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPixSection, setShowPixSection] = useState(false);
  const [pixQrCodeBase64, setPixQrCodeBase64] = useState<string | null>(null);
  const [pixCopyPaste, setPixCopyPaste] = useState<string | null>(null);

  const isPlanFromUrl = !!(planNameFromUrl && planPriceFromUrl);

  useEffect(() => {
    // Update form data if URL params change (e.g., user navigates back and selects a different plan)
    const newPlanName = searchParams.get('planName');
    const newPlanPrice = searchParams.get('planPrice');
    if (newPlanName && newPlanPrice) {
      setFormData(prev => ({
        ...prev,
        itemName: newPlanName,
        unitPrice: parseFloat(newPlanPrice),
        quantity: 1, // Reset quantity for subscriptions
      }));
    }
  }, [searchParams]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCopyToClipboard = async () => {
    if (pixCopyPaste) {
      try {
        await navigator.clipboard.writeText(pixCopyPaste);
        toast({
          title: "Copiado!",
          description: "Código PIX copiado para a área de transferência.",
        });
      } catch (err) {
        toast({
          title: "Erro ao Copiar",
          description: "Não foi possível copiar o código PIX.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setShowPixSection(false);
    setPixQrCodeBase64(null);
    setPixCopyPaste(null);

    if (formData.unitPrice <= 0 || formData.quantity <= 0) {
        toast({
            title: "Erro de Validação",
            description: "O preço e a quantidade devem ser maiores que zero.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }
    
    if (!formData.payerEmail || !/\S+@\S+\.\S+/.test(formData.payerEmail)) {
      toast({
          title: "Email Inválido",
          description: "Por favor, insira um endereço de e-mail válido.",
          variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const paymentData = {
      items: [
        {
          id: planNameFromUrl ? planNameFromUrl.replace(/\s+/g, '-').toLowerCase() : 'item-biblico-01',
          title: formData.itemName,
          quantity: formData.quantity,
          unit_price: formData.unitPrice,
        },
      ],
      payerEmail: formData.payerEmail,
    };

    try {
      const response: MercadoPagoResponse = await processPaymentWithMercadoPago(paymentData);

      if (response.qr_code_base64 && response.qr_code) {
        setPixQrCodeBase64(response.qr_code_base64);
        setPixCopyPaste(response.qr_code);
        setShowPixSection(true);
        toast({
          title: "QR Code PIX Gerado",
          description: "Escaneie o QR Code ou copie o código para pagar.",
        });
      } else if (response.init_point) {
        toast({
          title: "Redirecionando para o Mercado Pago...",
          description: "Você será levado ao ambiente de pagamento seguro.",
        });
        window.location.href = response.init_point;
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
          description: "Não foi possível obter os dados de pagamento. Tente novamente.",
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

  const handleBackToForm = () => {
    setShowPixSection(false);
    setPixQrCodeBase64(null);
    setPixCopyPaste(null);
  }

  return (
    <Card className="w-full max-w-lg shadow-xl">
      {!showPixSection ? (
        <>
          <CardHeader className="text-center">
            <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl font-headline">Pagamento</CardTitle>
            <CardDescription>
              {isPlanFromUrl ? `Você está assinando: ${formData.itemName}` : `Realize o pagamento de: ${formData.itemName}`}
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
                  readOnly={isPlanFromUrl} 
                  className={isPlanFromUrl ? "bg-muted/50 cursor-not-allowed" : ""}
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
                    readOnly={isPlanFromUrl}
                    className={isPlanFromUrl ? "bg-muted/50 cursor-not-allowed" : ""}
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
                    readOnly={isPlanFromUrl}
                    className={isPlanFromUrl ? "bg-muted/50 cursor-not-allowed" : ""}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payerEmail">Seu Email para Pagamento</Label>
                <Input
                  id="payerEmail"
                  name="payerEmail"
                  type="email"
                  value={formData.payerEmail}
                  onChange={handleChange}
                  placeholder="seu.email@exemplo.com"
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
        </>
      ) : (
        <>
          <CardHeader className="text-center">
            <QrCode className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl font-headline">Pague com PIX</CardTitle>
            <CardDescription>
              Escaneie o QR Code abaixo com o app do seu banco ou copie o código.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {pixQrCodeBase64 && (
              <div className="flex justify-center">
                <Image 
                  src={pixQrCodeBase64} 
                  alt="QR Code PIX" 
                  width={256} 
                  height={256} 
                  className="rounded-md shadow-md"
                  data-ai-hint="pix qrcode" 
                />
              </div>
            )}
            {pixCopyPaste && (
              <div className="space-y-2">
                <Label htmlFor="pixCopyPasteCode">PIX Copia e Cola:</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="pixCopyPasteCode"
                    type="text"
                    value={pixCopyPaste}
                    readOnly
                    className="bg-muted/50 text-sm flex-grow"
                  />
                  <Button variant="outline" size="icon" onClick={handleCopyToClipboard} title="Copiar Código PIX">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center">
              Após o pagamento, a confirmação pode levar alguns instantes.
              (Lembre-se: a verificação automática de pagamento não está implementada nesta etapa).
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
             <Button onClick={handleBackToForm} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4"/>
              Alterar Dados ou Método
            </Button>
            {isPlanFromUrl && (
                <Button onClick={() => router.push('/planos')} variant="link" className="w-full text-primary hover:text-primary/80">
                    Voltar para Planos
                </Button>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
}

export default function CheckoutMercadoPagoPage() {
  return (
    <div className="flex justify-center items-start py-8 animate-fade-in">
       <Suspense fallback={<div className="flex justify-center items-center h-64"><LoadingIndicator text="Carregando dados..." /></div>}>
        <CheckoutMercadoPagoContent />
      </Suspense>
    </div>
  );
}
