-- ========================================
-- CONFIGURAÇÃO COMPLETA SUPABASE PAGARME
-- Execute este SQL único no SQL Editor
-- ========================================

-- 1. HABILITAR EXTENSÃO HTTP
CREATE EXTENSION IF NOT EXISTS http;

-- 2. CRIAR TABELA DE PAGAMENTOS
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Dados do cliente
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_document TEXT NOT NULL,
  customer_phone TEXT,
  
  -- Dados do pagamento
  amount INTEGER NOT NULL, -- valor em centavos
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'credit_card')),
  description TEXT,
  
  -- Dados do PagarMe
  pagarme_order_id TEXT,
  pagarme_customer_id TEXT,
  status TEXT DEFAULT 'pending',
  
  -- Dados específicos do PIX
  pix_qr_code TEXT,
  pix_qr_code_url TEXT,
  pix_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Dados específicos do cartão
  card_brand TEXT,
  card_last_digits TEXT,
  installments INTEGER DEFAULT 1,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_pagamentos_customer_document ON pagamentos(customer_document);
CREATE INDEX IF NOT EXISTS idx_pagamentos_pagarme_order_id ON pagamentos(pagarme_order_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_created_at ON pagamentos(created_at);

-- 4. HABILITAR RLS
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- 5. CRIAR POLICIES (remover se já existirem)
DROP POLICY IF EXISTS "Permitir leitura de pagamentos" ON pagamentos;
DROP POLICY IF EXISTS "Permitir inserção de pagamentos" ON pagamentos;
DROP POLICY IF EXISTS "Permitir atualização de pagamentos" ON pagamentos;

CREATE POLICY "Permitir leitura de pagamentos" ON pagamentos
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de pagamentos" ON pagamentos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de pagamentos" ON pagamentos
  FOR UPDATE USING (true);

-- 6. FUNÇÃO PARA CRIAR PIX
-- Remover função antiga primeiro
DROP FUNCTION IF EXISTS create_pix_payment(TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_pix_payment(TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION create_pix_payment(
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_document TEXT,
  p_amount INTEGER,
  p_customer_phone TEXT DEFAULT NULL,
  p_description TEXT DEFAULT 'Recarga de créditos',
  p_profissional_id INTEGER DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment_id UUID;
  v_pagarme_response JSON;
  v_order_data JSON;
  v_customer_data JSON;
  v_result JSON;
  v_phone_area TEXT;
  v_phone_number TEXT;
  v_clean_phone TEXT;
BEGIN
  -- Log da tentativa
  RAISE LOG 'Criando pagamento PIX: % - R$ %', p_customer_name, (p_amount::FLOAT / 100);
  
  -- Validações básicas
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Valor deve ser maior que zero');
  END IF;
  
  IF p_customer_name IS NULL OR p_customer_email IS NULL OR p_customer_document IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Dados do cliente são obrigatórios');
  END IF;
  
  -- Processar telefone
  v_clean_phone := regexp_replace(COALESCE(p_customer_phone, ''), '[^0-9]', '', 'g');
  IF length(v_clean_phone) >= 10 THEN
    v_phone_area := substring(v_clean_phone, 1, 2);
    v_phone_number := substring(v_clean_phone, 3);
  ELSE
    v_phone_area := '11';
    v_phone_number := '999999999';
  END IF;
  
     -- Inserir registro na tabela
   INSERT INTO pagamentos (
     customer_name,
     customer_email, 
     customer_document,
     customer_phone,
     amount,
     payment_method,
     description,
     status,
           metadata
    ) VALUES (
      p_customer_name,
      p_customer_email,
      p_customer_document,
      p_customer_phone,
      p_amount,
      'pix',
      p_description,
      'processing',
      json_build_object('created_by', 'sent_servicos', 'timestamp', now(), 'profissional_id', p_profissional_id)
    ) RETURNING id INTO v_payment_id;
  
  -- Preparar dados do cliente para PagarMe
  v_customer_data := json_build_object(
    'name', p_customer_name,
    'email', p_customer_email,
    'document', regexp_replace(p_customer_document, '[^0-9]', '', 'g'),
    'type', 'individual',
    'address', json_build_object(
      'street', 'Rua Principal',
      'number', '123',
      'zip_code', '01000000',
      'neighborhood', 'Centro',
      'city', 'São Paulo',
      'state', 'SP',
      'country', 'BR',
      'complement', '',
      'line_1', 'Rua Principal, 123',
      'line_2', 'Centro'
    ),
    'phones', json_build_object(
      'mobile_phone', json_build_object(
        'country_code', '55',
        'area_code', v_phone_area,
        'number', v_phone_number
      )
    ),
    'metadata', json_build_object('created_by', 'sent_servicos'),
    'code', 'customer_pix_' || extract(epoch from now())::bigint,
    'document_type', 'CPF'
  );
  
  -- Preparar dados do pedido para PagarMe
  v_order_data := json_build_object(
    'items', json_build_array(
      json_build_object(
        'amount', p_amount,
        'description', p_description,
        'quantity', 1,
        'code', 'recarga_' || extract(epoch from now())::bigint
      )
    ),
    'customer', v_customer_data,
    'payments', json_build_array(
      json_build_object(
        'payment_method', 'pix',
        'pix', json_build_object(
          'expires_in', 300,
          'additional_information', json_build_array(
            json_build_object(
              'Name', 'Recarga',
              'Value', 'R$ ' || (p_amount::FLOAT / 100)::TEXT
            )
          )
        )
      )
    ),
    'code', 'order_' || extract(epoch from now())::bigint,
    'closed', true
  );
  
  -- Fazer chamada para API do PagarMe
  BEGIN
    SELECT 
      content::json INTO v_pagarme_response
    FROM http((
      'POST',
      'https://api.pagar.me/core/v5/orders',
      ARRAY[
        http_header('Content-Type', 'application/json'),
        http_header('Authorization', 'Basic ' || encode('sk_83744d2260054f53bc9eb5f2934d7e42:', 'base64'))
      ],
      'application/json',
      v_order_data::text
    ));
  EXCEPTION WHEN OTHERS THEN
    -- Erro na chamada HTTP
    UPDATE pagamentos SET
      status = 'failed',
      metadata = metadata || json_build_object('error', 'Erro na chamada HTTP: ' || SQLERRM)::jsonb,
      updated_at = NOW()
    WHERE id = v_payment_id;
    
    RETURN json_build_object(
      'success', false,
      'payment_id', v_payment_id,
      'error', 'Erro na comunicação com PagarMe'
    );
  END;
  
  -- Processar resposta do PagarMe
  IF v_pagarme_response IS NOT NULL AND v_pagarme_response->>'id' IS NOT NULL THEN
    -- Sucesso - atualizar registro
    UPDATE pagamentos SET
      pagarme_order_id = v_pagarme_response->>'id',
      status = COALESCE(v_pagarme_response->>'status', 'created'),
      pix_qr_code = v_pagarme_response->'charges'->0->'last_transaction'->>'qr_code',
      pix_qr_code_url = v_pagarme_response->'charges'->0->'last_transaction'->>'qr_code_url',
      pix_expires_at = (v_pagarme_response->'charges'->0->'last_transaction'->>'expires_at')::timestamp with time zone,
      metadata = metadata || json_build_object('pagarme_response', v_pagarme_response)::jsonb,
      updated_at = NOW()
    WHERE id = v_payment_id;
    
    -- Retornar resultado de sucesso
    v_result := json_build_object(
      'success', true,
      'payment_id', v_payment_id,
      'pagarme_order_id', v_pagarme_response->>'id',
      'status', v_pagarme_response->>'status',
      'pix', json_build_object(
        'qr_code', v_pagarme_response->'charges'->0->'last_transaction'->>'qr_code',
        'qr_code_url', v_pagarme_response->'charges'->0->'last_transaction'->>'qr_code_url',
        'expires_at', v_pagarme_response->'charges'->0->'last_transaction'->>'expires_at'
      )
    );
    
  ELSE
    -- Erro - atualizar status
    UPDATE pagamentos SET
      status = 'failed',
      metadata = metadata || json_build_object('error', 'Resposta inválida do PagarMe', 'response', v_pagarme_response)::jsonb,
      updated_at = NOW()
    WHERE id = v_payment_id;
    
    -- Retornar erro
    v_result := json_build_object(
      'success', false,
      'payment_id', v_payment_id,
      'error', 'Erro na API do PagarMe',
      'details', v_pagarme_response
    );
  END IF;
  
  RAISE LOG 'Resultado do pagamento PIX: %', v_result;
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  -- Em caso de erro geral
  UPDATE pagamentos SET
    status = 'failed',
    metadata = metadata || json_build_object('error', 'Erro geral: ' || SQLERRM)::jsonb,
    updated_at = NOW()
  WHERE id = v_payment_id;
  
  -- Retornar erro
  RETURN json_build_object(
    'success', false,
    'payment_id', v_payment_id,
    'error', SQLERRM
  );
END;
$$;

-- 7. FUNÇÃO PARA CONSULTAR STATUS POR ORDER_ID (PagarMe)
CREATE OR REPLACE FUNCTION get_payment_status(
  p_order_id TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment RECORD;
  v_result JSON;
BEGIN
  -- Buscar pagamento local pelo order_id do PagarMe
  SELECT * INTO v_payment 
  FROM pagamentos 
  WHERE pagarme_order_id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pagamento não encontrado',
      'order_id', p_order_id
    );
  END IF;
  
  -- Retornar dados locais
  v_result := json_build_object(
    'success', true,
    'payment_id', v_payment.id,
    'order_id', v_payment.pagarme_order_id,
    'status', v_payment.status,
    'amount', v_payment.amount,
    'payment_method', v_payment.payment_method,
    'created_at', v_payment.created_at
  );
  
  -- Adicionar dados específicos do PIX se aplicável
  IF v_payment.payment_method = 'pix' THEN
    v_result := json_build_object(
      'success', true,
      'payment_id', v_payment.id,
      'order_id', v_payment.pagarme_order_id,
      'status', v_payment.status,
      'amount', v_payment.amount,
      'payment_method', v_payment.payment_method,
      'created_at', v_payment.created_at,
      'pix', json_build_object(
        'qr_code', v_payment.pix_qr_code,
        'qr_code_url', v_payment.pix_qr_code_url,
        'expires_at', v_payment.pix_expires_at
      )
    );
  ELSE
    v_result := json_build_object(
      'success', true,
      'payment_id', v_payment.id,
      'order_id', v_payment.pagarme_order_id,
      'status', v_payment.status,
      'amount', v_payment.amount,
      'payment_method', v_payment.payment_method,
      'created_at', v_payment.created_at
    );
  END IF;
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'order_id', p_order_id
  );
END;
$$;

-- 8. FUNÇÃO PARA ATUALIZAR STATUS VIA PAGARME
CREATE OR REPLACE FUNCTION update_payment_status_from_pagarme(
  p_order_id TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment RECORD;
  v_pagarme_response JSON;
  v_result JSON;
BEGIN
  -- Buscar pagamento local
  SELECT * INTO v_payment 
  FROM pagamentos 
  WHERE pagarme_order_id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pagamento não encontrado',
      'order_id', p_order_id
    );
  END IF;
  
  -- Consultar status real no PagarMe
  BEGIN
    SELECT 
      content::json INTO v_pagarme_response
    FROM http((
      'GET',
      'https://api.pagar.me/core/v5/orders/' || p_order_id,
      ARRAY[
        http_header('Authorization', 'Basic ' || encode('sk_83744d2260054f53bc9eb5f2934d7e42:', 'base64'))
      ],
      'application/json',
      NULL
    ));
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro ao consultar PagarMe: ' || SQLERRM,
      'order_id', p_order_id
    );
  END;
  
  -- Processar resposta do PagarMe
  IF v_pagarme_response IS NOT NULL AND v_pagarme_response->>'id' IS NOT NULL THEN
    -- Atualizar status no banco local
    UPDATE pagamentos SET
      status = COALESCE(v_pagarme_response->>'status', v_payment.status),
      updated_at = NOW(),
      metadata = metadata || json_build_object('last_pagarme_check', now(), 'pagarme_response', v_pagarme_response)::jsonb
    WHERE pagarme_order_id = p_order_id;
    
    -- Retornar status atualizado
    v_result := json_build_object(
      'success', true,
      'payment_id', v_payment.id,
      'order_id', p_order_id,
      'status', v_pagarme_response->>'status',
      'amount', v_payment.amount,
      'payment_method', v_payment.payment_method,
      'pagarme_status', v_pagarme_response->>'status'
    );
    
    -- Adicionar dados específicos do PIX se aplicável
    IF v_payment.payment_method = 'pix' THEN
      v_result := json_build_object(
        'success', true,
        'payment_id', v_payment.id,
        'order_id', p_order_id,
        'status', v_pagarme_response->>'status',
        'amount', v_payment.amount,
        'payment_method', v_payment.payment_method,
        'pagarme_status', v_pagarme_response->>'status',
        'pix', json_build_object(
          'qr_code', v_payment.pix_qr_code,
          'qr_code_url', v_payment.pix_qr_code_url,
          'expires_at', v_payment.pix_expires_at
        )
      );
    END IF;
    
  ELSE
    -- Erro na resposta do PagarMe
    v_result := json_build_object(
      'success', false,
      'error', 'Resposta inválida do PagarMe',
      'order_id', p_order_id,
      'pagarme_response', v_pagarme_response
    );
  END IF;
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'order_id', p_order_id
  );
END;
$$;

-- 9. COMENTÁRIOS
COMMENT ON FUNCTION create_pix_payment IS 'Cria pagamento PIX via PagarMe - elimina problemas de CORS';
COMMENT ON FUNCTION get_payment_status IS 'Consulta status de pagamento local';
COMMENT ON FUNCTION update_payment_status_from_pagarme IS 'Atualiza status consultando PagarMe em tempo real';
COMMENT ON TABLE pagamentos IS 'Tabela para armazenar histórico de pagamentos';

-- 10. TABELA DE RECARGAS
CREATE TABLE IF NOT EXISTS recargas (
  id SERIAL PRIMARY KEY,
  profissional_id INTEGER NOT NULL,
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

-- Habilitar RLS
ALTER TABLE recargas ENABLE ROW LEVEL SECURITY;

-- Policies para recargas
DROP POLICY IF EXISTS "Permitir leitura de recargas" ON recargas;
DROP POLICY IF EXISTS "Permitir inserção de recargas" ON recargas;
DROP POLICY IF EXISTS "Permitir atualização de recargas" ON recargas;

CREATE POLICY "Permitir leitura de recargas" ON recargas
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de recargas" ON recargas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de recargas" ON recargas
  FOR UPDATE USING (true);

-- 11. FUNÇÃO PARA ATUALIZAR SALDO QUANDO PAGAMENTO FOR APROVADO
CREATE OR REPLACE FUNCTION processar_pagamento_aprovado(
  p_order_id TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recarga RECORD;
  v_profissional RECORD;
  v_result JSON;
BEGIN
  -- Buscar a recarga
  SELECT * INTO v_recarga 
  FROM recargas 
  WHERE order_id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Recarga não encontrada',
      'order_id', p_order_id
    );
  END IF;
  
  -- Verificar se já foi processada
  IF v_recarga.status = 'aprovado' THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Recarga já foi processada anteriormente',
      'order_id', p_order_id
    );
  END IF;
  
  -- Buscar o profissional
  SELECT * INTO v_profissional 
  FROM profissionais 
  WHERE id = v_recarga.profissional_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Profissional não encontrado',
      'profissional_id', v_recarga.profissional_id
    );
  END IF;
  
  -- Atualizar status da recarga para aprovado
  UPDATE recargas SET
    status = 'aprovado',
    created_at = NOW()
  WHERE order_id = p_order_id;
  
  -- Atualizar saldo do profissional
  UPDATE profissionais SET
    saldo = COALESCE(saldo, 0) + v_recarga.valor_total
  WHERE id = v_recarga.profissional_id;
  
  -- Retornar sucesso
  v_result := json_build_object(
    'success', true,
    'message', 'Saldo atualizado com sucesso',
    'order_id', p_order_id,
    'profissional_id', v_recarga.profissional_id,
    'valor_creditado', v_recarga.valor_total,
    'novo_saldo', COALESCE(v_profissional.saldo, 0) + v_recarga.valor_total
  );
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'order_id', p_order_id
  );
