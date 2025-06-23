
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      {/* Header com botão voltar */}
      <div className="w-full max-w-4xl mx-auto mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
            Política de Privacidade
          </h1>
          <p className="text-sm text-gray-500">
            Última atualização: 23 de junho de 2025
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="w-full max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-xl font-semibold text-black mb-3">1. Informações que Coletamos</h2>
                <p className="leading-relaxed mb-3">
                  Coletamos informações que você nos fornece diretamente, incluindo:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Dados de cadastro (nome, e-mail, telefone)</li>
                  <li>Informações de perfil profissional</li>
                  <li>Dados de comunicação na plataforma</li>
                  <li>Informações de uso dos serviços</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-black mb-3">2. Como Usamos suas Informações</h2>
                <p className="leading-relaxed mb-3">
                  Utilizamos suas informações para:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Facilitar conexões entre profissionais e clientes</li>
                  <li>Melhorar nossos serviços e experiência do usuário</li>
                  <li>Comunicar atualizações e informações relevantes</li>
                  <li>Garantir a segurança da plataforma</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-black mb-3">3. Compartilhamento de Informações</h2>
                <p className="leading-relaxed">
                  Não vendemos, trocamos ou transferimos suas informações pessoais para terceiros sem seu consentimento, exceto quando necessário para o funcionamento da plataforma ou quando exigido por lei.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-black mb-3">4. Segurança dos Dados</h2>
                <p className="leading-relaxed">
                  Implementamos medidas de segurança adequadas para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-black mb-3">5. Seus Direitos</h2>
                <p className="leading-relaxed mb-3">
                  Você tem o direito de:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Acessar suas informações pessoais</li>
                  <li>Corrigir dados incorretos</li>
                  <li>Solicitar a exclusão de suas informações</li>
                  <li>Retirar seu consentimento a qualquer momento</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-black mb-3">6. Contato</h2>
                <p className="leading-relaxed">
                  Para questões sobre privacidade ou exercer seus direitos, entre em contato através dos canais oficiais da plataforma.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
