
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Package, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MobileMenu = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
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
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
