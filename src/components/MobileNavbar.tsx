
import { Home, Package, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MobileNavbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 md:hidden">
      <div className="flex justify-around items-center">
        <button 
          className="flex flex-col items-center space-y-1 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={() => navigate('/')}
        >
          <Home className="h-5 w-5 text-gray-600" />
          <span className="text-xs text-gray-600 font-medium">Home</span>
        </button>
        
        <button 
          className="flex flex-col items-center space-y-1 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={() => navigate('/equipamentos')}
        >
          <Package className="h-5 w-5 text-gray-600" />
          <span className="text-xs text-gray-600 font-medium">Equipamentos</span>
        </button>
        
        <button 
          className="flex flex-col items-center space-y-1 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={() => navigate('/perfil')}
        >
          <User className="h-5 w-5 text-gray-600" />
          <span className="text-xs text-gray-600 font-medium">Perfil</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNavbar;
