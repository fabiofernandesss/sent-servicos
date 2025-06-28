
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Profissional } from '@/services/supabaseService';

interface DadosProfissionaisFormProps {
  formData: Profissional;
  onInputChange: (field: keyof Profissional, value: any) => void;
}

const DadosProfissionaisForm = ({ formData, onInputChange }: DadosProfissionaisFormProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1E486F]">Dados Profissionais</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="crea">CREA (se aplicável)</Label>
          <Input
            id="crea"
            value={formData.crea || ''}
            onChange={(e) => onInputChange('crea', e.target.value)}
            placeholder="Número do CREA"
          />
        </div>
        <div>
          <Label htmlFor="creci">CRECI (se aplicável)</Label>
          <Input
            id="creci"
            value={formData.creci || ''}
            onChange={(e) => onInputChange('creci', e.target.value)}
            placeholder="Número do CRECI"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="aceita_diaria"
          checked={formData.aceita_diaria || false}
          onCheckedChange={(checked) => onInputChange('aceita_diaria', checked)}
        />
        <Label htmlFor="aceita_diaria">Aceito trabalhar por diária</Label>
      </div>
      
      {formData.aceita_diaria && (
        <div>
          <Label htmlFor="valor_diaria">Valor da Diária (R$)</Label>
          <Input
            id="valor_diaria"
            type="number"
            value={formData.valor_diaria || 0}
            onChange={(e) => onInputChange('valor_diaria', parseFloat(e.target.value) || 0)}
            placeholder="150.00"
          />
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="receber_msm"
          checked={formData.receber_msm ?? true}
          onCheckedChange={(checked) => onInputChange('receber_msm', checked)}
        />
        <Label htmlFor="receber_msm">Desejo receber mensagens sobre novas demandas</Label>
      </div>
    </div>
  );
};

export default DadosProfissionaisForm;
