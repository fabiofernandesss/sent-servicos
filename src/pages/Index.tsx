
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelection = (role: string) => {
    setSelectedRole(role);
    console.log(`Usuário selecionou: ${role}`);
    // Aqui você pode adicionar navegação ou outras ações
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-6 flex flex-col items-center">
      {/* Logo */}
      <div className="w-full max-w-md mb-8 flex justify-center">
        <img 
          src="https://9088bc4d5081958e858f937822185f7b.cdn.bubble.io/cdn-cgi/image/w=256,h=53,f=auto,dpr=1.25,fit=contain/f1716158171404x251547051884103870/Ativo%201.png"
          alt="Logo"
          className="h-12 w-auto sm:h-16 md:h-20"
        />
      </div>

      {/* Título Principal */}
      <div className="text-center mb-8 max-w-md">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Bem-vindo!
        </h1>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          Escolha como você deseja usar nossa plataforma
        </p>
      </div>

      {/* Cards de Escolha */}
      <div className="w-full max-w-4xl space-y-4 sm:space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6 lg:gap-8">
        
        {/* Card Cliente */}
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
            selectedRole === 'cliente' ? 'ring-2 ring-blue-500 shadow-lg' : ''
          }`}
          onClick={() => handleRoleSelection('cliente')}
        >
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="relative overflow-hidden rounded-lg">
                <img 
                  src="https://9088bc4d5081958e858f937822185f7b.cdn.bubble.io/cdn-cgi/image/w=384,h=216,f=auto,dpr=1.25,fit=contain/f1723061404023x261344246053864860/Sem%20nome%20%28800%20x%20450%20px%29%20%28800%20x%20450%20px%29%20%284%29.gif"
                  alt="Cliente"
                  className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg"
                />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                  Sou Cliente
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Procuro profissionais qualificados para atender minhas necessidades
                </p>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  size="lg"
                >
                  Continuar como Cliente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Profissional */}
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
            selectedRole === 'profissional' ? 'ring-2 ring-green-500 shadow-lg' : ''
          }`}
          onClick={() => handleRoleSelection('profissional')}
        >
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="relative overflow-hidden rounded-lg">
                <img 
                  src="https://9088bc4d5081958e858f937822185f7b.cdn.bubble.io/cdn-cgi/image/w=384,h=216,f=auto,dpr=1.25,fit=contain/f1723060289465x326811261910033600/Sem%20nome%20%28800%20x%20450%20px%29%20%28800%20x%20450%20px%29%20%283%29.gif"
                  alt="Profissional"
                  className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg"
                />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                  Sou Profissional
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Ofereço meus serviços e quero conectar com novos clientes
                </p>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  size="lg"
                >
                  Continuar como Profissional
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rodapé */}
      <div className="mt-8 text-center">
        <p className="text-xs sm:text-sm text-gray-500">
          Ao continuar, você concorda com nossos termos de uso
        </p>
      </div>
    </div>
  );
};

export default Index;
