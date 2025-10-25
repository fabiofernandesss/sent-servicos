import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, Copy, Calendar, MapPin, User, ShoppingBag } from 'lucide-react';
import { useProfissionalSession } from '@/hooks/useProfissionalSession';
import { demandasService, CompraDemanda, DadosCliente } from '@/services/demandasService';
import { useToast } from '@/hooks/use-toast';

const MinhasCompras = () => {
  const navigate = useNavigate();
  const { profissionalLogado } = useProfissionalSession();
  const { toast } = useToast();
  
  const [compras, setCompras] = useState<CompraDemanda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profissionalLogado?.id) {
      loadCompras();
    }
  }, [profissionalLogado]);

  const loadCompras = async () => {
    if (!profissionalLogado?.id) return;

    try {
      setLoading(true);
      const comprasData = await demandasService.listarComprasProfissional(profissionalLogado.id);
      setCompras(comprasData);
    } catch (error) {
      console.error('Erro ao carregar compras:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar suas compras",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirWhatsApp = (compra: CompraDemanda) => {
    const dadosCliente: DadosCliente = {
      nome: compra.dados_demanda.nome,
      whatsapp: compra.dados_demanda.whatsapp,
      email: compra.dados_demanda.email,
      cidade: compra.dados_demanda.cidade,
      estado: compra.dados_demanda.estado,
      observacao: compra.dados_demanda.observacao
    };

    const mensagem = demandasService.gerarMensagemWhatsApp(
      dadosCliente,
      profissionalLogado?.nome || '',
      profissionalLogado?.whatsapp || ''
    );

    demandasService.abrirWhatsApp(compra.dados_demanda.whatsapp, mensagem);
  };

  const handleCopiarDados = async (compra: CompraDemanda) => {
    try {
      const dadosCliente: DadosCliente = {
        nome: compra.dados_demanda.nome,
        whatsapp: compra.dados_demanda.whatsapp,
        email: compra.dados_demanda.email,
        cidade: compra.dados_demanda.cidade,
        estado: compra.dados_demanda.estado,
        observacao: compra.dados_demanda.observacao
      };

      await demandasService.copiarDadosCliente(dadosCliente);
      
      toast({
        title: "Dados copiados!",
        description: "Informações do cliente copiadas para área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao copiar dados do cliente",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!profissionalLogado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login necessário</h2>
          <p className="text-gray-600 mb-4">Você precisa estar logado para ver suas compras</p>
          <Button onClick={() => navigate('/profissionais')}>
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/profissionais')} className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <img src="https://9088bc4d5081958e858f937822185f7b.cdn.bubble.io/cdn-cgi/image/w=256,h=53,f=auto,dpr=1.25,fit=contain/f1716158171404x251547051884103870/Ativo%201.png" alt="Sent Serviços" className="h-5 w-auto" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header da página */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="h-8 w-8 text-[#1E486F]" />
            <h1 className="text-3xl font-bold text-[#1E486F]">Minhas Compras</h1>
          </div>
          <p className="text-gray-600">
            Gerencie suas demandas compradas e entre em contato com os clientes
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-gray-600">Carregando suas compras...</div>
          </div>
        ) : compras.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma compra encontrada</h3>
              <p className="text-gray-600 mb-6">
                Você ainda não comprou nenhuma demanda. Explore as oportunidades disponíveis!
              </p>
              <Button onClick={() => navigate('/profissionais')}>
                Ver Demandas Disponíveis
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {compras.map((compra) => (
              <Card key={compra.compra_id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-[#1E486F]">
                      {compra.dados_demanda.categoria_nome}
                    </CardTitle>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {formatCurrency(compra.valor_pago)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {compra.dados_demanda.subcategoria_nome}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Cliente */}
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{compra.dados_demanda.nome}</span>
                  </div>

                  {/* Localização */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{compra.dados_demanda.cidade}/{compra.dados_demanda.estado}</span>
                  </div>

                  {/* Data da compra */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(compra.created_at)}</span>
                  </div>

                  {/* Observação */}
                  {compra.dados_demanda.observacao && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        "{compra.dados_demanda.observacao}"
                      </p>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1" 
                      size="sm"
                      onClick={() => handleAbrirWhatsApp(compra)}
                      style={{ backgroundColor: '#25D366' }}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      WhatsApp
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopiarDados(compra)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Status */}
                  <div className="pt-2 border-t">
                    <Badge 
                      variant={compra.status === 'comprada' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {compra.status === 'comprada' ? 'Ativa' : compra.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Estatísticas */}
        {compras.length > 0 && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-[#1E486F] mb-4">Resumo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#1E486F]">{compras.length}</div>
                  <div className="text-sm text-gray-600">Total de compras</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(compras.reduce((total, compra) => total + compra.valor_pago, 0))}
                  </div>
                  <div className="text-sm text-gray-600">Total investido</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {compras.filter(c => c.status === 'comprada').length}
                  </div>
                  <div className="text-sm text-gray-600">Demandas ativas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MinhasCompras;
