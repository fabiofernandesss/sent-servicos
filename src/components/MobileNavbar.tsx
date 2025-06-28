import { useState } from 'react';
import { Menu, X, LogOut, Home, Wrench, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useProfissionalSession } from '@/hooks/useProfissionalSession';
import { useToast } from '@/hooks/use-toast';
const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    profissionalLogado,
    logout
  } = useProfissionalSession();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso"
    });
    setIsOpen(false);
    window.location.href = '/';
  };
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };
  return <>
      {/* Mobile menu button - posicionado no canto superior direito */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu" className="p-2 text-white bg-[#1E486F] rounded-full shadow-lg my-[-3px]">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile navbar fixo na parte inferior com fundo azul */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1E486F] border-t border-[#1E486F] shadow-lg z-40">
        <div className="grid grid-cols-3 h-16">
          <button onClick={() => handleNavigation('/')} className="flex flex-col items-center justify-center text-white hover:text-gray-200 transition-colors">
            <Home size={20} className="mb-1" />
            <span className="text-xs font-medium">Início</span>
          </button>
          <button onClick={() => handleNavigation('/equipamentos')} className="flex flex-col items-center justify-center text-white hover:text-gray-200 transition-colors">
            <Wrench size={20} className="mb-1" />
            <span className="text-xs font-medium">Equipamentos</span>
          </button>
          <button onClick={() => handleNavigation('/perfil')} className="flex flex-col items-center justify-center text-white hover:text-gray-200 transition-colors">
            <User size={20} className="mb-1" />
            <span className="text-xs font-medium">Perfil</span>
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {isOpen && <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
          <div className="fixed inset-y-0 right-0 w-64 bg-[#1E486F] shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <span className="text-white font-semibold">Menu</span>
              <button onClick={() => setIsOpen(false)} className="text-white p-1" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            
            <nav className="p-4 space-y-4">
              <Link to="/" className="block text-white hover:text-gray-200 py-2" onClick={() => setIsOpen(false)}>
                Início
              </Link>
              <Link to="/cliente-demanda" className="block text-white hover:text-gray-200 py-2" onClick={() => setIsOpen(false)}>
                Solicitar Serviço
              </Link>
              <Link to="/equipamentos" className="block text-white hover:text-gray-200 py-2" onClick={() => setIsOpen(false)}>
                Equipamentos
              </Link>
              <Link to="/profissionais" className="block text-white hover:text-gray-200 py-2" onClick={() => setIsOpen(false)}>
                Área do Profissional
              </Link>
              
              {profissionalLogado && <>
                  <div className="border-t border-white/20 pt-4 mt-4">
                    <p className="text-white/70 text-sm mb-2">
                      Logado como: {profissionalLogado.nome}
                    </p>
                  </div>
                  <Button variant="ghost" onClick={handleLogout} className="w-full text-white hover:text-gray-200 hover:bg-white/10 flex items-center gap-2 justify-start">
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                </>}
            </nav>
          </div>
        </div>}
    </>;
};
export default MobileNavbar;