END;
$$;

-- 12. COMENTÁRIOS
COMMENT ON FUNCTION create_pix_payment IS 'Cria pagamento PIX via PagarMe - elimina problemas de CORS';
COMMENT ON FUNCTION get_payment_status IS 'Consulta status de pagamento local';
COMMENT ON FUNCTION update_payment_status_from_pagarme IS 'Atualiza status consultando PagarMe em tempo real';
COMMENT ON FUNCTION processar_pagamento_aprovado IS 'Processa pagamento aprovado e atualiza saldo do profissional';
COMMENT ON TABLE pagamentos IS 'Tabela para armazenar histórico de pagamentos';
COMMENT ON TABLE recargas IS 'Tabela para armazenar histórico de recargas';

-- 13. FUNÇÃO PARA SINCRONIZAR PAGAMENTOS COM RECARGAS
CREATE OR REPLACE FUNCTION sincronizar_pagamento_com_recarga(
  p_order_id TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pagamento RECORD;
  v_recarga RECORD;
  v_profissional RECORD;
  v_result JSON;
BEGIN
  -- Buscar o pagamento
  SELECT * INTO v_pagamento 
  FROM pagamentos 
  WHERE pagarme_order_id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pagamento não encontrado',
      'order_id', p_order_id
    );
  END IF;
  
  -- Buscar a recarga correspondente
  SELECT * INTO v_recarga 
  FROM recargas 
  WHERE order_id = p_order_id;
  
  IF NOT FOUND THEN
    -- Criar recarga automaticamente baseada no pagamento
    INSERT INTO recargas (
      profissional_id,
      valor,
      bonus,
      valor_total,
      order_id,
      status,
      metodo_pagamento,
      created_at
    ) VALUES (
      -- Extrair profissional_id do metadata do pagamento ou usar um valor padrão
      COALESCE((v_pagamento.metadata->>'profissional_id')::integer, 1),
      (v_pagamento.amount::decimal / 100),
      0, -- bonus será calculado depois
      (v_pagamento.amount::decimal / 100),
      p_order_id,
      'pendente',
      v_pagamento.payment_method,
      NOW()
    ) RETURNING * INTO v_recarga;
    
    RAISE LOG 'Recarga criada automaticamente para order_id: %', p_order_id;
  END IF;
  
  -- Se o pagamento foi aprovado, processar a recarga
  IF v_pagamento.status = 'paid' THEN
    -- Buscar o profissional
    SELECT * INTO v_profissional 
    FROM profissionais 
    WHERE id = v_recarga.profissional_id;
    
    IF FOUND THEN
      -- Atualizar status da recarga para aprovado
      UPDATE recargas SET
        status = 'aprovado',
        created_at = NOW()
      WHERE order_id = p_order_id;
      
      -- Atualizar saldo do profissional
      UPDATE profissionais SET
        saldo = COALESCE(saldo, 0) + v_recarga.valor_total
      WHERE id = v_recarga.profissional_id;
      
      v_result := json_build_object(
        'success', true,
        'message', 'Pagamento sincronizado e saldo atualizado',
        'order_id', p_order_id,
        'profissional_id', v_recarga.profissional_id,
        'valor_creditado', v_recarga.valor_total,
        'novo_saldo', COALESCE(v_profissional.saldo, 0) + v_recarga.valor_total,
        'status_pagamento', v_pagamento.status,
        'status_recarga', 'aprovado'
      );
    ELSE
      v_result := json_build_object(
        'success', false,
        'error', 'Profissional não encontrado',
        'profissional_id', v_recarga.profissional_id
      );
    END IF;
  ELSE
    -- Pagamento ainda pendente
    v_result := json_build_object(
      'success', true,
      'message', 'Pagamento sincronizado - aguardando confirmação',
      'order_id', p_order_id,
      'status_pagamento', v_pagamento.status,
      'status_recarga', v_recarga.status
    );
  END IF;
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'order_id', p_order_id
  );
