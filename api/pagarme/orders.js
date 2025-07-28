import fetch from 'node-fetch';

const PAGARME_BASE_URL = 'https://api.pagar.me/core/v5';
const PAGARME_SECRET_KEY = process.env.PAGARME_SECRET_KEY;
const AUTH_HEADER = `Basic ${Buffer.from(PAGARME_SECRET_KEY + ':').toString('base64')}`;

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    console.log('📦 Dados recebidos para criar pedido:', JSON.stringify(req.body, null, 2));

    let orderData;

    if (req.body.items && req.body.customer && req.body.payments) {
      orderData = req.body;
      console.log('✅ Usando formato novo do frontend');
    } else {
      const { customer, amount, description, payment_method, card } = req.body;
      console.log('🔄 Convertendo formato antigo para novo');

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
            area_code: customer.phone ? customer.phone.substring(0, 2) : '11',
            number: customer.phone ? customer.phone.substring(2) : '999999999'
          }
        }
      };

      // Preparar dados do pedido
      const timestamp = Date.now();
      orderData = {
        items: [
          {
            amount: amount,
            description: description,
            quantity: 1,
            code: `recarga_${timestamp}`,
            category: 'recarga'
          }
        ],
        customer: customerData,
        payments: [],
        code: `order_${timestamp}`,
        closed: true
      };

      // Adicionar método de pagamento
      if (payment_method === 'pix') {
        orderData.payments.push({
          payment_method: 'pix',
          pix: {
            expires_in: 300,
            additional_information: [
              {
                name: 'Recarga',
                value: `R$ ${(amount / 100).toFixed(2)}`
              }
            ]
          }
        });
      } else if (payment_method === 'credit_card' && card) {
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

    const response = await fetch(`${PAGARME_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': AUTH_HEADER,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    const responseData = await response.json();
    console.log('📥 Resposta da Pagar.me:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.log('❌ Erro da API Pagar.me:', response.status, responseData);
      return res.status(response.status).json(responseData);
    }

    console.log('✅ Pedido criado com sucesso:', responseData.id);
    res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ Erro interno:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
} 