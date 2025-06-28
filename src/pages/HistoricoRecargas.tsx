
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, CreditCard, TrendingUp } from 'lucide-react';
import MobileNavbar from '@/components/MobileNavbar';
import MobileMenu from '@/components/MobileMenu';

interface Recarga {
  id: string;
  valor: number;
  data: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  metodo: string;
}

const HistoricoRecargas = () => {
  const navigate = useNavigate();
  const [recargas, setRecargas] = useState<Recarga[]>([]);
  const [loading, setLoading] = useState(true);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setRecargas([
        {
          id: '1',
          valor: 50.00,
          data: '2024-01-15T10:30:00Z',
          status: 'aprovado',
          metodo: 'PIX'
        },
        {
          id: '2',
          valor: 100.00,
          data: '2024-01-10T14:20:00Z',
          status: 'aprovado',
          metodo: 'Cartão de Crédito'
        },
        {
          id: '3',
          valor: 25.00,
          data: '2024-01-05T09:15:00Z',
          status: 'pendente',
          metodo: 'PIX'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

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
    const statusMap = {
      'aprovado': { text: 'Aprovado', color: 'bg-green-500' },
      'pendente': { text: 'Pendente', color: 'bg-yellow-500' },
      'rejeitado': { text: 'Rejeitado', color: 'bg-red-500' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pendente;
    
    return (
      <Badge className={`${statusInfo.color} text-white`}>
        {statusInfo.text}
      </Badge>
    );
  };

  const totalRecargas = recargas.reduce((sum, recarga) => sum + recarga.valor, 0);

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Histórico de Recargas</h1>
          <p className="text-gray-600">Acompanhe todas as suas recargas realizadas</p>
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
                  <p className="text-sm text-gray-600">Total Recarregado</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(totalRecargas)}</p>
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
                  <p className="text-sm text-gray-600">Total de Recargas</p>
                  <p className="text-xl font-bold text-gray-900">{recargas.length}</p>
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
                  <p className="text-xl font-bold text-gray-900">
                    {recargas.filter(r => r.status === 'pendente').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Recargas */}
        <Card>
          <CardHeader>
            <CardTitle>Suas Recargas</CardTitle>
          </CardHeader>
          <CardContent>
            {recargas.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma recarga encontrada
                </h3>
                <p className="text-gray-500 mb-4">
                  Você ainda não fez nenhuma recarga em sua conta.
                </p>
                <Button onClick={() => navigate('/recarga')} className="bg-[#1E486F] hover:bg-[#1E486F]/90">
                  Fazer Recarga
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recargas.map((recarga) => (
                  <div key={recarga.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <CreditCard className="h-5 w-5 text-[#1E486F]" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{formatCurrency(recarga.valor)}</p>
                        <p className="text-sm text-gray-600">{recarga.metodo}</p>
                        <p className="text-xs text-gray-500">{formatDate(recarga.data)}</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      {getStatusBadge(recarga.status)}
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
