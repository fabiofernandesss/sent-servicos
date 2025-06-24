
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import FormularioDemanda from '@/components/FormularioDemanda';
import { sendWhatsAppMessage } from '@/services/whatsappService';
import { 
  loadCategorias, 
  loadSubcategorias, 
  createDemanda, 
  loadCidades,
  type Categoria,
  type Subcategoria,
  type DemandaData
} from '@/services/supabaseService';
import { getCategoryIcon } from '@/utils/categoryIcons';

interface Cidade {
  id: number;
  nome: string;
}

const ClienteDemanda = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  const onSubmit = async (data: DemandaData) => {
    setSubmitting(true);
    console.log('Iniciando envio de demanda:', data);
    
    try {
      // Criar demanda no Supabase
      await createDemanda(data);
      
      console.log('Demanda criada com sucesso, enviando WhatsApp...');
      
      // Enviar mensagem no WhatsApp
      const whatsappResult = await sendWhatsAppMessage(data.whatsapp, data.nome);
      
      if (whatsappResult.success) {
        console.log('WhatsApp enviado com sucesso');
      } else {
        console.warn('Erro no WhatsApp, mas demanda foi criada:', whatsappResult.error);
      }

      // Mostrar toast de sucesso
      toast({
        title: "Parabéns! 🎉",
        description: "Sua demanda foi enviada com sucesso! Em breve um profissional entrará em contato.",
        duration: 5000,
      });

      // Resetar para página inicial após sucesso
      window.location.href = '/';
      
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
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
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
            <FormularioDemanda
              categorias={categorias}
              subcategorias={subcategorias}
              cidades={cidades}
              loadingCidades={loadingCidades}
              submitting={submitting}
              onSubmit={onSubmit}
              onEstadoChange={handleEstadoChange}
              getCategoryIcon={getCategoryIcon}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClienteDemanda;
