import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Profissional, createProfissional, updateProfissional, loadCidades, loadProfissionalCategorias } from '@/services/supabaseService';
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
  const [cidades, setCidades] = useState<any[]>([]);
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

  // Atualizar formData quando profissional mudar
  useEffect(() => {
    if (profissional) {
      console.log('=== CARREGANDO DADOS DO PROFISSIONAL ===');
      console.log('Profissional recebido:', profissional);
      console.log('Cidade do profissional no banco:', profissional.cidade);
      
      const newFormData = {
        cpf_cnpj: profissional.cpf_cnpj || '',
        nome: profissional.nome || '',
        whatsapp: profissional.whatsapp || whatsapp,
        email: profissional.email || '',
        estado: profissional.estado || '',
        cidade: profissional.cidade || '', // Preservar cidade original
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
      };
      
      console.log('FormData sendo definido com cidade:', newFormData.cidade);
      setFormData(newFormData);

      // Carregar cidades do estado se existir
      if (profissional.estado) {
        console.log('Carregando cidades para o estado:', profissional.estado);
        loadCidades(profissional.estado)
          .then(cidadesData => {
            console.log('Cidades carregadas:', cidadesData.length);
            setCidades(cidadesData);
            console.log('Cidade preservada após carregar cidades:', profissional.cidade);
          })
          .catch(error => {
            console.error('Erro ao carregar cidades:', error);
          });
      }
    }
  }, [profissional, whatsapp]);

  // Effect separado para carregar cidades quando estado muda (mas preservando cidade existente)
  useEffect(() => {
    if (formData.estado && !profissional) {
      // Só carregar cidades automaticamente se for um novo cadastro
      console.log('Carregando cidades para novo cadastro, estado:', formData.estado);
      loadCidades(formData.estado)
        .then(cidadesData => {
          console.log('Cidades carregadas para novo cadastro:', cidadesData.length);
          setCidades(cidadesData);
        })
        .catch(error => {
          console.error('Erro ao carregar cidades para novo cadastro:', error);
          setCidades([]);
        });
    } else if (formData.estado && profissional && formData.estado !== profissional.estado) {
      // Se mudou o estado de um profissional existente, carregar cidades mas limpar cidade
      console.log('Estado alterado, carregando novas cidades e limpando cidade');
      loadCidades(formData.estado)
        .then(cidadesData => {
          console.log('Cidades carregadas após mudança de estado:', cidadesData.length);
          setCidades(cidadesData);
          // Limpar cidade apenas se mudou o estado
          setFormData(prev => ({ ...prev, cidade: '' }));
        })
        .catch(error => {
          console.error('Erro ao carregar cidades:', error);
          setCidades([]);
        });
    } else if (!formData.estado) {
      setCidades([]);
      setFormData(prev => ({ ...prev, cidade: '' }));
    }
  }, [formData.estado, profissional]);

  useEffect(() => {
    // Carregar categorias apenas uma vez
    if (!categoriesLoaded) {
      if (profissional?.id) {
        console.log('Carregando categorias para profissional existente:', profissional.id);
        // Se está editando um profissional existente, carregar categorias do banco
        loadProfissionalCategorias(profissional.id).then(categorias => {
          console.log('Categorias carregadas do banco:', categorias);
          const categoryIds = categorias.map(cat => cat.categoria_id);
          setSelectedCategories(categoryIds);
          setCategoriesLoaded(true);
        }).catch(error => {
          console.error('Erro ao carregar categorias:', error);
          setCategoriesLoaded(true);
        });
      } else {
        console.log('Carregando categorias temporárias para novo cadastro');
        // Se não está logado, carregar categorias temporárias
        const tempCategories = getTempCategories();
        setSelectedCategories(tempCategories);
        setCategoriesLoaded(true);
      }
    }
  }, [profissional, getTempCategories, categoriesLoaded]);

  const handleInputChange = (field: keyof Profissional, value: any) => {
    console.log('=== ALTERANDO CAMPO ===');
    console.log('Campo:', field, 'Valor:', value);
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      console.log('FormData após alteração:', newData);
      return newData;
    });
  };

  const handleCategoriesChange = (categories: string[]) => {
    console.log('Categorias selecionadas alteradas:', categories);
    setSelectedCategories(categories);
    // Se não está logado, salvar temporariamente
    if (!isLoggedIn) {
      saveTempCategories(categories);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== INICIANDO SUBMIT ===');
    console.log('FormData antes da validação:', formData);
    console.log('Cidade antes da validação:', formData.cidade);
    
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
    
    console.log('=== DADOS ANTES DE ENVIAR PARA SUPABASE ===');
    console.log('FormData completo:', formData);
    console.log('Campo cidade especificamente:', formData.cidade);
    console.log('Tipo da cidade:', typeof formData.cidade);
    console.log('===============================================');
    
    setLoading(true);
    try {
      let result;
      if (profissional?.id) {
        // Atualizar profissional existente
        console.log('Atualizando profissional ID:', profissional.id);
        result = await updateProfissional(profissional.id, formData, selectedCategories);
        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso!"
        });
      } else {
        // Criar novo profissional
        console.log('Criando novo profissional');
        result = await createProfissional(formData, selectedCategories);
        // Limpar categorias temporárias após o cadastro
        clearTempCategories();
        toast({
          title: "Sucesso",
          description: "Cadastro realizado com sucesso!"
        });
      }
      
      console.log('=== RESULTADO DO SAVE ===');
      console.log('Profissional salvo:', result);
      console.log('Cidade salva:', result.cidade);
      console.log('=========================');
      
      // Só chamar onSuccess DEPOIS que a operação foi bem-sucedida
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
    // Redirecionar para a página inicial
    window.location.href = '/';
  };

  const isEditing = !!profissional?.id;

  console.log('=== RENDERIZANDO FORMULÁRIO ===');
  console.log('FormData atual:', formData);
  console.log('Cidade no formData:', formData.cidade);
  console.log('Cidades disponíveis:', cidades.length);
  console.log('===================================');

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

          {/* Categorias de Serviço */}
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
