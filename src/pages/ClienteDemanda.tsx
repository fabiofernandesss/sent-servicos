
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FormularioDemanda from '@/components/FormularioDemanda';
import LoadingSpinner from '@/components/LoadingSpinner';
import DemandaHeader from '@/components/DemandaHeader';
import { useClienteDemandaData } from '@/hooks/useClienteDemandaData';
import { useFormSubmission } from '@/hooks/useFormSubmission';
import { getCategoryIcon } from '@/utils/categoryIcons';

const ClienteDemanda = () => {
  const {
    categorias,
    subcategorias,
    cidades,
    loading,
    loadingCidades,
    handleEstadoChange
  } = useClienteDemandaData();

  const { submitting, onSubmit } = useFormSubmission();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <DemandaHeader />

        <Card>
          <CardHeader>
            <CardTitle>Informações da Solicitação</CardTitle>
          </CardHeader>
          <CardContent>
            <FormularioDemanda
              categorias={categorias}
              subcategorias={subcategorias}
              cidades={cidades}
              loadingCidades={loadingCidades}
              submitting={submitting}
              onSubmit={onSubmit}
              onEstadoChange={handleEstadoChange}
              getCategoryIcon={getCategoryIcon}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClienteDemanda;
