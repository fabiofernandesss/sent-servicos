
import { useState, useEffect } from 'react';
import { Profissional } from '@/services/supabaseService';

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
  }, []);

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
    saveTempCategories,
    getTempCategories,
    clearTempCategories,
    isLoggedIn: !!profissionalLogado
  };
};
