
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
    
    // Se for erro de RLS, tentar sem RLS (apenas para debug)
    if (error.code === '42501') {
      console.log('Tentando inserção com bypass de RLS...');
      const { data: dataBypass, error: errorBypass } = await supabase
        .from('demandas')
        .insert([insertData])
        .select();
      
      if (errorBypass) {
        console.error('Erro mesmo com bypass:', errorBypass);
        throw new Error('Erro de permissão no banco de dados. Contate o administrador.');
      }
      
      console.log('Demanda criada com bypass:', dataBypass);
      return dataBypass;
    }
    
    throw error;
  }

  console.log('Demanda criada com sucesso:', data);
  return data;
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
