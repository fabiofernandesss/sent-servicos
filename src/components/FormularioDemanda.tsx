
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

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

interface FormularioDemandaProps {
  categorias: Categoria[];
  subcategorias: Subcategoria[];
  cidades: Cidade[];
  loadingCidades: boolean;
  submitting: boolean;
  onSubmit: (data: FormData) => void;
  onEstadoChange: (uf: string) => void;
  getCategoryIcon: (categoryName: string) => { icon: any; color: string };
}

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

const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, '');
  
  if (digits.length <= 2) {
    return `(${digits}`;
  } else if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  } else {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }
};

const FormularioDemanda = ({ 
  categorias, 
  subcategorias, 
  cidades, 
  loadingCidades, 
  submitting, 
  onSubmit, 
  onEstadoChange,
  getCategoryIcon 
}: FormularioDemandaProps) => {
  const form = useForm<FormData>();
  const selectedCategoryId = form.watch('categoria_id');
  const selectedEstado = form.watch('estado');

  const filteredSubcategorias = subcategorias.filter(sub => sub.categoria_id === selectedCategoryId);

  // Reset subcategoria quando categoria muda
  useEffect(() => {
    if (selectedCategoryId && form.getValues('subcategoria_id') && 
        !filteredSubcategorias.find(sub => sub.id === form.getValues('subcategoria_id'))) {
      form.setValue('subcategoria_id', '');
    }
  }, [selectedCategoryId, filteredSubcategorias, form]);

  // Chamar onEstadoChange quando estado muda
  useEffect(() => {
    if (selectedEstado) {
      console.log('Estado selecionado mudou para:', selectedEstado);
      onEstadoChange(selectedEstado);
      // Reset cidade quando estado muda
      form.setValue('cidade', '');
    }
  }, [selectedEstado, onEstadoChange, form]);

  return (
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
                    value={field.value || ''}
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
                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedEstado || loadingCidades}>
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
  );
};

export default FormularioDemanda;
