-- Função para criar pagamento PIX via PagarMe
-- Esta função roda no servidor Supabase, eliminando problemas de CORS

-- Primeiro, vamos criar uma tabela para armazenar os pagamentos
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pagamentos_customer_document ON pagamentos(customer_document);
CREATE INDEX IF NOT EXISTS idx_pagamentos_pagarme_order_id ON pagamentos(pagarme_order_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_created_at ON pagamentos(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- Policy para permitir leitura de qualquer usuário (ajustar conforme necessário)
CREATE POLICY "Permitir leitura de pagamentos" ON pagamentos
  FOR SELECT USING (true);

-- Policy para permitir inserção de qualquer usuário (ajustar conforme necessário)  
CREATE POLICY "Permitir inserção de pagamentos" ON pagamentos
  FOR INSERT WITH CHECK (true);

-- Policy para permitir atualização de qualquer usuário (ajustar conforme necessário)
CREATE POLICY "Permitir atualização de pagamentos" ON pagamentos
  FOR UPDATE USING (true);

-- Função para criar pagamento PIX
CREATE OR REPLACE FUNCTION create_pix_payment(
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_document TEXT,
  p_customer_phone TEXT DEFAULT NULL,
  p_amount INTEGER,
  p_description TEXT DEFAULT 'Recarga de créditos'
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
BEGIN
  -- Log da tentativa
  RAISE LOG 'Criando pagamento PIX: % - R$ %', p_customer_name, (p_amount::FLOAT / 100);
  
  -- Validações básicas
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Valor deve ser maior que zero';
  END IF;
  
  IF p_customer_name IS NULL OR p_customer_email IS NULL OR p_customer_document IS NULL THEN
    RAISE EXCEPTION 'Dados do cliente são obrigatórios';
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
    status
  ) VALUES (
    p_customer_name,
    p_customer_email,
    p_customer_document,
    p_customer_phone,
    p_amount,
    'pix',
    p_description,
    'processing'
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
        'area_code', COALESCE(substring(regexp_replace(p_customer_phone, '[^0-9]', '', 'g'), 1, 2), '11'),
        'number', COALESCE(substring(regexp_replace(p_customer_phone, '[^0-9]', '', 'g'), 3), '999999999')
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
  
  -- Fazer chamada para API do PagarMe usando http extension
  -- IMPORTANTE: Você precisa habilitar a extensão http no Supabase
  -- e configurar a chave secreta do PagarMe nas variáveis de ambiente
  
  SELECT 
    content::json INTO v_pagarme_response
  FROM http((
    'POST',
    'https://api.pagar.me/core/v5/orders',
    ARRAY[
      http_header('Content-Type', 'application/json'),
      http_header('Authorization', 'Basic ' || encode(
        current_setting('app.pagarme_secret_key', true) || ':',
        'base64'
      ))
    ],
    'application/json',
    v_order_data::text
  ));
  
  -- Processar resposta do PagarMe
  IF v_pagarme_response->>'id' IS NOT NULL THEN
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
      metadata = metadata || json_build_object('error', v_pagarme_response)::jsonb,
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
  -- Em caso de erro, atualizar status
  UPDATE pagamentos SET
    status = 'failed',
    metadata = metadata || json_build_object('error', SQLERRM)::jsonb,
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

-- Função para criar pagamento com cartão de crédito
CREATE OR REPLACE FUNCTION create_credit_card_payment(
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_document TEXT,
  p_customer_phone TEXT DEFAULT NULL,
  p_amount INTEGER,
  p_card_number TEXT,
  p_card_holder_name TEXT,
  p_card_exp_month INTEGER,
  p_card_exp_year INTEGER,
  p_card_cvv TEXT,
  p_installments INTEGER DEFAULT 1,
  p_description TEXT DEFAULT 'Recarga de créditos'
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
BEGIN
  -- Log da tentativa
  RAISE LOG 'Criando pagamento cartão: % - R$ % - %x', p_customer_name, (p_amount::FLOAT / 100), p_installments;
  
  -- Validações básicas
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Valor deve ser maior que zero';
  END IF;
  
  IF p_installments < 1 OR p_installments > 12 THEN
    RAISE EXCEPTION 'Parcelas devem ser entre 1 e 12';
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
    installments,
    card_last_digits,
    status
  ) VALUES (
    p_customer_name,
    p_customer_email,
    p_customer_document,
    p_customer_phone,
    p_amount,
    'credit_card',
    p_description,
    p_installments,
    right(regexp_replace(p_card_number, '[^0-9]', '', 'g'), 4),
    'processing'
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
        'area_code', COALESCE(substring(regexp_replace(p_customer_phone, '[^0-9]', '', 'g'), 1, 2), '11'),
        'number', COALESCE(substring(regexp_replace(p_customer_phone, '[^0-9]', '', 'g'), 3), '999999999')
      )
    ),
    'metadata', json_build_object('created_by', 'sent_servicos'),
    'code', 'customer_card_' || extract(epoch from now())::bigint,
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
        'payment_method', 'credit_card',
        'credit_card', json_build_object(
          'installments', p_installments,
          'statement_descriptor', 'SENT SERVICOS',
          'card', json_build_object(
            'number', regexp_replace(p_card_number, '[^0-9]', '', 'g'),
            'holder_name', p_card_holder_name,
            'exp_month', p_card_exp_month,
            'exp_year', p_card_exp_year,
            'cvv', p_card_cvv
          ),
          'capture', true
        )
      )
    ),
    'code', 'order_' || extract(epoch from now())::bigint,
    'closed', true
  );
  
  -- Fazer chamada para API do PagarMe
  SELECT 
    content::json INTO v_pagarme_response
  FROM http((
    'POST',
    'https://api.pagar.me/core/v5/orders',
    ARRAY[
      http_header('Content-Type', 'application/json'),
      http_header('Authorization', 'Basic ' || encode(
        current_setting('app.pagarme_secret_key', true) || ':',
        'base64'
      ))
    ],
    'application/json',
    v_order_data::text
  ));
  
  -- Processar resposta do PagarMe
  IF v_pagarme_response->>'id' IS NOT NULL THEN
    -- Sucesso - atualizar registro
    UPDATE pagamentos SET
      pagarme_order_id = v_pagarme_response->>'id',
      status = COALESCE(v_pagarme_response->>'status', 'created'),
      card_brand = v_pagarme_response->'charges'->0->'last_transaction'->>'card_brand',
      metadata = metadata || json_build_object('pagarme_response', v_pagarme_response)::jsonb,
      updated_at = NOW()
    WHERE id = v_payment_id;
    
    -- Retornar resultado de sucesso
    v_result := json_build_object(
      'success', true,
      'payment_id', v_payment_id,
      'pagarme_order_id', v_pagarme_response->>'id',
      'status', v_pagarme_response->>'status',
      'card', json_build_object(
        'brand', v_pagarme_response->'charges'->0->'last_transaction'->>'card_brand',
        'last_digits', right(regexp_replace(p_card_number, '[^0-9]', '', 'g'), 4),
        'installments', p_installments
      )
    );
    
  ELSE
    -- Erro - atualizar status
    UPDATE pagamentos SET
      status = 'failed',
      metadata = metadata || json_build_object('error', v_pagarme_response)::jsonb,
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
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  -- Em caso de erro, atualizar status
  UPDATE pagamentos SET
    status = 'failed',
    metadata = metadata || json_build_object('error', SQLERRM)::jsonb,
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