END;
$$;

-- 14. FUNÇÃO PARA VERIFICAR E PROCESSAR TODOS OS PAGAMENTOS PENDENTES
CREATE OR REPLACE FUNCTION processar_pagamentos_pendentes() RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pagamento RECORD;
  v_result JSON;
  v_results JSON[] := '{}';
BEGIN
  -- Buscar todos os pagamentos pendentes
  FOR v_pagamento IN 
    SELECT * FROM pagamentos 
    WHERE status IN ('pending', 'processing', 'created')
    AND created_at > NOW() - INTERVAL '24 hours'
  LOOP
    -- Atualizar status consultando PagarMe
    SELECT * INTO v_result FROM update_payment_status_from_pagarme(v_pagamento.pagarme_order_id);
    
    -- Se o status foi atualizado para 'paid', processar completamente
    IF v_result->>'success' = 'true' AND v_result->>'pagarme_status' = 'paid' THEN
      SELECT * INTO v_result FROM processar_pagamento_completo(v_pagamento.pagarme_order_id);
    END IF;
    
    v_results := array_append(v_results, v_result);
  END LOOP;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Processamento concluído',
    'total_processados', array_length(v_results, 1),
    'resultados', v_results
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 15. COMENTÁRIOS ATUALIZADOS
COMMENT ON FUNCTION create_pix_payment IS 'Cria pagamento PIX via PagarMe - elimina problemas de CORS';
COMMENT ON FUNCTION get_payment_status IS 'Consulta status de pagamento local';
COMMENT ON FUNCTION update_payment_status_from_pagarme IS 'Atualiza status consultando PagarMe em tempo real';
COMMENT ON FUNCTION processar_pagamento_aprovado IS 'Processa pagamento aprovado e atualiza saldo do profissional';
COMMENT ON FUNCTION sincronizar_pagamento_com_recarga IS 'Sincroniza pagamentos com recargas automaticamente';
COMMENT ON FUNCTION processar_pagamentos_pendentes IS 'Processa todos os pagamentos pendentes em lote';
COMMENT ON TABLE pagamentos IS 'Tabela para armazenar histórico de pagamentos';
COMMENT ON TABLE recargas IS 'Tabela para armazenar histórico de recargas';

