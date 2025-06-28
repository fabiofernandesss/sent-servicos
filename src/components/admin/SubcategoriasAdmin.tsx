
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Subcategoria {
  id: string;
  nome: string;
  descricao: string;
  categoria_id: string;
  ativo: boolean;
  created_at: string;
  categorias?: { nome: string };
}

interface Categoria {
  id: string;
  nome: string;
}

const SubcategoriasAdmin = () => {
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubcategoria, setEditingSubcategoria] = useState<Subcategoria | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria_id: '',
    ativo: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [subcategoriasResult, categoriasResult] = await Promise.all([
        supabase
          .from('subcategorias')
          .select(`
            *,
            categorias:categoria_id (nome)
          `)
          .order('nome'),
        supabase
          .from('categorias')
          .select('id, nome')
          .eq('ativo', true)
          .order('nome')
      ]);

      if (subcategoriasResult.error) throw subcategoriasResult.error;
      if (categoriasResult.error) throw categoriasResult.error;

      setSubcategorias(subcategoriasResult.data || []);
      setCategorias(categoriasResult.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSubcategoria) {
        const { error } = await supabase
          .from('subcategorias')
          .update(formData)
          .eq('id', editingSubcategoria.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Subcategoria atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('subcategorias')
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Subcategoria criada com sucesso!",
        });
      }

      setDialogOpen(false);
      setEditingSubcategoria(null);
      setFormData({ nome: '', descricao: '', categoria_id: '', ativo: true });
      loadData();
    } catch (error) {
      console.error('Erro ao salvar subcategoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar subcategoria.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (subcategoria: Subcategoria) => {
    setEditingSubcategoria(subcategoria);
    setFormData({
      nome: subcategoria.nome,
      descricao: subcategoria.descricao || '',
      categoria_id: subcategoria.categoria_id,
      ativo: subcategoria.ativo
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta subcategoria?')) return;

    try {
      const { error } = await supabase
        .from('subcategorias')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Subcategoria excluída com sucesso!",
      });
      loadData();
    } catch (error) {
      console.error('Erro ao excluir subcategoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir subcategoria.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando subcategorias...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gerenciar Subcategorias</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingSubcategoria(null);
              setFormData({ nome: '', descricao: '', categoria_id: '', ativo: true });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Subcategoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSubcategoria ? 'Editar Subcategoria' : 'Nova Subcategoria'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <Select
                  value={formData.categoria_id}
                  onValueChange={(value) => setFormData({ ...formData, categoria_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                />
                <label className="text-sm font-medium">Ativo</label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingSubcategoria ? 'Atualizar' : 'Criar'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subcategorias.map((subcategoria) => (
              <TableRow key={subcategoria.id}>
                <TableCell className="font-medium">{subcategoria.nome}</TableCell>
                <TableCell>{subcategoria.categorias?.nome}</TableCell>
                <TableCell>{subcategoria.descricao}</TableCell>
                <TableCell>
                  <Badge variant={subcategoria.ativo ? "default" : "secondary"}>
                    {subcategoria.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(subcategoria)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(subcategoria.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SubcategoriasAdmin;
