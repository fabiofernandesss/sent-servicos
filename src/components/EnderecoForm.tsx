
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Profissional } from '@/services/supabaseService';

interface EnderecoFormProps {
  formData: Profissional;
  onInputChange: (field: keyof Profissional, value: any) => void;
  cidades: any[];
  estados: string[];
}

const EnderecoForm = ({ formData, onInputChange, cidades, estados }: EnderecoFormProps) => {
  const [selectedCidade, setSelectedCidade] = useState<string>('');

  // Inicializar cidade selecionada quando formData.cidade mudar
  useEffect(() => {
    if (formData.cidade && formData.cidade !== selectedCidade) {
      console.log('=== INICIALIZANDO CIDADE SELECIONADA ===');
      console.log('Cidade do formData:', formData.cidade);
      setSelectedCidade(formData.cidade);
    }
  }, [formData.cidade]); // Removido selectedCidade da dependência para evitar loop

  // Limpar cidade selecionada quando estado mudar
  useEffect(() => {
    if (formData.estado) {
      console.log('=== ESTADO MUDOU ===');
      console.log('Novo estado:', formData.estado);
      // Só limpar se realmente mudou o estado e não é a inicialização
      if (selectedCidade && cidades.length === 0) {
        console.log('Limpando cidade selecionada devido à mudança de estado');
        setSelectedCidade('');
        onInputChange('cidade', '');
      }
    }
  }, [formData.estado, cidades.length]);

  const handleCidadeChange = (cidade: string) => {
    console.log('=== CIDADE SELECIONADA PELO USUÁRIO ===');
    console.log('Cidade selecionada:', cidade);
    setSelectedCidade(cidade);
    onInputChange('cidade', cidade);
    console.log('========================================');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1E486F]">Endereço</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="estado">Estado *</Label>
          <Select value={formData.estado || ''} onValueChange={(value) => onInputChange('estado', value)}>
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
          <Label htmlFor="cidade">Cidade * (Selecionada: {selectedCidade || 'Nenhuma'})</Label>
          <Select 
            value={selectedCidade} 
            onValueChange={handleCidadeChange}
            disabled={!formData.estado}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                !formData.estado 
                  ? "Selecione o estado primeiro" 
                  : cidades.length === 0 
                  ? "Carregando cidades..." 
                  : "Selecione a cidade"
              } />
            </SelectTrigger>
            <SelectContent>
              {cidades.map((cidade) => (
                <SelectItem key={cidade.id} value={cidade.nome}>{cidade.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            onChange={(e) => onInputChange('cep', e.target.value)}
            placeholder="00000-000"
          />
        </div>
      </div>
    </div>
  );
};

export default EnderecoForm;
