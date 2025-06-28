
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Profissional } from '@/services/supabaseService';
import { useInputMasks } from '@/hooks/useInputMasks';
import { useCidades } from '@/hooks/useCidades';

interface EnderecoFormProps {
  formData: Profissional;
  onInputChange: (field: keyof Profissional, value: any) => void;
  estados: string[];
}

const EnderecoForm = ({ formData, onInputChange, estados }: EnderecoFormProps) => {
  const { formatCEP } = useInputMasks();
  const { cidades, loading: cidadesLoading } = useCidades(formData.estado || '');

  const handleCidadeChange = (cidade: string) => {
    console.log('Nova cidade selecionada:', cidade);
    onInputChange('cidade', cidade);
  };

  const handleEstadoChange = (estado: string) => {
    console.log('Novo estado selecionado:', estado);
    onInputChange('estado', estado);
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    onInputChange('cep', formatted);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1E486F]">Endereço</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="estado">Estado *</Label>
          <Select value={formData.estado || ''} onValueChange={handleEstadoChange}>
            <SelectTrigger className="h-[54px]">
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent>
              {estados.map((estado) => (
                <SelectItem key={estado} value={estado}>{estado}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Dois inputs de cidade lado a lado */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="cidade-atual">Cidade Atual</Label>
            <Input
              id="cidade-atual"
              value={formData.cidade || ''}
              readOnly
              className="bg-gray-100 cursor-not-allowed h-[54px]"
              placeholder="Cidade no banco"
            />
          </div>
          <div>
            <Label htmlFor="cidade-nova">Nova Cidade</Label>
            <Select 
              value="" 
              onValueChange={handleCidadeChange}
              disabled={!formData.estado || cidadesLoading}
            >
              <SelectTrigger className="h-[54px]">
                <SelectValue placeholder={
                  !formData.estado 
                    ? "Selecione estado" 
                    : cidadesLoading 
                    ? "Carregando..." 
                    : cidades.length === 0 
                    ? "Sem cidades" 
                    : "Selecionar cidade"
                } />
              </SelectTrigger>
              <SelectContent>
                {cidades.map((cidade) => (
                  <SelectItem key={cidade.id} value={cidade.nome}>{cidade.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="bairro">Bairro</Label>
          <Input
            id="bairro"
            value={formData.bairro || ''}
            onChange={(e) => onInputChange('bairro', e.target.value)}
            placeholder="Seu bairro"
          />
        </div>
        <div>
          <Label htmlFor="rua">Rua</Label>
          <Input
            id="rua"
            value={formData.rua || ''}
            onChange={(e) => onInputChange('rua', e.target.value)}
            placeholder="Nome da rua"
          />
        </div>
        <div>
          <Label htmlFor="numero">Número</Label>
          <Input
            id="numero"
            value={formData.numero || ''}
            onChange={(e) => onInputChange('numero', e.target.value)}
            placeholder="Número"
          />
        </div>
        <div>
          <Label htmlFor="cep">CEP</Label>
          <Input
            id="cep"
            value={formData.cep || ''}
            onChange={handleCEPChange}
            placeholder="00000-000"
            maxLength={9}
          />
        </div>
      </div>
    </div>
  );
};

export default EnderecoForm;
