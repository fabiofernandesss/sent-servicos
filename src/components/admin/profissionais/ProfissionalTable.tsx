
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';

interface Profissional {
  id: number;
  nome: string;
  cpf_cnpj: string;
  whatsapp: string;
  email: string | null;
  cidade: string | null;
  estado: string | null;
  saldo: number | null;
  desativado: boolean | null;
  aceita_diaria: boolean | null;
  valor_diaria: number | null;
  nacionalidade?: string | null;
  bairro?: string | null;
  rua?: string | null;
  numero?: string | null;
  cep?: string | null;
  crea?: string | null;
  creci?: string | null;
  receber_msm?: boolean | null;
  sobre?: string | null;
}

interface ProfissionalTableProps {
  profissionais: Profissional[];
  onView: (profissional: Profissional) => void;
  onEdit: (profissional: Profissional) => void;
  onDelete: (id: number) => void;
}

const ProfissionalTable = ({
  profissionais,
  onView,
  onEdit,
  onDelete
}: ProfissionalTableProps) => {
  if (profissionais.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum profissional encontrado
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>WhatsApp</TableHead>
          <TableHead>Cidade/Estado</TableHead>
          <TableHead>Saldo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {profissionais.map((profissional) => (
          <TableRow key={profissional.id}>
            <TableCell className="font-medium">{profissional.nome}</TableCell>
            <TableCell>{profissional.whatsapp}</TableCell>
            <TableCell>{profissional.cidade || ''}/{profissional.estado || ''}</TableCell>
            <TableCell>R$ {(profissional.saldo || 0).toFixed(2)}</TableCell>
            <TableCell>
              <Badge variant={profissional.desativado ? "destructive" : "default"}>
                {profissional.desativado ? 'Desativado' : 'Ativo'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(profissional)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(profissional)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(profissional.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProfissionalTable;
export type { Profissional };
