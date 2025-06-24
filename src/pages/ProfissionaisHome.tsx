import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, User, Phone, Mail, Bell, Search } from 'lucide-react';
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
  return <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="https://9088bc4d5081958e858f937822185f7b.cdn.bubble.io/cdn-cgi/image/w=256,h=53,f=auto,dpr=1.25,fit=contain/f1716158171404x251547051884103870/Ativo%201.png" alt="Sent Serviços" className="h-8 w-auto" />
              <span className="ml-2 text-sm text-gray-600 font-medium">Profissionais</span>
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
        <img alt="Os melhores profissionais" src="/lovable-uploads/af1a336b-3a05-412b-aa88-9b754e687d34.png" className="w-full h-15 sm:h-20 md:h-30 lg:h-30 object-cover" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filtro por Categorias - Horizontal */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Filtrar por Categoria</h3>
          <div className="overflow-x-auto">
            <div className="flex gap-3 pb-2 min-w-max">
              <Button variant={categoriaFiltro === '' ? 'default' : 'outline'} onClick={() => setCategoriaFiltro('')} className={`flex-shrink-0 ${categoriaFiltro === '' ? 'bg-[#CB0533] hover:bg-[#a50429] text-white' : ''}`} size="sm">
                Todas ({demandas.length})
              </Button>
              {categorias.map(categoria => {
              const {
                icon: Icon,
                color,
                bgColor
              } = getCategoryIcon(categoria.nome);
              const count = demandas.filter(d => d.categoria_nome === categoria.nome).length;
              const isSelected = categoriaFiltro === categoria.nome;
              return <Button key={categoria.id} variant="outline" onClick={() => setCategoriaFiltro(categoria.nome)} className={`flex-shrink-0 flex items-center gap-2 border-0 text-white font-medium ${isSelected ? 'ring-2 ring-white ring-offset-2' : ''} ${bgColor} hover:opacity-90`} size="sm">
                    <Icon className="h-4 w-4 text-white" />
                    {categoria.nome} ({count})
                  </Button>;
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

          {demandasFiltradas.length === 0 ? <Card className="text-center py-12">
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
            </Card> : <div className="grid gap-4">
              {demandasFiltradas.map(demanda => {
            const {
              icon: Icon,
              color
            } = getCategoryIcon(demanda.categoria_nome);
            const urgenciaInfo = formatUrgencia(demanda.urgencia);
            return <Card key={demanda.id} className="hover:shadow-md transition-all duration-200 border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <Icon className={`h-5 w-5 ${color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg text-gray-900 truncate">
                              {demanda.categoria_nome} - {demanda.subcategoria_nome}
                            </CardTitle>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {demanda.cidade}, {demanda.estado}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTempo(demanda.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Badge className={`${urgenciaInfo.color} text-white flex-shrink-0`}>
                          {urgenciaInfo.text}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{demanda.nome}</span>
                        </div>
                        
                        {demanda.observacao && <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700 line-clamp-2">{demanda.observacao}</p>
                          </div>}
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {demanda.whatsapp}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[200px]">{demanda.email}</span>
                            </div>
                          </div>
                          <Button className="bg-[#1B4970] hover:bg-[#153a5b] text-white flex-shrink-0" size="sm">
                            Enviar Proposta
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>;
          })}
            </div>}
        </div>
      </div>
    </div>;
};
export default ProfissionaisHome;