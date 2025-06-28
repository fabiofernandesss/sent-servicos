import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wallet, Gift, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useProfissionalSession } from '@/hooks/useProfissionalSession';
import MobileNavbar from '@/components/MobileNavbar';
import MobileMenu from '@/components/MobileMenu';

interface RecargaOption {
  valor: number;
  bonus: number;
  destaque?: boolean;
}

const Recarga = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profissionalLogado, isLoggedIn } = useProfissionalSession();
  const [loading, setLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  const recargaOptions: RecargaOption[] = [
    { valor: 2, bonus: 0 },
    { valor: 5, bonus: 0 },
    { valor: 10, bonus: 2 },
    { valor: 16, bonus: 2 },
    { valor: 20, bonus: 4 },
    { valor: 30, bonus: 6 },
    { valor: 50, bonus: 15, destaque: true },
    { valor: 80, bonus: 0 },
    { valor: 100, bonus: 0 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleRecarga = async (opcao: RecargaOption) => {
    if (!isLoggedIn) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para fazer uma recarga",
        variant: "destructive"
      });
      navigate('/perfil');
      return;
    }

    setSelectedValue(opcao.valor);
    setLoading(true);

    try {
      // Simular processamento da recarga
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const valorTotal = opcao.valor + opcao.bonus;
      
      toast({
        title: "Recarga Realizada!",
        description: `${formatCurrency(opcao.valor)} + ${formatCurrency(opcao.bonus)} de bônus = ${formatCurrency(valorTotal)} creditados!`
      });
      
      // Aqui você integraria com o sistema de pagamento real
      navigate('/perfil');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar recarga. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setSelectedValue(null);
    }
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
            <Wallet className="h-8 w-8 text-[#1E486F]" />
          </div>
          <h1 className="text-3xl font-bold text-[#1E486F] mb-2">Recarregar Carteira</h1>
          <p className="text-gray-600">Escolha o valor para recarregar sua carteira e ganhe bônus!</p>
          
          {profissionalLogado && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Saldo atual:</p>
              <p className="text-2xl font-bold text-[#1E486F]">
                {formatCurrency(profissionalLogado.saldo || 0)}
              </p>
            </div>
          )}
        </div>

        {/* Opções de Recarga */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {recargaOptions.map((opcao, index) => (
            <Card 
              key={index} 
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                opcao.destaque ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'
              } ${selectedValue === opcao.valor && loading ? 'opacity-50' : ''}`}
              onClick={() => handleRecarga(opcao)}
            >
              {opcao.destaque && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Popular
                </div>
              )}
              
              <CardContent className="p-4 text-center">
                <div className="mb-2">
                  <CreditCard className="h-6 w-6 mx-auto text-[#1E486F]" />
                </div>
                
                <div className="text-lg font-bold text-[#1E486F] mb-1">
                  {formatCurrency(opcao.valor)}
                </div>
                
                {opcao.bonus > 0 && (
                  <div className="flex items-center justify-center gap-1 text-sm text-green-600">
                    <Gift className="h-3 w-3" />
                    <span>+{formatCurrency(opcao.bonus)}</span>
                  </div>
                )}
                
                {opcao.bonus === 0 && (
                  <div className="text-xs text-gray-500">Sem bônus</div>
                )}
                
                {selectedValue === opcao.valor && loading && (
                  <div className="mt-2 text-xs text-blue-600">Processando...</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Informações sobre bônus */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-[#1E486F] flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Sistema de Bônus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Valores com Bônus:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• R$ 10 → Ganhe R$ 2</li>
                  <li>• R$ 16 → Ganhe R$ 2</li>
                  <li>• R$ 20 → Ganhe R$ 4</li>
                  <li>• R$ 30 → Ganhe R$ 6</li>
                  <li>• R$ 50 → Ganhe R$ 15 (Melhor oferta!)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Como funciona:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Bônus creditado automaticamente</li>
                  <li>• Válido por tempo ilimitado</li>
                  <li>• Use para qualquer serviço</li>
                  <li>• Sem taxas adicionais</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métodos de Pagamento - Sem Débito */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-[#1E486F]">Métodos de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm">PIX</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm">Cartão de Crédito</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Navbar */}
      <MobileNavbar />
    </div>
  );
};

export default Recarga;
