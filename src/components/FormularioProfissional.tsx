
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Profissional, createProfissional, updateProfissional } from '@/services/supabaseService';
import { useProfissionalSession } from '@/hooks/useProfissionalSession';
import { useProfissionalData } from '@/hooks/useProfissionalData';
import CategoriasSelector from './CategoriasSelector';
import DadosPessoaisForm from './DadosPessoaisForm';
import EnderecoForm from './EnderecoForm';
import DadosProfissionaisForm from './DadosProfissionaisForm';

interface FormularioProfissionalProps {
  profissional: Profissional | null;
  whatsapp: string;
  onSuccess: (profissional: Profissional) => void;
}

const FormularioProfissional = ({
  profissional,
  whatsapp,
  onSuccess
}: FormularioProfissionalProps) => {
  const { toast } = useToast();
  const {
    saveTempCategories,
    getTempCategories,
    clearTempCategories,
    isLoggedIn,
    logout
  } = useProfissionalSession();
  
  const [loading, setLoading] = useState(false);
  
  const {
    formData,
    setFormData,
    cidades,
    selectedCategories,
    setSelectedCategories,
    categoriesLoaded
  } = useProfissionalData(profissional, whatsapp);

  const estados = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  const handleInputChange = (field: keyof Profissional, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoriesChange = (categories: string[]) => {
    setSelectedCategories(categories);
    if (!isLoggedIn) {
      saveTempCategories(categories);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.cpf_cnpj || !formData.email) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedCategories.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, selecione pelo menos uma categoria de serviço",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      let result;
      if (profissional?.id) {
        result = await updateProfissional(profissional.id, formData, selectedCategories);
        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso!"
        });
      } else {
        result = await createProfissional(formData, selectedCategories);
        clearTempCategories();
        toast({
          title: "Sucesso",
          description: "Cadastro realizado com sucesso!"
        });
      }
      
      onSuccess(result);
      
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
      toast({
        title: "Erro",
        description: profissional ? "Erro ao atualizar perfil" : "Erro ao realizar cadastro",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
    window.location.href = '/';
  };

  const isEditing = !!profissional?.id;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-[#1E486F]">
          {isEditing ? 'Editar Perfil Profissional' : 'Cadastro Profissional'}
        </CardTitle>
        <p className="text-gray-600">
          {isEditing ? 'Atualize suas informações profissionais' : 'Complete seu cadastro para começar a receber demandas'}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <DadosPessoaisForm 
            formData={formData} 
            onInputChange={handleInputChange} 
          />

          <EnderecoForm 
            formData={formData} 
            onInputChange={handleInputChange} 
            cidades={cidades}
            estados={estados}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1E486F]">Categorias de Serviço *</h3>
            {categoriesLoaded && (
              <CategoriasSelector 
                selectedCategories={selectedCategories} 
                onCategoriesChange={handleCategoriesChange}
                estado={formData.estado}
                cidade={formData.cidade}
              />
            )}
          </div>

          <DadosProfissionaisForm 
            formData={formData} 
            onInputChange={handleInputChange} 
          />

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#1E486F] hover:bg-[#1E486F]/90 py-0 rounded-3xl font-semibold"
            >
              {loading ? 'Salvando...' : isEditing ? 'Atualizar Perfil' : 'Criar Cadastro'}
            </Button>
            
            {isLoggedIn && (
              <Button
                type="button"
                variant="outline"
                onClick={handleLogout}
                className="py-0 rounded-3xl font-semibold flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormularioProfissional;
