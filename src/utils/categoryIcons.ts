
import { 
  Hammer, 
  Zap, 
  Users, 
  Building, 
  Droplets, 
  Wrench, 
  Home, 
  Car, 
  Truck, 
  Baby, 
  Palette, 
  Sparkles, 
  Heart, 
  MapPin, 
  Shield, 
  Leaf, 
  Snowflake, 
  Briefcase, 
  Ruler 
} from 'lucide-react';

export const getCategoryIcon = (categoryName: string) => {
  const iconMap: { [key: string]: { icon: any; color: string; bgColor: string } } = {
    'Construção': { icon: Building, color: 'text-white', bgColor: 'bg-orange-600' },
    'Eletricista': { icon: Zap, color: 'text-white', bgColor: 'bg-yellow-500' },
    'Encanador': { icon: Droplets, color: 'text-white', bgColor: 'bg-blue-500' },
    'Pedreiro': { icon: Hammer, color: 'text-white', bgColor: 'bg-gray-600' },
    'Eventos': { icon: Users, color: 'text-white', bgColor: 'bg-purple-600' },
    'Arquitetura': { icon: Home, color: 'text-white', bgColor: 'bg-indigo-600' },
    'Limpeza': { icon: Wrench, color: 'text-white', bgColor: 'bg-green-500' },
    'Refrigeração': { icon: Snowflake, color: 'text-white', bgColor: 'bg-cyan-500' },
    'Jardinagem': { icon: Leaf, color: 'text-white', bgColor: 'bg-green-600' },
    'Segurança e Internet': { icon: Shield, color: 'text-white', bgColor: 'bg-red-600' },
    'Engenharia': { icon: Ruler, color: 'text-white', bgColor: 'bg-slate-600' },
    'Corretor': { icon: MapPin, color: 'text-white', bgColor: 'bg-emerald-600' },
    'Frete': { icon: Truck, color: 'text-white', bgColor: 'bg-amber-600' },
    'Babá': { icon: Baby, color: 'text-white', bgColor: 'bg-pink-500' },
    'Borracharia': { icon: Car, color: 'text-white', bgColor: 'bg-gray-700' },
    'Design gráfico': { icon: Palette, color: 'text-white', bgColor: 'bg-rose-500' },
    'Beleza': { icon: Sparkles, color: 'text-white', bgColor: 'bg-pink-400' },
    'Pet': { icon: Heart, color: 'text-white', bgColor: 'bg-red-400' },
    'Pintor': { icon: Palette, color: 'text-white', bgColor: 'bg-blue-400' },
    'Assentador de Piso': { icon: Wrench, color: 'text-white', bgColor: 'bg-amber-700' },
    'Todas': { icon: Briefcase, color: 'text-white', bgColor: 'bg-gray-500' }
  };
  
  return iconMap[categoryName] || { icon: Wrench, color: 'text-white', bgColor: 'bg-gray-500' };
};
