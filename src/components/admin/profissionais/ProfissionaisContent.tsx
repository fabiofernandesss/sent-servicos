
import { CardContent } from '@/components/ui/card';
import ProfissionaisFilters from './ProfissionaisFilters';
import ProfissionalTable, { Profissional } from './ProfissionalTable';
import ProfissionalViewDialog from './ProfissionalViewDialog';

interface ProfissionaisContentProps {
  // Filter props
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterEstado: string;
  setFilterEstado: (estado: string) => void;
  filterCidade: string;
  setFilterCidade: (cidade: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterDiaria: string;
  setFilterDiaria: (diaria: string) => void;
  uniqueEstados: string[];
  uniqueCidades: string[];
  clearFilters: () => void;
  
  // Data props
  filteredProfissionais: Profissional[];
  totalProfissionais: number;
  
  // Table actions
  onView: (profissional: Profissional) => void;
  onEdit: (profissional: Profissional) => void;
  onDelete: (id: number) => void;
  
  // View dialog
  viewDialogOpen: boolean;
  setViewDialogOpen: (open: boolean) => void;
  viewingProfissional: Profissional | null;
}

const ProfissionaisContent = ({
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
  filteredProfissionais,
  totalProfissionais,
  onView,
  onEdit,
  onDelete,
  viewDialogOpen,
  setViewDialogOpen,
  viewingProfissional
}: ProfissionaisContentProps) => {
  return (
    <CardContent>
      <ProfissionaisFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterEstado={filterEstado}
        setFilterEstado={setFilterEstado}
        filterCidade={filterCidade}
        setFilterCidade={setFilterCidade}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterDiaria={filterDiaria}
        setFilterDiaria={setFilterDiaria}
        uniqueEstados={uniqueEstados}
        uniqueCidades={uniqueCidades}
        clearFilters={clearFilters}
        totalFiltered={filteredProfissionais.length}
        totalAll={totalProfissionais}
      />

      <ProfissionalTable
        profissionais={filteredProfissionais}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <ProfissionalViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        profissional={viewingProfissional}
      />
    </CardContent>
  );
};

export default ProfissionaisContent;
