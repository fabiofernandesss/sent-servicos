import { supabase } from '@/integrations/supabase/client';

export interface Categoria {
  id: string;
  nome: string;
}

export interface Subcategoria {
  id: string;
  nome: string;
  categoria_id: string;
}

export interface DemandaData {
  nome: string;
  email: string;
  whatsapp: string;
  cidade: string;
  estado: string;
  categoria_id: string;
  subcategoria_id: string;
  urgencia: string;
  observacao: string;
}

// Interface atualizada para corresponder exatamente à tabela do banco
export interface Profissional {
  id?: number;
  cpf_cnpj: string;
  nome: string;
  whatsapp: string;
  aceita_diaria?: boolean;
  foto_perfil?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  crea?: string;
  creci?: string;
  desativado?: boolean;
  email?: string;
  estado?: string;
  estrelas?: number;
  nacionalidade?: string;
  numero?: string;
  receber_msm?: boolean;
  rua?: string;
  saldo?: number;
  termos?: string;
  valor_diaria?: number;
}

// Interface atualizada para corresponder à tabela profissional_categorias
export interface ProfissionalCategoria {
  id?: number;
  profissional_id: number;
  categoria_id: string; // UUID como string
  whatsapp?: string;
  created_at?: string;
}

// Função para limpar formatação do WhatsApp
const cleanWhatsApp = (whatsapp: string): string => {
  // Remove todos os caracteres que não são dígitos
  const cleaned = whatsapp.replace(/\D/g, '');
  
  // Se começar com 55 (código do Brasil), mantém
  // Se não começar com 55, adiciona
  if (cleaned.startsWith('55')) {
    return cleaned;
  } else {
    return '55' + cleaned;
  }
};

export const loadCategorias = async () => {
  console.log('Carregando categorias...');
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('ativo', true)
    .order('nome');

  if (error) {
    console.error('Erro ao carregar categorias:', error);
    throw error;
  }

  console.log('Categorias carregadas:', data?.length);
  return data || [];
};

export const loadSubcategorias = async () => {
  console.log('Carregando subcategorias...');
  const { data, error } = await supabase
    .from('subcategorias')
    .select('*')
    .eq('ativo', true)
    .order('nome');

  if (error) {
    console.error('Erro ao carregar subcategorias:', error);
    throw error;
  }

  console.log('Subcategorias carregadas:', data?.length);
  return data || [];
};

