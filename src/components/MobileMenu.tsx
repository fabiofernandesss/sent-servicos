
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Package, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfissionalSession } from '@/hooks/useProfissionalSession';

const MobileMenu = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { isLoggedIn, logout } = useProfissionalSession();

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
    // Scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
    // Scroll to top after logout
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          <Menu className="h-4 w-4 mr-1" />
          Menu
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-6">
          <Button
            variant="ghost"
            className="justify-start h-12 text-lg"
            onClick={() => handleNavigation('/')}
          >
            <Home className="h-5 w-5 mr-3" />
            Início
          </Button>
          <Button
            variant="ghost"
            className="justify-start h-12 text-lg"
            onClick={() => handleNavigation('/equipamentos')}
          >
            <Package className="h-5 w-5 mr-3" />
            Equipamentos
          </Button>
          <Button
            variant="ghost"
            className="justify-start h-12 text-lg"
            onClick={() => handleNavigation('/perfil')}
          >
            <User className="h-5 w-5 mr-3" />
            Perfil
          </Button>
          
          {isLoggedIn && (
            <Button
              variant="ghost"
              className="justify-start h-12 text-lg text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sair
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
