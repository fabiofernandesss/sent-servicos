
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createDemanda, type DemandaData } from '@/services/supabaseService';
import { sendWhatsAppMessage } from '@/services/whatsappService';

export const useFormSubmission = () => {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data: DemandaData) => {
    setSubmitting(true);
    console.log('Iniciando envio de demanda:', data);
    
    try {
      // Criar demanda no Supabase
      await createDemanda(data);
      
      console.log('Demanda criada com sucesso, enviando WhatsApp...');
      
      // Enviar mensagem no WhatsApp
      const whatsappResult = await sendWhatsAppMessage(data.whatsapp, data.nome);
      
      if (whatsappResult.success) {
        console.log('WhatsApp enviado com sucesso');
      } else {
        console.warn('Erro no WhatsApp, mas demanda foi criada:', whatsappResult.error);
      }

      // Mostrar toast de sucesso
      toast({
        title: "Parabéns! 🎉",
        description: "Sua demanda foi enviada com sucesso! Em breve um profissional entrará em contato.",
        duration: 5000,
      });

      // Resetar para página inicial após sucesso
      window.location.href = '/';
      
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
