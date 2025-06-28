
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Package, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="https://9088bc4d5081958e858f937822185f7b.cdn.bubble.io/cdn-cgi/image/w=256,h=53,f=auto,dpr=1.25,fit=contain/f1716158171404x251547051884103870/Ativo%201.png" 
              alt="Sent Serviços" 
              className="h-6 w-auto cursor-pointer" 
              onClick={() => navigate('/')}
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Button
              variant="ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-[#1E486F] font-medium"
            >
              <Menu className="h-4 w-4 mr-2" />
              MENU
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => navigate('/equipamentos')}
              className="text-gray-600 hover:text-[#1E486F] font-medium"
            >
              <Package className="h-4 w-4 mr-2" />
              EQUIPAMENTOS
            </Button>
          </nav>

          {/* Mobile Navigation Icons */}
          <div className="md:hidden flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/equipamentos')}
              className="text-gray-600"
            >
              <Package className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed top-0 left-0 right-0 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-4 border-b">
              <img 
                src="https://9088bc4d5081958e858f937822185f7b.cdn.bubble.io/cdn-cgi/image/w=256,h=53,f=auto,dpr=1.25,fit=contain/f1716158171404x251547051884103870/Ativo%201.png" 
                alt="Sent Serviços" 
                className="h-6 w-auto" 
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="py-4">
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/');
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start px-4 py-3 text-gray-600 hover:text-[#1E486F] hover:bg-gray-50"
              >
                Início
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/equipamentos');
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start px-4 py-3 text-gray-600 hover:text-[#1E486F] hover:bg-gray-50"
              >
                <Package className="h-4 w-4 mr-2" />
                Equipamentos
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/cliente-demanda');
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start px-4 py-3 text-gray-600 hover:text-[#1E486F] hover:bg-gray-50"
              >
                Solicitar Serviço
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/profissionais');
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start px-4 py-3 text-gray-600 hover:text-[#1E486F] hover:bg-gray-50"
              >
                Profissionais
              </Button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
