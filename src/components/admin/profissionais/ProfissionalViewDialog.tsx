
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Profissional } from './ProfissionalTable';

interface ProfissionalViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profissional: Profissional | null;
}

const ProfissionalViewDialog = ({
  open,
  onOpenChange,
  profissional
}: ProfissionalViewDialogProps) => {
  if (!profissional) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Profissional</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Nome:</strong> {profissional.nome}
            </div>
            <div>
              <strong>CPF/CNPJ:</strong> {profissional.cpf_cnpj}
            </div>
            <div>
              <strong>WhatsApp:</strong> {profissional.whatsapp}
            </div>
            <div>
              <strong>Email:</strong> {profissional.email || 'Não informado'}
            </div>
            <div>
              <strong>Cidade:</strong> {profissional.cidade || 'Não informado'}
            </div>
            <div>
              <strong>Estado:</strong> {profissional.estado || 'Não informado'}
            </div>
            <div>
              <strong>Saldo:</strong> R$ {(profissional.saldo || 0).toFixed(2)}
            </div>
            <div>
              <strong>Valor Diária:</strong> R$ {(profissional.valor_diaria || 0).toFixed(2)}
            </div>
            <div>
              <strong>Aceita Diária:</strong> {profissional.aceita_diaria ? 'Sim' : 'Não'}
            </div>
            <div>
              <strong>Status:</strong> {profissional.desativado ? 'Desativado' : 'Ativo'}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfissionalViewDialog;
