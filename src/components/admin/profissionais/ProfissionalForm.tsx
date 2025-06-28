
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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
  nacionalidade?: string;
  bairro?: string;
  rua?: string;
  numero?: string;
  cep?: string;
  crea?: string;
  creci?: string;
  receber_msm?: boolean;
  sobre?: string;
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
  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
    'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Dados Pessoais */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1E486F] border-b pb-2">Dados Pessoais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="block text-sm font-medium mb-1">Nome Completo *</Label>
            <Input
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Digite o nome completo do profissional"
              required
            />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">CPF/CNPJ *</Label>
            <Input
              value={formData.cpf_cnpj}
              onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              required
            />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">WhatsApp *</Label>
            <Input
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="(11) 99999-9999"
              required
            />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="profissional@exemplo.com"
            />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Nacionalidade</Label>
            <Input
              value={formData.nacionalidade || ''}
              onChange={(e) => setFormData({ ...formData, nacionalidade: e.target.value })}
              placeholder="Ex: Brasileira"
            />
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1E486F] border-b pb-2">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="block text-sm font-medium mb-1">Estado</Label>
            <Select value={formData.estado || ''} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {estados.map((estado) => (
                  <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Cidade</Label>
            <Input
              value={formData.cidade}
              onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              placeholder="Digite a cidade"
            />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Bairro</Label>
            <Input
              value={formData.bairro || ''}
              onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
              placeholder="Digite o bairro"
            />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Rua</Label>
            <Input
              value={formData.rua || ''}
              onChange={(e) => setFormData({ ...formData, rua: e.target.value })}
              placeholder="Digite o nome da rua"
            />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Número</Label>
            <Input
              value={formData.numero || ''}
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              placeholder="Digite o número"
            />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">CEP</Label>
            <Input
              value={formData.cep || ''}
              onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
              placeholder="00000-000"
              maxLength={9}
            />
          </div>
        </div>
      </div>

      {/* Dados Profissionais */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1E486F] border-b pb-2">Dados Profissionais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="block text-sm font-medium mb-1">CREA</Label>
            <Input
              value={formData.crea || ''}
              onChange={(e) => setFormData({ ...formData, crea: e.target.value })}
              placeholder="Número do CREA (se aplicável)"
            />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">CRECI</Label>
            <Input
              value={formData.creci || ''}
              onChange={(e) => setFormData({ ...formData, creci: e.target.value })}
              placeholder="Número do CRECI (se aplicável)"
            />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Saldo</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.saldo}
              onChange={(e) => setFormData({ ...formData, saldo: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Valor Diária</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.valor_diaria}
              onChange={(e) => setFormData({ ...formData, valor_diaria: parseFloat(e.target.value) || 0 })}
              placeholder="150.00"
            />
          </div>
        </div>
        
        <div>
          <Label className="block text-sm font-medium mb-1">Sobre</Label>
          <Textarea
            value={formData.sobre || ''}
            onChange={(e) => setFormData({ ...formData, sobre: e.target.value })}
            placeholder="Conte um pouco sobre o profissional, experiência, especialidades..."
            className="min-h-[100px]"
          />
        </div>
      </div>

      {/* Configurações */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1E486F] border-b pb-2">Configurações</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="aceita_diaria"
              checked={formData.aceita_diaria}
              onCheckedChange={(checked) => setFormData({ ...formData, aceita_diaria: !!checked })}
            />
            <Label htmlFor="aceita_diaria" className="text-sm font-medium">Aceita trabalhar por diária</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="receber_msm"
              checked={formData.receber_msm ?? true}
              onCheckedChange={(checked) => setFormData({ ...formData, receber_msm: !!checked })}
            />
            <Label htmlFor="receber_msm" className="text-sm font-medium">Receber mensagens sobre novas demandas</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="desativado"
              checked={formData.desativado}
              onCheckedChange={(checked) => setFormData({ ...formData, desativado: !!checked })}
            />
            <Label htmlFor="desativado" className="text-sm font-medium">Profissional desativado</Label>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button type="submit" className="flex-1 bg-[#1E486F] hover:bg-[#1E486F]/90">
          {isEditing ? 'Atualizar Profissional' : 'Criar Profissional'}
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
