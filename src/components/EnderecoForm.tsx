
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
  const { cidades, loading: cidadesLoading, error: cidadesError } = useCidades(formData.estado || '');

  const handleCidadeChange = (cidade: string) => {
    console.log('Nova cidade selecionada:', cidade);
    onInputChange('cidade', cidade);
  };

  const handleEstadoChange = (estado: string) => {
    console.log('Novo estado selecionado:', estado);
    onInputChange('estado', estado);
    // Limpar cidade quando mudar estado
    onInputChange('cidade', '');
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
              className="bg-gray-50 cursor-not-allowed h-[54px] text-gray-600"
              placeholder="Cidade salva"
            />
          </div>
          <div>
            <Label htmlFor="cidade-nova">Alterar Cidade</Label>
            <Select 
              value="" 
              onValueChange={handleCidadeChange}
              disabled={!formData.estado}
            >
              <SelectTrigger className="h-[54px]">
                <SelectValue placeholder={
                  !formData.estado 
                    ? "Selecione estado primeiro" 
                    : cidadesLoading 
                    ? "Carregando cidades..." 
                    : cidadesError
                    ? "Erro ao carregar"
                    : cidades.length === 0 
                    ? "Nenhuma cidade encontrada" 
                    : "Selecionar nova cidade"
                } />
              </SelectTrigger>
              <SelectContent>
                {cidades.length > 0 ? (
                  cidades.map((cidade) => (
                    <SelectItem key={cidade.id} value={cidade.nome}>
                      {cidade.nome}
                    </SelectItem>
                  ))
                ) : (
                  !cidadesLoading && !cidadesError && formData.estado && (
                    <SelectItem value="" disabled>
                      Nenhuma cidade encontrada
                    </SelectItem>
                  )
                )}
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
            className="h-[54px]"
          />
        </div>
        <div>
          <Label htmlFor="rua">Rua</Label>
          <Input
            id="rua"
            value={formData.rua || ''}
            onChange={(e) => onInputChange('rua', e.target.value)}
            placeholder="Nome da rua"
            className="h-[54px]"
          />
        </div>
        <div>
          <Label htmlFor="numero">Número</Label>
          <Input
            id="numero"
            value={formData.numero || ''}
            onChange={(e) => onInputChange('numero', e.target.value)}
            placeholder="Número"
            className="h-[54px]"
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
            className="h-[54px]"
          />
        </div>
      </div>
      
      {cidadesError && (
        <div className="text-sm text-red-600 mt-2">
          {cidadesError} - Tente novamente em alguns segundos
        </div>
      )}
    </div>
  );
};

export default EnderecoForm;
