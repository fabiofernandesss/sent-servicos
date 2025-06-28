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
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle className="text-[#1E486F]">Gerenciar Profissionais</CardTitle>
      </div>
      <div className="flex items-center gap-4">
        <WhatsAppMessagePanel 
          filteredProfissionais={filteredProfissionais} 
          onSendComplete={() => {}} 
        />
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={onNewProfissional}
              className="bg-[#1E486F] hover:bg-[#1E486F]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Profissional
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-[#1E486F]">
                {editingProfissional ? 'Editar Profissional' : 'Novo Profissional'}
              </DialogTitle>
            </DialogHeader>
            <ProfissionalForm 
              formData={formData} 
              setFormData={setFormData} 
              onSubmit={onSubmit} 
              onCancel={() => setDialogOpen(false)} 
              isEditing={editingProfissional} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </CardHeader>
  );
};
export default ProfissionaisHeader;
