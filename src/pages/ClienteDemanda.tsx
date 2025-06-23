
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Hammer, Zap, Users, Building, Droplets, Wrench, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ryvcwjajgspbzxzncpfi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dmN3amFqZ3NwYnp4em5jcGZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODkzNjAsImV4cCI6MjA2MjE2NTM2MH0.1GhRnk2-YbL4awFz0c9bFWOleO_cFJKjvfyWQ30dxo8'
);

interface Categoria {
  id: string;
  nome: string;
}

interface Subcategoria {
  id: string;
  nome: string;
  categoria_id: string;
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

const getCategoryIcon = (categoryName: string) => {
  const iconMap: { [key: string]: any } = {
    'Construção': Building,
    'Eletricista': Zap,
    'Encanador': Droplets,
    'Pedreiro': Hammer,
    'Eventos': Users,
    'default': Wrench
  };
  
  return iconMap[categoryName] || iconMap.default;
};

const ClienteDemanda = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [filteredSubcategorias, setFilteredSubcategorias] = useState<Subcategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormData>();
  const selectedCategoryId = form.watch('categoria_id');

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

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      console.log('Dados do formulário:', data);
      // Aqui você pode implementar o envio para o Supabase
      alert('Demanda cadastrada com sucesso!');
    } catch (error) {
      console.error('Erro ao cadastrar demanda:', error);
      alert('Erro ao cadastrar demanda. Tente novamente.');
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
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
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
                        <FormControl>
                          <Input placeholder="Digite sua cidade" {...field} />
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
                        <FormControl>
                          <Input placeholder="Digite seu estado" {...field} />
                        </FormControl>
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
                              const Icon = getCategoryIcon(categoria.nome);
                              return (
                                <SelectItem key={categoria.id} value={categoria.id}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
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
