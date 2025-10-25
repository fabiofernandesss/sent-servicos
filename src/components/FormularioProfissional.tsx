import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Profissional, createProfissional, updateProfissional, loadProfissionalCategorias } from '@/services/supabaseService';
import { useProfissionalSession } from '@/hooks/useProfissionalSession';
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [formData, setFormData] = useState<Profissional>({
    cpf_cnpj: '',
    nome: '',
    whatsapp: whatsapp,
    email: '',
    estado: '',
    cidade: '',
    bairro: '',
    rua: '',
    numero: '',
    cep: '',
    aceita_diaria: false,
    valor_diaria: 0,
    crea: '',
    creci: '',
    nacionalidade: 'Brasileira',
    receber_msm: true
  });

  const estados = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  // Carregar dados do profissional existente
  useEffect(() => {
    if (profissional && !formData.nome) { // Só carregar se não tiver dados já
      console.log('Carregando profissional existente:', profissional.nome);
      setFormData({
        cpf_cnpj: profissional.cpf_cnpj || '',
        nome: profissional.nome || '',
        whatsapp: profissional.whatsapp || whatsapp,
        email: profissional.email || '',
        estado: profissional.estado || '',
        cidade: profissional.cidade || '',
        bairro: profissional.bairro || '',
        rua: profissional.rua || '',
        numero: profissional.numero || '',
        cep: profissional.cep || '',
        aceita_diaria: profissional.aceita_diaria || false,
        valor_diaria: profissional.valor_diaria || 0,
        crea: profissional.crea || '',
        creci: profissional.creci || '',
        nacionalidade: profissional.nacionalidade || 'Brasileira',
        receber_msm: profissional.receber_msm ?? true
      });
    }
  }, [profissional?.id]); // Só depender do ID do profissional

  // Carregar categorias
  useEffect(() => {
    if (!categoriesLoaded && profissional?.id) {
      console.log('Carregando categorias para profissional:', profissional.id);
      loadProfissionalCategorias(profissional.id).then(categorias => {
        const categoryIds = categorias.map(cat => cat.categoria_id);
        setSelectedCategories(categoryIds);
        setCategoriesLoaded(true);
      }).catch(error => {
        console.error('Erro ao carregar categorias:', error);
        setCategoriesLoaded(true);
      });
    } else if (!categoriesLoaded && !profissional?.id) {
      const tempCategories = getTempCategories();
      setSelectedCategories(tempCategories);
      setCategoriesLoaded(true);
    }
  }, [profissional?.id, categoriesLoaded]); // Remover getTempCategories da dependência

  const handleInputChange = (field: keyof Profissional, value: any) => {
    console.log('Alterando campo:', field, 'para:', value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoriesChange = (categories: string[]) => {
    console.log('Categorias alteradas:', categories);
    setSelectedCategories(categories);
    if (!isLoggedIn) {
      saveTempCategories(categories);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Iniciando submit com dados:', formData);
    
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
        console.log('Atualizando profissional:', profissional.id);
        result = await updateProfissional(profissional.id, formData, selectedCategories);
        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso!"
        });
      } else {
        console.log('Criando novo profissional');
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
        <CardTitle className="text-xl sm:text-2xl text-[#1E486F]">
          {profissional?.id ? 'Editar Perfil' : 'Cadastro Profissional'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-4 sm:p-6">
        <DadosPessoaisForm 
          formData={formData} 
          onInputChange={handleInputChange} 
        />
        
        <EnderecoForm 
          formData={formData} 
          onInputChange={handleInputChange} 
          estados={estados}
        />
        
        <CategoriasSelector 
          selectedCategories={selectedCategories}
          onCategoriesChange={handleCategoriesChange}
          estado={formData.estado}
          cidade={formData.cidade}
        />
        
        <DadosProfissionaisForm 
          formData={formData} 
          onInputChange={handleInputChange} 
        />
        
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-6">
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto flex-1 bg-[#1E486F] hover:bg-[#2a5a8a] text-white h-12 text-base font-medium"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button 
            onClick={logout}
            variant="outline"
            className="w-full sm:w-auto flex-1 border-[#1E486F] text-[#1E486F] hover:bg-[#1E486F] hover:text-white h-12 text-base font-medium"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormularioProfissional;
