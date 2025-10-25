
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, CreditCard, TrendingUp } from 'lucide-react';
import MobileNavbar from '@/components/MobileNavbar';
import MobileMenu from '@/components/MobileMenu';
import { useProfissionalSession } from '@/hooks/useProfissionalSession';
import { usePagamentos, Pagamento } from '@/hooks/usePagamentos';

// Histórico passa a usar pagamentos (tabela `pagamentos`) em vez de `recargas`.

const HistoricoRecargas = () => {
  const navigate = useNavigate();
  const { profissionalLogado, isLoggedIn } = useProfissionalSession();
  const { buscarPagamentos, processarPendentes } = usePagamentos();
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isLoggedIn && profissionalLogado) {
      loadPagamentos();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, profissionalLogado]);

  const loadPagamentos = async () => {
    try {
      setLoading(true);
      const data = await buscarPagamentos(profissionalLogado!.id);
      setPagamentos(data);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    } finally {
      setLoading(false);
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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      paid: { text: 'Pago', color: 'bg-green-500' },
      pending: { text: 'Pendente', color: 'bg-yellow-500' },
      processing: { text: 'Processando', color: 'bg-blue-500' },
      created: { text: 'Criado', color: 'bg-gray-500' },
      canceled: { text: 'Cancelado', color: 'bg-red-500' }
    };

    const statusInfo = statusMap[status] || { text: status, color: 'bg-gray-500' };

    return (
      <Badge className={`${statusInfo.color} text-white`}>
        {statusInfo.text}
      </Badge>
    );
  };

  const getMetodoPagamento = (metodo: string) => {
    const metodoMap = {
      'pix': 'PIX',
      'credit_card': 'Cartão de Crédito'
    };
    return metodoMap[metodo as keyof typeof metodoMap] || metodo;
  };

  const totalPago = pagamentos.reduce((sum, p) => sum + (p.status === 'paid' ? (p.amount || 0) / 100 : 0), 0);
  const totalPendentes = pagamentos.filter(p => ['pending', 'processing', 'created'].includes(p.status)).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Carregando histórico...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/perfil')} className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <img 
                src="https://9088bc4d5081958e858f937822185f7b.cdn.bubble.io/cdn-cgi/image/w=256,h=53,f=auto,dpr=1.25,fit=contain/f1716158171404x251547051884103870/Ativo%201.png" 
                alt="Sent Serviços" 
                className="h-5 w-auto" 
              />
            </div>
            <div className="flex items-center gap-2">
              <nav className="hidden md:flex space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-600" onClick={() => navigate('/')}>
                  Início
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600" onClick={() => navigate('/equipamentos')}>
                  Equipamentos
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600" onClick={() => navigate('/perfil')}>
                  Perfil
                </Button>
              </nav>
              <MobileMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Histórico de Pagamentos</h1>
            <p className="text-gray-600">Acompanhe seus pagamentos e status reais do PagarMe</p>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Pago</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(totalPago)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Pagamentos</p>
                  <p className="text-xl font-bold text-gray-900">{pagamentos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pendentes</p>
                  <p className="text-xl font-bold text-gray-900">{totalPendentes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Recargas */}
        <Card>
          <CardHeader>
            <CardTitle>Seus Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {pagamentos.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pagamento encontrado</h3>
                <p className="text-gray-500 mb-4">Você ainda não fez nenhum pagamento.</p>
                <Button onClick={() => navigate('/recarga')} className="bg-[#1E486F] hover:bg-[#1E486F]/90">
                  Fazer Recarga
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {pagamentos.map((p) => (
                  <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <CreditCard className="h-5 w-5 text-[#1E486F]" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{formatCurrency((p.amount || 0) / 100)}</p>
                        <p className="text-xs text-gray-500">{getMetodoPagamento(p.payment_method)}</p>
                        <p className="text-xs text-gray-500">{formatDate(p.created_at)}</p>
                        {p.pagarme_order_id && (
                          <p className="text-xs text-gray-500">Pedido: {p.pagarme_order_id}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      {getStatusBadge(p.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile Navbar */}
      <MobileNavbar />
    </div>
  );
};

export default HistoricoRecargas;
