import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// Configurações do Pagar.me - USANDO CHAVE CORRETA
const PAGARME_API_URL = 'https://api.pagar.me/core/v5';
const PAGARME_SECRET_KEY = 'sk_83744d2260054f53bc9eb5f2934d7e42';

// Formato correto de autorização para a API v5
const AUTH_HEADER = `Basic ${Buffer.from(PAGARME_SECRET_KEY + ':').toString('base64')}`;

// Middlewares
app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Logs para debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rota para buscar cliente por documento
app.get('/api/pagarme/customers', async (req, res) => {
  try {
    const { document } = req.query;
    
    if (!document) {
      return res.status(400).json({ error: 'Documento é obrigatório' });
    }

    console.log('🔍 Buscando cliente por documento:', document);

    const response = await fetch(`${PAGARME_API_URL}/customers?document=${document}`, {
      headers: {
        'Authorization': AUTH_HEADER,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Erro ao buscar cliente:', data);
      return res.status(response.status).json(data);
    }

    console.log('✅ Cliente encontrado:', data);
    res.json(data);

  } catch (error) {
    console.error('❌ Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para criar cliente
app.post('/api/pagarme/customers', async (req, res) => {
  try {
    const { name, email, document, phone } = req.body;
    
    console.log('👤 Criando cliente:', { name, email, document, phone });

    // Validar dados obrigatórios
    if (!name || !email || !document) {
      return res.status(400).json({
        error: 'Dados obrigatórios faltando',
        required: ['name', 'email', 'document']
      });
    }

    const customerData = {
      name,
      email,
      type: 'individual', // SEMPRE incluir o tipo
      document,
      document_type: 'CPF',
      phones: {
        mobile_phone: {
          country_code: '55',
          area_code: '11', // Default
          number: '999999999' // Default
        }
      }
    };

    // Se tiver telefone, usar o fornecido
    if (phone) {
      try {
        const areaCode = phone.substring(0, 2);
        const number = phone.substring(2);
        customerData.phones.mobile_phone.area_code = areaCode;
        customerData.phones.mobile_phone.number = number;
      } catch (error) {
        console.warn('⚠️ Erro ao processar telefone, usando padrão:', phone);
      }
    }

    console.log('📤 Enviando dados do cliente para Pagar.me:', JSON.stringify(customerData, null, 2));

    const response = await fetch(`${PAGARME_API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Authorization': AUTH_HEADER,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customerData)
    });

    const responseData = await response.json();
    console.log('📥 Resposta da Pagar.me:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error('❌ Erro da API Pagar.me:', response.status, responseData);
      return res.status(response.status).json({
        error: 'API Pagar.me falhou',
        status: response.status,
        details: responseData,
        message: 'ERRO REAL - NÃO SIMULADO'
      });
    }

    console.log('✅ Cliente criado com sucesso:', responseData.id);
    res.json(responseData);

  } catch (error) {
    console.error('❌ Erro ao criar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Rota para criar pedido
app.post('/api/pagarme/orders', async (req, res) => {
  try {
    console.log('📦 Dados recebidos para criar pedido:', JSON.stringify(req.body, null, 2));

    // O frontend pode enviar os dados de duas formas:
    // 1. Formato antigo: { customer, amount, description, payment_method }
    // 2. Formato novo: { items, customer, payments, code, closed }
    
    let orderData;
    
    if (req.body.items && req.body.customer && req.body.payments) {
      // Formato novo - usar diretamente
      orderData = req.body;
      console.log('✅ Usando formato novo do frontend');
    } else {
      // Formato antigo - converter
      const { customer, amount, description, payment_method, card } = req.body;
      
      console.log('🔄 Convertendo formato antigo para novo');

      // Validar dados obrigatórios
      if (!customer || !customer.name || !customer.email || !customer.document) {
        return res.status(400).json({
          error: 'Dados do cliente incompletos',
          required: ['name', 'email', 'document']
        });
      }

      if (!amount || !description) {
        return res.status(400).json({
          error: 'Dados do pedido incompletos',
          required: ['amount', 'description']
        });
      }

      // Preparar dados do cliente
      const customerData = {
        name: customer.name,
        email: customer.email,
        type: 'individual',
        document: customer.document,
        document_type: 'CPF',
        phones: {
          mobile_phone: {
            country_code: '55',
            area_code: '11',
            number: '999999999'
          }
        }
      };

      // Se tiver telefone, usar o fornecido
      if (customer.phone) {
        try {
          const areaCode = customer.phone.substring(0, 2);
          const number = customer.phone.substring(2);
          customerData.phones.mobile_phone.area_code = areaCode;
          customerData.phones.mobile_phone.number = number;
        } catch (error) {
          console.warn('⚠️ Erro ao processar telefone, usando padrão:', customer.phone);
        }
      }

      // Preparar dados do pedido
      orderData = {
        items: [{
          amount: amount,
          description: description,
          quantity: 1,
          code: `recarga_${Date.now()}`,
          category: 'recarga'
        }],
        customer: customerData,
        payments: [],
        code: `order_${Date.now()}`,
        closed: true
      };

      // Adicionar método de pagamento
      if (payment_method === 'pix') {
        orderData.payments.push({
          payment_method: 'pix',
          pix: {
            expires_in: 300,
            additional_information: [{
              name: 'Recarga',
              value: `R$ ${(amount / 100).toFixed(2)}`
            }]
          }
        });
      } else if (payment_method === 'credit_card') {
        orderData.payments.push({
          payment_method: 'credit_card',
          credit_card: {
            operation_type: 'auth_and_capture',
            installments: 1,
            statement_descriptor: 'SENT SERVICOS',
            card: {
              number: card.number,
              holder_name: card.holder_name,
              exp_month: card.exp_month,
              exp_year: card.exp_year,
              cvv: card.cvv
            }
          }
        });
      }
    }

    console.log('📤 Enviando dados para Pagar.me:', JSON.stringify(orderData, null, 2));

    const response = await fetch(`${PAGARME_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': AUTH_HEADER,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    const responseData = await response.json();
    console.log('📥 Resposta da Pagar.me:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error('❌ Erro da API Pagar.me:', response.status, responseData);
      return res.status(response.status).json({
        error: 'API Pagar.me falhou',
        status: response.status,
        details: responseData,
        message: 'ERRO REAL - NÃO SIMULADO'
      });
    }

    console.log('✅ Pedido criado com sucesso:', responseData.id);
    res.json(responseData);

  } catch (error) {
    console.error('❌ Erro ao criar pedido:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Rota para buscar status do pedido
app.get('/api/pagarme/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    console.log('🔍 Buscando status REAL do pedido:', orderId);

    const response = await fetch(`${PAGARME_API_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AUTH_HEADER,
        'accept': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Erro na API Pagar.me (GET orders):', data);
      return res.status(response.status).json({
        error: 'API Pagar.me falhou',
        status: response.status,
        details: data,
        message: 'ERRO REAL - NÃO SIMULADO'
      });
    }

    console.log('📊 Status REAL do pedido:', JSON.stringify(data, null, 2));
    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Erro no servidor (GET orders):', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    pagarme_key: PAGARME_SECRET_KEY.substring(0, 10) + '...',
    auth_header: AUTH_HEADER.substring(0, 20) + '...'
  });
});

// Rota de teste da API Pagar.me
app.get('/test-pagarme', async (req, res) => {
  try {
    console.log('🧪 Testando conexão com a API Pagar.me...');
    
    const response = await fetch(`${PAGARME_API_URL}/customers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AUTH_HEADER,
        'accept': 'application/json'
      }
    });

    const data = await response.json();
    
    res.json({
      message: '🧪 TESTE DE CONEXÃO',
      key_used: PAGARME_SECRET_KEY.substring(0, 15) + '...',
      status: response.status,
      success: response.ok,
      data: response.ok ? 'SUCCESS' : data
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    res.status(500).json({ 
      status: '💥 ERROR - FALHA NA CONEXÃO', 
      error: error.message 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Proxy Pagar.me rodando na porta ${PORT}`);
  console.log(`📡 API disponível em: http://localhost:${PORT}`);
  console.log(`🔑 Usando chave: ${PAGARME_SECRET_KEY.substring(0, 10)}...`);
  console.log(`🔐 Auth Header: ${AUTH_HEADER.substring(0, 20)}...`);
  console.log(`✅ Teste: http://localhost:${PORT}/health`);
  console.log(`🧪 Teste API: http://localhost:${PORT}/test-pagarme`);
});

export default app;