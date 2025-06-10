
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
import { Lock, Loader2, QrCode, Copy, ArrowLeft, ShoppingBag } from 'lucide-react';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { Separator } from '@/components/ui/separator';

interface FormData {
  itemName: string;
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
    itemName: '',
    unitPrice: 0,
    payerEmail: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPixSection, setShowPixSection] = useState(false);
  const [pixQrCodeBase64, setPixQrCodeBase64] = useState<string | null>(null);
  const [pixCopyPaste, setPixCopyPaste] = useState<string | null>(null);

  const isPlanFromUrl = !!(planNameFromUrl && planPriceFromUrl);

  useEffect(() => {
    const newPlanName = searchParams.get('planName');
    const newPlanPrice = searchParams.get('planPrice');

    if (newPlanName && newPlanPrice) {
      setFormData(prev => ({
        ...prev,
        itemName: newPlanName,
        unitPrice: parseFloat(newPlanPrice),
      }));
    } else {
      // Opcional: lidar com o caso de não haver plano na URL, 
      // talvez redirecionar para /planos ou mostrar um erro.
      // Por agora, vamos deixar o usuário preencher o email e tentar um pagamento genérico (se sua edge function suportar).
      // Ou, melhor, se não veio de /planos, não deveria estar aqui.
      if (!planNameFromUrl) { // Se não há nem nome do plano, é mais seguro redirecionar
        toast({
            title: "Plano não especificado",
            description: "Por favor, selecione um plano primeiro.",
            variant: "destructive",
        });
        router.push('/planos');
      } else { // Se tem nome mas não preço, pode ser um item free ou erro nos params
         setFormData(prev => ({
            ...prev,
            itemName: newPlanName || "Item Genérico",
            unitPrice: 0, // Poderia ser um plano free
         }));
      }
    }
  }, [searchParams, router, toast, planNameFromUrl]);


  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      payerEmail: e.target.value,
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

    if (formData.unitPrice <= 0 && isPlanFromUrl) { // Apenas valida preço se for um plano pago da URL
        toast({
            title: "Erro de Validação",
            description: "O preço do plano deve ser maior que zero.",
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
          id: formData.itemName.replace(/\s+/g, '-').toLowerCase() || 'item-default-01',
          title: formData.itemName,
          quantity: 1, // Assumindo quantidade 1 para assinaturas
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
    <Card className="w-full max-w-md shadow-xl mx-auto">
      {!showPixSection ? (
        <>
          <CardHeader className="text-center">
            <Lock className="h-10 w-10 text-primary mx-auto mb-3" />
            <CardTitle className="text-2xl font-headline">Finalizar Assinatura</CardTitle>
            {isPlanFromUrl && formData.itemName && formData.unitPrice >= 0 && (
              <CardDescription className="text-md pt-2 text-foreground/80">
                Você está assinando: <span className="font-semibold text-primary">{formData.itemName}</span>
                <br />
                Valor: <span className="font-semibold text-primary">R$ {formData.unitPrice.toFixed(2).replace('.', ',')}</span>
              </CardDescription>
            )}
            {(!isPlanFromUrl || !formData.itemName) && (
                 <CardDescription className="text-md pt-2">
                    Carregando detalhes do plano...
                 </CardDescription>
            )}
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-4">
              <Separator />
              <div className="space-y-2 pt-2">
                <Label htmlFor="payerEmail" className="font-semibold">Seu melhor e-mail</Label>
                <Input
                  id="payerEmail"
                  name="payerEmail"
                  type="email"
                  value={formData.payerEmail}
                  onChange={handleEmailChange}
                  placeholder="seu.email@exemplo.com"
                  required
                  className="text-base h-12"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center pt-2">
                Você será direcionado ao ambiente seguro do Mercado Pago para escolher a forma de pagamento (PIX, Cartão, etc.).
              </p>
            </CardContent>
            <CardFooter className="flex-col gap-3 pt-2">
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg" disabled={isLoading || !formData.itemName}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Pagar com Mercado Pago"
                )}
              </Button>
              {isPlanFromUrl && (
                  <Button onClick={() => router.push('/planos')} variant="link" className="text-sm font-normal text-muted-foreground hover:text-primary">
                      Escolher outro plano
                  </Button>
              )}
            </CardFooter>
          </form>
        </>
      ) : (
        <>
          <CardHeader className="text-center">
            <QrCode className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl font-headline">Pague com PIX</CardTitle>
            <CardDescription className="text-foreground/80">
              Escaneie o QR Code abaixo com o app do seu banco ou copie o código.
            </CardDescription>
            {formData.itemName && (
                 <p className="text-sm text-muted-foreground pt-1">Plano: {formData.itemName} - R$ {formData.unitPrice.toFixed(2).replace('.', ',')}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {pixQrCodeBase64 && (
              <div className="flex justify-center p-2 bg-white rounded-md shadow-md max-w-[200px] mx-auto">
                <Image 
                  src={pixQrCodeBase64} 
                  alt="QR Code PIX" 
                  width={180} 
                  height={180}
                  data-ai-hint="pix qrcode"
                />
              </div>
            )}
            {pixCopyPaste && (
              <div className="space-y-2">
                <Label htmlFor="pixCopyPasteCode" className="font-semibold">PIX Copia e Cola:</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="pixCopyPasteCode"
                    type="text"
                    value={pixCopyPaste}
                    readOnly
                    className="bg-muted/50 text-sm flex-grow h-11"
                  />
                  <Button variant="outline" size="icon" onClick={handleCopyToClipboard} title="Copiar Código PIX" className="h-11 w-11">
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center">
              Após o pagamento, a confirmação pode levar alguns instantes.
              (A verificação automática de pagamento não está implementada nesta etapa.)
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
             <Button onClick={handleBackToForm} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4"/>
              Alterar E-mail ou Método
            </Button>
            {isPlanFromUrl && (
                <Button onClick={() => router.push('/planos')} variant="link" className="w-full text-sm font-normal text-muted-foreground hover:text-primary">
                    Ver outros Planos
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
    <div className="flex justify-center items-start py-8 md:py-12 animate-fade-in">
       <Suspense fallback={<div className="flex justify-center items-center h-screen"><LoadingIndicator text="Carregando checkout..." /></div>}>
        <CheckoutMercadoPagoContent />
      </Suspense>
    </div>
  );
}

    