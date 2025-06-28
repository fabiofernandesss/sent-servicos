import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import ProfissionalForm, { ProfissionalFormData } from './ProfissionalForm';
import WhatsAppMessagePanel from './WhatsAppMessagePanel';
interface ProfissionaisHeaderProps {
  filteredProfissionais: Array<{
    whatsapp: string;
  }>;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  editingProfissional: boolean;
  formData: ProfissionalFormData;
  setFormData: (data: ProfissionalFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onNewProfissional: () => void;
}
const ProfissionaisHeader = ({
  filteredProfissionais,
  dialogOpen,
  setDialogOpen,
  editingProfissional,
  formData,
  setFormData,
  onSubmit,
  onNewProfissional
}: ProfissionaisHeaderProps) => {
  return <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Gerenciar Profissionais</CardTitle>
      </div>
      <div className="flex-auto flex-auto mx-[20px]">
        <WhatsAppMessagePanel filteredProfissionais={filteredProfissionais} onSendComplete={() => {}} />
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProfissional ? 'Editar Profissional' : 'Novo Profissional'}
              </DialogTitle>
            </DialogHeader>
            <ProfissionalForm formData={formData} setFormData={setFormData} onSubmit={onSubmit} onCancel={() => setDialogOpen(false)} isEditing={editingProfissional} />
          </DialogContent>
        </Dialog>
      </div>
    </CardHeader>;
};
export default ProfissionaisHeader;