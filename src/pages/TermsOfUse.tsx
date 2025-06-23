
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfUse = () => {
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
            Termos de Uso
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
                <h2 className="text-xl font-semibold text-black mb-3">1. Aceitação dos Termos</h2>
                <p className="leading-relaxed">
                  Ao acessar e usar nossa plataforma, você concorda em cumprir e estar vinculado aos presentes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-black mb-3">2. Descrição do Serviço</h2>
                <p className="leading-relaxed">
                  Nossa plataforma conecta profissionais qualificados com clientes que buscam serviços especializados. Facilitamos essa conexão através de nossa interface digital.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-black mb-3">3. Responsabilidades do Usuário</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fornecer informações precisas e atualizadas</li>
                  <li>Manter a confidencialidade de suas credenciais de acesso</li>
                  <li>Usar a plataforma de forma ética e legal</li>
                  <li>Respeitar outros usuários e suas propriedades intelectuais</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-black mb-3">4. Limitação de Responsabilidade</h2>
                <p className="leading-relaxed">
                  Nossa plataforma atua como intermediária na conexão entre profissionais e clientes. Não nos responsabilizamos pela qualidade dos serviços prestados ou por disputas entre as partes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-black mb-3">5. Modificações dos Termos</h2>
                <p className="leading-relaxed">
                  Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação na plataforma.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-black mb-3">6. Contato</h2>
                <p className="leading-relaxed">
                  Para questões relacionadas aos Termos de Uso, entre em contato conosco através dos canais oficiais da plataforma.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfUse;
