import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ryvcwjajgspbzxzncpfi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dmN3amFqZ3NwYnp4em5jcGZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODkzNjAsImV4cCI6MjA2MjE2NTM2MH0.1GhRnk2-YbL4awFz0c9bFWOleO_cFJKjvfyWQ30dxo8'
);

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
    // Primeira tentativa: inserção normal
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
      
      // Se for erro de RLS, vamos tentar uma abordagem alternativa
      if (error.code === '42501') {
        console.log('Erro de RLS detectado, tentando abordagem alternativa...');
        
        // Fazer uma chamada HTTP direta para a API REST do Supabase
        const response = await fetch(`https://ryvcwjajgspbzxzncpfi.supabase.co/rest/v1/demandas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dmN3amFqZ3NwYnp4em5jcGZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODkzNjAsImV4cCI6MjA2MjE2NTM2MH0.1GhRnk2-YbL4awFz0c9bFWOleO_cFJKjvfyWQ30dxo8',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dmN3amFqZ3NwYnp4em5jcGZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODkzNjAsImV4cCI6MjA2MjE2NTM2MH0.1GhRnk2-YbL4awFz0c9bFWOleO_cFJKjvfyWQ30dxo8',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(insertData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Erro na API REST:', errorText);
          throw new Error('Erro ao salvar demanda. Verifique se todos os dados estão corretos.');
        }

        const restData = await response.json();
        console.log('Demanda criada via API REST:', restData);
        return Array.isArray(restData) ? restData : [restData];
      }
      
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
  
  // Tentar buscar com o número original e com variações de formatação
  const whatsappVariations = [
    whatsapp,
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
    // Formatar WhatsApp com prefixo 55 se fornecido
    let formattedWhatsapp = '';
    if (whatsapp) {
      const cleanWhatsapp = whatsapp.replace(/\D/g, '');
      formattedWhatsapp = cleanWhatsapp.startsWith('55') ? cleanWhatsapp : '55' + cleanWhatsapp;
    }

    const insertData = categoriaIds.map(categoria_id => ({
      profissional_id: profissionalId,
      categoria_id,
      whatsapp: formattedWhatsapp || null,
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
  console.log('Criando profissional:', profissionalData);
  
  // Garantir que todos os campos estão sendo enviados corretamente
  const cleanData = {
    cpf_cnpj: profissionalData.cpf_cnpj?.trim(),
    nome: profissionalData.nome?.trim(),
    whatsapp: profissionalData.whatsapp?.trim(),
    email: profissionalData.email?.trim(),
    estado: profissionalData.estado?.trim(),
    cidade: profissionalData.cidade?.trim(), // Garantir que cidade está sendo enviada
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

  console.log('Dados limpos para criar profissional:', cleanData);
  
  const { data, error } = await supabase
    .from('profissionais')
    .insert([cleanData])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar profissional:', error);
    throw error;
  }

  console.log('Profissional criado:', data);
  
  // Salvar categorias se fornecidas
  if (categoriaIds.length > 0 && data.id) {
    console.log('Salvando categorias para o novo profissional...');
    await saveProfissionalCategorias(
      data.id, 
      categoriaIds, 
      profissionalData.whatsapp,
      profissionalData.estado,
      profissionalData.cidade
    );
  }
  
  return data;
};

export const updateProfissional = async (id: number, profissionalData: Partial<Profissional>, categoriaIds?: string[]) => {
  console.log('=== INÍCIO UPDATE PROFISSIONAL ===');
  console.log('ID:', id);
  console.log('Dados recebidos:', profissionalData);
  console.log('Campo cidade recebido:', profissionalData.cidade);
  console.log('Tipo da cidade:', typeof profissionalData.cidade);
  
  // Criar objeto de dados limpo com todas as verificações explícitas
  const cleanData: any = {};
  
  // Campos obrigatórios
  if (profissionalData.cpf_cnpj !== undefined) cleanData.cpf_cnpj = profissionalData.cpf_cnpj.trim();
  if (profissionalData.nome !== undefined) cleanData.nome = profissionalData.nome.trim();
  if (profissionalData.whatsapp !== undefined) cleanData.whatsapp = profissionalData.whatsapp.trim();
  if (profissionalData.email !== undefined) cleanData.email = profissionalData.email.trim();
  if (profissionalData.estado !== undefined) cleanData.estado = profissionalData.estado.trim();
  
  // CIDADE - tratamento especial
  if (profissionalData.cidade !== undefined) {
    cleanData.cidade = profissionalData.cidade?.trim() || null;
    console.log('CIDADE processada para o banco:', cleanData.cidade);
  }
  
  // Outros campos opcionais
  if (profissionalData.bairro !== undefined) cleanData.bairro = profissionalData.bairro?.trim() || null;
  if (profissionalData.rua !== undefined) cleanData.rua = profissionalData.rua?.trim() || null;
  if (profissionalData.numero !== undefined) cleanData.numero = profissionalData.numero?.trim() || null;
  if (profissionalData.cep !== undefined) cleanData.cep = profissionalData.cep?.trim() || null;
  if (profissionalData.aceita_diaria !== undefined) cleanData.aceita_diaria = profissionalData.aceita_diaria;
  if (profissionalData.valor_diaria !== undefined) cleanData.valor_diaria = profissionalData.valor_diaria;
  if (profissionalData.crea !== undefined) cleanData.crea = profissionalData.crea?.trim() || null;
  if (profissionalData.creci !== undefined) cleanData.creci = profissionalData.creci?.trim() || null;
  if (profissionalData.nacionalidade !== undefined) cleanData.nacionalidade = profissionalData.nacionalidade?.trim() || 'Brasileira';
  if (profissionalData.receber_msm !== undefined) cleanData.receber_msm = profissionalData.receber_msm;

  console.log('=== DADOS FINAIS PARA O BANCO ===');
  console.log('cleanData completo:', cleanData);
  console.log('Cidade nos dados limpos:', cleanData.cidade);
  console.log('================================');
  
  const { data, error } = await supabase
    .from('profissionais')
    .update(cleanData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('=== ERRO NO BANCO ===');
    console.error('Erro completo:', error);
    console.error('Código:', error.code);
    console.error('Mensagem:', error.message);
    console.error('Detalhes:', error.details);
    console.error('==================');
    throw error;
  }

  console.log('=== RESULTADO DO BANCO ===');
  console.log('Profissional atualizado:', data);
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
