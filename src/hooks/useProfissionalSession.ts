
import { useState, useEffect } from 'react';
import { Profissional } from '@/services/supabaseService';

const STORAGE_KEY = 'profissional_session';

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
    setProfissionalLogado(null);
  };

  const updateSession = (profissional: Profissional) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profissional));
    setProfissionalLogado(profissional);
  };

  return {
    profissionalLogado,
    loading,
    login,
    logout,
    updateSession,
    isLoggedIn: !!profissionalLogado
  };
};
