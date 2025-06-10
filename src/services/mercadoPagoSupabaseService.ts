
'use client';

import { supabase } from '@/lib/supabaseClient';

interface PaymentData {
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
  }>;
  payerEmail: string;
  // Adicione outros dados necessários para o Mercado Pago
}

interface MercadoPagoResponse {
  // Defina a estrutura da resposta que você espera do Mercado Pago/sua Edge Function
  // Por exemplo:
  paymentId?: string;
  init_point?: string; // URL de checkout do Mercado Pago
  error?: string;
}

/**
 * Invoca a Edge Function do Supabase para processar um pagamento com o Mercado Pago.
 * 
 * NOTA: O nome da Edge Function ('process-mercadopago-payment') é um exemplo.
 * Você precisará criar e nomear sua Edge Function no Supabase.
 * 
 * @param paymentData Os dados do pagamento a serem enviados para a Edge Function.
 * @returns Uma promessa que resolve com a resposta do Mercado Pago ou de sua Edge Function.
 */
export async function processPaymentWithMercadoPago(paymentData: PaymentData): Promise<MercadoPagoResponse> {
  if (!supabase) {
    console.error('Cliente Supabase não inicializado.');
    return { error: 'Cliente Supabase não está pronto.' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('process-mercadopago-payment', {
      body: paymentData,
    });

    if (error) {
      console.error('Erro ao invocar a Edge Function do Supabase:', error);
      // Você pode querer mapear erros específicos aqui
      let errorMessage = 'Falha ao processar o pagamento com o Supabase.';
      if (error.message.includes('Function not found')) {
        errorMessage = 'A Edge Function "process-mercadopago-payment" não foi encontrada no Supabase. Verifique se ela foi implantada corretamente.';
      } else if (error.message.includes('TypeError') && error.message.includes('Failed to fetch')) {
        errorMessage = 'Falha na comunicação com a Edge Function. Verifique a rede e a configuração da função.';
      } else if (error.message) {
        errorMessage = `Erro da Edge Function: ${error.message}`;
      }
      return { error: errorMessage };
    }

    // Se a Edge Function retornar dados específicos de erro em sua estrutura, trate-os aqui também.
    // Exemplo: if (data && data.functionError) { return { error: data.functionError }; }

    return data as MercadoPagoResponse; // Faça o type assertion para a sua interface de resposta
  } catch (e) {
    console.error('Erro inesperado ao chamar a Edge Function:', e);
    const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro inesperado.';
    return { error: `Erro inesperado no cliente: ${errorMessage}` };
  }
}

// Exemplo de como você poderia usar esta função em um componente:
/*
import { processPaymentWithMercadoPago } from '@/services/mercadoPagoSupabaseService';

async function handlePayment() {
  const examplePaymentData = {
    items: [
      { id: '123', title: 'Produto Teste', quantity: 1, unit_price: 10.50 }
    ],
    payerEmail: 'comprador@email.com'
  };

  const response = await processPaymentWithMercadoPago(examplePaymentData);

  if (response.init_point) {
    // Redirecionar para o checkout do Mercado Pago
    window.location.href = response.init_point;
  } else if (response.error) {
    // Mostrar mensagem de erro
    console.error('Erro no pagamento:', response.error);
    alert(`Erro no pagamento: ${response.error}`);
  }
}
*/
