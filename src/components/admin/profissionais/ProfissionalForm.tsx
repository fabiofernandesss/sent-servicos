
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProfissionalFormData {
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

interface ProfissionalFormProps {
  formData: ProfissionalFormData;
  setFormData: (data: ProfissionalFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const ProfissionalForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEditing
}: ProfissionalFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 max-h-96 overflow-y-auto">
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
          {isEditing ? 'Atualizar' : 'Criar'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default ProfissionalForm;
export type { ProfissionalFormData };
