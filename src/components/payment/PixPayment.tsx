import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Clock, Copy } from 'lucide-react';
import { pagarMeService } from '@/services/pagarme';

interface PixPaymentProps {
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

interface PixData {
  id: string;
  qr_code: string;
  qr_code_url: string;
  expires_at: string;
}

const PixPayment = ({ amount, onSuccess, onCancel, customerData, profissionalId }: PixPaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Código copiado!",
      description: "Código PIX copiado para a área de transferência"
    });
  };

  // Função para gerar QR code a partir da string PIX
  const generateQRCodeImage = (pixString: string) => {
    // Usar uma API online para gerar QR code
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixString)}`;
    return qrApiUrl;
  };

  const createPixPayment = async () => {
    setLoading(true);
    
    try {
      console.log('👤 Dados do cliente para PIX:', customerData);
      
      // Validar CPF antes de prosseguir
      const formattedDocument = pagarMeService.formatDocument(customerData.document);
      if (!pagarMeService.validateCPF(formattedDocument)) {
        throw new Error('CPF inválido. Verifique os dados e tente novamente.');
      }

      // Preparar dados do cliente para o Pagar.me
      const phone = customerData.phone || '11999999999'; // Fallback para telefone
      const phoneData = pagarMeService.parsePhoneNumber(phone);
      
      const customerDataForPagarme = {
        name: customerData.name,
        email: customerData.email,
        type: 'individual' as const,
        document: formattedDocument,
        document_type: 'CPF' as const,
        phones: {
          mobile_phone: {
            country_code: '55',
            area_code: phoneData.area_code,
            number: phoneData.number
          }
        }
      };

      const response = await pagarMeService.createPixPayment(
        customerDataForPagarme,
        amount,
        'Recarga de créditos - Sent Serviços',
        profissionalId
      );

      if (response && response.charges && response.charges[0]) {
        const charge = response.charges[0];
        const pixInfo = charge.last_transaction;

        // Verificar se o PIX foi criado com sucesso
        if (pixInfo && pixInfo.qr_code && pixInfo.qr_code_url) {
          const pixData = {
            id: response.id,
            qr_code: pixInfo.qr_code,
            qr_code_url: pixInfo.qr_code_url,
            expires_at: pixInfo.expires_at
          };

          setPixData(pixData);
          
          // Iniciar timer
          timerIntervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
              if (prev <= 1) {
                if (timerIntervalRef.current) {
                  clearInterval(timerIntervalRef.current);
                }
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          // Verificar status do pagamento periodicamente - APENAS REAL
          setIsChecking(true);
          checkIntervalRef.current = setInterval(async () => {
            try {
              console.log('🔍 Verificando status REAL do PIX:', response.id);
              const status = await pagarMeService.getPaymentStatus(response.id);
              console.log('📊 Status retornado:', status);
              
              // APENAS aprovar se o status for realmente 'paid' na API
              if (status.status === 'paid' || (status.charges && status.charges[0]?.status === 'paid')) {
                if (checkIntervalRef.current) {
                  clearInterval(checkIntervalRef.current);
                }
                if (timerIntervalRef.current) {
                  clearInterval(timerIntervalRef.current);
                }
                setIsChecking(false);
                console.log('✅ PIX REALMENTE PAGO - Aprovando');
                toast({
                  title: "PIX Pago!",
                  description: "Pagamento confirmado pelo Pagar.me"
                });
                onSuccess(response.id);
              } else if (status.status === 'failed' || (status.charges && status.charges[0]?.status === 'failed')) {
                if (checkIntervalRef.current) {
                  clearInterval(checkIntervalRef.current);
                }
                if (timerIntervalRef.current) {
                  clearInterval(timerIntervalRef.current);
                }
                setIsChecking(false);
                console.log('❌ PIX falhou');
                toast({
                  title: "PIX Falhou",
                  description: "O pagamento não foi aprovado",
                  variant: "destructive"
                });
              } else {
                console.log('⏳ PIX ainda pendente, continuando verificação...');
              }
            } catch (error) {
              console.error('❌ Erro ao verificar status:', error);
            }
          }, 5000); // Verificar a cada 5 segundos

          // Limpar verificação após 10 minutos
          setTimeout(() => {
            if (checkIntervalRef.current) {
              clearInterval(checkIntervalRef.current);
              setIsChecking(false);
            }
          }, 600000);
        } else {
          throw new Error('QR Code não foi gerado corretamente');
        }
      } else {
        throw new Error('Resposta inválida da API');
      }
      
    } catch (error) {
      console.error('Erro ao criar PIX:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao gerar PIX. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Limpar todos os intervalos
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    setIsChecking(false);
    setPixData(null);
    setTimeLeft(300);
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Cleanup ao desmontar o componente
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  if (!pixData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Pagamento via PIX
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#1E486F] mb-2">
              {formatCurrency(amount)}
            </p>
            <p className="text-gray-600 mb-4">
              Pagamento instantâneo e seguro
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={createPixPayment} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Gerando PIX...' : 'Gerar PIX'}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          PIX Gerado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-orange-500 font-medium">
              Expira em: {formatTime(timeLeft)}
            </span>
          </div>
          
          <div className="bg-white p-4 rounded-lg border mb-4">
            <img 
              src={generateQRCodeImage(pixData.qr_code)} 
              alt="QR Code PIX" 
              className="w-48 h-48 mx-auto mb-4 bg-gray-100 rounded"
              onError={(e) => {
                console.error('Erro ao carregar QR code:', e);
                e.currentTarget.style.display = 'none';
              }}
            />
            <p className="text-sm text-gray-600 mb-2">
              Escaneie o QR Code ou copie o código abaixo:
            </p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs font-mono break-all mb-2">
              {pixData.qr_code}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => copyToClipboard(pixData.qr_code)}
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar Código PIX
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              {isChecking ? 'Verificando pagamento...' : 'Aguardando confirmação do pagamento...'}
            </p>
            <div className="animate-pulse mt-2">
              <div className="h-2 bg-blue-200 rounded-full">
                <div className="h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        <Button variant="outline" onClick={handleCancel} className="w-full">
          Cancelar Pagamento
        </Button>
      </CardContent>
    </Card>
  );
};

export default PixPayment;