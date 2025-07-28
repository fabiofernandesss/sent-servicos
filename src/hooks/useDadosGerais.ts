import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DadoGeral {
  id: number;
  chave: string;
  valor: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const useDadosGerais = () => {
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState<DadoGeral[]>([]);

  const buscarDados = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dados_gerais')
        .select('*')
        .eq('ativo', true)
        .order('chave');

      if (error) throw error;

      setDados(data || []);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar dados gerais:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const buscarPorChave = async (chave: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('dados_gerais')
        .select('valor')
        .eq('chave', chave)
        .eq('ativo', true)
        .single();

      if (error) throw error;

      return data?.valor || null;
    } catch (error) {
      console.error(`Erro ao buscar chave ${chave}:`, error);
      return null;
    }
  };

  const atualizarDado = async (chave: string, valor: string) => {
    try {
      const { error } = await supabase
        .from('dados_gerais')
        .update({ 
          valor, 
          updated_at: new Date().toISOString() 
        })
        .eq('chave', chave);

      if (error) throw error;

      // Atualizar estado local
      setDados(prev => prev.map(item => 
        item.chave === chave 
          ? { ...item, valor, updated_at: new Date().toISOString() }
          : item
      ));

      return true;
    } catch (error) {
      console.error('Erro ao atualizar dado:', error);
      return false;
    }
  };

  const criarDado = async (chave: string, valor: string, descricao?: string) => {
    try {
      const { data, error } = await supabase
        .from('dados_gerais')
        .insert([{ chave, valor, descricao }])
        .select()
        .single();

      if (error) throw error;

      setDados(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Erro ao criar dado:', error);
      return null;
    }
  };

  // Funções específicas para Pagar.me
  const getPagarMeSecretKey = () => buscarPorChave('pagarme_secret_key');
  const getPagarMePublicKey = () => buscarPorChave('pagarme_public_key');
  const getPagarMeAuthorization = () => buscarPorChave('pagarme_authorization');

  useEffect(() => {
    buscarDados();
  }, []);

  return {
    loading,
    dados,
    buscarDados,
    buscarPorChave,
    atualizarDado,
    criarDado,
    getPagarMeSecretKey,
    getPagarMePublicKey,
    getPagarMeAuthorization
  };
};