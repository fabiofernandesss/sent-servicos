
export const sendWhatsAppMessage = async (whatsapp: string, nome: string) => {
  try {
    // Extrair apenas números do WhatsApp e formatar o JID corretamente
    const phoneNumber = whatsapp.replace(/\D/g, '');
    const jid = `55${phoneNumber}@s.whatsapp.net`;
    
    console.log('Enviando mensagem WhatsApp para:', jid);
    
    const message = `Olá ${nome}! 🎉\n\nParabéns! Sua demanda foi enviada com sucesso!\n\nEm breve um profissional qualificado entrará em contato com você para atender sua solicitação.\n\nObrigado por confiar em nossos serviços! 😊`;

    // Criar um AbortController para timeout mais rápido
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

    const response = await fetch('https://9045.bubblewhats.com/send-message', {
      method: 'POST',
      headers: {
        'Authorization': 'YzFkMGVkNzUwYzBjMjlhYzg0ZmJjYmU3',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jid: jid,
        message: message
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.log('Response text:', responseText);
      throw new Error(`Erro HTTP: ${response.status} - ${responseText}`);
    }

    const responseData = await response.json();
    console.log('Mensagem enviada com sucesso no WhatsApp:', responseData);
    return { success: true };

  } catch (error) {
    console.error('Erro ao enviar mensagem no WhatsApp:', error);
    
    // Se for timeout ou erro de rede, não impedir o fluxo
    if (error.name === 'AbortError') {
      console.warn('Timeout no WhatsApp - continuando sem bloquear o fluxo');
      return { success: false, error: 'Timeout' };
    }
    
    return { success: false, error: error };
  }
};
