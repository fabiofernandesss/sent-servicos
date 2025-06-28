import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Categoria {
  id: number;
  nome: string;
  descricao: string | null;
  icone: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

const CategoriasAdmin = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [filteredCategorias, setFilteredCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    icone: '',
    ativo: true
  });

  useEffect(() => {
    fetchCategorias();
  }, []);

  useEffect(() => {
    let filtered = categorias;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(categoria =>
        categoria.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (categoria.descricao && categoria.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por status
    if (statusFilter !== 'todos') {
      const isActive = statusFilter === 'ativo';
      filtered = filtered.filter(categoria => categoria.ativo === isActive);
    }

    setFilteredCategorias(filtered);
  }, [categorias, searchTerm, statusFilter]);

  const fetchCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategorias(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar categorias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCategoria) {
        const { error } = await supabase
          .from('categorias')
          .update({
            nome: formData.nome,
            descricao: formData.descricao || null,
            icone: formData.icone || null,
            ativo: formData.ativo,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategoria.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Categoria atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('categorias')
          .insert([{
            nome: formData.nome,
            descricao: formData.descricao || null,
            icone: formData.icone || null,
            ativo: formData.ativo
          }]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Categoria criada com sucesso!",
        });
      }

      setDialogOpen(false);
      setEditingCategoria(null);
      setFormData({ nome: '', descricao: '', icone: '', ativo: true });
      fetchCategorias();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar categoria",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nome: categoria.nome,
      descricao: categoria.descricao || '',
      icone: categoria.icone || '',
      ativo: categoria.ativo
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso!",
      });
      fetchCategorias();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir categoria",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Categorias</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {filteredCategorias.length} de {categorias.length} categorias
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingCategoria(null);
                setFormData({ nome: '', descricao: '', icone: '', ativo: true });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="icone">Ícone</Label>
                  <Input
                    id="icone"
                    value={formData.icone}
                    onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                    placeholder="Ex: wrench, hammer, etc."
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={formData.ativo ? 'ativo' : 'inativo'} 
                    onValueChange={(value) => setFormData({ ...formData, ativo: value === 'ativo' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-48">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">Carregando...</div>
        ) : (
          <div className="space-y-2">
            {filteredCategorias.map((categoria) => (
              <div key={categoria.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{categoria.nome}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      categoria.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {categoria.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  {categoria.descricao && (
                    <p className="text-sm text-gray-600 mt-1">{categoria.descricao}</p>
                  )}
                  {categoria.icone && (
                    <p className="text-xs text-gray-500 mt-1">Ícone: {categoria.icone}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(categoria)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(categoria.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredCategorias.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma categoria encontrada
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoriasAdmin;