-- 16. FUNÇÃO PARA PROCESSAR PAGAMENTO COMPLETO (PIX + RECARGA + SALDO)
CREATE OR REPLACE FUNCTION processar_pagamento_completo(
  p_order_id TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pagamento RECORD;
  v_recarga RECORD;
  v_profissional RECORD;
  v_result JSON;
  v_profissional_id INTEGER;
BEGIN
  -- Buscar o pagamento
  SELECT * INTO v_pagamento 
  FROM pagamentos 
  WHERE pagarme_order_id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pagamento não encontrado',
      'order_id', p_order_id
    );
  END IF;
  
  -- Extrair profissional_id do metadata
  v_profissional_id := COALESCE((v_pagamento.metadata->>'profissional_id')::integer, 1);
  
  -- Buscar a recarga correspondente
  SELECT * INTO v_recarga 
  FROM recargas 
  WHERE order_id = p_order_id;
  
  IF NOT FOUND THEN
    -- Criar recarga automaticamente
    INSERT INTO recargas (
      profissional_id,
      valor,
      bonus,
      valor_total,
      order_id,
      status,
      metodo_pagamento,
      created_at
    ) VALUES (
      v_profissional_id,
      (v_pagamento.amount::decimal / 100),
      0, -- bonus será calculado depois
      (v_pagamento.amount::decimal / 100),
      p_order_id,
      'pendente',
      v_pagamento.payment_method,
      NOW()
    ) RETURNING * INTO v_recarga;
    
    RAISE LOG 'Recarga criada automaticamente para order_id: %', p_order_id;
  END IF;
  
  -- Se o pagamento foi aprovado, processar a recarga
  IF v_pagamento.status = 'paid' THEN
    -- Buscar o profissional
    SELECT * INTO v_profissional 
    FROM profissionais 
    WHERE id = v_recarga.profissional_id;
    
    IF FOUND THEN
      -- Atualizar status da recarga para aprovado
      UPDATE recargas SET
        status = 'aprovado',
        created_at = NOW()
      WHERE order_id = p_order_id;
      
      -- Atualizar saldo do profissional
      UPDATE profissionais SET
        saldo = COALESCE(saldo, 0) + v_recarga.valor_total
      WHERE id = v_recarga.profissional_id;
      
      v_result := json_build_object(
        'success', true,
        'message', 'Pagamento processado e saldo atualizado',
        'order_id', p_order_id,
        'profissional_id', v_recarga.profissional_id,
        'valor_creditado', v_recarga.valor_total,
        'novo_saldo', COALESCE(v_profissional.saldo, 0) + v_recarga.valor_total,
        'status_pagamento', v_pagamento.status,
        'status_recarga', 'aprovado'
      );
    ELSE
      v_result := json_build_object(
        'success', false,
        'error', 'Profissional não encontrado',
        'profissional_id', v_recarga.profissional_id
      );
    END IF;
  ELSE
    -- Pagamento ainda pendente
    v_result := json_build_object(
      'success', true,
      'message', 'Pagamento sincronizado - aguardando confirmação',
      'order_id', p_order_id,
      'status_pagamento', v_pagamento.status,
      'status_recarga', v_recarga.status
    );
  END IF;
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'order_id', p_order_id
  );
