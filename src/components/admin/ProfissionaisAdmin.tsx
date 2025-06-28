
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Profissional {
  id: number;
  nome: string;
  cpf_cnpj: string;
  whatsapp: string;
  email: string;
  cidade: string;
  estado: string;
  saldo: number;
  desativado: boolean;
  aceita_diaria: boolean;
  valor_diaria: number;
}

const ProfissionaisAdmin = () => {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingProfissional, setEditingProfissional] = useState<Profissional | null>(null);
  const [viewingProfissional, setViewingProfissional] = useState<Profissional | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cpf_cnpj: '',
    whatsapp: '',
    email: '',
    cidade: '',
    estado: '',
    saldo: 0,
    desativado: false,
    aceita_diaria: false,
    valor_diaria: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProfissionais();
  }, []);

  const loadProfissionais = async () => {
    try {
      const { data, error } = await supabase
        .from('profissionais')
        .select('*')
        .order('nome');

      if (error) throw error;
      setProfissionais(data || []);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar profissionais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProfissional) {
        const { error } = await supabase
          .from('profissionais')
          .update(formData)
          .eq('id', editingProfissional.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Profissional atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('profissionais')
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Profissional criado com sucesso!",
        });
      }

      setDialogOpen(false);
      setEditingProfissional(null);
      setFormData({
        nome: '',
        cpf_cnpj: '',
        whatsapp: '',
        email: '',
        cidade: '',
        estado: '',
        saldo: 0,
        desativado: false,
        aceita_diaria: false,
        valor_diaria: 0
      });
      loadProfissionais();
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar profissional.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (profissional: Profissional) => {
    setEditingProfissional(profissional);
    setFormData({
      nome: profissional.nome,
      cpf_cnpj: profissional.cpf_cnpj,
      whatsapp: profissional.whatsapp,
      email: profissional.email || '',
      cidade: profissional.cidade || '',
      estado: profissional.estado || '',
      saldo: profissional.saldo || 0,
      desativado: profissional.desativado || false,
      aceita_diaria: profissional.aceita_diaria || false,
      valor_diaria: profissional.valor_diaria || 0
    });
    setDialogOpen(true);
  };

  const handleView = (profissional: Profissional) => {
    setViewingProfissional(profissional);
    setViewDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este profissional?')) return;

    try {
      const { error } = await supabase
        .from('profissionais')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Profissional excluído com sucesso!",
      });
      loadProfissionais();
    } catch (error) {
      console.error('Erro ao excluir profissional:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir profissional.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando profissionais...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gerenciar Profissionais</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingProfissional(null);
              setFormData({
                nome: '',
                cpf_cnpj: '',
                whatsapp: '',
                email: '',
                cidade: '',
                estado: '',
                saldo: 0,
                desativado: false,
                aceita_diaria: false,
                valor_diaria: 0
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Profissional
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProfissional ? 'Editar Profissional' : 'Novo Profissional'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">CPF/CNPJ</label>
                  <Input
                    value={formData.cpf_cnpj}
                    onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">WhatsApp</label>
                  <Input
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cidade</label>
                  <Input
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <Input
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Saldo</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.saldo}
                    onChange={(e) => setFormData({ ...formData, saldo: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Valor Diária</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor_diaria}
                    onChange={(e) => setFormData({ ...formData, valor_diaria: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.aceita_diaria}
                    onChange={(e) => setFormData({ ...formData, aceita_diaria: e.target.checked })}
                  />
                  <label className="text-sm font-medium">Aceita Diária</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.desativado}
                    onChange={(e) => setFormData({ ...formData, desativado: e.target.checked })}
                  />
                  <label className="text-sm font-medium">Desativado</label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingProfissional ? 'Atualizar' : 'Criar'}
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
              <TableHead>WhatsApp</TableHead>
              <TableHead>Cidade/Estado</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profissionais.map((profissional) => (
              <TableRow key={profissional.id}>
                <TableCell className="font-medium">{profissional.nome}</TableCell>
                <TableCell>{profissional.whatsapp}</TableCell>
                <TableCell>{profissional.cidade || ''}/{profissional.estado || ''}</TableCell>
                <TableCell>R$ {(profissional.saldo || 0).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={profissional.desativado ? "destructive" : "default"}>
                    {profissional.desativado ? 'Desativado' : 'Ativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(profissional)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(profissional)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(profissional.id)}
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
              <DialogTitle>Detalhes do Profissional</DialogTitle>
            </DialogHeader>
            {viewingProfissional && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Nome:</strong> {viewingProfissional.nome}
                  </div>
                  <div>
                    <strong>CPF/CNPJ:</strong> {viewingProfissional.cpf_cnpj}
                  </div>
                  <div>
                    <strong>WhatsApp:</strong> {viewingProfissional.whatsapp}
                  </div>
                  <div>
                    <strong>Email:</strong> {viewingProfissional.email || 'Não informado'}
                  </div>
                  <div>
                    <strong>Cidade:</strong> {viewingProfissional.cidade || 'Não informado'}
                  </div>
                  <div>
                    <strong>Estado:</strong> {viewingProfissional.estado || 'Não informado'}
                  </div>
                  <div>
                    <strong>Saldo:</strong> R$ {(viewingProfissional.saldo || 0).toFixed(2)}
                  </div>
                  <div>
                    <strong>Valor Diária:</strong> R$ {(viewingProfissional.valor_diaria || 0).toFixed(2)}
                  </div>
                  <div>
                    <strong>Aceita Diária:</strong> {viewingProfissional.aceita_diaria ? 'Sim' : 'Não'}
                  </div>
                  <div>
                    <strong>Status:</strong> {viewingProfissional.desativado ? 'Desativado' : 'Ativo'}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ProfissionaisAdmin;
