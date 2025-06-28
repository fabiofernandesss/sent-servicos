import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, User, Phone, Mail, Bell, Search, Menu } from 'lucide-react';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { createClient } from '@supabase/supabase-js';
import MobileNavbar from '@/components/MobileNavbar';

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
interface Categoria {
  id: string;
  nome: string;
}
const ProfissionaisHome = () => {
  const navigate = useNavigate();
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      // Carregar categorias
      const {
        data: categoriasData,
        error: categoriasError
      } = await supabase.from('categorias').select('*').eq('ativo', true).order('nome');
      if (categoriasError) throw categoriasError;
      setCategorias(categoriasData || []);

      // Carregar demandas com nomes das categorias
      const {
        data: demandasData,
        error: demandasError
      } = await supabase.from('demandas').select(`
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
        `).eq('status', 'pendente').order('created_at', {
        ascending: false
      });
      if (demandasError) throw demandasError;

      // Transformar dados para o formato esperado
      const demandasFormatadas = demandasData?.map((demanda: any) => ({
        id: demanda.id,
        nome: demanda.nome,
        email: demanda.email,
        whatsapp: demanda.whatsapp,
        cidade: demanda.cidade,
        estado: demanda.estado,
        categoria_nome: demanda.categorias.nome,
        subcategoria_nome: demanda.subcategorias.nome,
        urgencia: demanda.urgencia,
        observacao: demanda.observacao,
        created_at: demanda.created_at
      })) || [];
      setDemandas(demandasFormatadas);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
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
    return `${diffDias}d atrás`;
  };
  const maskContact = (contact: string, type: 'phone' | 'email') => {
    if (type === 'phone') {
      return contact.substring(0, 5) + '*'.repeat(contact.length - 5);
    } else {
      const [user, domain] = contact.split('@');
      return user.substring(0, 3) + '*'.repeat(user.length - 3) + '@' + domain;
    }
  };
  const demandasFiltradas = categoriaFiltro ? demandas.filter(d => d.categoria_nome === categoriaFiltro) : demandas;
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Carregando oportunidades...</div>
      </div>;
  }
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="https://9088bc4d5081958e858f937822185f7b.cdn.bubble.io/cdn-cgi/image/w=256,h=53,f=auto,dpr=1.25,fit=contain/f1716158171404x251547051884103870/Ativo%201.png" alt="Sent Serviços" className="h-5 w-auto" />
            </div>
            <nav className="hidden md:flex space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <Bell className="h-4 w-4 mr-1" />
                Notificações
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600">Minhas Propostas</Button>
              <Button variant="ghost" size="sm" className="text-gray-600">Perfil</Button>
              <Button variant="outline" size="sm">Sair</Button>
            </nav>
            <Button 
              variant="outline" 
              size="sm" 
              className="md:hidden"
              onClick={() => navigate('/')}
            >
              <Menu className="h-4 w-4 mr-1" />
              Menu
            </Button>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="relative">
        <img alt="Os melhores profissionais" src="/lovable-uploads/af1a336b-3a05-412b-aa88-9b754e687d34.png" className="w-full h-24 sm:h-32 md:h-40 lg:h-48 object-cover" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filtro por Categorias - Horizontal */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Filtrar por Categoria</h3>
          <div className="overflow-x-auto">
            <div className="flex gap-3 pb-2 min-w-max">
              <Button 
                variant="outline" 
                onClick={() => setCategoriaFiltro('')} 
                className={`flex-shrink-0 ${categoriaFiltro === '' ? 'border-[#CB0533] text-[#CB0533] bg-[#CB0533]/10' : 'border-gray-300'}`} 
                size="sm"
              >
                Todas ({demandas.length})
              </Button>
              {categorias.map(categoria => {
                const { icon: Icon, color, borderColor } = getCategoryIcon(categoria.nome);
                const count = demandas.filter(d => d.categoria_nome === categoria.nome).length;
                const isSelected = categoriaFiltro === categoria.nome;
                
                return (
                  <Button 
                    key={categoria.id} 
                    variant="outline" 
                    onClick={() => setCategoriaFiltro(categoria.nome)} 
                    className={`flex-shrink-0 flex items-center gap-2 ${borderColor} ${color} bg-white hover:bg-gray-50 ${isSelected ? 'ring-2 ring-offset-1 ring-current' : ''}`} 
                    size="sm"
                  >
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span className="whitespace-nowrap">{categoria.nome} ({count})</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lista de Demandas */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <h3 className="text-xl font-semibold text-gray-800">
              Oportunidades Disponíveis
            </h3>
            <span className="text-sm text-gray-500">
              {demandasFiltradas.length} resultado{demandasFiltradas.length !== 1 ? 's' : ''}
            </span>
          </div>

          {demandasFiltradas.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="max-w-md mx-auto">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma oportunidade encontrada
                  </h3>
                  <p className="text-gray-500">
                    Não há demandas disponíveis para os filtros selecionados. Tente selecionar uma categoria diferente.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {demandasFiltradas.map(demanda => {
                const { icon: Icon, color } = getCategoryIcon(demanda.categoria_nome);
                const urgenciaInfo = formatUrgencia(demanda.urgencia);
                
                return (
                  <Card key={demanda.id} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 overflow-hidden">
                    <div className="relative">
                      {/* Header com gradiente */}
                      <div className="bg-gradient-to-r from-[#1E486F] to-blue-700 p-4 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1E486F]/90 to-blue-800/70"></div>
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">
                                {demanda.categoria_nome}
                              </h3>
                              <p className="text-white/90 text-sm">
                                {demanda.subcategoria_nome}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${urgenciaInfo.color} text-white border-0 shadow-lg px-3 py-1`}>
                            {urgenciaInfo.text}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-6 space-y-4">
                        {/* Info do Cliente */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="p-2 bg-white rounded-full shadow-sm">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{demanda.nome}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{demanda.cidade}, {demanda.estado}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTempo(demanda.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Observação com destaque */}
                        {demanda.observacao && (
                          <div className="relative">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                            <div className="pl-4 py-2">
                              <p className="text-sm text-gray-700 leading-relaxed italic">
                                "{demanda.observacao}"
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Contatos mascarados */}
                        <div className="space-y-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-amber-600" />
                            <span className="text-gray-600">WhatsApp:</span>
                            <span className="font-mono text-gray-800">{maskContact(demanda.whatsapp, 'phone')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-amber-600" />
                            <span className="text-gray-600">Email:</span>
                            <span className="font-mono text-gray-800">{maskContact(demanda.email, 'email')}</span>
                          </div>
                          <p className="text-xs text-amber-700 font-medium">
                            🔒 Dados completos liberados após pagamento
                          </p>
                        </div>

                        {/* Botão de ação destacado */}
                        <Button 
                          className="w-full bg-gradient-to-r from-[#1E486F] to-blue-700 hover:from-[#1E486F]/90 hover:to-blue-800 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" 
                          size="lg"
                        >
                          💼 Enviar Proposta
                        </Button>
                      </CardContent>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navbar */}
      <MobileNavbar />
    </div>
  );
};

export default ProfissionaisHome;