END;
$$;

-- 18. FUNÇÃO PARA BUSCAR SALDO ATUALIZADO DO PROFISSIONAL
CREATE OR REPLACE FUNCTION get_profissional_saldo(
  p_profissional_id INTEGER
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profissional RECORD;
  v_result JSON;
BEGIN
  -- Buscar o profissional
  SELECT * INTO v_profissional 
  FROM profissionais 
  WHERE id = p_profissional_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Profissional não encontrado',
      'profissional_id', p_profissional_id
    );
  END IF;
  
  -- Retornar dados do profissional
  v_result := json_build_object(
    'success', true,
    'profissional_id', v_profissional.id,
    'nome', v_profissional.nome,
    'saldo', COALESCE(v_profissional.saldo, 0),
    'whatsapp', v_profissional.whatsapp,
    'email', v_profissional.email
  );
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'profissional_id', p_profissional_id
  );
END;
$$;

-- 19. TESTE RÁPIDO (OPCIONAL)
-- SELECT create_pix_payment('Teste', 'teste@teste.com', '12345678901', 100, '11999999999', 'Teste PIX', 1);
-- SELECT update_payment_status_from_pagarme('or_bzyoMZxTGHRNdRY9');
-- SELECT processar_pagamento_completo('or_bzyoMZxTGHRNdRY9');
-- SELECT processar_pagamentos_pendentes();
-- SELECT get_profissional_saldo(1);

