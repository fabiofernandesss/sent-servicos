
-- Verificar se existe alguma constraint de unicidade que está impedindo cadastros duplicados
-- e remover restrições desnecessárias na tabela demandas

-- Verificar constraints existentes
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'demandas'::regclass;

-- Se houver constraint de unicidade desnecessária, vamos removê-la
-- (isso será executado apenas se existir uma constraint problemática)
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Buscar constraint de unicidade que pode estar causando problema
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'demandas'::regclass 
    AND contype = 'u' 
    AND pg_get_constraintdef(oid) LIKE '%whatsapp%';
    
    -- Se encontrar, remover a constraint
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE demandas DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
END $$;

-- Garantir que a tabela demandas permite múltiplas demandas do mesmo cliente
-- Remover qualquer índice único desnecessário no campo whatsapp
DROP INDEX IF EXISTS demandas_whatsapp_key;
DROP INDEX IF EXISTS demandas_email_key;

-- Criar índices normais (não únicos) para performance, se necessário
CREATE INDEX IF NOT EXISTS idx_demandas_whatsapp ON demandas(whatsapp);
CREATE INDEX IF NOT EXISTS idx_demandas_email ON demandas(email);
CREATE INDEX IF NOT EXISTS idx_demandas_categoria_cidade ON demandas(categoria_id, cidade);
