
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProfissionaisFilters from './profissionais/ProfissionaisFilters';
import ProfissionalForm, { ProfissionalFormData } from './profissionais/ProfissionalForm';
import ProfissionalTable, { Profissional } from './profissionais/ProfissionalTable';
import ProfissionalViewDialog from './profissionais/ProfissionalViewDialog';

const ProfissionaisAdmin = () => {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingProfissional, setEditingProfissional] = useState<Profissional | null>(null);
  const [viewingProfissional, setViewingProfissional] = useState<Profissional | null>(null);
  
  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterCidade, setFilterCidade] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDiaria, setFilterDiaria] = useState('');
  
  const [formData, setFormData] = useState<ProfissionalFormData>({
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
      setLoading(true);
      const { data, error } = await supabase
        .from('profissionais')
        .select('id, nome, cpf_cnpj, whatsapp, email, cidade, estado, saldo, desativado, aceita_diaria, valor_diaria')
        .order('nome');

      if (error) {
        console.error('Erro ao carregar profissionais:', error);
        throw error;
      }
      
      console.log('Profissionais carregados:', data);
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

  // Dados únicos para os filtros
  const uniqueEstados = useMemo(() => {
    const estados = [...new Set(profissionais.map(p => p.estado).filter(Boolean))];
    return estados.sort();
  }, [profissionais]);

  const uniqueCidades = useMemo(() => {
    let cidades = profissionais.map(p => p.cidade).filter(Boolean);
    if (filterEstado) {
      cidades = profissionais
        .filter(p => p.estado === filterEstado)
        .map(p => p.cidade)
        .filter(Boolean);
    }
    return [...new Set(cidades)].sort();
  }, [profissionais, filterEstado]);

  // Profissionais filtrados
  const filteredProfissionais = useMemo(() => {
    return profissionais.filter(profissional => {
      const matchesSearch = !searchTerm || 
        profissional.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profissional.whatsapp.includes(searchTerm) ||
        profissional.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profissional.cpf_cnpj.includes(searchTerm);
      
      const matchesEstado = !filterEstado || profissional.estado === filterEstado;
      const matchesCidade = !filterCidade || profissional.cidade === filterCidade;
      const matchesStatus = filterStatus === '' || 
        (filterStatus === 'ativo' && !profissional.desativado) ||
        (filterStatus === 'desativado' && profissional.desativado);
      const matchesDiaria = filterDiaria === '' ||
        (filterDiaria === 'aceita' && profissional.aceita_diaria) ||
        (filterDiaria === 'nao_aceita' && !profissional.aceita_diaria);

      return matchesSearch && matchesEstado && matchesCidade && matchesStatus && matchesDiaria;
    });
  }, [profissionais, searchTerm, filterEstado, filterCidade, filterStatus, filterDiaria]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterEstado('');
    setFilterCidade('');
    setFilterStatus('');
    setFilterDiaria('');
  };

  const resetForm = () => {
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
      resetForm();
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
        <div>
          <CardTitle>Gerenciar Profissionais</CardTitle>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingProfissional(null);
              resetForm();
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
            <ProfissionalForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              onCancel={() => setDialogOpen(false)}
              isEditing={!!editingProfissional}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <ProfissionaisFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterEstado={filterEstado}
          setFilterEstado={setFilterEstado}
          filterCidade={filterCidade}
          setFilterCidade={setFilterCidade}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterDiaria={filterDiaria}
          setFilterDiaria={setFilterDiaria}
          uniqueEstados={uniqueEstados}
          uniqueCidades={uniqueCidades}
          clearFilters={clearFilters}
          totalFiltered={filteredProfissionais.length}
          totalAll={profissionais.length}
        />

        <ProfissionalTable
          profissionais={filteredProfissionais}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <ProfissionalViewDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          profissional={viewingProfissional}
        />
      </CardContent>
    </Card>
  );
};

export default ProfissionaisAdmin;
