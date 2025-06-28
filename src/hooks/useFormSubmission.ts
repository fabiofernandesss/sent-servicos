
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createDemanda, type DemandaData } from '@/services/supabaseService';
import { sendWhatsAppMessage } from '@/services/whatsappService';
import { sendRecursiveWhatsappMessage } from '@/services/recursiveWhatsappService';

export const useFormSubmission = () => {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data: DemandaData, resetForm: () => void) => {
    setSubmitting(true);
    console.log('Iniciando envio de demanda:', data);
    
    try {
      // Criar demanda no Supabase
      await createDemanda(data);
      
      console.log('Demanda criada com sucesso, enviando WhatsApp...');
      
      // Mostrar toast de sucesso imediatamente após salvar no banco
      toast({
        title: "Parabéns! 🎉",
        description: "Sua demanda foi enviada com sucesso! Em breve um profissional entrará em contato.",
        duration: 5000,
      });

      // Resetar o formulário após sucesso
      resetForm();

      // Enviar mensagem individual para o cliente (não bloquear o fluxo)
      sendWhatsAppMessage(data.whatsapp, data.nome, data).then((whatsappResult) => {
        if (whatsappResult.success) {
          console.log('WhatsApp individual enviado com sucesso');
        } else {
          console.warn('Erro no WhatsApp individual, mas demanda foi criada:', whatsappResult.error);
        }
      }).catch((error) => {
        console.warn('Erro no WhatsApp individual (não crítico):', error);
      });

      // Enviar mensagem recursiva para profissionais da categoria e cidade
      const mensagemProfissionais = `🔔 *NOVA DEMANDA DISPONÍVEL!*

📋 *Detalhes da Solicitação:*
• *Cliente:* ${data.nome}
• *Local:* ${data.cidade}/${data.estado}
• *Urgência:* ${data.urgencia}

${data.observacao ? `📝 *Observações:* ${data.observacao}\n\n` : ''}💼 *Uma nova oportunidade de trabalho está disponível na sua região!*

Entre em contato com o cliente para oferecer seus serviços e fechar este negócio.

📞 *Aja rápido! O primeiro profissional a responder tem mais chances de ser escolhido!*`;

      sendRecursiveWhatsappMessage(
        data.categoria_id,
        data.cidade,
        mensagemProfissionais,
        '10-15'
      ).then((recursiveResult) => {
        if (recursiveResult.success) {
          console.log(`Mensagem recursiva enviada para ${recursiveResult.recipientsCount} profissionais`);
          toast({
            title: "Profissionais notificados! 📢",
            description: `${recursiveResult.recipientsCount} profissionais da sua região foram notificados sobre sua demanda.`,
            duration: 4000,
          });
        } else {
          console.warn('Erro no envio recursivo:', recursiveResult.error);
        }
      }).catch((error) => {
        console.warn('Erro no envio recursivo (não crítico):', error);
      });

      // Resetar para página inicial após sucesso
      setTimeout(() => {
        window.location.href = '/';
      }, 3000); // Aguardar 3 segundos para o usuário ver os toasts
      
    } catch (error) {
      console.error('Erro ao cadastrar demanda:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar demanda. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    onSubmit
  };
};
