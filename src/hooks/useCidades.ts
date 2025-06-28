
import { useState, useEffect } from 'react';

interface Cidade {
  id: number;
  nome: string;
}

// Lista de cidades principais por estado como fallback
const cidadesFallback: Record<string, Cidade[]> = {
  'SP': [
    { id: 3550308, nome: 'São Paulo' },
    { id: 3509502, nome: 'Campinas' },
    { id: 3518800, nome: 'Guarulhos' },
    { id: 3547809, nome: 'Santo André' },
    { id: 3548708, nome: 'São Bernardo do Campo' },
    { id: 3552205, nome: 'Sorocaba' },
    { id: 3543402, nome: 'Ribeirão Preto' },
    { id: 3525904, nome: 'Jundiaí' },
    { id: 3548807, nome: 'São José dos Campos' }
  ],
  'RJ': [
    { id: 3304557, nome: 'Rio de Janeiro' },
    { id: 3303500, nome: 'Niterói' },
    { id: 3301702, nome: 'Campos dos Goytacazes' },
    { id: 3304904, nome: 'São Gonçalo' },
    { id: 3301009, nome: 'Belford Roxo' },
    { id: 3303302, nome: 'Nova Iguaçu' },
    { id: 3302403, nome: 'Macaé' },
    { id: 3304144, nome: 'Petrópolis' }
  ],
  'MG': [
    { id: 3106200, nome: 'Belo Horizonte' },
    { id: 3170206, nome: 'Uberlândia' },
    { id: 3118601, nome: 'Contagem' },
    { id: 3127701, nome: 'Juiz de Fora' },
    { id: 3106705, nome: 'Betim' },
    { id: 3136702, nome: 'Montes Claros' },
    { id: 3145604, nome: 'Ribeirão das Neves' },
    { id: 3169901, nome: 'Uberaba' }
  ],
  'PR': [
    { id: 4106902, nome: 'Curitiba' },
    { id: 4127306, nome: 'Londrina' },
    { id: 4125506, nome: 'Maringá' },
    { id: 4118204, nome: 'Ponta Grossa' },
    { id: 4108304, nome: 'Foz do Iguaçu' },
    { id: 4105805, nome: 'Cascavel' },
    { id: 4119905, nome: 'São José dos Pinhais' },
    { id: 4106803, nome: 'Colombo' }
  ],
  'RS': [
    { id: 4314902, nome: 'Porto Alegre' },
    { id: 4305108, nome: 'Caxias do Sul' },
    { id: 4314407, nome: 'Pelotas' },
    { id: 4304606, nome: 'Canoas' },
    { id: 4318705, nome: 'Santa Maria' },
    { id: 4309209, nome: 'Gravataí' },
    { id: 4322400, nome: 'Viamão' },
    { id: 4313409, nome: 'Novo Hamburgo' }
  ]
};

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
        console.log('Tentando carregar cidades para UF:', estado);
        
        // Primeira tentativa: API do IBGE
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos timeout
        
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0 (compatible; SentServicos/1.0)'
            },
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API IBGE falhou: ${response.status}`);
        }

        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const cidadesFormatadas = data.map((cidade: any) => ({
            id: cidade.id,
            nome: cidade.nome
          })).sort((a, b) => a.nome.localeCompare(b.nome));
          
          console.log(`Cidades carregadas via API: ${cidadesFormatadas.length}`);
          setCidades(cidadesFormatadas);
          return;
        }
        
        throw new Error('Dados vazios da API');
      } catch (err) {
        console.log('API IBGE falhou, usando fallback:', err);
        
        // Fallback: usar lista pré-definida
        const cidadesFallbackEstado = cidadesFallback[estado];
        
        if (cidadesFallbackEstado && cidadesFallbackEstado.length > 0) {
          console.log(`Usando fallback para ${estado}: ${cidadesFallbackEstado.length} cidades`);
          setCidades(cidadesFallbackEstado);
        } else {
          // Fallback final: criar algumas cidades genéricas baseadas no estado
          const cidadesGenericas = [
            { id: Date.now(), nome: `Capital do ${estado}` },
            { id: Date.now() + 1, nome: `Região Metropolitana ${estado}` },
            { id: Date.now() + 2, nome: `Interior ${estado}` }
          ];
          
          console.log(`Usando cidades genéricas para ${estado}`);
          setCidades(cidadesGenericas);
        }
      } finally {
        setLoading(false);
      }
    };

    // Delay para evitar muitas requisições simultâneas
    const timer = setTimeout(loadCidades, 300);
    return () => clearTimeout(timer);
  }, [estado]);

  return { cidades, loading, error };
};
