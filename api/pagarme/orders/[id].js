import fetch from 'node-fetch';

const PAGARME_BASE_URL = 'https://api.pagar.me/core/v5';
const PAGARME_SECRET_KEY = process.env.PAGARME_SECRET_KEY;
const AUTH_HEADER = `Basic ${Buffer.from(PAGARME_SECRET_KEY + ':').toString('base64')}`;

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID do pedido é obrigatório' });
  }

  try {
    console.log('🔍 Buscando status REAL do pedido:', id);

    const response = await fetch(`${PAGARME_BASE_URL}/orders/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': AUTH_HEADER,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    console.log('📊 Status REAL do pedido:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('❌ Erro ao buscar status do pedido:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
} 