export const createDemanda = async (demandaData: DemandaData) => {
  console.log('Criando demanda:', demandaData);
  
  // Verificar se todos os campos obrigatórios estão presentes
  const requiredFields = ['nome', 'email', 'whatsapp', 'cidade', 'estado', 'categoria_id', 'subcategoria_id', 'urgencia'];
  for (const field of requiredFields) {
    if (!demandaData[field as keyof DemandaData]) {
      throw new Error(`Campo obrigatório ausente: ${field}`);
    }
  }

  // Preparar dados para inserção com valores explícitos
  const insertData = {
    nome: demandaData.nome.trim(),
    email: demandaData.email.trim().toLowerCase(),
    whatsapp: demandaData.whatsapp.trim(),
    cidade: demandaData.cidade.trim(),
    estado: demandaData.estado.trim(),
    categoria_id: demandaData.categoria_id,
    subcategoria_id: demandaData.subcategoria_id,
    urgencia: demandaData.urgencia,
    observacao: demandaData.observacao?.trim() || null,
    status: 'pendente',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('Dados preparados para inserção:', insertData);
  
  try {
    const { data, error } = await supabase
      .from('demandas')
      .insert([insertData])
      .select();

    if (error) {
      console.error('Erro detalhado ao criar demanda:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      throw new Error('Erro ao salvar demanda. Tente novamente.');
    }

    console.log('Demanda criada com sucesso:', data);
    return data;

  } catch (fetchError) {
    console.error('Erro geral ao criar demanda:', fetchError);
    throw new Error('Erro interno. Tente novamente em alguns instantes.');
  }
};

export const loadCidades = async (uf: string) => {
  console.log('Carregando cidades para UF:', uf);
  
  try {
    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
    
    if (!response.ok) {
      throw new Error(`Erro ao carregar cidades: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Cidades carregadas:', data.length);
    return data;
  } catch (error) {
    console.error('Erro ao carregar cidades:', error);
    throw error;
  }
};

export const loadProfissionalByWhatsapp = async (whatsapp: string) => {
  console.log('Buscando profissional por WhatsApp:', whatsapp);
  
  // Limpar o WhatsApp de entrada para busca
  const cleanedWhatsapp = cleanWhatsApp(whatsapp);
  
  // Tentar buscar com o número limpo e com variações de formatação
  const whatsappVariations = [
    cleanedWhatsapp,
    whatsapp.replace(/\D/g, ''), // Remove todos os não-dígitos
    '55' + whatsapp.replace(/\D/g, ''), // Adiciona 55
    whatsapp.replace(/\D/g, '').replace(/^55/, ''), // Remove 55 se existir
  ];

  console.log('Tentando variações do WhatsApp:', whatsappVariations);

  for (const variation of whatsappVariations) {
    const { data, error } = await supabase
      .from('profissionais')
      .select('*')
      .eq('whatsapp', variation)
      .maybeSingle(); // Usar maybeSingle() ao invés de single() para evitar erro quando não encontrar

    if (data && !error) {
      console.log('Profissional encontrado com WhatsApp:', variation, data);
      return data;
    }
    
    if (error) {
      console.log('Erro ao buscar com WhatsApp:', variation, error);
    }
  }

  console.log('Nenhum profissional encontrado para as variações do WhatsApp');
  return null;
};

export const loadProfissionalCategorias = async (profissionalId: number) => {
  console.log('Carregando categorias do profissional:', profissionalId);
  
  const { data, error } = await supabase
    .from('profissional_categorias')
    .select(`
      *,
      categorias:categoria_id (
        id,
        nome
      )
    `)
    .eq('profissional_id', profissionalId);

  if (error) {
    console.error('Erro ao carregar categorias do profissional:', error);
    throw error;
  }

  console.log('Categorias do profissional carregadas:', data?.length, data);
  return data || [];
};

export const saveProfissionalCategorias = async (profissionalId: number, categoriaIds: string[], whatsapp?: string, estado?: string, cidade?: string) => {
  console.log('Salvando categorias do profissional:', {
    profissionalId,
    categoriaIds,
    whatsapp,
    estado,
    cidade
  });
  
  // Primeiro, remover todas as categorias existentes do profissional
  const { error: deleteError } = await supabase
    .from('profissional_categorias')
    .delete()
    .eq('profissional_id', profissionalId);

  if (deleteError) {
    console.error('Erro ao remover categorias existentes:', deleteError);
    throw deleteError;
  }

  // Depois, inserir as novas categorias se fornecidas
  if (categoriaIds.length > 0) {
    // Limpar WhatsApp antes de salvar
    let cleanedWhatsapp = '';
    if (whatsapp) {
      cleanedWhatsapp = cleanWhatsApp(whatsapp);
    }

    const insertData = categoriaIds.map(categoria_id => ({
      profissional_id: profissionalId,
      categoria_id,
      whatsapp: cleanedWhatsapp || null,
      estado: estado || null,
      cidade: cidade || null
    }));

    console.log('Dados para inserir na profissional_categorias:', insertData);

    const { data, error } = await supabase
      .from('profissional_categorias')
      .insert(insertData)
      .select();

    if (error) {
      console.error('Erro ao salvar categorias do profissional:', error);
      throw error;
    }

    console.log('Categorias do profissional salvas com sucesso:', data);
    return data;
  }

  return [];
};

export const createProfissional = async (profissionalData: Profissional, categoriaIds: string[] = []) => {
  console.log('=== CRIAR PROFISSIONAL ===');
  console.log('Dados recebidos:', profissionalData);
  console.log('WhatsApp original:', profissionalData.whatsapp);
  
  // Limpar WhatsApp antes de salvar
  const cleanedWhatsapp = cleanWhatsApp(profissionalData.whatsapp);
  console.log('WhatsApp limpo:', cleanedWhatsapp);
  
  // Garantir que todos os campos estão sendo enviados corretamente
  const cleanData = {
    cpf_cnpj: profissionalData.cpf_cnpj?.trim(),
    nome: profissionalData.nome?.trim(),
    whatsapp: cleanedWhatsapp, // Usar WhatsApp limpo
    email: profissionalData.email?.trim(),
    estado: profissionalData.estado?.trim(),
    cidade: profissionalData.cidade?.trim() || null,
    bairro: profissionalData.bairro?.trim() || null,
    rua: profissionalData.rua?.trim() || null,
    numero: profissionalData.numero?.trim() || null,
    cep: profissionalData.cep?.trim() || null,
    aceita_diaria: profissionalData.aceita_diaria || false,
    valor_diaria: profissionalData.valor_diaria || null,
    crea: profissionalData.crea?.trim() || null,
    creci: profissionalData.creci?.trim() || null,
    nacionalidade: profissionalData.nacionalidade?.trim() || 'Brasileira',
    receber_msm: profissionalData.receber_msm ?? true
  };

  console.log('=== DADOS PROCESSADOS PARA CRIAR ===');
  console.log('cleanData:', cleanData);
  console.log('WhatsApp processado:', cleanData.whatsapp);
  
  const { data, error } = await supabase
    .from('profissionais')
    .insert([cleanData])
    .select()
    .single();

  if (error) {
    console.error('=== ERRO AO CRIAR PROFISSIONAL ===');
    console.error('Erro:', error);
    throw error;
  }

  console.log('=== PROFISSIONAL CRIADO ===');
  console.log('Resultado:', data);
  console.log('WhatsApp salvo:', data.whatsapp);
  
  // Salvar categorias se fornecidas
  if (categoriaIds.length > 0 && data.id) {
    console.log('Salvando categorias para o novo profissional...');
    await saveProfissionalCategorias(
      data.id, 
      categoriaIds, 
      data.whatsapp, // Usar WhatsApp já limpo do resultado
      profissionalData.estado,
      profissionalData.cidade
    );
  }
  
  return data;
};

export const updateProfissional = async (id: number, profissionalData: Partial<Profissional>, categoriaIds?: string[]) => {
  console.log('=== INÍCIO UPDATE PROFISSIONAL ===');
  console.log('ID:', id);
  console.log('Dados completos recebidos:', JSON.stringify(profissionalData, null, 2));
  console.log('Campo cidade específico:', profissionalData.cidade);
  console.log('Tipo da cidade:', typeof profissionalData.cidade);
  console.log('Cidade é undefined?', profissionalData.cidade === undefined);
  console.log('Cidade é null?', profissionalData.cidade === null);
  console.log('Cidade é string vazia?', profissionalData.cidade === '');
  
  // NOVA ABORDAGEM: Criar objeto explícito com validação rigorosa
  const updateData: Record<string, any> = {};
  
  // Processar cada campo individualmente com logs detalhados
  if (profissionalData.cpf_cnpj !== undefined) {
    updateData.cpf_cnpj = profissionalData.cpf_cnpj.trim();
    console.log('CPF processado:', updateData.cpf_cnpj);
  }
  
  if (profissionalData.nome !== undefined) {
    updateData.nome = profissionalData.nome.trim();
    console.log('Nome processado:', updateData.nome);
  }
  
  if (profissionalData.whatsapp !== undefined) {
    // Limpar WhatsApp no update também
    updateData.whatsapp = cleanWhatsApp(profissionalData.whatsapp);
    console.log('WhatsApp processado:', updateData.whatsapp);
  }
  
  if (profissionalData.email !== undefined) {
    updateData.email = profissionalData.email.trim();
    console.log('Email processado:', updateData.email);
  }
  
  if (profissionalData.estado !== undefined) {
    updateData.estado = profissionalData.estado.trim();
    console.log('Estado processado:', updateData.estado);
  }
  
  // TRATAMENTO ESPECIAL PARA CIDADE COM LOGS EXTREMAMENTE DETALHADOS
  if (profissionalData.cidade !== undefined) {
    console.log('=== PROCESSAMENTO ESPECIAL DA CIDADE ===');
    console.log('Valor original da cidade:', profissionalData.cidade);
    console.log('Tipo original:', typeof profissionalData.cidade);
    
    if (profissionalData.cidade === null) {
      updateData.cidade = null;
      console.log('Cidade definida como NULL explicitamente');
    } else if (profissionalData.cidade === '') {
      updateData.cidade = null;
      console.log('Cidade era string vazia, convertida para NULL');
    } else if (typeof profissionalData.cidade === 'string') {
      const cidadeTrimmed = profissionalData.cidade.trim();
      updateData.cidade = cidadeTrimmed || null;
      console.log('Cidade após trim:', cidadeTrimmed);
      console.log('Cidade final (com fallback para null):', updateData.cidade);
    } else {
      updateData.cidade = null;
      console.log('Cidade não era string válida, definida como NULL');
    }
    console.log('RESULTADO FINAL - cidade no updateData:', updateData.cidade);
    console.log('==========================================');
  }
  
  // Continuar com outros campos
  if (profissionalData.bairro !== undefined) {
    updateData.bairro = profissionalData.bairro?.trim() || null;
  }
  if (profissionalData.rua !== undefined) {
    updateData.rua = profissionalData.rua?.trim() || null;
  }
  if (profissionalData.numero !== undefined) {
    updateData.numero = profissionalData.numero?.trim() || null;
  }
  if (profissionalData.cep !== undefined) {
    updateData.cep = profissionalData.cep?.trim() || null;
  }
  if (profissionalData.aceita_diaria !== undefined) {
    updateData.aceita_diaria = profissionalData.aceita_diaria;
  }
  if (profissionalData.valor_diaria !== undefined) {
    updateData.valor_diaria = profissionalData.valor_diaria;
  }
  if (profissionalData.crea !== undefined) {
    updateData.crea = profissionalData.crea?.trim() || null;
  }
  if (profissionalData.creci !== undefined) {
    updateData.creci = profissionalData.creci?.trim() || null;
  }
  if (profissionalData.nacionalidade !== undefined) {
    updateData.nacionalidade = profissionalData.nacionalidade?.trim() || 'Brasileira';
  }
  if (profissionalData.receber_msm !== undefined) {
    updateData.receber_msm = profissionalData.receber_msm;
  }

  console.log('=== DADOS FINAIS PARA UPDATE ===');
  console.log('updateData completo:', JSON.stringify(updateData, null, 2));
  console.log('Cidade nos dados finais:', updateData.cidade);
  console.log('Número de campos a atualizar:', Object.keys(updateData).length);
  console.log('===============================');
  
  // EXECUTAR UPDATE COM LOGS DETALHADOS
  console.log('Executando update no Supabase...');
  const { data, error } = await supabase
    .from('profissionais')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('=== ERRO NO UPDATE ===');
    console.error('Erro completo:', JSON.stringify(error, null, 2));
    console.error('Código:', error.code);
    console.error('Mensagem:', error.message);
    console.error('Detalhes:', error.details);
    console.error('Hint:', error.hint);
    console.error('===================');
    throw error;
  }

  console.log('=== SUCESSO NO UPDATE ===');
  console.log('Dados retornados pelo banco:', JSON.stringify(data, null, 2));
  console.log('Cidade salva no banco:', data.cidade);
  console.log('=========================');
  
  // Atualizar categorias se fornecidas
  if (categoriaIds && data.id) {
    console.log('Atualizando categorias do profissional...');
    await saveProfissionalCategorias(
      data.id, 
      categoriaIds, 
      data.whatsapp,
      data.estado,
      data.cidade // Usar a cidade atualizada
    );
  }
  
  return data;
};

export const getProfissionaisTelefonesByCategoriaECidade = async (categoriaId: string, cidade: string) => {
  console.log('Buscando telefones de profissionais por categoria e cidade:', { categoriaId, cidade });
  
  const { data, error } = await supabase
    .from('profissional_categorias')
    .select('whatsapp')
    .eq('categoria_id', categoriaId)
    .eq('cidade', cidade)
    .not('whatsapp', 'is', null);

  if (error) {
    console.error('Erro ao buscar telefones dos profissionais:', error);
    throw error;
  }

  console.log('Dados brutos retornados:', data);

  // Filtrar números válidos e remover duplicatas
  const telefones = data
    ?.map(item => item.whatsapp)
    .filter(tel => tel && tel.trim() !== '')
    .filter((tel, index, arr) => arr.indexOf(tel) === index) // remover duplicatas
    || [];

  console.log('Telefones filtrados encontrados:', telefones.length, telefones);
  return telefones;
};
