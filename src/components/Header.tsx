
import { Link } from 'react-router-dom';
import MobileNavbar from './MobileNavbar';
import ProfessionalLogoutMenu from './ProfessionalLogoutMenu';

const Header = () => {
  return (
    <header className="bg-[#1E486F] text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/lovable-uploads/af1a336b-3a05-412b-aa88-9b754e687d34.png"
              alt="Logo"
              className="h-8 w-8"
            />
            <span className="text-xl font-bold">Facilita Obra</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="hover:text-gray-200 transition-colors"
            >
              Início
            </Link>
            <Link 
              to="/cliente-demanda" 
              className="hover:text-gray-200 transition-colors"
            >
              Solicitar Serviço
            </Link>
            <Link 
              to="/equipamentos" 
              className="hover:text-gray-200 transition-colors"
            >
              Equipamentos
            </Link>
            <Link 
              to="/profissionais" 
              className="hover:text-gray-200 transition-colors"
            >
              Área do Profissional
            </Link>
            
            {/* Logout Menu for Desktop/Tablet */}
            <ProfessionalLogoutMenu />
          </nav>

          {/* Mobile Navigation */}
          <MobileNavbar />
        </div>
      </div>
    </header>
  );
};

export default Header;
