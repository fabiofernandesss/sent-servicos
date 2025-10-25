import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ArrowLeft, Phone, User, CheckCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import MobileNavbar from '@/components/MobileNavbar';
import MobileMenu from '@/components/MobileMenu';
import FormularioProfissional from '@/components/FormularioProfissional';
import CarteiraCard from '@/components/CarteiraCard';
import ProfessionalLogoutMenu from '@/components/ProfessionalLogoutMenu';
import { Profissional, loadProfissionalByWhatsapp } from '@/services/supabaseService';
import { useProfissionalSession } from '@/hooks/useProfissionalSession';

const ProfissionalPerfil = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profissionalLogado, loading: sessionLoading, login, logout, refreshSaldo } = useProfissionalSession();
  const [step, setStep] = useState<'login' | 'otp' | 'form'>('login');
  const [whatsapp, setWhatsapp] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [profissional, setProfissional] = useState<Profissional | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Função para aplicar máscara de telefone
  const formatPhoneNumber = (value: string) => {
    // Remove todos os caracteres não numéricos
    const onlyNumbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (onlyNumbers.length <= 2) {
      return `(${onlyNumbers}`;
    } else if (onlyNumbers.length <= 7) {
      return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2)}`;
    } else {
      return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2, 7)}-${onlyNumbers.slice(7, 11)}`;
    }
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setWhatsapp(formatted);
  };

  // Se já estiver logado, mostrar diretamente o formulário
  if (!sessionLoading && profissionalLogado) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <img 
                  src="https://9088bc4d5081958e858f937822185f7b.cdn.bubble.io/cdn-cgi/image/w=256,h=53,f=auto,dpr=1.25,fit=contain/f1716158171404x251547051884103870/Ativo%201.png" 
                  alt="Sent Serviços" 
                  className="h-4 sm:h-5 w-auto" 
                />
              </div>
              <div className="flex items-center gap-2">
                <nav className="hidden md:flex space-x-2">
                  <Button 
                    variant="ghost" 
                    className="text-gray-600 font-bold text-sm lg:text-base" 
                    onClick={() => navigate('/')}
                    style={{
                      height: '44px',
                      borderRadius: '22px',
                      padding: '0 16px'
                    }}
                  >
                    Início
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-gray-600 font-bold text-sm lg:text-base" 
                    onClick={() => navigate('/equipamentos')}
                    style={{
                      height: '44px',
                      borderRadius: '22px',
                      padding: '0 16px'
                    }}
                  >
                    Equipamentos
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-[#1c4970] font-bold text-sm lg:text-base"
                    style={{
                      height: '44px',
                      borderRadius: '22px',
                      padding: '0 16px'
                    }}
                  >
                    Perfil
                  </Button>
                  {profissionalLogado && <ProfessionalLogoutMenu />}
                </nav>
                
                <MobileMenu />
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Carteira Card */}
          <CarteiraCard saldo={profissionalLogado.saldo || 0} />
          
          <FormularioProfissional 
            profissional={profissionalLogado} 
            whatsapp={profissionalLogado.whatsapp} 
            onSuccess={(updatedProfissional) => {
              login(updatedProfissional);
              toast({
                title: "Sucesso!",
                description: "Perfil atualizado com sucesso!"
              });
            }} 
          />
        </div>

        {/* Mobile Navbar */}
        <MobileNavbar />
      </div>
    );
  }

  const sendOTP = async () => {
    if (!whatsapp || whatsapp.length < 10) {
      toast({
        title: "Erro",
        description: "Por favor, insira um número de WhatsApp válido",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Gerar código OTP de 4 dígitos
      const code = Math.floor(1000 + Math.random() * 9000).toString();

      // Salvar código temporariamente (em produção, salvar no backend)
      localStorage.setItem('otp_code', code);
      localStorage.setItem('otp_whatsapp', whatsapp);

      // Enviar mensagem WhatsApp
      const phoneNumber = whatsapp.replace(/\D/g, '');
      const jid = `55${phoneNumber}`;
      const message = `🔒 ${code} Código Sent`;

      const response = await fetch('https://9045.bubblewhats.com/send-message', {
        method: 'POST',
        headers: {
          'Authorization': 'YzFkMGVkNzUwYzBjMjlhYzg0ZmJjYmU3',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jid: jid,
          message: message
        })
      });

      if (response.ok) {
        toast({
          title: "Código Enviado",
          description: "Verifique seu WhatsApp para o código de verificação"
        });
        setStep('otp');
      } else {
        throw new Error('Erro ao enviar código');
      }
    } catch (error) {
      console.error('Erro ao enviar OTP:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar código. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    const savedCode = localStorage.getItem('otp_code');
    const savedWhatsapp = localStorage.getItem('otp_whatsapp');

    if (otpCode === savedCode && whatsapp === savedWhatsapp) {
      // Limpar código usado
      localStorage.removeItem('otp_code');
      localStorage.removeItem('otp_whatsapp');

      setLoading(true);
      try {
        // Verificar se profissional existe no Supabase
        const profissionalExistente = await loadProfissionalByWhatsapp(whatsapp);
        
        if (profissionalExistente) {
          setProfissional(profissionalExistente);
          login(profissionalExistente);
          toast({
            title: "Bem-vindo de volta!",
            description: "Você pode editar suas informações abaixo"
          });
        } else {
          setProfissional(null);
          toast({
            title: "Novo Cadastro",
            description: "Complete seu cadastro para começar a receber demandas"
          });
        }
        setStep('form');
      } catch (error) {
        console.error('Erro ao verificar profissional:', error);
        toast({
          title: "Erro",
          description: "Erro ao verificar cadastro. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    } else {
      toast({
        title: "Código Inválido",
        description: "Verifique o código e tente novamente",
        variant: "destructive"
      });
    }
  };

  const handleFormSuccess = (savedProfissional: Profissional) => {
    login(savedProfissional);
    toast({
      title: "Sucesso!",
      description: profissional ? "Perfil atualizado com sucesso" : "Cadastro realizado com sucesso"
    });
  };

  const renderLogin = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
          <User className="h-8 w-8 text-[#1E486F]" />
        </div>
        <CardTitle className="text-2xl text-[#1E486F]">Acesso Profissional</CardTitle>
        <p className="text-gray-600">Digite seu WhatsApp para acessar seu perfil</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            type="tel"
            placeholder="(11) 99999-9999"
            value={whatsapp}
            onChange={handleWhatsappChange}
            className="mt-1"
            maxLength={15}
          />
        </div>
        <Button 
          onClick={sendOTP} 
          disabled={loading} 
          className="w-full bg-[#1E486F] hover:bg-[#1E486F]/90 font-bold transition-all duration-200"
          style={{
            height: '54px',
            borderRadius: '27px'
          }}
        >
          <Phone className="h-4 w-4 mr-2" />
          {loading ? 'Enviando...' : 'Enviar Código'}
        </Button>
      </CardContent>
    </Card>
  );

  const renderOTP = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl text-[#1E486F]">Verificar Código</CardTitle>
        <p className="text-gray-600">Digite o código de 4 dígitos enviado para seu WhatsApp</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <InputOTP value={otpCode} onChange={setOtpCode} maxLength={4}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button 
          onClick={verifyOTP} 
          disabled={otpCode.length !== 4 || loading} 
          className="w-full bg-[#1E486F] hover:bg-[#1E486F]/90 font-bold transition-all duration-200"
          style={{
            height: '54px',
            borderRadius: '27px'
          }}
        >
          {loading ? 'Verificando...' : 'Verificar Código'}
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => setStep('login')} 
          className="w-full font-bold"
          style={{
            height: '54px',
            borderRadius: '27px'
          }}
        >
          Voltar
        </Button>
      </CardContent>
    </Card>
  );

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="https://9088bc4d5081958e858f937822185f7b.cdn.bubble.io/cdn-cgi/image/w=256,h=53,f=auto,dpr=1.25,fit=contain/f1716158171404x251547051884103870/Ativo%201.png" 
                alt="Sent Serviços" 
                className="h-4 sm:h-5 w-auto" 
              />
            </div>
            <div className="flex items-center gap-2">
              <nav className="hidden md:flex space-x-2">
                <Button 
                  variant="ghost" 
                  className="text-gray-600 font-bold text-sm lg:text-base" 
                  onClick={() => navigate('/')}
                  style={{
                    height: '44px',
                    borderRadius: '22px',
                    padding: '0 16px'
                  }}
                >
                  Início
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-gray-600 font-bold text-sm lg:text-base" 
                  onClick={() => navigate('/equipamentos')}
                  style={{
                    height: '44px',
                    borderRadius: '22px',
                    padding: '0 16px'
                  }}
                >
                  Equipamentos
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-[#1c4970] font-bold text-sm lg:text-base"
                  style={{
                    height: '44px',
                    borderRadius: '22px',
                    padding: '0 16px'
                  }}
                >
                  Perfil
                </Button>
                {profissionalLogado && <ProfessionalLogoutMenu />}
              </nav>
              
              <MobileMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'login' && renderLogin()}
        {step === 'otp' && renderOTP()}
        {step === 'form' && (
          <FormularioProfissional 
            profissional={profissional} 
            whatsapp={whatsapp} 
            onSuccess={handleFormSuccess} 
          />
        )}
      </div>

      {/* Mobile Navbar */}
      <MobileNavbar />
    </div>
  );
};

export default ProfissionalPerfil;
