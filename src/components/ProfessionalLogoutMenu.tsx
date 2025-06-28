import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProfissionalSession } from '@/hooks/useProfissionalSession';
import { useToast } from '@/hooks/use-toast';
const ProfessionalLogoutMenu = () => {
  const {
    profissionalLogado,
    logout
  } = useProfissionalSession();
  const {
    toast
  } = useToast();
  if (!profissionalLogado) {
    return null;
  }
  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso"
    });
    // Redirecionar para a página inicial
    window.location.href = '/';
  };
  return <Button variant="ghost" onClick={handleLogout} className="hover:bg-white/10 flex items-center gap-2 text-gray-600 my-[7px]">
      <LogOut className="h-4 w-4" />
      <span className="hidden md:inline font-bold">Sair</span>
    </Button>;
};
export default ProfessionalLogoutMenu;