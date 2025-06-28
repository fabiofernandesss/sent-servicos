
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, AlertCircle } from 'lucide-react';
import { loadCategorias, Categoria } from '@/services/supabaseService';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { useToast } from '@/hooks/use-toast';

interface CategoriasSelectorProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  estado?: string;
  cidade?: string;
}

const CategoriasSelector = ({ selectedCategories, onCategoriesChange, estado, cidade }: CategoriasSelectorProps) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        const data = await loadCategorias();
        setCategorias(data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar categorias",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    carregarCategorias();
  }, []);

  const addCategory = (categoryId: string) => {
    if (!estado || !cidade) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha Estado e Cidade antes de selecionar categorias",
        variant: "destructive"
      });
      return;
    }

    if (!selectedCategories.includes(categoryId)) {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  const removeCategory = (categoryId: string) => {
    onCategoriesChange(selectedCategories.filter(id => id !== categoryId));
  };

  const getSelectedCategoriaNames = () => {
    return categorias.filter(cat => selectedCategories.includes(cat.id));
  };

  const canSelectCategories = estado && cidade;

  if (loading) {
    return <div>Carregando categorias...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Aviso se estado e cidade não estão preenchidos */}
      {!canSelectCategories && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">Preencha Estado e Cidade acima para selecionar categorias</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dropdown de categorias disponíveis */}
      <Card className={!canSelectCategories ? 'opacity-50' : ''}>
        <CardHeader>
          <CardTitle className="text-lg text-[#1E486F]">Selecionar Categorias</CardTitle>
          <p className="text-sm text-gray-600">Clique nas categorias que você atende</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categorias.map((categoria) => {
              const { icon: IconComponent, color, borderColor } = getCategoryIcon(categoria.nome);
              const isSelected = selectedCategories.includes(categoria.id);
              
              return (
                <Button
                  key={categoria.id}
                  variant={isSelected ? "default" : "outline"}
                  disabled={!canSelectCategories}
                  onClick={() => isSelected ? removeCategory(categoria.id) : addCategory(categoria.id)}
                  className={`h-auto p-3 flex flex-col items-center space-y-2 ${
                    isSelected 
                      ? 'bg-[#1E486F] hover:bg-[#1E486F]/90 text-white' 
                      : `hover:border-2 ${borderColor} hover:bg-gray-50`
                  } ${!canSelectCategories ? 'cursor-not-allowed' : ''}`}
                >
                  <IconComponent className={`h-6 w-6 ${isSelected ? 'text-white' : color}`} />
                  <span className="text-xs text-center leading-tight">{categoria.nome}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de categorias selecionadas */}
      {selectedCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-[#1E486F]">Categorias Selecionadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {getSelectedCategoriaNames().map((categoria) => {
                const { icon: IconComponent, color } = getCategoryIcon(categoria.nome);
                
                return (
                  <Badge key={categoria.id} variant="secondary" className="flex items-center gap-2 p-2">
                    <IconComponent className={`h-4 w-4 ${color}`} />
                    <span>{categoria.nome}</span>
                    <button
                      onClick={() => removeCategory(categoria.id)}
                      className="ml-1 text-gray-500 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CategoriasSelector;
