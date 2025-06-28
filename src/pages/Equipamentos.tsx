
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ryvcwjajgspbzxzncpfi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dmN3amFqZ3NwYnp4em5jcGZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODkzNjAsImV4cCI6MjA2MjE2NTM2MH0.1GhRnk2-YbL4awFz0c9bFWOleO_cFJKjvfyWQ30dxo8');

interface Equipamento {
  id: string;
  nome: string;
  categoria: string;
  descrição: string;
  foto: string;
}

const Equipamentos = () => {
  const navigate = useNavigate();
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEquipamentos();
  }, []);

  const loadEquipamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('equipamentos')
        .select('*')
        .order('nome');

      if (error) throw error;
      setEquipamentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    window.open('https://api.whatsapp.com/message/Q4IOVKWQAXLGN1?autoload=1&app_absent=0', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Carregando equipamentos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-gray-600"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <img 
                src="https://9088bc4d5081958e858f937822185f7b.cdn.bubble.io/cdn-cgi/image/w=256,h=53,f=auto,dpr=1.25,fit=contain/f1716158171404x251547051884103870/Ativo%201.png" 
                alt="Sent Serviços" 
                className="h-5 w-auto" 
              />
            </div>
          </div>
        </div>
      </header>

      {/* Título */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1E486F] mb-2">
            Equipamentos para Locação
          </h1>
          <p className="text-gray-600">
            Encontre o equipamento ideal para seu projeto
          </p>
        </div>

        {/* Grid de Equipamentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {equipamentos.map((equipamento) => (
            <Card key={equipamento.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {/* Imagem */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <img
                  src={equipamento.foto}
                  alt={equipamento.nome}
                  className="w-full h-full object-contain p-4"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>

              <CardContent className="p-4">
                {/* Nome do Equipamento */}
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                  {equipamento.nome}
                </h3>

                {/* Categoria */}
                <Badge className="mb-3 bg-[#1E486F] text-white">
                  {equipamento.categoria}
                </Badge>

                {/* Descrição */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {equipamento.descrição}
                </p>

                {/* Botão WhatsApp */}
                <Button
                  onClick={handleWhatsAppClick}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  FALAR CONOSCO
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {equipamentos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Nenhum equipamento encontrado no momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Equipamentos;
