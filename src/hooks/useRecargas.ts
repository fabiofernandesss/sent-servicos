import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Recarga {
  id: string | number;
  profissional_id: string | number;
  valor: number;
  bonus: number;
  valor_total: number;
  order_id: string;
  status: 'pendente' | 'aprovado' | 'cancelado';
  metodo_pagamento: 'pix' | 'credit_card';
  created_at: string;
}

export const useRecargas = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const criarRecarga = async (recargaData: {
    profissional_id: string | number;
    valor: number;
    bonus: number;
    valor_total: number;
    order_id: string;
    metodo_pagamento: 'pix' | 'credit_card';
  }) => {
    setLoading(true);
    try {
      // Por enquanto, apenas simular a criação da recarga
      // Quando a tabela recargas estiver disponível, usar:
      // const { data, error } = await supabase
      //   .from('recargas')
      //   .insert([{
      //     ...recargaData,
      //     status: 'pendente'
      //   }])
      //   .select()
      //   .single();

      console.log('📝 Recarga criada (simulado):', recargaData);
      
      // Simular retorno
      const data = {
        id: Date.now(),
        ...recargaData,
        status: 'pendente',
        created_at: new Date().toISOString()
      };

      return data;
    } catch (error) {
      console.error('Erro ao criar recarga:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar recarga",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatusRecarga = async (orderId: string, status: 'aprovado' | 'cancelado') => {
    try {
      console.log(`🔄 Atualizando status da recarga ${orderId} para: ${status}`);

      // Por enquanto, apenas simular a atualização
      // Quando a tabela recargas estiver disponível, usar:
      // const { error } = await supabase
      //   .from('recargas')
      //   .update({ status })
      //   .eq('order_id', orderId);

      // APENAS creditar saldo se o status for 'aprovado'
      if (status === 'aprovado') {
        console.log('✅ Recarga aprovada - saldo será creditado quando a tabela estiver disponível');
        // TODO: Implementar quando a tabela recargas estiver disponível
        // const { data: recarga } = await supabase
        //   .from('recargas')
        //   .select('profissional_id, valor_total')
        //   .eq('order_id', orderId)
        //   .single();

        // if (recarga) {
        //   await atualizarSaldoProfissional(recarga.profissional_id, recarga.valor_total);
        // }
      }
    } catch (error) {
      console.error('Erro ao atualizar status da recarga:', error);
      throw error;
    }
  };

  const atualizarSaldoProfissional = async (profissionalId: string | number, valor: number) => {
    try {
      console.log(`💰 Atualizando saldo do profissional ${profissionalId}: +R$ ${valor.toFixed(2)}`);

      // Por enquanto, apenas simular a atualização
      // Quando a tabela profissionais estiver disponível, usar:
      // const { data: profissional } = await supabase
      //   .from('profissionais')
      //   .select('saldo')
      //   .eq('id', profissionalId)
      //   .single();

      // if (profissional) {
      //   const novoSaldo = (profissional.saldo || 0) + valor;
      //   
      //   const { error } = await supabase
      //     .from('profissionais')
      //     .update({ saldo: novoSaldo })
      //     .eq('id', profissionalId);

      //   if (error) throw error;
      //   console.log(`✅ Saldo atualizado: R$ ${novoSaldo.toFixed(2)} para profissional ${profissionalId}`);
      // }
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
      throw error;
    }
  };

  const buscarRecargas = async (profissionalId: string | number) => {
    setLoading(true);
    try {
      console.log('🔍 Buscando recargas do profissional:', profissionalId);

      // Por enquanto, retornar array vazio
      // Quando a tabela recargas estiver disponível, usar:
      // const { data, error } = await supabase
      //   .from('recargas')
      //   .select('*')
      //   .eq('profissional_id', profissionalId)
      //   .order('created_at', { ascending: false });

      // if (error) throw error;
      // return data as Recarga[];

      return [] as Recarga[];
    } catch (error) {
      console.error('Erro ao buscar recargas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico de recargas",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar se uma recarga já foi aprovada
  const verificarRecargaAprovada = async (orderId: string): Promise<boolean> => {
    try {
      console.log('🔍 Verificando se recarga já foi aprovada:', orderId);

      // Por enquanto, sempre retornar false
      // Quando a tabela recargas estiver disponível, usar:
      // const { data, error } = await supabase
      //   .from('recargas')
      //   .select('status')
      //   .eq('order_id', orderId)
      //   .single();

      // if (error) throw error;
      // return data?.status === 'aprovado';

      return false;
    } catch (error) {
      console.error('Erro ao verificar recarga:', error);
      return false;
    }
  };

  return {
    loading,
    criarRecarga,
    atualizarStatusRecarga,
    buscarRecargas,
    verificarRecargaAprovada
  };
};