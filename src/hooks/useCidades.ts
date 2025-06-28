
import { useState, useEffect } from 'react';
import { loadCidades } from '@/services/supabaseService';

export const useCidades = (estado: string) => {
  const [cidades, setCidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!estado) {
      setCidades([]);
      return;
    }

    setLoading(true);
    loadCidades(estado)
      .then(cidadesData => {
        console.log('Cidades carregadas para', estado, ':', cidadesData.length);
        setCidades(cidadesData);
      })
      .catch(error => {
        console.error('Erro ao carregar cidades:', error);
        setCidades([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [estado]);

  return { cidades, loading };
};
