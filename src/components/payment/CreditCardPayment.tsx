import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { pagarMeService } from '@/services/pagarme';

interface CreditCardPaymentProps {
  amount: number;
  onSuccess: (orderId: string) => void;
  onCancel: () => void;
  customerData: {
    name: string;
    email: string;
    document: string;
    phone: string;
  };
  profissionalId?: string | number;
}

const CreditCardPayment = ({ amount, onSuccess, onCancel, customerData, profissionalId }: CreditCardPaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    holderName: '',
    expMonth: '',
    expYear: '',
    cvv: ''
  });
  const { toast } = useToast();
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardData(prev => ({ ...prev, number: formatted }));
    }
  };

  const handleExpMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 2 && (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12))) {
      setCardData(prev => ({ ...prev, expMonth: value }));
    }
  };

  const handleExpYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCardData(prev => ({ ...prev, expYear: value }));
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCardData(prev => ({ ...prev, cvv: value }));
    }
  };

  const validateForm = () => {
    const { number, holderName, expMonth, expYear, cvv } = cardData;
    
    if (!number || number.replace(/\s/g, '').length < 13) {
      toast({
        title: "Erro",
        description: "Número do cartão inválido",
        variant: "destructive"
      });
      return false;
    }
    
    if (!holderName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do portador é obrigatório",
        variant: "destructive"
      });
      return false;
    }
    
    if (!expMonth || parseInt(expMonth) < 1 || parseInt(expMonth) > 12) {
      toast({
        title: "Erro",
        description: "Mês de vencimento inválido",
        variant: "destructive"
      });
      return false;
    }
    
    if (!expYear || expYear.length !== 4) {
      toast({
        title: "Erro",
        description: "Ano de vencimento inválido",
        variant: "destructive"
      });
      return false;
    }
    
    if (!cvv || cvv.length < 3) {
      toast({
        title: "Erro",
        description: "CVV inválido",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const processPayment = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Validar CPF antes de prosseguir
      if (!pagarMeService.validateCPF(customerData.document)) {
        throw new Error('CPF inválido. Verifique os dados e tente novamente.');
      }

      console.log('👤 Dados do cliente para cartão:', customerData);

      // Criar pagamento com cartão real
      const response = await pagarMeService.createCreditCardPayment({
        amount: amount,
        customerName: customerData.name,
        customerEmail: customerData.email,
        customerDocument: customerData.document,
        customerPhone: customerData.phone,
        cardNumber: cardData.number.replace(/\s/g, ''),
        cardHolderName: cardData.holderName,
        cardExpMonth: parseInt(cardData.expMonth),
        cardExpYear: parseInt(cardData.expYear),
        cardCvv: cardData.cvv,
        installments: 1,
        description: 'Recarga de créditos - Sent Serviços'
      });

      if (response && response.id) {
        // Verificar se o pagamento foi aprovado
        if (response.status === 'paid' || (response.charges && response.charges[0]?.status === 'paid')) {
          toast({
            title: "Pagamento Aprovado!",
            description: "Sua recarga foi processada com sucesso"
          });
          
          onSuccess(response.id);
        } else if (response.status === 'pending' || response.status === 'processing' || (response.charges && response.charges[0]?.status === 'pending')) {
          toast({
            title: "Pagamento Pendente",
            description: "Aguardando confirmação do pagamento"
          });
          
          // Verificar status periodicamente
          setIsChecking(true);
          checkIntervalRef.current = setInterval(async () => {
            try {
              const status = await pagarMeService.getOrderStatus(response.id!);
              if (status.status === 'paid') {
                if (checkIntervalRef.current) {
                  clearInterval(checkIntervalRef.current);
                }
                setIsChecking(false);
                toast({
                  title: "Pagamento Aprovado!",
                  description: "Sua recarga foi processada com sucesso"
                });
                onSuccess(response.id);
              } else if (status.status === 'failed' || status.status === 'canceled') {
                if (checkIntervalRef.current) {
                  clearInterval(checkIntervalRef.current);
                }
                setIsChecking(false);
                toast({
                  title: "Pagamento Rejeitado",
                  description: "O pagamento não foi aprovado",
                  variant: "destructive"
                });
              }
            } catch (error) {
              if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
              }
              setIsChecking(false);
              throw error;
            }
          }, 3000);

          // Limpar verificação após 5 minutos
          setTimeout(() => {
            if (checkIntervalRef.current) {
              clearInterval(checkIntervalRef.current);
              setIsChecking(false);
            }
          }, 300000);
        } else {
          throw new Error('Pagamento rejeitado. Verifique os dados do cartão.');
        }
      } else {
        throw new Error('Resposta inválida da API');
      }
      
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar pagamento. Verifique os dados do cartão.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Limpar intervalo de verificação
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    setIsChecking(false);
    onCancel();
  };

  // Cleanup ao desmontar o componente
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pagamento com Cartão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center mb-4">
          <p className="text-2xl font-bold text-[#1E486F]">
            {formatCurrency(amount / 100)}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="cardNumber">Número do Cartão</Label>
            <Input
              id="cardNumber"
              placeholder="0000 0000 0000 0000"
              value={cardData.number}
              onChange={handleCardNumberChange}
              maxLength={19}
            />
          </div>

          <div>
            <Label htmlFor="holderName">Nome do Portador</Label>
            <Input
              id="holderName"
              placeholder="Nome como está no cartão"
              value={cardData.holderName}
              onChange={(e) => setCardData(prev => ({ ...prev, holderName: e.target.value.toUpperCase() }))}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="expMonth">Mês</Label>
              <Input
                id="expMonth"
                placeholder="MM"
                value={cardData.expMonth}
                onChange={handleExpMonthChange}
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="expYear">Ano</Label>
              <Input
                id="expYear"
                placeholder="AAAA"
                value={cardData.expYear}
                onChange={handleExpYearChange}
                maxLength={4}
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="000"
                value={cardData.cvv}
                onChange={handleCvvChange}
                maxLength={4}
                type="password"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <Lock className="h-4 w-4" />
          <span>Seus dados estão protegidos com criptografia SSL</span>
        </div>

        {isChecking && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Verificando pagamento...
            </p>
            <div className="animate-pulse">
              <div className="h-2 bg-blue-200 rounded-full">
                <div className="h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={processPayment} 
            disabled={loading || isChecking}
            className="flex-1"
          >
            {loading ? 'Processando...' : isChecking ? 'Verificando...' : 'Pagar'}
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditCardPayment;