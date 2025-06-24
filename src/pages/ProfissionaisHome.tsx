
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, User, Phone, Mail } from 'lucide-react';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ryvcwjajgspbzxzncpfi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dmN3amFqZ3NwYnp4em5jcGZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODkzNjAsImV4cCI6MjA2MjE2NTM2MH0.1GhRnk2-YbL4awFz0c9bFWOleO_cFJKjvfyWQ30dxo8'
);

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
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (categoriasError) throw categoriasError;
      setCategorias(categoriasData || []);

      // Carregar demandas com nomes das categorias
      const { data: demandasData, error: demandasError } = await supabase
        .from('demandas')
        .select(`
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
        `)
        .eq('status', 'pendente')
        .order('created_at', { ascending: false });

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
      'preciso_com_urgencia': { text: 'Urgente', color: 'bg-red-500' },
      'quero_para_esses_dias': { text: 'Breve', color: 'bg-orange-500' },
      'nao_tenho_tanta_pressa': { text: 'Flexível', color: 'bg-green-500' },
      'so_orcamento': { text: 'Orçamento', color: 'bg-blue-500' }
    };
    return urgenciaMap[urgencia as keyof typeof urgenciaMap] || { text: urgencia, color: 'bg-gray-500' };
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

  const demandasFiltradas = categoriaFiltro 
    ? demandas.filter(d => d.categoria_nome === categoriaFiltro)
    : demandas;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">ServiçoPro</h1>
            </div>
            <nav className="flex space-x-4">
              <Button variant="ghost">Minhas Propostas</Button>
              <Button variant="ghost">Perfil</Button>
              <Button variant="outline">Sair</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Encontre Trabalhos na Sua Área
            </h2>
            <p className="text-xl opacity-90">
              Conecte-se com clientes que precisam dos seus serviços
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtro por Categorias */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Filtrar por Categoria</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={categoriaFiltro === '' ? 'default' : 'outline'}
              onClick={() => setCategoriaFiltro('')}
              className="mb-2"
            >
              Todas as Categorias
            </Button>
            {categorias.map((categoria) => {
              const { icon: Icon, color } = getCategoryIcon(categoria.nome);
              return (
                <Button
                  key={categoria.id}
                  variant={categoriaFiltro === categoria.nome ? 'default' : 'outline'}
                  onClick={() => setCategoriaFiltro(categoria.nome)}
                  className="mb-2 flex items-center gap-2"
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                  {categoria.nome}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Lista de Demandas */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">
              Trabalhos Disponíveis ({demandasFiltradas.length})
            </h3>
          </div>

          {demandasFiltradas.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Nenhuma demanda encontrada para os filtros selecionados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {demandasFiltradas.map((demanda) => {
                const { icon: Icon, color } = getCategoryIcon(demanda.categoria_nome);
                const urgenciaInfo = formatUrgencia(demanda.urgencia);
                
                return (
                  <Card key={demanda.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Icon className={`h-6 w-6 ${color}`} />
                          <div>
                            <CardTitle className="text-lg">
                              {demanda.categoria_nome} - {demanda.subcategoria_nome}
                            </CardTitle>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {demanda.cidade}, {demanda.estado}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatTempo(demanda.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Badge className={`${urgenciaInfo.color} text-white`}>
                          {urgenciaInfo.text}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{demanda.nome}</span>
                        </div>
                        
                        {demanda.observacao && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700">{demanda.observacao}</p>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center pt-4">
                          <div className="flex gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {demanda.whatsapp}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {demanda.email}
                            </div>
                          </div>
                          <Button className="bg-green-600 hover:bg-green-700">
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
    </div>
  );
};

export default ProfissionaisHome;
