
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Profissional } from '@/services/supabaseService';
import { useInputMasks } from '@/hooks/useInputMasks';
import { useCidades } from '@/hooks/useCidades';
import { RefreshCw } from 'lucide-react';

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

  const handleRefreshCidades = () => {
    // Force re-render do hook
    if (formData.estado) {
      onInputChange('estado', '');
      setTimeout(() => {
        onInputChange('estado', formData.estado!);
      }, 100);
    }
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
            <SelectContent className="bg-white z-50 max-h-64 overflow-y-auto">
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
            <Label htmlFor="cidade-nova" className="flex items-center justify-between">
              Alterar Cidade
              {formData.estado && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshCidades}
                  className="h-auto p-1 text-xs"
                  disabled={cidadesLoading}
                >
                  <RefreshCw className={`h-3 w-3 ${cidadesLoading ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </Label>
            <Select 
              value="" 
              onValueChange={handleCidadeChange}
              disabled={!formData.estado || cidadesLoading}
            >
              <SelectTrigger className="h-[54px]">
                <SelectValue placeholder={
                  !formData.estado 
                    ? "Selecione estado primeiro" 
                    : cidadesLoading 
                    ? "Carregando..." 
                    : cidades.length === 0 
                    ? "Tentar novamente"
                    : "Selecionar nova cidade"
                } />
              </SelectTrigger>
              <SelectContent className="bg-white z-50 max-h-64 overflow-y-auto">
                {cidades.length > 0 ? (
                  cidades.map((cidade) => (
                    <SelectItem key={cidade.id} value={cidade.nome}>
                      {cidade.nome}
                    </SelectItem>
                  ))
                ) : (
                  !cidadesLoading && formData.estado && (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-500 mb-2">
                        Erro ao carregar cidades
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshCidades}
                        className="text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Tentar Novamente
                      </Button>
                    </div>
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm">
          <p className="text-yellow-800 mb-2">
            ⚠️ Usando lista simplificada de cidades
          </p>
          <p className="text-yellow-600 text-xs">
            A conexão com o servidor de cidades está instável. Você ainda pode selecionar as principais cidades do estado.
          </p>
        </div>
      )}
    </div>
  );
};

export default EnderecoForm;
