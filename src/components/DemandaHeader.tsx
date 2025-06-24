
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const DemandaHeader = () => {
  return (
    <div className="mb-6 flex items-center gap-4">
      <Link to="/" className="text-blue-600 hover:text-blue-800">
        <ArrowLeft className="h-6 w-6" />
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cadastrar Nova Demanda</h1>
        <p className="text-gray-600">Preencha os dados para solicitar um serviço</p>
      </div>
    </div>
  );
};

export default DemandaHeader;
