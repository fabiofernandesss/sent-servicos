import type { VercelRequest, VercelResponse } from '@vercel/node';

const PAGARME_API_URL = 'https://api.pagar.me/core/v5';
const PAGARME_SECRET_KEY = 'sk_83744d2260054f53bc9eb5f2934d7e42';
const AUTH_HEADER = 'Basic c2tfNDcwOTFkM2FiMzAzNDdhZWFiM2QzY2I2YWViMzUyMjg6';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Buscar cliente por documento
      const { document } = req.query;
      
      if (!document) {
        return res.status(400).json({ error: 'Document is required' });
      }

      const response = await fetch(`${PAGARME_API_URL}/customers?document=${document}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_HEADER,
          'accept': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Erro na API Pagar.me:', data);
        return res.status(response.status).json(data);
      }

      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      // Criar cliente
      const customerData = req.body;

      const response = await fetch(`${PAGARME_API_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_HEADER,
          'accept': 'application/json'
        },
        body: JSON.stringify(customerData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Erro na API Pagar.me:', data);
        return res.status(response.status).json(data);
      }

      return res.status(200).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Erro no servidor:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}