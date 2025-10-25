import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Plus, History, RefreshCw, ShoppingBag, TrendingUp, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfissionalSession } from '@/hooks/useProfissionalSession';
import { useToast } from '@/hooks/use-toast';
import { usePagamentos } from '@/hooks/usePagamentos';

interface CarteiraCardProps {
  saldo: number;
}

const CarteiraCard = ({ saldo }: CarteiraCardProps) => {
  const navigate = useNavigate();
  const { refreshSaldo } = useProfissionalSession();
  const { toast } = useToast();
  const { processarPendentes, loading } = usePagamentos();

  const ganhosSemanais = 0;
  const ultimaRecarga: string | null = null;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleRecarregar = () => navigate('/recarga');
  const handleHistorico = () => navigate('/historico-recargas');
  const handleMinhasCompras = () => navigate('/minhas-compras');

  return (
    <Card className="mb-8 bg-gradient-to-r from-[#1E486F] to-[#2A5A82] text-white">
      <CardContent className="p-4 sm:p-6">
        {/* Cabeçalho com saldo disponível */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-white/20 rounded-full">
            <Wallet className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-white/80">Saldo Disponível</p>
            <div className="flex items-center gap-2">
              <p className="text-xl sm:text-2xl font-bold">{formatCurrency(saldo)}</p>
              <Button variant="ghost" size="sm" onClick={refreshSaldo} className="p-1 h-auto text-white/80 hover:text-white hover:bg-white/20">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Ações principais (sem Pagamentos) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full mt-4">
          <Button onClick={handleRecarregar} className="w-full h-12 sm:h-14 bg-white text-[#1E486F] hover:bg-gray-100 font-bold transition-all duration-200 rounded-3xl">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Fazer</span> Recarga
          </Button>
          <Button onClick={handleHistorico} variant="outline" className="w-full h-12 sm:h-14 bg-yellow-400 text-[#1E486F] hover:bg-yellow-500 font-bold transition-all duration-200 rounded-3xl">
            <CreditCard className="h-4 w-4 mr-2" />
            Pagamentos
          </Button>
          <Button onClick={handleMinhasCompras} variant="outline" className="w-full h-12 sm:h-14 bg-white text-[#1E486F] hover:bg-gray-100 font-bold transition-all duration-200 rounded-3xl">
            <ShoppingBag className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Minhas</span> Compras
          </Button>
        </div>



        {/* Informações resumidas */}
        <div className="bg-gray-50 p-4 rounded-lg mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Ganhos da Semana</p>
              <p className="text-lg sm:text-xl font-bold text-[#1E486F]">{formatCurrency(ganhosSemanais)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Última Recarga</p>
              <p className="text-lg sm:text-xl font-bold text-[#1E486F]">{ultimaRecarga || 'Nenhuma'}</p>
            </div>
          </div>
        </div>

        {/* Rodapé informativo */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-xs sm:text-sm text-white/80">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Esta semana: +{formatCurrency(25.5)}</span>
            </div>
            <span>Última recarga: 15/01</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarteiraCard;