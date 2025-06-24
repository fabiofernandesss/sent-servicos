
export const sendWhatsAppMessage = async (whatsapp: string, nome: string) => {
  try {
    // Extrair apenas números do WhatsApp
    const phoneNumber = whatsapp.replace(/\D/g, '');
    // Formatação correta do JID conforme a API
    const jid = `55${phoneNumber}`;
    
    console.log('Enviando mensagem WhatsApp para:', jid);
    
    const message = `🚀 Olá ${nome}! 🎉\n\nParabéns! Sua demanda foi enviada com sucesso!\n\nEm breve um profissional qualificado entrará em contato com você para atender sua solicitação.\n\nObrigado por confiar em nossos serviços! 😊`;

    // Criar um AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout

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
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.log('Response error text:', responseText);
      throw new Error(`Erro HTTP: ${response.status} - ${responseText}`);
    }

    const responseData = await response.text(); // Mudar para text() primeiro para ver o que retorna
    console.log('Resposta da API WhatsApp:', responseData);
    
    // Tentar fazer parse do JSON se possível
    let parsedData;
    try {
      parsedData = JSON.parse(responseData);
    } catch (e) {
      console.log('Resposta não é JSON válido, mas foi sucesso');
      parsedData = { raw: responseData };
    }
    
    console.log('Mensagem enviada com sucesso no WhatsApp:', parsedData);
    return { success: true };

  } catch (error) {
    console.error('Erro ao enviar mensagem no WhatsApp:', error);
    
    // Se for timeout ou erro de rede, não impedir o fluxo
    if (error.name === 'AbortError') {
      console.warn('Timeout no WhatsApp - continuando sem bloquear o fluxo');
      return { success: false, error: 'Timeout' };
    }
    
    return { success: false, error: error.message || error };
  }
};
