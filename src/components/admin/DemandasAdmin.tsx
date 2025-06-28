
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Demanda {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  cidade: string;
  estado: string;
  urgencia: string;
  observacao: string;
  status: string;
  created_at: string;
  categorias?: { nome: string };
  subcategorias?: { nome: string };
}

const DemandasAdmin = () => {
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingDemanda, setViewingDemanda] = useState<Demanda | null>(null);
  
  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterCidade, setFilterCidade] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUrgencia, setFilterUrgencia] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    loadDemandas();
  }, []);

  const loadDemandas = async () => {
    try {
      const { data, error } = await supabase
        .from('demandas')
        .select(`
          *,
          categorias:categoria_id (nome),
          subcategorias:subcategoria_id (nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDemandas(data || []);
    } catch (error) {
      console.error('Erro ao carregar demandas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar demandas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Dados únicos para os filtros
  const uniqueEstados = useMemo(() => {
    const estados = [...new Set(demandas.map(d => d.estado).filter(Boolean))];
    return estados.sort();
  }, [demandas]);

  const uniqueCidades = useMemo(() => {
    let cidades = demandas.map(d => d.cidade).filter(Boolean);
    if (filterEstado) {
      cidades = demandas
        .filter(d => d.estado === filterEstado)
        .map(d => d.cidade)
        .filter(Boolean);
    }
    return [...new Set(cidades)].sort();
  }, [demandas, filterEstado]);

  // Demandas filtradas
  const filteredDemandas = useMemo(() => {
    return demandas.filter(demanda => {
      const matchesSearch = !searchTerm || 
        demanda.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        demanda.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        demanda.whatsapp.includes(searchTerm) ||
        demanda.categorias?.nome.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEstado = !filterEstado || demanda.estado === filterEstado;
      const matchesCidade = !filterCidade || demanda.cidade === filterCidade;
      const matchesStatus = !filterStatus || demanda.status === filterStatus;
      const matchesUrgencia = !filterUrgencia || demanda.urgencia === filterUrgencia;

      return matchesSearch && matchesEstado && matchesCidade && matchesStatus && matchesUrgencia;
    });
  }, [demandas, searchTerm, filterEstado, filterCidade, filterStatus, filterUrgencia]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterEstado('');
    setFilterCidade('');
    setFilterStatus('');
    setFilterUrgencia('');
  };

  const handleView = (demanda: Demanda) => {
    setViewingDemanda(demanda);
    setViewDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta demanda?')) return;

    try {
      const { error } = await supabase
        .from('demandas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Demanda excluída com sucesso!",
      });
      loadDemandas();
    } catch (error) {
      console.error('Erro ao excluir demanda:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir demanda.",
        variant: "destructive",
      });
    }
  };

  const formatUrgencia = (urgencia: string) => {
    const map = {
      'preciso_com_urgencia': 'Urgente',
      'quero_para_esses_dias': 'Breve',
      'nao_tenho_tanta_pressa': 'Flexível',
      'so_orcamento': 'Orçamento'
    };
    return map[urgencia as keyof typeof map] || urgencia;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'default';
      case 'em_andamento': return 'secondary';
      case 'concluida': return 'default';
      case 'cancelada': return 'destructive';
      default: return 'default';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando demandas...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Gerenciar Demandas</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            {filteredDemandas.length} de {demandas.length} demandas
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filtros</span>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Estados</SelectItem>
                {uniqueEstados.map(estado => (
                  <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterCidade} onValueChange={setFilterCidade}>
              <SelectTrigger>
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as Cidades</SelectItem>
                {uniqueCidades.map(cidade => (
                  <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterUrgencia} onValueChange={setFilterUrgencia}>
              <SelectTrigger>
                <SelectValue placeholder="Urgência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="preciso_com_urgencia">Urgente</SelectItem>
                <SelectItem value="quero_para_esses_dias">Breve</SelectItem>
                <SelectItem value="nao_tenho_tanta_pressa">Flexível</SelectItem>
                <SelectItem value="so_orcamento">Orçamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Cidade/Estado</TableHead>
              <TableHead>Urgência</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDemandas.map((demanda) => (
              <TableRow key={demanda.id}>
                <TableCell className="font-medium">{demanda.nome}</TableCell>
                <TableCell>{demanda.categorias?.nome}</TableCell>
                <TableCell>{demanda.cidade}/{demanda.estado}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {formatUrgencia(demanda.urgencia)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(demanda.status)}>
                    {demanda.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(demanda.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(demanda)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(demanda.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Dialog para visualizar detalhes */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes da Demanda</DialogTitle>
            </DialogHeader>
            {viewingDemanda && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Cliente:</strong> {viewingDemanda.nome}
                  </div>
                  <div>
                    <strong>Email:</strong> {viewingDemanda.email}
                  </div>
                  <div>
                    <strong>WhatsApp:</strong> {viewingDemanda.whatsapp}
                  </div>
                  <div>
                    <strong>Categoria:</strong> {viewingDemanda.categorias?.nome}
                  </div>
                  <div>
                    <strong>Subcategoria:</strong> {viewingDemanda.subcategorias?.nome}
                  </div>
                  <div>
                    <strong>Cidade:</strong> {viewingDemanda.cidade}
                  </div>
                  <div>
                    <strong>Estado:</strong> {viewingDemanda.estado}
                  </div>
                  <div>
                    <strong>Urgência:</strong> {formatUrgencia(viewingDemanda.urgencia)}
                  </div>
                  <div>
                    <strong>Status:</strong> {viewingDemanda.status}
                  </div>
                  <div>
                    <strong>Data:</strong> {new Date(viewingDemanda.created_at).toLocaleString()}
                  </div>
                </div>
                {viewingDemanda.observacao && (
                  <div>
                    <strong>Observações:</strong>
                    <p className="mt-2 p-3 bg-gray-50 rounded-lg">{viewingDemanda.observacao}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default DemandasAdmin;
