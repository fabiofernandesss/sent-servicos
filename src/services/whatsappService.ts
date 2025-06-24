
export const sendWhatsAppMessage = async (whatsapp: string, nome: string) => {
  try {
    // Extrair apenas números do WhatsApp e formatar o JID corretamente
    const phoneNumber = whatsapp.replace(/\D/g, '');
    const jid = `55${phoneNumber}@s.whatsapp.net`;
    
    console.log('Enviando mensagem WhatsApp para:', jid);
    
    const message = `Olá ${nome}! 🎉\n\nParabéns! Sua demanda foi enviada com sucesso!\n\nEm breve um profissional qualificado entrará em contato com você para atender sua solicitação.\n\nObrigado por confiar em nossos serviços! 😊`;

    const response = await fetch('https://9045.bubblewhats.com/send-message', {
      method: 'POST',
      headers: {
        'Authorization': 'YzFkMGVkNzUwYzBjMjlhYzg0ZmJjYmU3',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jid: jid,
        message: message
      })
    });

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response text:', responseText);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} - ${responseText}`);
    }

    console.log('Mensagem enviada com sucesso no WhatsApp');
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar mensagem no WhatsApp:', error);
    return { success: false, error: error };
  }
};
