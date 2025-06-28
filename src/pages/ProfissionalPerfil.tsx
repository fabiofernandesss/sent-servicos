
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ArrowLeft, Phone, User, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import MobileNavbar from '@/components/MobileNavbar';
import MobileMenu from '@/components/MobileMenu';

const ProfissionalPerfil = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'login' | 'otp' | 'cadastro' | 'perfil'>('login');
  const [whatsapp, setWhatsapp] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [profissional, setProfissional] = useState(null);

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
      
      const message = `🔐 *Código de Verificação - Perfil Profissional*

Seu código de acesso é: *${code}*

⚠️ Este código expira em 5 minutos.
⚠️ Não compartilhe este código com ninguém.

Se você não solicitou este código, ignore esta mensagem.`;

      const response = await fetch('https://9045.bubblewhats.com/send-message', {
        method: 'POST',
        headers: {
          'Authorization': 'YzFkMGVkNzUwYzBjMjlhYzg0ZmJjYmU3',
          'Content-Type': 'application/json',
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

  const verifyOTP = () => {
    const savedCode = localStorage.getItem('otp_code');
    const savedWhatsapp = localStorage.getItem('otp_whatsapp');
    
    if (otpCode === savedCode && whatsapp === savedWhatsapp) {
      // Limpar código usado
      localStorage.removeItem('otp_code');
      localStorage.removeItem('otp_whatsapp');
      
      // Verificar se profissional existe (simulação)
      const existeProfissional = false; // Aqui você faria a consulta no Supabase
      
      if (existeProfissional) {
        setStep('perfil');
      } else {
        setStep('cadastro');
      }
    } else {
      toast({
        title: "Código Inválido",
        description: "Verifique o código e tente novamente",
        variant: "destructive"
      });
    }
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
            onChange={(e) => setWhatsapp(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button 
          onClick={sendOTP} 
          disabled={loading}
          className="w-full bg-[#1E486F] hover:bg-[#1E486F]/90"
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
          disabled={otpCode.length !== 4}
          className="w-full bg-[#1E486F] hover:bg-[#1E486F]/90"
        >
          Verificar Código
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => setStep('login')}
          className="w-full"
        >
          Voltar
        </Button>
      </CardContent>
    </Card>
  );

  const renderCadastro = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-[#1E486F]">Cadastro Profissional</CardTitle>
        <p className="text-gray-600">Complete seu perfil profissional</p>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-600">Formulário de cadastro será implementado aqui</p>
          <Button 
            onClick={() => setStep('perfil')}
            className="mt-4 bg-[#1E486F] hover:bg-[#1E486F]/90"
          >
            Simular Cadastro Completo
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderPerfil = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-[#1E486F]">Meu Perfil</CardTitle>
        <p className="text-gray-600">Gerencie suas informações profissionais</p>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-600">Área do perfil do profissional será implementada aqui</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-gray-600"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <img 
                src="https://9088bc4d5081958e858f937822185f7b.cdn.bubble.io/cdn-cgi/image/w=256,h=53,f=auto,dpr=1.25,fit=contain/f1716158171404x251547051884103870/Ativo%201.png" 
                alt="Sent Serviços" 
                className="h-5 w-auto" 
              />
            </div>
            <nav className="hidden md:flex space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-600" onClick={() => navigate('/')}>Início</Button>
              <Button variant="ghost" size="sm" className="text-gray-600" onClick={() => navigate('/equipamentos')}>Equipamentos</Button>
              <Button variant="ghost" size="sm" className="text-[#1c4970]">Perfil</Button>
            </nav>
            <MobileMenu />
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'login' && renderLogin()}
        {step === 'otp' && renderOTP()}
        {step === 'cadastro' && renderCadastro()}
        {step === 'perfil' && renderPerfil()}
      </div>

      {/* Mobile Navbar */}
      <MobileNavbar />
    </div>
  );
};

export default ProfissionalPerfil;
