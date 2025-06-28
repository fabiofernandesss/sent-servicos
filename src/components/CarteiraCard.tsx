
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Plus, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CarteiraCardProps {
  saldo?: number;
}

const CarteiraCard = ({ saldo = 0 }: CarteiraCardProps) => {
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="w-full bg-gradient-to-r from-[#1E486F] to-[#2563EB] text-white mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-full">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Saldo da Carteira</p>
              <p className="text-2xl font-bold">{formatCurrency(saldo)}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/recarga')}
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <Plus className="h-4 w-4 mr-1" />
              Recarregar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/recarga/historico')}
              className="text-white hover:bg-white/20"
            >
              <History className="h-4 w-4 mr-1" />
              Histórico
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarteiraCard;
