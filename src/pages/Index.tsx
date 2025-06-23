import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
const Index = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const handleRoleSelection = (role: string) => {
    setSelectedRole(role);
    console.log(`Usuário selecionou: ${role}`);
    // Aqui você pode adicionar navegação ou outras ações
  };
  return <div className="min-h-screen bg-white px-4 py-4 flex flex-col items-center relative">
      {/* Botões flutuantes para lojas */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        {/* Play Store */}
        <a href="https://play.google.com/store/apps/details?id=com.converta.sent" target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.92 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
          </svg>
        </a>

        {/* Apple Store */}
        <a href="https://apps.apple.com/us/app/sent-servi%C3%A7os/id6578414284" target="_blank" rel="noopener noreferrer" className="bg-black hover:bg-gray-800 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
          </svg>
        </a>
      </div>

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
      <div className="w-full max-w-5xl space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-6 lg:gap-8 mb-6">
        
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
                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed font-medium">Ofereço meus serviços e quero conectar com novos clientes todos os dias</p>
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
                <img alt="Cliente" className="w-full h-28 sm:h-32 md:h-40 object-cover" src="/lovable-uploads/8a0f17a6-7fe4-45b1-918f-1d0c670cac7c.png" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-3">
                  Sou Cliente
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed font-medium">Procuro profissionais qualificados para atender minhas demandas</p>
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
      <div className="mt-auto text-center space-y-4">
        <p className="text-sm text-gray-700 font-medium">
          Conectando talentos, construindo oportunidades
        </p>
        
        {/* Botões melhorados para Termos e Política */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/terms">
            <Button variant="outline" size="sm" className="text-xs px-3 py-1 h-8 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 rounded-full">
              <ExternalLink className="w-3 h-3 mr-1" />
              Termos de Uso
            </Button>
          </Link>
          <Link to="/privacy">
            <Button variant="outline" size="sm" className="text-xs px-3 py-1 h-8 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 rounded-full">
              <ExternalLink className="w-3 h-3 mr-1" />
              Política de Privacidade
            </Button>
          </Link>
        </div>
        
        <p className="text-xs text-gray-500 font-medium">
          Ao continuar, você concorda com nossos termos de uso
        </p>
        
        {/* Informações da empresa */}
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 font-medium">
            SENT ENGENHARIA E TECNOLOGIA LTDA - CNPJ - 21.357.305/0001-25
          </p>
        </div>
      </div>
    </div>;
};
export default Index;