-- Função para consultar status de um pagamento
CREATE OR REPLACE FUNCTION get_payment_status(
  p_payment_id UUID
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
  WHERE id = p_payment_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pagamento não encontrado'
    );
  END IF;
  
  -- Se temos order_id do PagarMe, consultar status atualizado
  IF v_payment.pagarme_order_id IS NOT NULL THEN
    SELECT 
      content::json INTO v_pagarme_response
    FROM http((
      'GET',
      'https://api.pagar.me/core/v5/orders/' || v_payment.pagarme_order_id,
      ARRAY[
        http_header('Authorization', 'Basic ' || encode(
          current_setting('app.pagarme_secret_key', true) || ':',
          'base64'
        ))
      ],
      NULL,
      NULL
    ));
    
    -- Atualizar status local se necessário
    IF v_pagarme_response->>'status' != v_payment.status THEN
      UPDATE pagamentos SET
        status = v_pagarme_response->>'status',
        updated_at = NOW()
      WHERE id = p_payment_id;
    END IF;
    
    -- Retornar dados atualizados
    v_result := json_build_object(
      'success', true,
      'payment_id', p_payment_id,
      'status', v_pagarme_response->>'status',
      'pagarme_order_id', v_payment.pagarme_order_id,
      'amount', v_payment.amount,
      'payment_method', v_payment.payment_method
    );
    
    -- Adicionar dados específicos do PIX se aplicável
    IF v_payment.payment_method = 'pix' THEN
      v_result := v_result || json_build_object(
        'pix', json_build_object(
          'qr_code', v_payment.pix_qr_code,
          'qr_code_url', v_payment.pix_qr_code_url,
          'expires_at', v_payment.pix_expires_at
        )
      );
    END IF;
    
  ELSE
    -- Retornar apenas dados locais
    v_result := json_build_object(
      'success', true,
      'payment_id', p_payment_id,
      'status', v_payment.status,
      'amount', v_payment.amount,
      'payment_method', v_payment.payment_method
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

-- Comentários finais
COMMENT ON FUNCTION create_pix_payment IS 'Cria pagamento PIX via PagarMe - elimina problemas de CORS';
COMMENT ON FUNCTION create_credit_card_payment IS 'Cria pagamento cartão via PagarMe - elimina problemas de CORS';
COMMENT ON FUNCTION get_payment_status IS 'Consulta status de pagamento no PagarMe';
COMMENT ON TABLE pagamentos IS 'Tabela para armazenar histórico de pagamentos';
