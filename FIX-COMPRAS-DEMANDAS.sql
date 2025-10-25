-- ========================================
-- CORREÇÃO: COMPRAS DE DEMANDAS
-- Problema: Tipos incompatíveis entre demandas.id (UUID) e compras_demandas.demanda_id (TEXT)
-- ========================================

-- 1. REMOVER TABELA EXISTENTE (se existir)
DROP TABLE IF EXISTS compras_demandas CASCADE;

-- 2. CRIAR TABELA CORRIGIDA
CREATE TABLE IF NOT EXISTS compras_demandas (
  id SERIAL PRIMARY KEY,
  demanda_id UUID NOT NULL REFERENCES demandas(id), -- CORRIGIDO: UUID em vez de TEXT
  profissional_id INTEGER NOT NULL REFERENCES profissionais(id),
  valor_pago DECIMAL(10,2) NOT NULL DEFAULT 5.00,
  status TEXT CHECK (status IN ('comprada', 'cancelada', 'expirada')) DEFAULT 'comprada',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que uma demanda só pode ser comprada uma vez
  UNIQUE(demanda_id)
);

-- 3. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_compras_demandas_profissional ON compras_demandas(profissional_id);
CREATE INDEX IF NOT EXISTS idx_compras_demandas_demanda ON compras_demandas(demanda_id);
CREATE INDEX IF NOT EXISTS idx_compras_demandas_status ON compras_demandas(status);

-- 4. HABILITAR RLS
ALTER TABLE compras_demandas ENABLE ROW LEVEL SECURITY;

-- 5. CRIAR POLICIES
DROP POLICY IF EXISTS "Permitir leitura de compras_demandas" ON compras_demandas;
DROP POLICY IF EXISTS "Permitir inserção de compras_demandas" ON compras_demandas;
DROP POLICY IF EXISTS "Permitir atualização de compras_demandas" ON compras_demandas;

CREATE POLICY "Permitir leitura de compras_demandas" ON compras_demandas
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de compras_demandas" ON compras_demandas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de compras_demandas" ON compras_demandas
  FOR UPDATE USING (true);

-- 6. FUNÇÃO PARA COMPRAR DEMANDA (CORRIGIDA)
CREATE OR REPLACE FUNCTION comprar_demanda(
  p_demanda_id UUID, -- CORRIGIDO: UUID em vez de TEXT
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

-- 7. FUNÇÃO PARA VERIFICAR SE DEMANDA FOI COMPRADA (CORRIGIDA)
CREATE OR REPLACE FUNCTION verificar_demanda_comprada(
  p_demanda_id UUID -- CORRIGIDO: UUID em vez de TEXT
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

-- 8. FUNÇÃO PARA LISTAR COMPRAS DO PROFISSIONAL (CORRIGIDA)
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

-- 9. COMENTÁRIOS
COMMENT ON TABLE compras_demandas IS 'Tabela para armazenar compras de demandas pelos profissionais';
COMMENT ON FUNCTION comprar_demanda IS 'Função para comprar uma demanda - debita saldo e cria registro';
COMMENT ON FUNCTION verificar_demanda_comprada IS 'Verifica se uma demanda foi comprada e por quem';
COMMENT ON FUNCTION listar_compras_profissional IS 'Lista todas as compras de um profissional';

-- 10. TESTE RÁPIDO (OPCIONAL)
-- SELECT comprar_demanda('uuid-da-demanda-aqui', 1, 5.00);
-- SELECT verificar_demanda_comprada('uuid-da-demanda-aqui');
-- SELECT listar_compras_profissional(1);
