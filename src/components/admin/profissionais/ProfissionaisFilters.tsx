
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface ProfissionaisFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterEstado: string;
  setFilterEstado: (value: string) => void;
  filterCidade: string;
  setFilterCidade: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterDiaria: string;
  setFilterDiaria: (value: string) => void;
  uniqueEstados: string[];
  uniqueCidades: string[];
  clearFilters: () => void;
  totalFiltered: number;
  totalAll: number;
}

const ProfissionaisFilters = ({
  searchTerm,
  setSearchTerm,
  filterEstado,
  setFilterEstado,
  filterCidade,
  setFilterCidade,
  filterStatus,
  setFilterStatus,
  filterDiaria,
  setFilterDiaria,
  uniqueEstados,
  uniqueCidades,
  clearFilters,
  totalFiltered,
  totalAll
}: ProfissionaisFiltersProps) => {
  // Filtrar valores válidos (não vazios e não nulos)
  const validEstados = uniqueEstados.filter(estado => estado && estado.trim() !== '');
  const validCidades = uniqueCidades.filter(cidade => cidade && cidade.trim() !== '');

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4" />
        <span className="font-medium">Filtros</span>
        <Button variant="outline" size="sm" onClick={clearFilters}>
          Limpar Filtros
        </Button>
        <span className="text-sm text-gray-600 ml-auto">
          {totalFiltered} de {totalAll} profissionais
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div>
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os Estados</SelectItem>
            {validEstados.map(estado => (
              <SelectItem key={estado} value={estado}>{estado}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterCidade} onValueChange={setFilterCidade}>
          <SelectTrigger>
            <SelectValue placeholder="Cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as Cidades</SelectItem>
            {validCidades.map(cidade => (
              <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="desativado">Desativado</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterDiaria} onValueChange={setFilterDiaria}>
          <SelectTrigger>
            <SelectValue placeholder="Diária" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="aceita">Aceita Diária</SelectItem>
            <SelectItem value="nao_aceita">Não Aceita</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProfissionaisFilters;
