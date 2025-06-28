import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { sendRecursiveWhatsappMessage } from '@/services/recursiveWhatsappService';
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
  
  // Estados para WhatsApp
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [whatsappButtonState, setWhatsappButtonState] = useState<'draft' | 'ready' | 'sending'>('draft');
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);
  
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

  const handleWhatsappButtonClick = async () => {
    if (whatsappButtonState === 'draft') {
      setWhatsappButtonState('ready');
      return;
    }

    if (whatsappButtonState === 'ready' && whatsappMessage.trim()) {
      await sendWhatsappToFiltered();
    }
  };

  const sendWhatsappToFiltered = async () => {
    if (!whatsappMessage.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma mensagem antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    if (filteredProfissionais.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum profissional encontrado para enviar a mensagem.",
        variant: "destructive",
      });
      return;
    }

    setWhatsappButtonState('sending');
    setSendingWhatsapp(true);

    try {
      // Extrair telefones dos profissionais filtrados
      const telefones = filteredProfissionais
        .map(p => p.whatsapp)
        .filter(whatsapp => whatsapp && whatsapp.trim() !== '')
        .map(whatsapp => whatsapp.replace(/\D/g, ''));

      if (telefones.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhum telefone válido encontrado nos profissionais filtrados.",
          variant: "destructive",
        });
        return;
      }

      // Enviar mensagem usando a API recursiva
      const response = await fetch('https://9045.bubblewhats.com/recursive-send-message', {
        method: 'POST',
        headers: {
          'Authorization': 'YzFkMGVkNzUwYzBjMjlhYzg0ZmJjYmU3',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipients: telefones.join(','),
          message: whatsappMessage,
          interval: '5-10'
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      toast({
        title: "Sucesso! 🎉",
        description: `Mensagem enviada para ${telefones.length} profissionais filtrados.`,
        duration: 5000,
      });

      // Reset do estado
      setWhatsappMessage('');
      setWhatsappButtonState('draft');

    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagens via WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setSendingWhatsapp(false);
      setWhatsappButtonState('draft');
    }
  };

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
        <div className="flex gap-2">
          <Button
            variant={whatsappButtonState === 'draft' ? 'outline' : whatsappButtonState === 'ready' ? 'default' : 'secondary'}
            onClick={handleWhatsappButtonClick}
            disabled={sendingWhatsapp || filteredProfissionais.length === 0}
            className={whatsappButtonState === 'ready' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {whatsappButtonState === 'draft' && 'Enviar WhatsApp'}
            {whatsappButtonState === 'ready' && `Enviar para ${filteredProfissionais.length}`}
            {whatsappButtonState === 'sending' && 'Enviando...'}
          </Button>
          
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
        </div>
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

        {/* Input de mensagem WhatsApp */}
        {whatsappButtonState === 'ready' && (
          <div className="mb-4 p-4 border rounded-lg bg-green-50">
            <label className="block text-sm font-medium mb-2">
              Mensagem para {filteredProfissionais.length} profissionais:
            </label>
            <Input
              placeholder="Digite sua mensagem..."
              value={whatsappMessage}
              onChange={(e) => setWhatsappMessage(e.target.value)}
              className="mb-2"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setWhatsappButtonState('draft');
                  setWhatsappMessage('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

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
