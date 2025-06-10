
"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { processPaymentWithMercadoPago } from '@/services/mercadoPagoSupabaseService';
import { Lock, Loader2, QrCode, Copy, ArrowLeft, User, Mail, ShoppingBag, Edit3 } from 'lucide-react';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { Separator } from '@/components/ui/separator';

interface FormData {
  itemName: string;
  unitPrice: number;
  payerName: string;
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
  const pixSectionRef = useRef<HTMLDivElement>(null);

  const planNameFromUrl = searchParams.get('planName');
  const planPriceFromUrl = searchParams.get('planPrice');

  const [formData, setFormData] = useState<FormData>({
    itemName: 'Assinatura Jornada Bíblica',
    unitPrice: 0,
    payerName: '',
    payerEmail: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [pixQrCodeBase64, setPixQrCodeBase64] = useState<string | null>(null);
  const [pixCopyPaste, setPixCopyPaste] = useState<string | null>(null);
  const [isPixGenerated, setIsPixGenerated] = useState(false);

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
    } else if (newPlanName) {
        setFormData(prev => ({
            ...prev,
            itemName: newPlanName,
            unitPrice: 0, 
        }));
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
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

  const handleEditData = () => {
    setIsPixGenerated(false);
    setPixQrCodeBase64(null);
    setPixCopyPaste(null);
    // Campos de formulário já se tornarão editáveis porque `readOnly` depende de `isPixGenerated`
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (formData.unitPrice <= 0 && isPlanFromUrl) {
        toast({
            title: "Erro de Validação",
            description: "O preço do plano deve ser maior que zero.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }
    
    if (!formData.payerName.trim()) {
        toast({
            title: "Nome Inválido",
            description: "Por favor, insira seu nome completo.",
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
    
    // Limpa dados PIX anteriores antes de gerar um novo
    setPixQrCodeBase64(null);
    setPixCopyPaste(null);
    setIsPixGenerated(false);

    const nameParts = formData.payerName.trim().split(' ');
    const payerFirstName = nameParts[0] || '';
    const payerLastName = nameParts.slice(1).join(' ') || '';

    const paymentData = {
      items: [
        {
          id: formData.itemName.replace(/\s+/g, '-').toLowerCase() || 'item-default',
          title: formData.itemName,
          quantity: 1,
          unit_price: formData.unitPrice,
        },
      ],
      payerEmail: formData.payerEmail,
      payerFirstName: payerFirstName,
      payerLastName: payerLastName,
    };

    try {
      const response: MercadoPagoResponse = await processPaymentWithMercadoPago(paymentData);

      if (response.qr_code_base64 && response.qr_code) {
        setPixQrCodeBase64(response.qr_code_base64);
        setPixCopyPaste(response.qr_code);
        setIsPixGenerated(true);
        toast({
          title: "QR Code PIX Gerado",
          description: "Escaneie o QR Code ou copie o código para pagar.",
        });
        setTimeout(() => { 
            pixSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else if (response.init_point) {
        toast({
          title: "Redirecionando para o Mercado Pago...",
          description: "Você será levado ao ambiente de pagamento seguro.",
        });
        window.location.href = response.init_point;
      } else if (response.error) {
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
    <Card className="w-full max-w-md shadow-xl mx-auto">
      <CardHeader className="text-center">
        <Lock className="h-10 w-10 text-primary mx-auto mb-3" />
        <CardTitle className="text-2xl font-headline">Finalizar Assinatura</CardTitle>
        {isPlanFromUrl && formData.itemName && formData.unitPrice > 0 && (
          <CardDescription className="text-md pt-2 text-foreground/80">
            Você está assinando: <span className="font-semibold text-primary">{formData.itemName}</span>
            <br />
            Valor: <span className="font-semibold text-primary">R$ {formData.unitPrice.toFixed(2).replace('.', ',')}</span>
          </CardDescription>
        )}
         {isPlanFromUrl && formData.itemName && formData.unitPrice === 0 && ( 
          <CardDescription className="text-md pt-2 text-foreground/80">
            Você está acessando: <span className="font-semibold text-primary">{formData.itemName}</span> (Gratuito)
             <br />
             <span className="text-sm">Preencha seus dados para continuar.</span>
          </CardDescription>
        )}
        {(!isPlanFromUrl || !formData.itemName) && (
             <CardDescription className="text-md pt-2">
                Carregando detalhes...
             </CardDescription>
        )}
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-4">
          <Separator />
          <div className="space-y-2 pt-2">
            <Label htmlFor="payerName" className="font-semibold flex items-center">
                <User className="mr-2 h-4 w-4 text-primary/80"/> Nome Completo
            </Label>
            <Input
              id="payerName"
              name="payerName"
              type="text"
              value={formData.payerName}
              onChange={handleInputChange}
              placeholder="Seu nome completo"
              required
              readOnly={isPixGenerated}
              className="text-base h-12 disabled:opacity-70"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payerEmail" className="font-semibold flex items-center">
                <Mail className="mr-2 h-4 w-4 text-primary/80"/> Seu melhor e-mail
            </Label>
            <Input
              id="payerEmail"
              name="payerEmail"
              type="email"
              value={formData.payerEmail}
              onChange={handleInputChange}
              placeholder="seu.email@exemplo.com"
              required
              readOnly={isPixGenerated}
              className="text-base h-12 disabled:opacity-70"
            />
          </div>
          
          {!isPixGenerated ? (
            <Button 
              type="submit" 
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-6" 
              size="lg" 
              disabled={isLoading || (!formData.itemName && isPlanFromUrl && formData.unitPrice > 0)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processando...
                </>
              ) : (
                "Pagar com PIX"
              )}
            </Button>
          ) : (
            <Button 
              type="button" 
              variant="outline"
              onClick={handleEditData}
              className="w-full mt-6" 
              size="lg" 
              disabled={isLoading}
            >
              <Edit3 className="mr-2 h-5 w-5" />
              Editar Dados
            </Button>
          )}

          <p className="text-xs text-muted-foreground text-center pt-2">
            Você poderá pagar com PIX diretamente aqui ou ser direcionado ao ambiente seguro do Mercado Pago para outros métodos.
          </p>
        </CardContent>
      </form>

      {isPixGenerated && pixQrCodeBase64 && pixCopyPaste && (
        <div ref={pixSectionRef}>
            <CardContent className="space-y-6 pt-8 border-t mt-6">
                <div className="text-center">
                    <QrCode className="h-10 w-10 text-primary mx-auto mb-3" />
                    <h3 className="text-xl font-headline text-primary">Pague com PIX</h3>
                    <p className="text-foreground/80 text-sm">Escaneie o QR Code abaixo com o app do seu banco ou copie o código.</p>
                    {formData.itemName && formData.unitPrice > 0 && (
                        <p className="text-xs text-muted-foreground pt-1">Plano: {formData.itemName} - R$ {formData.unitPrice.toFixed(2).replace('.', ',')}</p>
                    )}
                </div>
                <div className="flex justify-center p-2 bg-white rounded-md shadow-md max-w-[200px] mx-auto">
                <Image 
                    src={pixQrCodeBase64} 
                    alt="QR Code PIX" 
                    width={180} 
                    height={180}
                    data-ai-hint="pix qrcode"
                />
                </div>
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
                <p className="text-xs text-muted-foreground text-center">
                Após o pagamento, a confirmação pode levar alguns instantes. (Verificação automática não implementada).
                </p>
            </CardContent>
        </div>
      )}

      <CardFooter className="flex-col gap-3 pt-6">
         {isPlanFromUrl && (
              <Button onClick={() => router.push('/planos')} variant="link" className="text-sm font-normal text-muted-foreground hover:text-primary">
                  <ShoppingBag className="mr-2 h-4 w-4"/> Ver outros planos
              </Button>
          )}
      </CardFooter>
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
