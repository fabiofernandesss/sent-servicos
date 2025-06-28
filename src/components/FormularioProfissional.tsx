import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Profissional, createProfissional, updateProfissional, loadCidades, loadProfissionalCategorias } from '@/services/supabaseService';
import { useProfissionalSession } from '@/hooks/useProfissionalSession';
import CategoriasSelector from './CategoriasSelector';

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
  const {
    toast
  } = useToast();
  const {
    saveTempCategories,
    getTempCategories,
    clearTempCategories,
    isLoggedIn
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

  // Atualizar formData quando profissional mudar
  useEffect(() => {
    if (profissional) {
      console.log('Atualizando formData com dados do profissional:', profissional);
      setFormData({
        cpf_cnpj: profissional.cpf_cnpj || '',
        nome: profissional.nome || '',
        whatsapp: profissional.whatsapp || whatsapp,
        email: profissional.email || '',
        estado: profissional.estado || '',
        cidade: profissional.cidade || '', // Corrigindo para pegar a cidade do profissional
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
  }, [profissional, whatsapp]);
  const estados = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
  useEffect(() => {
    if (formData.estado) {
      console.log('Carregando cidades para o estado:', formData.estado);
      loadCidades(formData.estado).then(setCidades).catch(console.error);
    }
  }, [formData.estado]);
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
    console.log('Alterando campo:', field, 'para:', value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
        // Atualizar profissional existente
        result = await updateProfissional(profissional.id, formData, selectedCategories);
        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso!"
        });
      } else {
        // Criar novo profissional
        result = await createProfissional(formData, selectedCategories);
        // Limpar categorias temporárias após o cadastro
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
  const isEditing = !!profissional?.id;
  console.log('Renderizando formulário com dados:', {
    profissional,
    formData,
    selectedCategories,
    categoriesLoaded,
    isEditing
  });
  return <Card className="w-full max-w-4xl mx-auto">
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
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1E486F]">Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cpf_cnpj">CPF/CNPJ *</Label>
                <Input
                  id="cpf_cnpj"
                  value={formData.cpf_cnpj}
                  onChange={(e) => handleInputChange('cpf_cnpj', e.target.value)}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="nacionalidade">Nacionalidade</Label>
                <Input
                  id="nacionalidade"
                  value={formData.nacionalidade}
                  onChange={(e) => handleInputChange('nacionalidade', e.target.value)}
                  placeholder="Brasileira"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1E486F]">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estado">Estado *</Label>
                <Select value={formData.estado || ''} onValueChange={(value) => handleInputChange('estado', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cidade">Cidade *</Label>
                <Select value={formData.cidade || ''} onValueChange={(value) => handleInputChange('cidade', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {cidades.map((cidade) => (
                      <SelectItem key={cidade.id} value={cidade.nome}>{cidade.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.bairro || ''}
                  onChange={(e) => handleInputChange('bairro', e.target.value)}
                  placeholder="Seu bairro"
                />
              </div>
              <div>
                <Label htmlFor="rua">Rua</Label>
                <Input
                  id="rua"
                  value={formData.rua || ''}
                  onChange={(e) => handleInputChange('rua', e.target.value)}
                  placeholder="Nome da rua"
                />
              </div>
              <div>
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.numero || ''}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                  placeholder="Número"
                />
              </div>
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep || ''}
                  onChange={(e) => handleInputChange('cep', e.target.value)}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>

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

          {/* Dados Profissionais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1E486F]">Dados Profissionais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="crea">CREA (se aplicável)</Label>
                <Input
                  id="crea"
                  value={formData.crea || ''}
                  onChange={(e) => handleInputChange('crea', e.target.value)}
                  placeholder="Número do CREA"
                />
              </div>
              <div>
                <Label htmlFor="creci">CRECI (se aplicável)</Label>
                <Input
                  id="creci"
                  value={formData.creci || ''}
                  onChange={(e) => handleInputChange('creci', e.target.value)}
                  placeholder="Número do CRECI"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="aceita_diaria"
                checked={formData.aceita_diaria || false}
                onCheckedChange={(checked) => handleInputChange('aceita_diaria', checked)}
              />
              <Label htmlFor="aceita_diaria">Aceito trabalhar por diária</Label>
            </div>
            
            {formData.aceita_diaria && (
              <div>
                <Label htmlFor="valor_diaria">Valor da Diária (R$)</Label>
                <Input
                  id="valor_diaria"
                  type="number"
                  value={formData.valor_diaria || 0}
                  onChange={(e) => handleInputChange('valor_diaria', parseFloat(e.target.value) || 0)}
                  placeholder="150.00"
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="receber_msm"
                checked={formData.receber_msm ?? true}
                onCheckedChange={(checked) => handleInputChange('receber_msm', checked)}
              />
              <Label htmlFor="receber_msm">Desejo receber mensagens sobre novas demandas</Label>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#1E486F] hover:bg-[#1E486F]/90 py-0 rounded-3xl font-semibold"
            >
              {loading ? 'Salvando...' : isEditing ? 'Atualizar Perfil' : 'Criar Cadastro'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>;
};

export default FormularioProfissional;