-- ========================================
-- SISTEMA DE COMPRA DE DEMANDAS
-- ========================================

-- 20. TABELA DE COMPRAS DE DEMANDAS
CREATE TABLE IF NOT EXISTS compras_demandas (
  id SERIAL PRIMARY KEY,
  demanda_id TEXT NOT NULL REFERENCES demandas(id),
  profissional_id INTEGER NOT NULL REFERENCES profissionais(id),
  valor_pago DECIMAL(10,2) NOT NULL DEFAULT 5.00,
  status TEXT CHECK (status IN ('comprada', 'cancelada', 'expirada')) DEFAULT 'comprada',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que uma demanda só pode ser comprada uma vez
  UNIQUE(demanda_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_compras_demandas_profissional ON compras_demandas(profissional_id);
CREATE INDEX IF NOT EXISTS idx_compras_demandas_demanda ON compras_demandas(demanda_id);
CREATE INDEX IF NOT EXISTS idx_compras_demandas_status ON compras_demandas(status);

-- Habilitar RLS
ALTER TABLE compras_demandas ENABLE ROW LEVEL SECURITY;

-- Policies para compras de demandas
DROP POLICY IF EXISTS "Permitir leitura de compras_demandas" ON compras_demandas;
DROP POLICY IF EXISTS "Permitir inserção de compras_demandas" ON compras_demandas;
DROP POLICY IF EXISTS "Permitir atualização de compras_demandas" ON compras_demandas;

CREATE POLICY "Permitir leitura de compras_demandas" ON compras_demandas
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de compras_demandas" ON compras_demandas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de compras_demandas" ON compras_demandas
  FOR UPDATE USING (true);

-- 21. FUNÇÃO PARA COMPRAR DEMANDA
CREATE OR REPLACE FUNCTION comprar_demanda(
  p_demanda_id TEXT,
  p_profissional_id INTEGER,
  p_valor_pago DECIMAL DEFAULT 5.00
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_demanda RECORD;
  v_profissional RECORD;
  v_saldo_atual DECIMAL;
  v_compra_id INTEGER;
  v_result JSON;
BEGIN
  -- Verificar se a demanda existe e está disponível
  SELECT * INTO v_demanda
  FROM demandas
  WHERE id = p_demanda_id AND status = 'pendente';
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Demanda não encontrada ou já foi comprada'
    );
  END IF;
  
  -- Verificar se o profissional existe
  SELECT * INTO v_profissional
  FROM profissionais
  WHERE id = p_profissional_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Profissional não encontrado'
    );
  END IF;
  
  -- Verificar se o profissional já comprou esta demanda
  IF EXISTS (SELECT 1 FROM compras_demandas WHERE demanda_id = p_demanda_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Esta demanda já foi comprada por outro profissional'
    );
  END IF;
  
  -- Verificar saldo do profissional
  v_saldo_atual := COALESCE(v_profissional.saldo, 0);
  
  IF v_saldo_atual < p_valor_pago THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Saldo insuficiente',
      'saldo_atual', v_saldo_atual,
      'valor_necessario', p_valor_pago
    );
  END IF;
  
  -- Iniciar transação
  BEGIN
    -- Criar registro da compra
    INSERT INTO compras_demandas (
      demanda_id,
      profissional_id,
      valor_pago,
      status
    ) VALUES (
      p_demanda_id,
      p_profissional_id,
      p_valor_pago,
      'comprada'
    ) RETURNING id INTO v_compra_id;
    
    -- Atualizar status da demanda
    UPDATE demandas SET
      status = 'comprada',
      updated_at = NOW()
    WHERE id = p_demanda_id;
    
    -- Debitar saldo do profissional
    UPDATE profissionais SET
      saldo = saldo - p_valor_pago,
      updated_at = NOW()
    WHERE id = p_profissional_id;
    
    -- Retornar sucesso
    v_result := json_build_object(
      'success', true,
      'message', 'Demanda comprada com sucesso!',
      'compra_id', v_compra_id,
      'demanda_id', p_demanda_id,
      'profissional_id', p_profissional_id,
      'valor_pago', p_valor_pago,
      'saldo_anterior', v_saldo_atual,
      'saldo_atual', v_saldo_atual - p_valor_pago,
      'dados_cliente', json_build_object(
        'nome', v_demanda.nome,
        'whatsapp', v_demanda.whatsapp,
        'email', v_demanda.email,
        'cidade', v_demanda.cidade,
        'estado', v_demanda.estado,
        'observacao', v_demanda.observacao
      )
    );
    
    RETURN v_result;
    
  EXCEPTION WHEN OTHERS THEN
    -- Em caso de erro, fazer rollback automático
    RETURN json_build_object(
      'success', false,
      'error', 'Erro ao processar compra: ' || SQLERRM
    );
  END;
  
