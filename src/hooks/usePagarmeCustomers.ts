import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PagarmeCustomer {
  id: string;
  profissional_id: string | number;
  pagarme_customer_id: string;
  document: string;
  name: string;
  email: string;
  created_at: string;
}

export const usePagarmeCustomers = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const salvarCustomer = async (customerData: {
    profissional_id: string | number;
    pagarme_customer_id: string;
    document: string;
    name: string;
    email: string;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pagarme_customers')
        .upsert([customerData], {
          onConflict: 'document'
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao salvar customer:', error);
      // Não mostrar erro para o usuário, é apenas cache
    } finally {
      setLoading(false);
    }
  };

  const buscarCustomerPorDocument = async (document: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('pagarme_customers')
        .select('pagarme_customer_id')
        .eq('document', document)
        .single();

      if (error) return null;

      return data?.pagarme_customer_id || null;
    } catch (error) {
      console.error('Erro ao buscar customer:', error);
      return null;
    }
  };

  const buscarCustomersPorProfissional = async (profissionalId: string | number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pagarme_customers')
        .select('*')
        .eq('profissional_id', profissionalId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as PagarmeCustomer[];
    } catch (error) {
      console.error('Erro ao buscar customers:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    salvarCustomer,
    buscarCustomerPorDocument,
    buscarCustomersPorProfissional
  };
};