import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, User, Phone, Mail, Bell, Search, Home, Briefcase, Settings, Wrench } from 'lucide-react';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { createClient } from '@supabase/supabase-js';

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
        color: 'bg-red-500'
      },
      'quero_para_esses_dias': {
        text: 'Breve',
        color: 'bg-orange-500'
      },
      'nao_tenho_tanta_pressa': {
        text: 'Flexível',
        color: 'bg-green-500'
      },
      'so_orcamento': {
        text: 'Orçamento',
        color: 'bg-blue-500'
      }
    };
    return urgenciaMap[urgencia as keyof typeof urgenciaMap] || {
      text: urgencia,
      color: 'bg-gray-500'
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

  const demandasFiltradas = categoriaFiltro ? demandas.filter(d => d.categoria_nome === categoriaFiltro) : demandas;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Carregando oportunidades...</div>
      </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
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
            <Button variant="outline" size="sm" className="md:hidden">Menu</Button>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="relative">
        <img alt="Banner Profissionais" src="/lovable-uploads/banner-profissionais.png" className="w-full h-24 sm:h-32 md:h-40 lg:h-48 object-cover" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filtro por Categorias - Horizontal com bordas coloridas */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Filtrar por Categoria</h3>
          <div className="overflow-x-auto">
            <div className="flex gap-3 pb-2 min-w-max">
              <Button 
                variant={categoriaFiltro === '' ? 'default' : 'outline'} 
                onClick={() => setCategoriaFiltro('')} 
                className={`flex-shrink-0 ${categoriaFiltro === '' ? 'bg-[#CB0533] hover:bg-[#a50429] text-white border-[#CB0533]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`} 
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
                    className={`flex-shrink-0 flex items-center gap-2 font-medium transition-all hover:shadow-md ${
                      isSelected 
                        ? `${borderColor} ${color} bg-white border-2 shadow-md` 
                        : `${borderColor} ${color} bg-white border-2 hover:shadow-md`
                    }`}
                    size="sm"
                  >
                    <Icon className={`h-4 w-4 ${color.replace('text-', 'text-')}`} />
                    {categoria.nome} ({count})
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lista de Demandas */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
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
            <div className="grid gap-4">
              {demandasFiltradas.map(demanda => {
                const { icon: Icon, color } = getCategoryIcon(demanda.categoria_nome);
                const urgenciaInfo = formatUrgencia(demanda.urgencia);
                
                return (
                  <Card key={demanda.id} className="hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header do Card */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className={`p-3 rounded-xl shadow-sm ${color.replace('text-', 'bg-').replace('-600', '-100')} border ${color.replace('text-', 'border-')}`}>
                              <Icon className={`h-6 w-6 ${color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
                                {demanda.categoria_nome} - {demanda.subcategoria_nome}
                              </h4>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{demanda.cidade}, {demanda.estado}</span>
                                </div>
                                <span className="hidden sm:inline">•</span>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatTempo(demanda.created_at)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Badge className={`${urgenciaInfo.color} text-white flex-shrink-0 px-3 py-1`}>
                            {urgenciaInfo.text}
                          </Badge>
                        </div>

                        {/* Informações do Cliente */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <User className="h-4 w-4 text-gray-600" />
                            <span className="font-medium text-gray-900">{demanda.nome}</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{demanda.whatsapp}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span className="truncate">{demanda.email}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Observação */}
                        {demanda.observacao && (
                          <div className="border-l-4 border-[#CB0533] pl-4 py-2">
                            <p className="text-sm text-gray-700 italic">"{demanda.observacao}"</p>
                          </div>
                        )}
                        
                        {/* Botão de Ação */}
                        <div className="flex justify-end pt-2">
                          <Button className="bg-[#1B4970] hover:bg-[#153a5b] text-white px-6 py-2 font-medium">
                            Enviar Proposta
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around py-2">
          <button className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-[#CB0533] transition-colors">
            <Home className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3 text-[#CB0533] transition-colors">
            <Briefcase className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Demandas</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-[#CB0533] transition-colors">
            <Wrench className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Equipamentos</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-[#CB0533] transition-colors">
            <Settings className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default ProfissionaisHome;
