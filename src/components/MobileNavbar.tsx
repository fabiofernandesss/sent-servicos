
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Wrench, User } from 'lucide-react';

const MobileNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    // Scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around items-center py-2">
        <button
          onClick={() => handleNavigation('/')}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isActive('/') 
              ? 'text-[#1E486F] bg-blue-50' 
              : 'text-gray-600 hover:text-[#1E486F] hover:bg-gray-50'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Início</span>
        </button>
        
        <button
          onClick={() => handleNavigation('/equipamentos')}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isActive('/equipamentos') 
              ? 'text-[#1E486F] bg-blue-50' 
              : 'text-gray-600 hover:text-[#1E486F] hover:bg-gray-50'
          }`}
        >
          <Wrench className="h-5 w-5" />
          <span className="text-xs mt-1">Equipamentos</span>
        </button>
        
        <button
          onClick={() => handleNavigation('/perfil')}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isActive('/perfil') 
              ? 'text-[#1E486F] bg-blue-50' 
              : 'text-gray-600 hover:text-[#1E486F] hover:bg-gray-50'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNavbar;
