
import { useState, useEffect } from 'react';

interface Cidade {
  id: number;
  nome: string;
}

export const useCidades = (estado: string) => {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!estado || estado.length !== 2) {
      setCidades([]);
      setLoading(false);
      setError(null);
      return;
    }

    const loadCidades = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Carregando cidades para UF:', estado);
        
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (Array.isArray(data)) {
          const cidadesFormatadas = data.map((cidade: any) => ({
            id: cidade.id,
            nome: cidade.nome
          }));
          
          console.log('Cidades carregadas:', cidadesFormatadas.length);
          setCidades(cidadesFormatadas);
        } else {
          throw new Error('Dados inválidos recebidos da API');
        }
      } catch (err) {
        console.error('Erro ao carregar cidades:', err);
        setError('Erro ao carregar cidades');
        setCidades([]);
      } finally {
        setLoading(false);
      }
    };

    loadCidades();
  }, [estado]);

  return { cidades, loading, error };
};
