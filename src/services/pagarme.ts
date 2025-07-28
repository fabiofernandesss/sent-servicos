import { supabase } from '@/integrations/supabase/client';

// Configuração da URL base baseada no ambiente
const isDevelopment = process.env.NODE_ENV === 'development';
const PROXY_BASE_URL = isDevelopment 
  ? 'http://localhost:3001' 
  : process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://sent-servicos.vercel.app';

export interface CustomerData {
  name: string;
  email: string;
  type: 'individual';
  document: string;
  document_type: 'CPF';
  birthdate?: string;
  code?: string;
  phones: {
    mobile_phone: {
      country_code: string;
      area_code: string;
      number: string;
    };
  };
}

export interface OrderData {
  items: Array<{
    amount: number;
    description: string;
    quantity: number;
    code?: string;
    category?: string;
  }>;
  customer: {
    name: string;
    email: string;
    type: 'individual';
    document: string;
    phones: {
      mobile_phone: {
        country_code: string;
        area_code: string;
        number: string;
      };
    };
  };
  payments: Array<{
    payment_method: 'pix' | 'credit_card';
    pix?: {
      expires_in: number;
      additional_information?: Array<{
        name: string;
        value: string;
      }>;
    };
    credit_card?: {
      installments: number;
      statement_descriptor?: string;
      card: {
        number: string;
        holder_name: string;
        exp_month: number;
        exp_year: number;
        cvv: string;
      };
    };
  }>;
  code?: string;
  closed?: boolean;
}

class PagarMeService {
  private apiKey: string = '';
  private authHeader: string = '';
  private customers: Map<string, string> = new Map(); // Cache de clientes por CPF

  constructor() {
    this.loadKeys();
  }

  private async loadKeys() {
    try {
      // Usar as chaves diretamente (mais confiável)
      this.apiKey = 'sk_83744d2260054f53bc9eb5f2934d7e42';
      this.authHeader = 'Basic c2tfODM3NDRkMjI2MDA1NGY1M2JjOWViNWYyOTM0ZDdlNDI6';
      
      console.log('✅ Chaves do Pagar.me carregadas');
    } catch (error) {
      console.error('Erro ao carregar chaves do Pagar.me:', error);
      // Fallback para variáveis de ambiente
      this.apiKey = import.meta.env.VITE_PAGARME_SECRET_KEY || 'sk_83744d2260054f53bc9eb5f2934d7e42';
    }
  }

  private async makeRequest(endpoint: string, data: any, method: 'POST' | 'GET' = 'POST') {
    await this.loadKeys();
    
    const apiUrl = `${PROXY_BASE_URL}/api/pagarme${endpoint}`;
    
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (data && method === 'POST') {
      requestOptions.body = JSON.stringify(data);
    }

    console.log(`🔥 FAZENDO REQUISIÇÃO REAL ${method} para: ${apiUrl}`);
    console.log('📤 Dados sendo enviados:', JSON.stringify(data, null, 2));
    
    try {
      const response = await fetch(apiUrl, requestOptions);
      const responseData = await response.json();

      console.log(`📊 RESPOSTA REAL (${response.status}):`, JSON.stringify(responseData, null, 2));

      if (!response.ok) {
        console.error('🚨 ERRO REAL NA API - NÃO SIMULADO:', responseData);
        throw new Error(`ERRO REAL: ${responseData.message || responseData.error || response.statusText}`);
      }

      // Log para verificar se os dados são reais
      console.log('✅ DADOS RECEBIDOS DA API - ASSUMINDO COMO REAIS');

      return responseData;
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      throw error;
    }
  }

  // Verificar se cliente já existe
  async checkCustomerExists(document: string): Promise<string | null> {
    try {
      // Verificar cache em memória primeiro
      if (this.customers.has(document)) {
        return this.customers.get(document)!;
      }

      // Buscar na API do Pagar.me via proxy
      const response = await this.makeRequest(`/customers?document=${document}`, null, 'GET');
      
      if (response.data && response.data.length > 0) {
        const customerId = response.data[0].id;
        this.customers.set(document, customerId);
        return customerId;
      }

      return null;
    } catch (error) {
      console.error('Erro ao verificar cliente:', error);
      return null;
    }
  }

