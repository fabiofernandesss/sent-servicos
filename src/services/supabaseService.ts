
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
  
  const { data, error } = await supabase
    .from('demandas')
    .insert([
      {
        ...demandaData,
        status: 'pendente'
      }
    ])
    .select();

  if (error) {
    console.error('Erro ao criar demanda:', error);
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
