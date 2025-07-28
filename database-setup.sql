-- ========================================
-- SETUP COMPLETO DO BANCO DE DADOS
-- Execute estes comandos no Supabase SQL Editor
-- ========================================

-- 1. Tabela para dados gerais (configurações)
CREATE TABLE IF NOT EXISTS dados_gerais (
  id SERIAL PRIMARY KEY,
  chave TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir as chaves do Pagar.me
INSERT INTO dados_gerais (chave, valor, descricao) VALUES 
('pagarme_secret_key', 'sk_83744d2260054f53bc9eb5f2934d7e42', 'Chave secreta do Pagar.me'),
('pagarme_public_key', 'pk_test_sua_chave_publica_aqui', 'Chave pública do Pagar.me'),
('pagarme_authorization', 'Basic c2tfNDcwOTFkM2FiMzAzNDdhZWFiM2QzY2I2YWViMzUyMjg6', 'Authorization header do Pagar.me')
ON CONFLICT (chave) DO NOTHING;

-- 2. Tabela para cache de customers do Pagar.me
CREATE TABLE IF NOT EXISTS pagarme_customers (
  id SERIAL PRIMARY KEY,
  profissional_id INTEGER REFERENCES profissionais(id),
  pagarme_customer_id TEXT NOT NULL,
  document TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pagarme_customers_document ON pagarme_customers(document);
CREATE INDEX IF NOT EXISTS idx_pagarme_customers_profissional ON pagarme_customers(profissional_id);

-- 3. Tabela para recargas
CREATE TABLE IF NOT EXISTS recargas (
  id SERIAL PRIMARY KEY,
  profissional_id INTEGER REFERENCES profissionais(id),
  valor DECIMAL(10,2) NOT NULL,
  bonus DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL,
  order_id TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('pendente', 'aprovado', 'cancelado')) DEFAULT 'pendente',
  metodo_pagamento TEXT CHECK (metodo_pagamento IN ('pix', 'credit_card')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_recargas_profissional ON recargas(profissional_id);
CREATE INDEX IF NOT EXISTS idx_recargas_order_id ON recargas(order_id);
CREATE INDEX IF NOT EXISTS idx_recargas_status ON recargas(status);

-- ========================================
-- CONFIRMADO: profissionais.id é INTEGER
-- ========================================

-- ========================================
-- APÓS EXECUTAR OS COMANDOS ACIMA:
-- 1. Descomente as linhas TODO nos arquivos TypeScript
-- 2. Remova as simulações (mock) dos componentes
-- 3. Teste a integração completa
-- ========================================