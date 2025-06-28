
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
  const iconMap: { [key: string]: { icon: any; color: string; borderColor: string } } = {
    'Construção': { icon: Building, color: 'text-orange-600', borderColor: 'border-orange-600' },
    'Eletricista': { icon: Zap, color: 'text-yellow-500', borderColor: 'border-yellow-500' },
    'Encanador': { icon: Droplets, color: 'text-blue-500', borderColor: 'border-blue-500' },
    'Pedreiro': { icon: Hammer, color: 'text-gray-600', borderColor: 'border-gray-600' },
    'Eventos': { icon: Users, color: 'text-purple-600', borderColor: 'border-purple-600' },
    'Arquitetura': { icon: Home, color: 'text-indigo-600', borderColor: 'border-indigo-600' },
    'Limpeza': { icon: Wrench, color: 'text-green-500', borderColor: 'border-green-500' },
    'Refrigeração': { icon: Snowflake, color: 'text-cyan-500', borderColor: 'border-cyan-500' },
    'Jardinagem': { icon: Leaf, color: 'text-green-600', borderColor: 'border-green-600' },
    'Segurança e Internet': { icon: Shield, color: 'text-red-600', borderColor: 'border-red-600' },
    'Engenharia': { icon: Ruler, color: 'text-slate-600', borderColor: 'border-slate-600' },
    'Corretor': { icon: MapPin, color: 'text-emerald-600', borderColor: 'border-emerald-600' },
    'Frete': { icon: Truck, color: 'text-amber-600', borderColor: 'border-amber-600' },
    'Babá': { icon: Baby, color: 'text-pink-500', borderColor: 'border-pink-500' },
    'Borracharia': { icon: Car, color: 'text-gray-700', borderColor: 'border-gray-700' },
    'Design gráfico': { icon: Palette, color: 'text-rose-500', borderColor: 'border-rose-500' },
    'Beleza': { icon: Sparkles, color: 'text-pink-400', borderColor: 'border-pink-400' },
    'Pet': { icon: Heart, color: 'text-red-400', borderColor: 'border-red-400' },
    'Pintor': { icon: Palette, color: 'text-blue-400', borderColor: 'border-blue-400' },
    'Assentador de Piso': { icon: Wrench, color: 'text-amber-700', borderColor: 'border-amber-700' },
    'Todas': { icon: Briefcase, color: 'text-gray-500', borderColor: 'border-gray-500' }
  };
  
  return iconMap[categoryName] || { icon: Wrench, color: 'text-gray-500', borderColor: 'border-gray-500' };
};
