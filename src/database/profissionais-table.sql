
-- ===================================
-- TABELA: PROFISSIONAIS
-- ===================================
-- Tabela para armazenar dados dos prestadores de serviço da plataforma

CREATE TABLE profissionais (
    -- 🧍‍♂️ DADOS PESSOAIS
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    documento_tipo VARCHAR(4) NOT NULL CHECK (documento_tipo IN ('CPF', 'CNPJ')),
    documento_numero VARCHAR(18) NOT NULL UNIQUE,
    
    -- 📍 ENDEREÇO COMPLETO
    estado CHAR(2) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    rua VARCHAR(255) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(100),
    cep CHAR(8) NOT NULL,
    
    -- 💰 DISPONIBILIDADE PARA DIÁRIA
    aceita_diaria BOOLEAN DEFAULT FALSE,
    valor_diaria DECIMAL(10,2),
    
    -- 📊 CONTROLE
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- ✅ VALIDAÇÕES
    CONSTRAINT valid_documento_cpf CHECK (
        (documento_tipo = 'CPF' AND LENGTH(documento_numero) = 11) OR 
        documento_tipo != 'CPF'
    ),
    CONSTRAINT valid_documento_cnpj CHECK (
        (documento_tipo = 'CNPJ' AND LENGTH(documento_numero) = 14) OR 
        documento_tipo != 'CNPJ'
    ),
    CONSTRAINT valid_valor_diaria CHECK (
        (aceita_diaria = TRUE AND valor_diaria > 0) OR 
        (aceita_diaria = FALSE AND valor_diaria IS NULL)
    )
);

-- ===================================
-- TABELA: PROFISSIONAL_CATEGORIA
-- ===================================
-- Tabela intermediária para relacionar profissionais com categorias
-- Um profissional pode atuar em múltiplas categorias

CREATE TABLE profissional_categoria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profissional_id UUID NOT NULL,
    categoria_id UUID NOT NULL,
    estado CHAR(2) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    data_vinculo TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ativo BOOLEAN DEFAULT TRUE,
    
    -- 🔗 RELACIONAMENTOS
    FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
    
    -- ✅ CONSTRAINT ÚNICA
    UNIQUE(profissional_id, categoria_id)
);

-- ===================================
-- ÍNDICES PARA PERFORMANCE
-- ===================================

-- Índices para busca por localização
CREATE INDEX idx_profissionais_estado_cidade ON profissionais(estado, cidade);
CREATE INDEX idx_profissionais_ativo ON profissionais(ativo);
CREATE INDEX idx_profissionais_email ON profissionais(email);
CREATE INDEX idx_profissionais_documento ON profissionais(documento_numero);

-- Índices para a tabela de relacionamento
CREATE INDEX idx_profissional_categoria_profissional ON profissional_categoria(profissional_id);
CREATE INDEX idx_profissional_categoria_categoria ON profissional_categoria(categoria_id);
CREATE INDEX idx_profissional_categoria_ativo ON profissional_categoria(ativo);
CREATE INDEX idx_profissional_categoria_estado_cidade ON profissional_categoria(estado, cidade);

-- ===================================
-- TRIGGERS PARA AUDITORIA
-- ===================================

-- Trigger para atualizar data_atualizacao
CREATE OR REPLACE FUNCTION update_profissional_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profissional_timestamp
    BEFORE UPDATE ON profissionais
    FOR EACH ROW
    EXECUTE FUNCTION update_profissional_timestamp();

-- ===================================
-- COMENTÁRIOS NAS COLUNAS
-- ===================================

COMMENT ON TABLE profissionais IS 'Tabela principal dos prestadores de serviço da plataforma';
COMMENT ON COLUMN profissionais.nome_completo IS 'Nome completo do profissional';
COMMENT ON COLUMN profissionais.email IS 'Email único do profissional';
COMMENT ON COLUMN profissionais.telefone IS 'Telefone com DDD';
COMMENT ON COLUMN profissionais.documento_tipo IS 'Tipo do documento: CPF ou CNPJ';
COMMENT ON COLUMN profissionais.documento_numero IS 'Número do CPF (11 dígitos) ou CNPJ (14 dígitos)';
COMMENT ON COLUMN profissionais.aceita_diaria IS 'Indica se o profissional aceita trabalhar por diária';
COMMENT ON COLUMN profissionais.valor_diaria IS 'Valor pretendido para diária (apenas se aceita_diaria = true)';

COMMENT ON TABLE profissional_categoria IS 'Relacionamento N:N entre profissionais e categorias de serviço';
COMMENT ON COLUMN profissional_categoria.estado IS 'Estado onde o profissional atende nesta categoria';
COMMENT ON COLUMN profissional_categoria.cidade IS 'Cidade onde o profissional atende nesta categoria';

-- ===================================
-- EXEMPLO DE CONSULTAS ÚTEIS
-- ===================================

/*
-- Buscar profissionais por categoria em uma cidade específica:
SELECT p.nome_completo, p.telefone, p.email, c.nome as categoria
FROM profissionais p
JOIN profissional_categoria pc ON p.id = pc.profissional_id
JOIN categorias c ON pc.categoria_id = c.id
WHERE pc.cidade = 'São Paulo'
  AND pc.estado = 'SP'
  AND c.nome = 'Elétrica'
  AND p.ativo = TRUE
  AND pc.ativo = TRUE;

-- Buscar profissionais que aceitam diária com valor específico:
SELECT nome_completo, telefone, valor_diaria, cidade, estado
FROM profissionais
WHERE aceita_diaria = TRUE
  AND valor_diaria <= 200.00
  AND ativo = TRUE
ORDER BY valor_diaria ASC;

-- Contar quantos profissionais há por categoria em uma cidade:
SELECT c.nome as categoria, pc.cidade, pc.estado, COUNT(pc.profissional_id) as total_profissionais
FROM categorias c
LEFT JOIN profissional_categoria pc ON c.id = pc.categoria_id AND pc.ativo = TRUE
LEFT JOIN profissionais p ON pc.profissional_id = p.id AND p.ativo = TRUE
GROUP BY c.id, c.nome, pc.cidade, pc.estado
ORDER BY total_profissionais DESC;
*/
