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

  if (req.method === 'GET') {
    // Buscar cliente por documento
    const { document } = req.query;
    
    if (!document) {
      return res.status(400).json({ error: 'Documento é obrigatório' });
    }

    try {
      console.log('🔍 Buscando cliente por documento:', document);

      const response = await fetch(`${PAGARME_BASE_URL}/customers?document=${document}`, {
        method: 'GET',
        headers: {
          'Authorization': AUTH_HEADER,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      console.log('✅ Cliente encontrado:', data);

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      res.status(200).json(data);
    } catch (error) {
      console.error('❌ Erro ao buscar cliente:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  } else if (req.method === 'POST') {
    // Criar novo cliente
    try {
      const { name, email, document, phone } = req.body;

      if (!name || !email || !document) {
        return res.status(400).json({
          error: 'Dados obrigatórios: name, email, document'
        });
      }

      const customerData = {
        name,
        email,
        type: 'individual',
        document,
        document_type: 'CPF',
        phones: {
          mobile_phone: {
            country_code: '55',
            area_code: phone ? phone.substring(0, 2) : '11',
            number: phone ? phone.substring(2) : '999999999'
          }
        }
      };

      console.log('📤 Criando cliente:', JSON.stringify(customerData, null, 2));

      const response = await fetch(`${PAGARME_BASE_URL}/customers`, {
        method: 'POST',
        headers: {
          'Authorization': AUTH_HEADER,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(customerData)
      });

      const data = await response.json();
      console.log('📥 Resposta da Pagar.me:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      console.log('✅ Cliente criado com sucesso:', data.id);
      res.status(200).json(data);
    } catch (error) {
      console.error('❌ Erro ao criar cliente:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
} 