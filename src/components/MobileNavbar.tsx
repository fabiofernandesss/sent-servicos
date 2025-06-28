
import { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useProfissionalSession } from '@/hooks/useProfissionalSession';
import { useToast } from '@/hooks/use-toast';

const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { profissionalLogado, logout } = useProfissionalSession();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
    setIsOpen(false);
    // Redirecionar para a página inicial
    window.location.href = '/';
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden p-2 text-white"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
          <div className="fixed inset-y-0 right-0 w-64 bg-[#1E486F] shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <span className="text-white font-semibold">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white p-1"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className="p-4 space-y-4">
              <button
                onClick={() => handleNavigation('/')}
                className="block w-full text-left text-white hover:text-gray-200 py-2"
              >
                Home
              </button>
              <button
                onClick={() => handleNavigation('/equipamentos')}
                className="block w-full text-left text-white hover:text-gray-200 py-2"
              >
                Equipamentos
              </button>
              <button
                onClick={() => handleNavigation('/profissionais')}
                className="block w-full text-left text-white hover:text-gray-200 py-2"
              >
                Perfil
              </button>
              
              {profissionalLogado && (
                <>
                  <div className="border-t border-white/20 pt-4 mt-4">
                    <p className="text-white/70 text-sm mb-2">
                      Logado como: {profissionalLogado.nome}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full text-white hover:text-gray-200 hover:bg-white/10 flex items-center gap-2 justify-start"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavbar;
