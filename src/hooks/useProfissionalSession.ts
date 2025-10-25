
import { useState, useEffect } from 'react';
import { Profissional, loadProfissionalByWhatsapp } from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'profissional_session';
const TEMP_CATEGORIES_KEY = 'temp_profissional_categories';

export const useProfissionalSession = () => {
  const [profissionalLogado, setProfissionalLogado] = useState<Profissional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar sessão do localStorage ao inicializar
    const savedSession = localStorage.getItem(STORAGE_KEY);
    if (savedSession) {
      try {
        const profissional = JSON.parse(savedSession);
        setProfissionalLogado(profissional);
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []); // Executar apenas uma vez na inicialização

  // Escutar evento de atualização de saldo em um useEffect separado
  useEffect(() => {
    const handleSaldoUpdate = (event: CustomEvent) => {
      setProfissionalLogado(prev => {
        if (prev) {
          return {
            ...prev,
            saldo: event.detail.novoSaldo
          };
        }
        return prev;
      });
    };

    window.addEventListener('saldoUpdated', handleSaldoUpdate as EventListener);

    return () => {
      window.removeEventListener('saldoUpdated', handleSaldoUpdate as EventListener);
    };
  }, []); // Executar apenas uma vez

  const login = (profissional: Profissional) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profissional));
    setProfissionalLogado(profissional);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TEMP_CATEGORIES_KEY);
    setProfissionalLogado(null);
  };

  const updateSession = (profissional: Profissional) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profissional));
    setProfissionalLogado(profissional);
  };

  const updateSaldo = (novoSaldo: number) => {
    if (profissionalLogado) {
      const profissionalAtualizado = {
        ...profissionalLogado,
        saldo: novoSaldo
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profissionalAtualizado));
      setProfissionalLogado(profissionalAtualizado);
    }
  };

  const refreshSaldo = async () => {
    if (profissionalLogado?.id) {
      try {
        const { data, error } = await supabase.rpc('get_profissional_saldo', {
          p_profissional_id: profissionalLogado.id
        });

        if (error) {
          console.error('Erro ao buscar saldo:', error);
          return;
        }

        if (data?.success) {
          const profissionalAtualizado = {
            ...profissionalLogado,
            saldo: data.saldo
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(profissionalAtualizado));
          setProfissionalLogado(profissionalAtualizado);
        }
      } catch (error) {
        console.error('Erro ao atualizar saldo:', error);
      }
    }
  };

  const saveTempCategories = (categories: string[]) => {
    localStorage.setItem(TEMP_CATEGORIES_KEY, JSON.stringify(categories));
  };

  const getTempCategories = (): string[] => {
    const saved = localStorage.getItem(TEMP_CATEGORIES_KEY);
    return saved ? JSON.parse(saved) : [];
  };

  const clearTempCategories = () => {
    localStorage.removeItem(TEMP_CATEGORIES_KEY);
  };

  return {
    profissionalLogado,
    loading,
    login,
    logout,
    updateSession,
    updateSaldo,
    refreshSaldo,
    saveTempCategories,
    getTempCategories,
    clearTempCategories,
    isLoggedIn: !!profissionalLogado
  };
};
