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
  return <div className="min-h-screen bg-white px-4 py-4 flex flex-col items-center">
      {/* Logo */}
      <div className="w-full max-w-md mb-6 flex justify-center">
        <img src="https://9088bc4d5081958e858f937822185f7b.cdn.bubble.io/cdn-cgi/image/w=256,h=53,f=auto,dpr=1.25,fit=contain/f1716158171404x251547051884103870/Ativo%201.png" alt="Logo" className="h-8 w-auto sm:h-10 md:h-12" />
      </div>

      {/* Título Principal */}
      <div className="text-center mb-6 max-w-lg">
        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-medium">
          Escolha como você deseja usar nossa plataforma
        </p>
      </div>

      {/* Cards de Escolha */}
      <div className="w-full max-w-5xl space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-6 lg:gap-8">
        
        {/* Card Profissional - Primeiro */}
        <Card className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 ${selectedRole === 'profissional' ? 'border-[#CB0533] shadow-xl' : 'border-gray-200'}`} onClick={() => handleRoleSelection('profissional')}>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center space-y-4">
              <div className="relative overflow-hidden rounded-xl shadow-lg">
                <img alt="Profissional" className="w-full h-28 sm:h-32 md:h-40 object-cover" src="/lovable-uploads/8b9daf9f-6b9e-4f30-bc40-3b49c2d48c42.png" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-3">
                  Sou Profissional
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed font-medium">
                  Ofereço meus serviços e quero conectar com novos clientes
                </p>
                <Button className="w-full font-bold text-white transition-all duration-200 shadow-lg hover:shadow-xl" style={{
                backgroundColor: '#CB0533',
                height: '54px',
                borderRadius: '27px'
              }} onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#a50429';
              }} onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#CB0533';
              }}>
                  Continuar como Profissional
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Cliente - Segundo */}
        <Card className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 ${selectedRole === 'cliente' ? 'border-[#1B4970] shadow-xl' : 'border-gray-200'}`} onClick={() => handleRoleSelection('cliente')}>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center space-y-4">
              <div className="relative overflow-hidden rounded-xl shadow-lg">
                <img alt="Cliente" className="w-full h-28 sm:h-32 md:h-40 object-cover" src="/lovable-uploads/0ebe5226-0d8b-4884-9fcc-45c9e114b72f.png" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-3">
                  Sou Cliente
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed font-medium">
                  Procuro profissionais qualificados para atender minhas necessidades
                </p>
                <Button className="w-full font-bold text-white transition-all duration-200 shadow-lg hover:shadow-xl" style={{
                backgroundColor: '#1B4970',
                height: '54px',
                borderRadius: '27px'
              }} onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#153a5b';
              }} onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#1B4970';
              }}>
                  Continuar como Cliente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rodapé */}
      <div className="mt-6 text-center">
        <p className="text-xs sm:text-sm text-gray-500 font-medium">
          Ao continuar, você concorda com nossos termos de uso
        </p>
      </div>
    </div>;
};
export default Index;