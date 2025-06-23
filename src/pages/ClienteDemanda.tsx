
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Hammer, Zap, Users, Building, Droplets, Wrench, ArrowLeft, Home, Car, Truck, Baby, Palette, Sparkles, Heart, MapPin, Shield, Leaf, Snowflake, Broom, Briefcase, Ruler } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

const supabase = createClient(
  'https://ryvcwjajgspbzxzncpfi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dmN3amFqZ3NwYnp4em5jcGZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODkzNjAsImV4cCI6MjA2MjE2NTM2MH0.1GhRnk2-YbL4awFz0c9bFWOleO_cFJKjvfyWQ30dxo8'
);

// ... keep existing code (estadosBrasil array)

const estadosBrasil = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
];

interface Categoria {
  id: string;
  nome: string;
}

interface Subcategoria {
  id: string;
  nome: string;
  categoria_id: string;
}

interface Cidade {
  id: number;
  nome: string;
}

interface FormData {
  nome: string;
  email: string;
  whatsapp: string;
  cidade: string;
  estado: string;
  categoria_id: string;
  subcategoria_id: string;
  urgencia: string;
  observacao: string;
}

const formatPhoneNumber = (value: string) => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // Apply phone mask (00) 00000-0000
  if (digits.length <= 2) {
    return `(${digits}`;
  } else if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  } else {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }
};

const sendWhatsAppMessage = async (whatsapp: string, nome: string) => {
  try {
    // Extract only numbers from WhatsApp
    const phoneNumber = whatsapp.replace(/\D/g, '');
    const jid = `55${phoneNumber}@s.whatsapp.net`;
    
    const message = `Olá ${nome}! 🎉\n\nParabéns! Sua demanda foi enviada com sucesso!\n\nEm breve um profissional qualificado entrará em contato com você para atender sua solicitação.\n\nObrigado por confiar em nossos serviços! 😊`;

    const response = await fetch('https://9045.bubblewhats.com/send-message', {
      method: 'POST',
      headers: {
        'Authorization': 'YzFkMGVkNzUwYzBjMjlhYzg0ZmJjYmU3',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jid: jid,
        message: message
      })
    });

    if (!response.ok) {
      console.error('Erro ao enviar mensagem no WhatsApp:', response.status);
    } else {
      console.log('Mensagem enviada com sucesso no WhatsApp');
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem no WhatsApp:', error);
  }
};

const getCategoryIcon = (categoryName: string) => {
  const iconMap: { [key: string]: { icon: any; color: string } } = {
    'Construção': { icon: Building, color: 'text-orange-600' },
    'Eletricista': { icon: Zap, color: 'text-yellow-500' },
    'Encanador': { icon: Droplets, color: 'text-blue-500' },
    'Pedreiro': { icon: Hammer, color: 'text-gray-600' },
    'Eventos': { icon: Users, color: 'text-purple-600' },
    'Arquitetura': { icon: Home, color: 'text-indigo-600' },
    'Limpeza': { icon: Wrench, color: 'text-green-500' },
    'Refrigeração': { icon: Snowflake, color: 'text-cyan-500' },
    'Jardinagem': { icon: Leaf, color: 'text-green-600' },
    'Segurança e Internet': { icon: Shield, color: 'text-red-600' },
    'Engenharia': { icon: Ruler, color: 'text-slate-600' },
    'Corretor': { icon: MapPin, color: 'text-emerald-600' },
    'Frete': { icon: Truck, color: 'text-amber-600' },
    'Babá': { icon: Baby, color: 'text-pink-500' },
    'Borracharia': { icon: Car, color: 'text-gray-700' },
    'Design gráfico': { icon: Palette, color: 'text-rose-500' },
    'Beleza': { icon: Sparkles, color: 'text-pink-400' },
    'Pet': { icon: Heart, color: 'text-red-400' },
    'Pintor': { icon: Palette, color: 'text-blue-400' },
    'Assentador de Piso': { icon: Wrench, color: 'text-brown-600' },
    'Todas': { icon: Briefcase, color: 'text-gray-500' }
  };
  
  return iconMap[categoryName] || { icon: Wrench, color: 'text-gray-500' };
};