  // Criar cliente no Pagar.me
  async createCustomer(customerData: CustomerData, profissionalId?: string | number): Promise<string> {
    try {
      const response = await this.makeRequest('/customers', customerData);
      
      if (response.id) {
        // Salvar no cache em memória
        this.customers.set(customerData.document, response.id);
        
        return response.id;
      }

      throw new Error('Erro ao criar cliente');
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  }

  // Garantir que o cliente existe (criar se necessário)
  async ensureCustomerExists(customerData: CustomerData, profissionalId?: string | number): Promise<string> {
    try {
      // Verificar se já existe
      let customerId = await this.checkCustomerExists(customerData.document);
      
      if (!customerId) {
        // Criar novo cliente
        customerId = await this.createCustomer(customerData, profissionalId);
      }

      return customerId;
    } catch (error) {
      console.error('Erro ao garantir cliente:', error);
      throw error;
    }
  }

  async createPixPayment(customerData: CustomerData, amount: number, description: string = 'Recarga de créditos', profissionalId?: string | number): Promise<any> {
    try {
      console.log('🔍 DEBUG: Dados recebidos em createPixPayment:', {
        customerData,
        amount,
        description,
        profissionalId
      });

      // Garantir que o cliente existe
      await this.ensureCustomerExists(customerData, profissionalId);

      // Preparar dados do pedido seguindo a documentação oficial
      const orderData: OrderData = {
        items: [{
          amount: this.formatToCents(amount),
          description,
          quantity: 1,
          code: `recarga_${Date.now()}`,
          category: 'recarga'
        }],
        customer: {
          name: customerData.name,
          email: customerData.email,
          type: 'individual',
          document: customerData.document,
          phones: {
            mobile_phone: {
              country_code: customerData.phones.mobile_phone.country_code,
              area_code: customerData.phones.mobile_phone.area_code,
              number: customerData.phones.mobile_phone.number
            }
          }
        },
        payments: [{
          payment_method: 'pix',
          pix: {
            expires_in: 300,
            additional_information: [{
              name: 'Recarga',
              value: `R$ ${(amount / 100).toFixed(2)}`
            }]
          }
        }],
        code: `order_${Date.now()}`,
        closed: true
      };

      console.log('🔥 Criando PIX REAL com dados:', JSON.stringify(orderData, null, 2));
      const response = await this.makeRequest('/orders', orderData);
      console.log('✅ Resposta REAL do PIX:', JSON.stringify(response, null, 2));
      
      if (!response || !response.charges || !response.charges[0]) {
        throw new Error('Resposta inválida da API Pagar.me: ' + JSON.stringify(response));
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      throw error;
    }
  }

  async createCreditCardPayment(customerData: CustomerData, amount: number, cardData: any, description: string = 'Recarga de créditos', profissionalId?: string | number): Promise<any> {
    try {
      // Garantir que o cliente existe
      await this.ensureCustomerExists(customerData, profissionalId);

      // Preparar dados do pedido seguindo a documentação oficial
      const orderData: OrderData = {
        items: [{
          amount: this.formatToCents(amount),
          description,
          quantity: 1,
          code: `recarga_${Date.now()}`,
          category: 'recarga'
        }],
        customer: {
          name: customerData.name,
          email: customerData.email,
          type: 'individual',
          document: customerData.document,
          phones: {
            mobile_phone: {
              country_code: customerData.phones.mobile_phone.country_code,
              area_code: customerData.phones.mobile_phone.area_code,
              number: customerData.phones.mobile_phone.number
            }
          }
        },
        payments: [{
          payment_method: 'credit_card',
          credit_card: {
            installments: 1,
            statement_descriptor: 'SENT SERVICOS',
            card: {
              number: cardData.number,
              holder_name: cardData.holder_name,
              exp_month: cardData.exp_month,
              exp_year: cardData.exp_year,
              cvv: cardData.cvv
            }
          }
        }],
        code: `order_${Date.now()}`,
        closed: true
      };

      console.log('🔥 Criando pagamento cartão com dados:', JSON.stringify(orderData, null, 2));
      const response = await this.makeRequest('/orders', orderData);
      console.log('✅ Resposta do cartão:', JSON.stringify(response, null, 2));
      return response;
    } catch (error) {
      console.error('Erro ao criar pagamento cartão:', error);
      throw error;
    }
  }

  async getPaymentStatus(orderId: string) {
    try {
      return await this.makeRequest(`/orders/${orderId}`, null, 'GET');
    } catch (error) {
      console.error('Erro ao consultar status:', error);
      throw error;
    }
  }

  // Função para formatar valor em centavos
  formatToCents(value: number): number {
    return Math.round(value * 100);
  }

  // Função para formatar valor de centavos para reais
  formatFromCents(cents: number): number {
    return cents / 100;
  }

  // Função para extrair dados do telefone
  parsePhoneNumber(phone: string): { area_code: string; number: string } {
    // Se não tiver telefone, usar padrão
    if (!phone) {
      return {
        area_code: '11',
        number: '999999999'
      };
    }

    // Remove caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Se tem 11 dígitos (com 9 na frente), pega os 2 primeiros como DDD
    if (cleanPhone.length === 11) {
      return {
        area_code: cleanPhone.substring(0, 2),
        number: cleanPhone.substring(2)
      };
    }
    
    // Se tem 10 dígitos, pega os 2 primeiros como DDD
    if (cleanPhone.length === 10) {
      return {
        area_code: cleanPhone.substring(0, 2),
        number: cleanPhone.substring(2)
      };
    }
    
    // Fallback - usar padrão
    return {
      area_code: '11',
      number: cleanPhone || '999999999'
    };
  }

  // Função para formatar CPF - CORRIGIDA
  formatDocument(document: string): string {
    // Remover todos os caracteres não numéricos
    const cleanDocument = document.replace(/\D/g, '');
    
    // Se for CPF, deve ter 11 dígitos
    if (cleanDocument.length === 11) {
      return cleanDocument;
    }
    
    // Se for CNPJ, deve ter 14 dígitos
    if (cleanDocument.length === 14) {
      return cleanDocument;
    }
    
    // Se não tiver o tamanho correto, retornar como está
    console.warn(`⚠️ Documento com formato inválido: ${document} (${cleanDocument.length} dígitos)`);
    return cleanDocument;
  }

  // Função para validar CPF
  validateCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (cleanCPF.length !== 11) {
      return false;
    }
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) {
      return false;
    }
    
    // Validar primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) {
      return false;
    }
    
    // Validar segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) {
      return false;
    }
    
    return true;
  }
}

export const pagarMeService = new PagarMeService();