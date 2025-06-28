
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, History, Calendar, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileNavbar from '@/components/MobileNavbar';
import MobileMenu from '@/components/MobileMenu';

const HistoricoRecarga = () => {
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Dados de exemplo para o histórico
  const historico = [
    {
      id: 1,
      valor: 50,
      bonus: 15,
      total: 65,
      metodo: 'PIX',
      status: 'concluida',
      data: '2024-06-25T14:30:00'
    },
    {
      id: 2,
      valor: 20,
      bonus: 4,
      total: 24,
      metodo: 'Cartão de Crédito',
      status: 'concluida',
      data: '2024-06-20T09:15:00'
    },
    {
      id: 3,
      valor: 10,
      bonus: 2,
      total: 12,
      metodo: 'Cartão de Débito',
      status: 'pendente',
      data: '2024-06-28T16:45:00'
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      'concluida': 'default',
      'pendente': 'secondary',
      'cancelada': 'destructive'
    } as const;

    const labels = {
      'concluida': 'Concluída',
      'pendente': 'Pendente',
      'cancelada': 'Cancelada'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/recarga')} className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <img src="https://9088bc4d5081958e858f937822185f7b.cdn.bubble.io/cdn-cgi/image/w=256,h=53,f=auto,dpr=1.25,fit=contain/f1716158171404x251547051884103870/Ativo%201.png" alt="Sent Serviços" className="h-5 w-auto" />
            </div>
            <div className="flex items-center gap-2">
              <nav className="hidden md:flex space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-600" onClick={() => navigate('/')}>Início</Button>
                <Button variant="ghost" size="sm" className="text-gray-600" onClick={() => navigate('/equipamentos')}>Equipamentos</Button>
                <Button variant="ghost" size="sm" className="text-gray-600" onClick={() => navigate('/perfil')}>Perfil</Button>
              </nav>
              <MobileMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header da página */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <History className="h-8 w-8 text-[#1E486F]" />
          </div>
          <h1 className="text-3xl font-bold text-[#1E486F] mb-2">Histórico de Recargas</h1>
          <p className="text-gray-600">Visualize todas as suas recargas realizadas</p>
        </div>

        {/* Lista de Histórico */}
        <div className="space-y-4">
          {historico.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Nenhuma recarga encontrada</p>
                <Button onClick={() => navigate('/recarga')} className="bg-[#1E486F] hover:bg-[#1E486F]/90">
                  Fazer Primeira Recarga
                </Button>
              </CardContent>
            </Card>
          ) : (
            historico.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CreditCard className="h-5 w-5 text-[#1E486F]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-lg text-[#1E486F]">
                            {formatCurrency(item.total)}
                          </span>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(item.data)}</span>
                          </div>
                          <div>Método: {item.metodo}</div>
                          {item.bonus > 0 && (
                            <div className="text-green-600">
                              Valor: {formatCurrency(item.valor)} + Bônus: {formatCurrency(item.bonus)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Ações */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => navigate('/recarga')}
            className="bg-[#1E486F] hover:bg-[#1E486F]/90"
          >
            Nova Recarga
          </Button>
        </div>
      </div>

      {/* Mobile Navbar */}
      <MobileNavbar />
    </div>
  );
};

export default HistoricoRecarga;