const ClienteDemanda = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [filteredSubcategorias, setFilteredSubcategorias] = useState<Subcategoria[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>();
  const selectedCategoryId = form.watch('categoria_id');
  const selectedEstado = form.watch('estado');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      const filtered = subcategorias.filter(sub => sub.categoria_id === selectedCategoryId);
      setFilteredSubcategorias(filtered);
      // Reset subcategoria quando categoria muda
      form.setValue('subcategoria_id', '');
    }
  }, [selectedCategoryId, subcategorias, form]);

  useEffect(() => {
    if (selectedEstado) {
      loadCidades(selectedEstado);
    }
  }, [selectedEstado]);

  const loadData = async () => {
    try {
      // Carregar categorias
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (categoriasError) throw categoriasError;

      // Carregar subcategorias
      const { data: subcategoriasData, error: subcategoriasError } = await supabase
        .from('subcategorias')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (subcategoriasError) throw subcategoriasError;

      setCategorias(categoriasData || []);
      setSubcategorias(subcategoriasData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCidades = async (uf: string) => {
    setLoadingCidades(true);
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
      const data = await response.json();
      setCidades(data);
      // Reset cidade quando estado muda
      form.setValue('cidade', '');
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
    } finally {
      setLoadingCidades(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      console.log('Dados do formulário:', data);
      
      // Inserir demanda no Supabase
      const { error } = await supabase
        .from('demandas')
        .insert([
          {
            nome: data.nome,
            email: data.email,
            whatsapp: data.whatsapp,
            cidade: data.cidade,
            estado: data.estado,
            categoria_id: data.categoria_id,
            subcategoria_id: data.subcategoria_id,
            urgencia: data.urgencia,
            observacao: data.observacao,
            status: 'pendente',
            data_criacao: new Date().toISOString()
          }
        ]);

      if (error) {
        throw error;
      }

      // Mostrar toast de sucesso
      toast({
        title: "Parabéns! 🎉",
        description: "Sua demanda foi enviada com sucesso! Em breve um profissional entrará em contato.",
        duration: 5000,
      });

      // Enviar mensagem no WhatsApp
      await sendWhatsAppMessage(data.whatsapp, data.nome);

      // Resetar formulário
      form.reset();
    } catch (error) {
      console.error('Erro ao cadastrar demanda:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar demanda. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cadastrar Nova Demanda</h1>
            <p className="text-gray-600">Preencha os dados para solicitar um serviço</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Solicitação</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Dados Pessoais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    rules={{ required: 'Nome é obrigatório' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    rules={{ 
                      required: 'Email é obrigatório',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido'
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Digite seu email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="whatsapp"
                    rules={{ required: 'WhatsApp é obrigatório' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="(00) 00000-0000"
                            value={field.value}
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(e.target.value);
                              field.onChange(formatted);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estado"
                    rules={{ required: 'Estado é obrigatório' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white max-h-60 overflow-y-auto">
                            {estadosBrasil.map((estado) => (
                              <SelectItem key={estado.sigla} value={estado.sigla}>
                                {estado.nome} - {estado.sigla}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cidade"
                    rules={{ required: 'Cidade é obrigatória' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedEstado}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={loadingCidades ? "Carregando..." : "Selecione a cidade"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white max-h-60 overflow-y-auto">
                            {cidades.map((cidade) => (
                              <SelectItem key={cidade.id} value={cidade.nome}>
                                {cidade.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Categoria e Subcategoria */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="categoria_id"
                    rules={{ required: 'Categoria é obrigatória' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white max-h-60 overflow-y-auto">
                            {categorias.map((categoria) => {
                              const { icon: Icon, color } = getCategoryIcon(categoria.nome);
                              return (
                                <SelectItem key={categoria.id} value={categoria.id}>
                                  <div className="flex items-center gap-2">
                                    <Icon className={`h-4 w-4 ${color}`} />
                                    {categoria.nome}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subcategoria_id"
                    rules={{ required: 'Subcategoria é obrigatória' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategoria</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCategoryId}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma subcategoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white max-h-60 overflow-y-auto">
                            {filteredSubcategorias.map((subcategoria) => (
                              <SelectItem key={subcategoria.id} value={subcategoria.id}>
                                {subcategoria.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Urgência */}
                <FormField
                  control={form.control}
                  name="urgencia"
                  rules={{ required: 'Urgência é obrigatória' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgência da solicitação</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a urgência" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white">
                          <SelectItem value="preciso_com_urgencia">Preciso com urgência</SelectItem>
                          <SelectItem value="quero_para_esses_dias">Quero para esses dias</SelectItem>
                          <SelectItem value="nao_tenho_tanta_pressa">Não tenho tanta pressa</SelectItem>
                          <SelectItem value="so_orcamento">Só orçamento</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Observação */}
                <FormField
                  control={form.control}
                  name="observacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observação da solicitação</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva detalhes da sua solicitação..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Botão de Submit */}
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-semibold"
                  style={{ backgroundColor: '#1B4970' }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    'Cadastrar Demanda'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClienteDemanda;
