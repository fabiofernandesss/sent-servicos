import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfissionalSession } from '@/hooks/useProfissionalSession';

export interface Pagamento {
  id: string;
  pagarme_order_id: string | null;
  amount: number; // em centavos
  status: string; // 'pending' | 'paid' | 'canceled' | etc
  payment_method: 'pix' | 'credit_card';
  created_at: string;
  metadata?: any;
}

export const usePagamentos = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { updateSaldo } = useProfissionalSession();

  const buscarPagamentos = async (profissionalId: string | number) => {
    setLoading(true);
    try {
      const pid = String(profissionalId);
      const { data, error } = await supabase
        .from('pagamentos')
        .select('id, pagarme_order_id, amount, status, payment_method, created_at, metadata')
        .filter('metadata->>profissional_id', 'eq', pid)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []) as Pagamento[];
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar histórico de pagamentos',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatusPorOrderId = async (orderId: string) => {
    try {
      const { data, error } = await supabase.rpc('update_payment_status_from_pagarme', {
        p_order_id: orderId
      });
      if (error) throw error;

      if (data?.success && data?.pagarme_status === 'paid') {
        const { data: processData, error: processError } = await supabase.rpc('processar_pagamento_completo', {
          p_order_id: orderId
        });
        if (processError) throw processError;
        if (processData?.success && typeof processData?.novo_saldo === 'number') {
          updateSaldo(processData.novo_saldo);
        }
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar status via PagarMe:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status no momento',
        variant: 'destructive'
      });
      return null;
    }
  };

  const processarPendentes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('processar_pagamentos_pendentes');
      if (error) throw error;
      if (data?.success) {
        toast({ title: 'Processamento concluído', description: 'Pagamentos pendentes verificados.' });
      }
      return data;
    } catch (error) {
      console.error('Erro ao processar pendentes:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao processar pagamentos pendentes',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    buscarPagamentos,
    atualizarStatusPorOrderId,
    processarPendentes,
  };
};