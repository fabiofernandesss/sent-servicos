import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProfissionaisHeader from './profissionais/ProfissionaisHeader';
import ProfissionaisContent from './profissionais/ProfissionaisContent';
import { ProfissionalFormData } from './profissionais/ProfissionalForm';
import { Profissional } from './profissionais/ProfissionalTable';

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
    valor_diaria: 0,
    nacionalidade: '',
    bairro: '',
    rua: '',
    numero: '',
    cep: '',
    crea: '',
    creci: '',
    receber_msm: true,
    sobre: ''
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
        .select(`
          id, nome, cpf_cnpj, whatsapp, email, cidade, estado, saldo, 
          desativado, aceita_diaria, valor_diaria, nacionalidade, bairro, 
          rua, numero, cep, crea, creci, receber_msm, sobre
        `)
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

  // Dados únicos para os filtros com validação extra
  const uniqueEstados = useMemo(() => {
    const estados = [...new Set(profissionais
      .map(p => p.estado)
      .filter(estado => estado && typeof estado === 'string' && estado.trim() !== '')
    )];
    console.log('Unique Estados:', estados);
    return estados.sort();
  }, [profissionais]);

  const uniqueCidades = useMemo(() => {
    let cidades = profissionais
      .map(p => p.cidade)
      .filter(cidade => cidade && typeof cidade === 'string' && cidade.trim() !== '');
    
    if (filterEstado && filterEstado !== 'todos') {
      cidades = profissionais
        .filter(p => p.estado === filterEstado)
        .map(p => p.cidade)
        .filter(cidade => cidade && typeof cidade === 'string' && cidade.trim() !== '');
    }
    const uniqueCidades = [...new Set(cidades)].sort();
    console.log('Unique Cidades:', uniqueCidades);
    return uniqueCidades;
  }, [profissionais, filterEstado]);

  // Profissionais filtrados com ajustes para os novos valores
  const filteredProfissionais = useMemo(() => {
    return profissionais.filter(profissional => {
      const matchesSearch = !searchTerm || 
        profissional.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profissional.whatsapp.includes(searchTerm) ||
        profissional.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profissional.cpf_cnpj.includes(searchTerm);
      
      const matchesEstado = !filterEstado || filterEstado === 'todos' || profissional.estado === filterEstado;
      const matchesCidade = !filterCidade || filterCidade === 'todas' || profissional.cidade === filterCidade;
      const matchesStatus = filterStatus === '' || filterStatus === 'todos' || 
        (filterStatus === 'ativo' && !profissional.desativado) ||
        (filterStatus === 'desativado' && profissional.desativado);
      const matchesDiaria = filterDiaria === '' || filterDiaria === 'todos' ||
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
      valor_diaria: 0,
      nacionalidade: '',
      bairro: '',
      rua: '',
      numero: '',
      cep: '',
      crea: '',
      creci: '',
      receber_msm: true,
      sobre: ''
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
      valor_diaria: profissional.valor_diaria || 0,
      nacionalidade: profissional.nacionalidade || '',
      bairro: profissional.bairro || '',
      rua: profissional.rua || '',
      numero: profissional.numero || '',
      cep: profissional.cep || '',
      crea: profissional.crea || '',
      creci: profissional.creci || '',
      receber_msm: profissional.receber_msm ?? true,
      sobre: profissional.sobre || ''
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

  const handleNewProfissional = () => {
    setEditingProfissional(null);
    resetForm();
  };

  if (loading) {
    return <div className="text-center py-8">Carregando profissionais...</div>;
  }

  return (
    <Card>
      <ProfissionaisHeader
        filteredProfissionais={filteredProfissionais}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        editingProfissional={!!editingProfissional}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onNewProfissional={handleNewProfissional}
      />
      
      <ProfissionaisContent
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
        filteredProfissionais={filteredProfissionais}
        totalProfissionais={profissionais.length}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        viewDialogOpen={viewDialogOpen}
        setViewDialogOpen={setViewDialogOpen}
        viewingProfissional={viewingProfissional}
      />
    </Card>
  );
};

export default ProfissionaisAdmin;
