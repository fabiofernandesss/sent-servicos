
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Profissional } from '@/services/supabaseService';

interface DadosPessoaisFormProps {
  formData: Profissional;
  onInputChange: (field: keyof Profissional, value: any) => void;
}

const DadosPessoaisForm = ({ formData, onInputChange }: DadosPessoaisFormProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1E486F]">Dados Pessoais</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome Completo *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => onInputChange('nome', e.target.value)}
            placeholder="Seu nome completo"
            required
          />
        </div>
        <div>
          <Label htmlFor="cpf_cnpj">CPF/CNPJ *</Label>
          <Input
            id="cpf_cnpj"
            value={formData.cpf_cnpj}
            onChange={(e) => onInputChange('cpf_cnpj', e.target.value)}
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            placeholder="seu.email@exemplo.com"
            required
          />
        </div>
        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp}
            disabled
            className="bg-gray-100"
          />
        </div>
        <div>
          <Label htmlFor="nacionalidade">Nacionalidade</Label>
          <Input
            id="nacionalidade"
            value={formData.nacionalidade}
            onChange={(e) => onInputChange('nacionalidade', e.target.value)}
            placeholder="Brasileira"
          />
        </div>
      </div>
    </div>
  );
};

export default DadosPessoaisForm;
