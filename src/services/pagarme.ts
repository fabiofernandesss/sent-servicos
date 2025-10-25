// Serviço PagarMe - Usando Database Functions do Supabase
// Solução definitiva que elimina CORS e problemas de URL

import { supabase } from '../integrations/supabase/client';

// Função para atualizar saldo na sessão local
const updateSaldoInSession = (novoSaldo: number) => {
  try {
    const sessionData = localStorage.getItem('profissional_session');
    if (sessionData) {
      const profissional = JSON.parse(sessionData);
      profissional.saldo = novoSaldo;
      localStorage.setItem('profissional_session', JSON.stringify(profissional));
      
      // Disparar evento customizado para notificar outros componentes
      window.dispatchEvent(new CustomEvent('saldoUpdated', { 
        detail: { novoSaldo } 
      }));
    }
  } catch (error) {
    console.error('Erro ao atualizar saldo na sessão:', error);
  }
};

class PagarMeService {
  constructor() {
    console.log('✅ PagarMe Service inicializado (Supabase Database Functions)');
  }

  /**
   * Cria pagamento PIX usando Database Function do Supabase
   * Elimina completamente problemas de CORS
   */
  async createPixPayment(paymentData: {
    amount: number; // Valor em centavos
    customerName: string;
    customerEmail: string;
    customerDocument: string;
    customerPhone?: string;
    description?: string;
    profissionalId?: number;
  }) {
    try {
      console.log('🎯 Criando PIX via Supabase Database Function:', {
        customer: paymentData.customerName,
        amount: paymentData.amount,
        document: paymentData.customerDocument.substring(0, 3) + '***'
      });

      // Chamar função SQL diretamente no Supabase
      const { data, error } = await supabase.rpc('create_pix_payment', {
        p_customer_name: paymentData.customerName,
        p_customer_email: paymentData.customerEmail,
        p_customer_document: paymentData.customerDocument,
        p_customer_phone: paymentData.customerPhone || null,
        p_amount: paymentData.amount,
        p_description: paymentData.description || 'Recarga de créditos',
        p_profissional_id: paymentData.profissionalId || null
      });

      if (error) {
        console.error('❌ Erro na Database Function PIX:', error);
        throw new Error(error.message || 'Erro ao criar PIX');
      }

      if (!data?.success) {
        console.error('❌ PIX não criado:', data);
        throw new Error(data?.error || 'Erro desconhecido ao criar PIX');
      }

      console.log('✅ PIX criado via Database Function:', data.payment_id);
      
      // Retornar no formato esperado pelo frontend
      return {
        id: data.pagarme_order_id,
        status: data.status,
        charges: [{
          status: data.status,
          lastTransaction: {
            qrCode: data.pix?.qr_code,
            qrCodeUrl: data.pix?.qr_code_url,
            expiresAt: data.pix?.expires_at
          }
        }]
      };

    } catch (error) {
      console.error('❌ Erro ao criar PIX via Database Function:', error);
      throw error;
    }
  }

  /**
   * Cria pagamento com cartão usando Database Function do Supabase
   */
  async createCreditCardPayment(paymentData: {
    amount: number; // Valor em centavos
    customerName: string;
    customerEmail: string;
    customerDocument: string;
    customerPhone?: string;
    cardNumber: string;
    cardHolderName: string;
    cardExpMonth: number;
    cardExpYear: number;
    cardCvv: string;
    installments?: number;
    description?: string;
  }) {
    try {
      console.log('💳 Criando pagamento cartão via Database Function:', {
        customer: paymentData.customerName,
        amount: paymentData.amount,
        installments: paymentData.installments || 1,
        card: paymentData.cardNumber.substring(0, 4) + '****'
      });

      // Chamar função SQL diretamente no Supabase
      const { data, error } = await supabase.rpc('create_credit_card_payment', {
        p_customer_name: paymentData.customerName,
        p_customer_email: paymentData.customerEmail,
        p_customer_document: paymentData.customerDocument,
        p_customer_phone: paymentData.customerPhone || null,
        p_amount: paymentData.amount,
        p_card_number: paymentData.cardNumber,
        p_card_holder_name: paymentData.cardHolderName,
        p_card_exp_month: paymentData.cardExpMonth,
        p_card_exp_year: paymentData.cardExpYear,
        p_card_cvv: paymentData.cardCvv,
        p_installments: paymentData.installments || 1,
        p_description: paymentData.description || 'Recarga de créditos'
      });

      if (error) {
        console.error('❌ Erro na Database Function cartão:', error);
        throw new Error(error.message || 'Erro ao criar pagamento cartão');
      }

      if (!data?.success) {
        console.error('❌ Pagamento cartão não criado:', data);
        throw new Error(data?.error || 'Erro desconhecido ao criar pagamento cartão');
      }

      console.log('✅ Pagamento cartão criado via Database Function:', data.payment_id);
      
      // Retornar no formato esperado pelo frontend
      return {
        id: data.pagarme_order_id,
        status: data.status,
        charges: [{
          status: data.status,
          lastTransaction: {
            cardBrand: data.card?.brand,
            cardLastDigits: data.card?.last_digits,
            installments: data.card?.installments
          }
        }]
      };

    } catch (error) {
      console.error('❌ Erro ao criar pagamento cartão via Database Function:', error);
      throw error;
    }
  }

