
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Profissional } from '@/services/supabaseService';
import { useInputMasks } from '@/hooks/useInputMasks';

interface EnderecoFormProps {
  formData: Profissional;
  onInputChange: (field: keyof Profissional, value: any) => void;
  cidades: any[];
  estados: string[];
}

const EnderecoForm = ({ formData, onInputChange, cidades, estados }: EnderecoFormProps) => {
  const { formatCEP } = useInputMasks();
  
  console.log('=== ENDERECO FORM RENDER ===');
  console.log('formData.cidade atual:', formData.cidade);
  console.log('Cidades disponíveis:', cidades.length);
  console.log('Estado atual:', formData.estado);
  console.log('Cidades array:', cidades);

  const handleCidadeChange = (cidade: string) => {
    console.log('=== MUDANÇA DE CIDADE NO ENDERECO FORM ===');
    console.log('Cidade selecionada:', cidade);
    console.log('Tipo da cidade:', typeof cidade);
    console.log('Cidade antes da mudança:', formData.cidade);
    
    // Chamar diretamente o onInputChange
    onInputChange('cidade', cidade);
    
    console.log('onInputChange chamado com cidade:', cidade);
    console.log('=========================================');
  };

  const handleEstadoChange = (estado: string) => {
    console.log('=== MUDANÇA DE ESTADO ===');
    console.log('Novo estado:', estado);
    
    onInputChange('estado', estado);
    
    console.log('Estado alterado para:', estado);
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    onInputChange('cep', formatted);
  };

  // Verificar se a cidade atual está na lista de cidades disponíveis
  const cidadeAtualExiste = cidades.some(cidade => 
    cidade.nome && cidade.nome.toLowerCase() === formData.cidade?.toLowerCase()
  );

  console.log('Cidade atual existe na lista?', cidadeAtualExiste);
  console.log('Cidade atual:', formData.cidade);

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
            <SelectContent className="bg-white border shadow-lg z-50">
              {estados.map((estado) => (
                <SelectItem key={estado} value={estado}>{estado}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="cidade">Cidade</Label>
          <div className="space-y-2">
            {/* Mostrar cidade atual se existir */}
            {formData.cidade && (
              <Input
                id="cidade-atual"
                value={formData.cidade}
                readOnly
                className="bg-gray-100 cursor-not-allowed h-[54px] text-sm"
                placeholder="Cidade atual"
              />
            )}
            
            {/* Select para trocar de cidade */}
            <Select 
              value="" 
              onValueChange={handleCidadeChange}
              disabled={!formData.estado}
            >
              <SelectTrigger className="h-[54px]">
                <SelectValue placeholder={
                  !formData.estado 
                    ? "Selecione estado primeiro" 
                    : cidades.length === 0 
                    ? "Carregando cidades..." 
                    : formData.cidade 
                    ? "Alterar cidade" 
                    : "Selecionar cidade"
                } />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50 max-h-[300px] overflow-y-auto">
                {cidades.length > 0 ? (
                  cidades.map((cidade) => (
                    <SelectItem key={cidade.id} value={cidade.nome}>
                      {cidade.nome}
                    </SelectItem>
                  ))
                ) : formData.estado ? (
                  <SelectItem value="" disabled>
                    Nenhuma cidade encontrada
                  </SelectItem>
                ) : null}
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
    </div>
  );
};

export default EnderecoForm;
