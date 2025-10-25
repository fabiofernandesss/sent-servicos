-- ========================================
-- CORREÇÃO COMPLETA DE TODOS OS ERROS
-- ========================================

-- 1. VERIFICAR E CORRIGIR CONSTRAINT DE STATUS DA TABELA DEMANDAS
-- Primeiro, vamos ver quais constraints existem
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'demandas'::regclass;

-- Remover constraint de status se existir e recriar com valores corretos
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Buscar constraint de status
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'demandas'::regclass 
    AND contype = 'c' 
    AND pg_get_constraintdef(oid) LIKE '%status%';
    
    -- Se encontrar, remover a constraint
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE demandas DROP CONSTRAINT ' || quote_ident(constraint_name);
        RAISE NOTICE 'Constraint removida: %', constraint_name;
    END IF;
END $$;

-- Adicionar constraint de status correta
ALTER TABLE demandas ADD CONSTRAINT demandas_status_check 
CHECK (status IN ('pendente', 'comprada', 'cancelada', 'expirada', 'concluida'));

-- 2. CORRIGIR TABELA DE COMPRAS DE DEMANDAS
-- Remover tabela existente
DROP TABLE IF EXISTS compras_demandas CASCADE;

-- Criar tabela corrigida
CREATE TABLE compras_demandas (
  id SERIAL PRIMARY KEY,
  demanda_id UUID NOT NULL REFERENCES demandas(id),
  profissional_id INTEGER NOT NULL REFERENCES profissionais(id),
  valor_pago DECIMAL(10,2) NOT NULL DEFAULT 5.00,
  status TEXT CHECK (status IN ('comprada', 'cancelada', 'expirada')) DEFAULT 'comprada',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que uma demanda só pode ser comprada uma vez
  UNIQUE(demanda_id)
);

-- Índices
CREATE INDEX idx_compras_demandas_profissional ON compras_demandas(profissional_id);
CREATE INDEX idx_compras_demandas_demanda ON compras_demandas(demanda_id);
CREATE INDEX idx_compras_demandas_status ON compras_demandas(status);

-- RLS
ALTER TABLE compras_demandas ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Permitir leitura de compras_demandas" ON compras_demandas
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de compras_demandas" ON compras_demandas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de compras_demandas" ON compras_demandas
  FOR UPDATE USING (true);

-- 3. CORRIGIR FUNÇÃO CREATE_PIX_PAYMENT
-- Remover todas as versões antigas
DROP FUNCTION IF EXISTS create_pix_payment(TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_pix_payment(TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS create_pix_payment(TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, INTEGER);

-- Criar função corrigida
CREATE OR REPLACE FUNCTION create_pix_payment(
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_document TEXT,
  p_customer_phone TEXT DEFAULT NULL,
  p_amount INTEGER,
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
    'type', 'individual',
    'document', p_customer_document,
    'document_type', 'CPF',
    'phones', json_build_object(
      'mobile_phone', json_build_object(
        'country_code', '55',
        'area_code', v_phone_area,
        'number', v_phone_number
      )
    )
  );
  
  -- Preparar dados do pedido
  v_order_data := json_build_object(
    'customer', v_customer_data,
    'items', json_build_array(
      json_build_object(
        'amount', p_amount,
        'description', p_description,
        'quantity', 1
      )
    ),
    'payments', json_build_array(
      json_build_object(
        'payment_method', 'pix',
        'pix', json_build_object(
          'expires_in', 3600
        )
      )
    )
  );
  
  -- Fazer requisição para PagarMe
  BEGIN
    SELECT content INTO v_pagarme_response
    FROM http((
      'POST',
      'https://api.pagar.me/core/v5/orders',
      ARRAY[http_header('Authorization', 'Basic ' || encode(current_setting('app.pagarme_secret_key')::text, 'base64'))],
      'application/json',
      v_order_data::text
    ));
    
    -- Atualizar registro com resposta do PagarMe
    UPDATE pagamentos SET
      pagarme_order_id = (v_pagarme_response->>'id'),
      status = COALESCE(v_pagarme_response->'charges'->0->>'status', 'processing'),
      pix_qr_code = v_pagarme_response->'charges'->0->'last_transaction'->>'qr_code',
      pix_qr_code_url = v_pagarme_response->'charges'->0->'last_transaction'->>'qr_code_url',
      updated_at = NOW()
    WHERE id = v_payment_id;
    
    -- Retornar resultado
    v_result := json_build_object(
      'success', true,
      'payment_id', v_payment_id,
      'pagarme_order_id', v_pagarme_response->>'id',
      'status', COALESCE(v_pagarme_response->'charges'->0->>'status', 'processing'),
      'pix', json_build_object(
        'qr_code', v_pagarme_response->'charges'->0->'last_transaction'->>'qr_code',
        'qr_code_url', v_pagarme_response->'charges'->0->'last_transaction'->>'qr_code_url',
        'expires_at', v_pagarme_response->'charges'->0->'last_transaction'->>'expires_at'
      )
    );
    
    RETURN v_result;
    
  EXCEPTION WHEN OTHERS THEN
    -- Em caso de erro na API, marcar como erro
    UPDATE pagamentos SET
      status = 'error',
      updated_at = NOW()
    WHERE id = v_payment_id;
    
    RETURN json_build_object(
      'success', false,
      'error', 'Erro na API PagarMe: ' || SQLERRM
    );
  END;
  
END;
$$;

-- 4. FUNÇÃO PARA COMPRAR DEMANDA
CREATE OR REPLACE FUNCTION comprar_demanda(
  p_demanda_id UUID,
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

-- 5. FUNÇÃO PARA VERIFICAR SE DEMANDA FOI COMPRADA
CREATE OR REPLACE FUNCTION verificar_demanda_comprada(
  p_demanda_id UUID
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

-- 6. FUNÇÃO PARA LISTAR COMPRAS DO PROFISSIONAL
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

-- 7. COMENTÁRIOS
COMMENT ON TABLE compras_demandas IS 'Tabela para armazenar compras de demandas pelos profissionais';
COMMENT ON FUNCTION comprar_demanda IS 'Função para comprar uma demanda - debita saldo e cria registro';
COMMENT ON FUNCTION verificar_demanda_comprada IS 'Verifica se uma demanda foi comprada e por quem';
COMMENT ON FUNCTION listar_compras_profissional IS 'Lista todas as compras de um profissional';
COMMENT ON FUNCTION create_pix_payment IS 'Função para criar pagamento PIX via PagarMe';

-- 8. VERIFICAÇÃO FINAL
-- Verificar se as constraints estão corretas
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'demandas'::regclass 
AND contype = 'c';

-- Verificar se as funções foram criadas
SELECT proname, proargnames 
FROM pg_proc 
WHERE proname IN ('create_pix_payment', 'comprar_demanda', 'verificar_demanda_comprada', 'listar_compras_profissional');

-- 9. TESTE RÁPIDO (OPCIONAL)
-- SELECT create_pix_payment('Teste', 'teste@teste.com', '12345678901', '11999999999', 100, 'Teste PIX', 1);
-- SELECT comprar_demanda('uuid-da-demanda-aqui', 1, 5.00);
-- SELECT verificar_demanda_comprada('uuid-da-demanda-aqui');
-- SELECT listar_compras_profissional(1);
