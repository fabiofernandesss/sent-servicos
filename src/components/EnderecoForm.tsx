
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
    
    // Não limpar mais a cidade automaticamente - manter o valor do banco
    console.log('Estado alterado, mas mantendo cidade do banco');
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
        
        {/* Dois inputs de cidade lado a lado */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="cidade-atual">Cidade Atual</Label>
            <Input
              id="cidade-atual"
              value={formData.cidade || ''}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
              placeholder="Cidade no banco"
            />
          </div>
          <div>
            <Label htmlFor="cidade-nova">Nova Cidade</Label>
            <Select 
              value="" 
              onValueChange={handleCidadeChange}
              disabled={!formData.estado}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !formData.estado 
                    ? "Selecione estado" 
                    : cidades.length === 0 
                    ? "Carregando..." 
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
