import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MapPin, Clock, User, Phone, Mail, ArrowLeft, Eye, EyeOff, ShoppingCart, MessageCircle, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { createClient } from '@supabase/supabase-js';
import { useProfissionalSession } from '@/hooks/useProfissionalSession';
import { demandasService, DadosCliente } from '@/services/demandasService';
import { useToast } from '@/hooks/use-toast';

const supabase = createClient('https://ryvcwjajgspbzxzncpfi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dmN3amFqZ3NwYnp4em5jcGZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODkzNjAsImV4cCI6MjA2MjE2NTM2MH0.1GhRnk2-YbL4awFz0c9bFWOleO_cFJKjvfyWQ30dxo8');

interface Demanda {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  cidade: string;
  estado: string;
  categoria_nome: string;
  subcategoria_nome: string;
  urgencia: string;
  observacao: string;
  created_at: string;
}

const DemandaDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profissionalLogado, refreshSaldo } = useProfissionalSession();
  const { toast } = useToast();
  
  const [demanda, setDemanda] = useState<Demanda | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContacts, setShowContacts] = useState(false);
  const [comprando, setComprando] = useState(false);
  const [demandaComprada, setDemandaComprada] = useState(false);
  const [dadosCompra, setDadosCompra] = useState<any>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    if (id) {
      loadDemanda();
      verificarSeComprada();
    }
  }, [id]);

  const loadDemanda = async () => {
    try {
      const { data, error } = await supabase.from('demandas').select(`
          id,
          nome,
          email,
          whatsapp,
          cidade,
          estado,
          urgencia,
          observacao,
          created_at,
          categorias!inner(nome),
          subcategorias!inner(nome)
        `).eq('id', id).single();
      
      if (error) throw error;
      
      if (data) {
        setDemanda({
          id: data.id,
          nome: data.nome,
          email: data.email,
          whatsapp: data.whatsapp,
          cidade: data.cidade,
          estado: data.estado,
          categoria_nome: (data.categorias as any).nome,
          subcategoria_nome: (data.subcategorias as any).nome,
          urgencia: data.urgencia,
          observacao: data.observacao,
          created_at: data.created_at
        });
      }
    } catch (error) {
      console.error('Erro ao carregar demanda:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da demanda",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verificarSeComprada = async () => {
    if (!id) return;
    
    try {
      const resultado = await demandasService.verificarDemandaComprada(id);
      
      if (resultado.comprada) {
        setDemandaComprada(true);
        setDadosCompra(resultado);
        
        // Se foi comprada pelo profissional logado, mostrar contatos
        if (profissionalLogado && resultado.profissional_id === profissionalLogado.id) {
          setShowContacts(true);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar se demanda foi comprada:', error);
    }
  };

  const handleComprarDemanda = async () => {
    if (!profissionalLogado) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para comprar demandas",
        variant: "destructive"
      });
      return;
    }

    if (!demanda) return;

    setComprando(true);
    
    try {
      const resultado = await demandasService.comprarDemanda(
        demanda.id, 
        profissionalLogado.id, 
        5.00 // Valor fixo de R$ 5,00
      );

      if (resultado.success) {
        setDemandaComprada(true);
        setDadosCompra(resultado);
        setShowContacts(true);
        setShowSuccessDialog(true);
        
        // Atualizar saldo na sessão
        await refreshSaldo();
        
        toast({
          title: "Demanda comprada!",
          description: "Você agora tem acesso aos dados do cliente",
        });
      }
    } catch (error: any) {
      console.error('Erro ao comprar demanda:', error);
      toast({
        title: "Erro ao comprar",
        description: error.message || "Erro desconhecido ao comprar demanda",
        variant: "destructive"
      });
    } finally {
      setComprando(false);
    }
  };

  const handleAbrirWhatsApp = () => {
    if (!demanda || !profissionalLogado) return;

    const dadosCliente: DadosCliente = {
      nome: demanda.nome,
      whatsapp: demanda.whatsapp,
      email: demanda.email,
      cidade: demanda.cidade,
      estado: demanda.estado,
      observacao: demanda.observacao
    };

    const mensagem = demandasService.gerarMensagemWhatsApp(
      dadosCliente,
      profissionalLogado.nome,
      profissionalLogado.whatsapp
    );

    demandasService.abrirWhatsApp(demanda.whatsapp, mensagem);
  };

  const handleCopiarDados = async () => {
    if (!demanda) return;

    try {
      const dadosCliente: DadosCliente = {
        nome: demanda.nome,
        whatsapp: demanda.whatsapp,
        email: demanda.email,
        cidade: demanda.cidade,
        estado: demanda.estado,
        observacao: demanda.observacao
      };

      await demandasService.copiarDadosCliente(dadosCliente);
      
      toast({
        title: "Dados copiados!",
        description: "Informações do cliente copiadas para área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao copiar dados do cliente",
        variant: "destructive"
      });
    }
  };

  const formatUrgencia = (urgencia: string) => {
    const urgenciaMap = {
      'preciso_com_urgencia': {
        text: 'Urgente',
        color: 'bg-gradient-to-r from-red-500 to-red-600'
      },
      'quero_para_esses_dias': {
        text: 'Breve',
        color: 'bg-gradient-to-r from-orange-500 to-orange-600'
      },
      'nao_tenho_tanta_pressa': {
        text: 'Flexível',
        color: 'bg-gradient-to-r from-green-500 to-green-600'
      },
      'so_orcamento': {
        text: 'Orçamento',
        color: 'bg-gradient-to-r from-blue-500 to-blue-600'
      }
    };
    return urgenciaMap[urgencia as keyof typeof urgenciaMap] || {
      text: urgencia,
      color: 'bg-gradient-to-r from-gray-500 to-gray-600'
    };
  };

  const formatTempo = (created_at: string) => {
    const agora = new Date();
    const criacao = new Date(created_at);
    const diffMs = agora.getTime() - criacao.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHoras < 1) return 'Agora mesmo';
    if (diffHoras < 24) return `${diffHoras}h atrás`;
    const diffDias = Math.floor(diffHoras / 24);
    return `${diffDias} dias atrás`;
  };

  const maskContact = (contact: string, type: 'phone' | 'email') => {
    if (type === 'phone') {
      return contact.substring(0, 5) + '*'.repeat(contact.length - 5);
    } else {
      const [user, domain] = contact.split('@');
      return user.substring(0, 3) + '*'.repeat(user.length - 3) + '@' + domain;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Carregando demanda...</div>
      </div>
    );
  }

  if (!demanda) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Demanda não encontrada</h2>
          <Button onClick={() => navigate('/profissionais')}>
            Voltar para oportunidades
          </Button>
        </div>
      </div>
    );
  }

  const { icon: Icon, color } = getCategoryIcon(demanda.categoria_nome);
  const urgenciaInfo = formatUrgencia(demanda.urgencia);
  const saldoAtual = profissionalLogado?.saldo || 0;
  const valorDemanda = 5.00;
  const saldoSuficiente = saldoAtual >= valorDemanda;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/profissionais')} className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <img src="https://9088bc4d5081958e858f937822185f7b.cdn.bubble.io/cdn-cgi/image/w=256,h=53,f=auto,dpr=1.25,fit=contain/f1716158171404x251547051884103870/Ativo%201.png" alt="Sent Serviços" className="h-5 w-auto" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          {/* Header do Card */}
          <div className="border-2 border-[#F3F3F3] bg-transparent p-6 relative overflow-hidden rounded-t-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#1E486F]/10 border border-[#1E486F] rounded-full">
                  <Icon className="h-6 w-6 text-[#1E486F]" />
                </div>
                <div>
                  <h1 className="font-bold text-[#1E486F] text-lg">
                    {demanda.categoria_nome}
                  </h1>
                  <p className="text-gray-600 text-xs">
                    {demanda.subcategoria_nome}
                  </p>
                </div>
              </div>
              <Badge className={`${urgenciaInfo.color} text-white border-0 shadow-lg px-4 py-2 text-sm`}>
                {urgenciaInfo.text}
              </Badge>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{demanda.cidade}, {demanda.estado}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{formatTempo(demanda.created_at)}</span>
              </div>
            </div>

            {/* Status da compra */}
            {demandaComprada && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    ✅ Demanda comprada com sucesso!
                  </span>
                </div>
                {dadosCompra && (
                  <p className="text-green-700 text-sm mt-1">
                    Valor pago: {formatCurrency(dadosCompra.valor_pago)}
                  </p>
                )}
              </div>
            )}
          </div>

          <CardContent className="p-6 space-y-6 bg-white">
            {/* Informações do Cliente */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white rounded-full shadow-sm">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{demanda.nome}</h3>
                  <p className="text-sm text-gray-500">Cliente solicitante</p>
                </div>
              </div>
            </div>

            {/* Descrição da Demanda */}
            {demanda.observacao && (
              <div className="relative">
                <h3 className="font-semibold text-lg text-gray-900 mb-3">Descrição da Demanda</h3>
                <div className="absolute left-0 top-8 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full bg-slate-200"></div>
                <div className="pl-6 py-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <p className="text-gray-700 leading-relaxed text-base">
                    "{demanda.observacao}"
                  </p>
                </div>
              </div>
            )}

            {/* Contatos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-gray-900">Informações de Contato</h3>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-base">
                    <Phone className="h-5 w-5 text-amber-600" />
                    <span className="text-gray-600 font-medium">WhatsApp:</span>
                    <span className="font-mono text-gray-800">
                      {showContacts ? demanda.whatsapp : maskContact(demanda.whatsapp, 'phone')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-base">
                    <Mail className="h-5 w-5 text-amber-600" />
                    <span className="text-gray-600 font-medium">Email:</span>
                    <span className="font-mono text-gray-800">
                      {showContacts ? demanda.email : maskContact(demanda.email, 'email')}
                    </span>
                  </div>
                </div>
                
                {!showContacts && (
                  <div className="mt-3 pt-3 border-t border-amber-300">
                    <p className="text-sm text-amber-700 font-medium">
                      🔒 Complete os dados para ver as informações completas de contato
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Botão de Ação */}
            <div className="pt-4 space-y-4">
              {!demandaComprada ? (
                <div className="space-y-4">
                  {/* Informações de saldo */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-800 font-medium">Valor da demanda: {formatCurrency(valorDemanda)}</p>
                        <p className="text-blue-600 text-sm">Seu saldo: {formatCurrency(saldoAtual)}</p>
                      </div>
                      {!saldoSuficiente && (
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Saldo insuficiente</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    className="w-full font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" 
                    style={{
                      backgroundColor: saldoSuficiente ? '#CB0533' : '#9CA3AF',
                      height: '54px',
                      borderRadius: '27px'
                    }}
                    disabled={!saldoSuficiente || comprando}
                    onClick={handleComprarDemanda}
                  >
                    {comprando ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        {saldoSuficiente ? 'Comprar Demanda' : 'Saldo Insuficiente'}
                      </div>
                    )}
                  </Button>

                  {!saldoSuficiente && (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => navigate('/recarga')}
                    >
                      Fazer Recarga
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Button 
                    className="w-full font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" 
                    style={{
                      backgroundColor: '#25D366',
                      height: '54px',
                      borderRadius: '27px'
                    }}
                    onClick={handleAbrirWhatsApp}
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Falar com Cliente via WhatsApp
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleCopiarDados}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Dados do Cliente
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Sucesso */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Demanda comprada com sucesso!
            </DialogTitle>
            <DialogDescription>
              Agora você tem acesso aos dados completos do cliente. Entre em contato para oferecer seus serviços!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 text-sm">
                <strong>Cliente:</strong> {demanda.nome}<br/>
                <strong>WhatsApp:</strong> {demanda.whatsapp}<br/>
                <strong>Localização:</strong> {demanda.cidade}/{demanda.estado}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                onClick={handleAbrirWhatsApp}
                style={{ backgroundColor: '#25D366' }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handleCopiarDados}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar Dados
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DemandaDetalhes;