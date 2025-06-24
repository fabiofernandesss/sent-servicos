
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  loadCategorias, 
  loadSubcategorias, 
  loadCidades,
  type Categoria,
  type Subcategoria
} from '@/services/supabaseService';

interface Cidade {
  id: number;
  nome: string;
}

export const useClienteDemandaData = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Iniciando carregamento de dados...');
      
      const [categoriasData, subcategoriasData] = await Promise.all([
        loadCategorias(),
        loadSubcategorias()
      ]);

      setCategorias(categoriasData);
      setSubcategorias(subcategoriasData);
      
      console.log('Dados carregados com sucesso');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = async (uf: string) => {
    setLoadingCidades(true);
    try {
      console.log('Carregando cidades para:', uf);
      const cidadesData = await loadCidades(uf);
      setCidades(cidadesData);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar cidades. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingCidades(false);
    }
  };

  return {
    categorias,
    subcategorias,
    cidades,
    loading,
    loadingCidades,
    handleEstadoChange
  };
};
