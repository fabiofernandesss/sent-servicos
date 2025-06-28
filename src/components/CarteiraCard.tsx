
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Plus, History, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CarteiraCardProps {
  saldo: number;
}

const CarteiraCard = ({ saldo }: CarteiraCardProps) => {
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="mb-8 bg-gradient-to-r from-[#1E486F] to-[#2A5A82] text-white">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Saldo Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-white/20 rounded-full">
              <Wallet className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-white/80">Saldo Disponível</p>
              <p className="text-xl sm:text-2xl font-bold">{formatCurrency(saldo)}</p>
            </div>
          </div>
          
          {/* Actions Section */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button 
              onClick={() => navigate('/recarga')}
              className="bg-white text-[#1E486F] hover:bg-gray-100 font-semibold flex-1 sm:flex-none"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Fazer</span> Recarga
            </Button>
            
            <Button 
              onClick={() => navigate('/historico-recargas')}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 flex-1 sm:flex-none"
              size="sm"
            >
              <History className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Ver</span> Histórico
            </Button>
          </div>
        </div>
        
        {/* Stats Row - Mobile responsive */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-xs sm:text-sm text-white/80">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Esta semana: +{formatCurrency(25.50)}</span>
            </div>
            <span>Última recarga: 15/01</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarteiraCard;