  /**
   * Consulta status de um pedido usando Database Function do Supabase
   * Atualiza status consultando PagarMe em tempo real
   */
  async getOrderStatus(paymentId: string, profissionalId?: number) {
    try {
      console.log('📊 Consultando status via Database Function:', paymentId);
      
      // Chamar função SQL que consulta PagarMe em tempo real
      const { data, error } = await supabase.rpc('update_payment_status_from_pagarme', {
        p_order_id: paymentId
      });

      if (error) {
        console.error('❌ Erro na Database Function status:', error);
        throw new Error(error.message || 'Erro ao consultar status');
      }

      if (!data?.success) {
        console.error('❌ Status não encontrado:', data);
        throw new Error(data?.error || 'Pagamento não encontrado');
      }

      // Log diferenciado para pagamentos simulados
      if (data.simulated) {
        console.log('🔄 Status simulado obtido:', data.status, '(ID temporário)');
      } else {
        console.log('✅ Status REAL obtido via PagarMe:', data.pagarme_status || data.status);
      }
      
      // Se o pagamento foi aprovado, processar completamente
      const currentStatus = data.pagarme_status || data.status;
      if (currentStatus === 'paid') {
        console.log('💰 Pagamento aprovado! Processando completamente...');
        try {
          const { data: processData, error: processError } = await supabase.rpc('processar_pagamento_completo', {
            p_order_id: data.order_id
          });

          if (processError) {
            console.error('❌ Erro ao processar pagamento completo:', processError);
          } else if (processData?.success) {
            console.log('✅ Pagamento processado completamente:', processData);
            
            // Atualizar saldo na sessão local
            if (processData.novo_saldo !== undefined) {
              updateSaldoInSession(processData.novo_saldo);
            }

            // Garantir sincronização com saldo REAL do backend
            if (typeof profissionalId === 'number') {
              try {
                const { data: saldoData, error: saldoError } = await supabase.rpc('get_profissional_saldo', {
                  p_profissional_id: profissionalId
                });
                if (saldoError) {
                  console.error('❌ Erro ao buscar saldo real:', saldoError);
                } else if (saldoData?.success && typeof saldoData.saldo === 'number') {
                  updateSaldoInSession(saldoData.saldo);
                }
              } catch (e) {
                console.error('❌ Erro ao sincronizar saldo real:', e);
              }
            }
          } else {
            console.error('❌ Erro no processamento completo:', processData);
          }
        } catch (error) {
          console.error('❌ Erro ao processar pagamento completo:', error);
        }
      }
      
      // Retornar no formato esperado pelo frontend
      const result = {
        id: data.order_id,
        status: currentStatus
      };

      // Adicionar dados específicos do PIX se aplicável
      if (data.payment_method === 'pix' && data.pix) {
        result.charges = [{
          status: currentStatus,
          lastTransaction: {
            qrCode: data.pix.qr_code,
            qrCodeUrl: data.pix.qr_code_url,
            expiresAt: data.pix.expires_at
          }
        }];
      }

      return result;

    } catch (error) {
      console.error('❌ Erro ao consultar status via Database Function:', error);
      throw error;
    }
  }

  /**
   * Utilitário para validar CPF
   */
  validateCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
      return false;
    }
    
    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
    
    return true;
  }

  /**
   * Utilitário para formatar valores
   */
  formatToCents(value: number): number {
    return Math.round(value * 100);
  }

  formatFromCents(cents: number): number {
    return cents / 100;
  }
}

// Exportar instância única
export const pagarMeService = new PagarMeService();

// Tipos para compatibilidade
export interface GetOrderResponse {
  id?: string;
  status?: string;
  charges?: Array<{
    status?: string;
    lastTransaction?: {
      qrCode?: string;
      qrCodeUrl?: string;
      expiresAt?: string;
      cardBrand?: string;
      cardLastDigits?: string;
      installments?: number;
    };
  }>;
}