END;
$$;

-- 22. FUNÇÃO PARA VERIFICAR SE DEMANDA FOI COMPRADA
CREATE OR REPLACE FUNCTION verificar_demanda_comprada(
  p_demanda_id TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_compra RECORD;
  v_result JSON;
BEGIN
  SELECT cd.*, p.nome as profissional_nome, p.whatsapp as profissional_whatsapp
  INTO v_compra
  FROM compras_demandas cd
  JOIN profissionais p ON cd.profissional_id = p.id
  WHERE cd.demanda_id = p_demanda_id;
  
  IF FOUND THEN
    v_result := json_build_object(
      'success', true,
      'comprada', true,
      'compra_id', v_compra.id,
      'profissional_id', v_compra.profissional_id,
      'profissional_nome', v_compra.profissional_nome,
      'profissional_whatsapp', v_compra.profissional_whatsapp,
      'valor_pago', v_compra.valor_pago,
      'status', v_compra.status,
      'created_at', v_compra.created_at
    );
  ELSE
    v_result := json_build_object(
      'success', true,
      'comprada', false
    );
  END IF;
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 23. FUNÇÃO PARA LISTAR COMPRAS DO PROFISSIONAL
CREATE OR REPLACE FUNCTION listar_compras_profissional(
  p_profissional_id INTEGER
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_compras JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'compra_id', cd.id,
      'demanda_id', cd.demanda_id,
      'valor_pago', cd.valor_pago,
      'status', cd.status,
      'created_at', cd.created_at,
      'dados_demanda', json_build_object(
        'nome', d.nome,
        'whatsapp', d.whatsapp,
        'email', d.email,
        'cidade', d.cidade,
        'estado', d.estado,
        'observacao', d.observacao,
        'categoria_nome', c.nome,
        'subcategoria_nome', sc.nome
      )
    ) ORDER BY cd.created_at DESC
  ) INTO v_compras
  FROM compras_demandas cd
  JOIN demandas d ON cd.demanda_id = d.id
  JOIN categorias c ON d.categoria_id = c.id
  JOIN subcategorias sc ON d.subcategoria_id = sc.id
  WHERE cd.profissional_id = p_profissional_id
  ORDER BY cd.created_at DESC;
  
  RETURN json_build_object(
    'success', true,
    'compras', COALESCE(v_compras, '[]'::json)
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 24. COMENTÁRIOS FINAIS
COMMENT ON TABLE compras_demandas IS 'Tabela para armazenar compras de demandas pelos profissionais';
COMMENT ON FUNCTION comprar_demanda IS 'Função para comprar uma demanda - debita saldo e cria registro';
COMMENT ON FUNCTION verificar_demanda_comprada IS 'Verifica se uma demanda foi comprada e por quem';
COMMENT ON FUNCTION listar_compras_profissional IS 'Lista todas as compras de um profissional';
