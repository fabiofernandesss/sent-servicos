
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createDemanda, type DemandaData } from '@/services/supabaseService';
import { sendWhatsAppMessage } from '@/services/whatsappService';

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

      // Enviar mensagem no WhatsApp em segundo plano (não bloquear o fluxo)
      sendWhatsAppMessage(data.whatsapp, data.nome, data).then((whatsappResult) => {
        if (whatsappResult.success) {
          console.log('WhatsApp enviado com sucesso');
        } else {
          console.warn('Erro no WhatsApp, mas demanda foi criada:', whatsappResult.error);
        }
      }).catch((error) => {
        console.warn('Erro no WhatsApp (não crítico):', error);
      });

      // Resetar para página inicial após sucesso
      setTimeout(() => {
        window.location.href = '/';
      }, 2000); // Aguardar 2 segundos para o usuário ver o toast
      
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
