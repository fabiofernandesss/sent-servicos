
import { DemandaData } from './supabaseService';

export const sendWhatsAppMessage = async (whatsapp: string, nome: string, demandaData: DemandaData) => {
  try {
    // Extrair apenas números do WhatsApp
    const phoneNumber = whatsapp.replace(/\D/g, '');
    // Formatação correta do JID conforme a API
    const jid = `55${phoneNumber}`;
    
    console.log('Enviando mensagem WhatsApp para:', jid);
    
    // Formatar urgência de forma legível
    const urgenciaTexto = {
      'preciso_com_urgencia': 'Preciso com urgência',
      'quero_para_esses_dias': 'Quero para esses dias',
      'nao_tenho_tanta_pressa': 'Não tenho tanta pressa',
      'so_orcamento': 'Só orçamento'
    }[demandaData.urgencia] || demandaData.urgencia;

    const message = `🚀 Olá *${nome}*! 🎉

*PARABÉNS! SUA SOLICITAÇÃO FOI ENVIADA COM SUCESSO!*

━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 *RESUMO DA SUA SOLICITAÇÃO:*

👤 *DADOS PESSOAIS:*
• *Nome:* ${demandaData.nome}
• *Email:* ${demandaData.email}
• *WhatsApp:* ${demandaData.whatsapp}

📍 *LOCALIZAÇÃO:*
• *Estado:* ${demandaData.estado}
• *Cidade:* ${demandaData.cidade}

🔧 *SERVIÇO SOLICITADO:*
• *Categoria:* ${demandaData.categoria_id}
• *Subcategoria:* ${demandaData.subcategoria_id}

⏰ *URGÊNCIA:*
• ${urgenciaTexto}

${demandaData.observacao ? `📝 *OBSERVAÇÕES ADICIONAIS:*\n• ${demandaData.observacao}\n\n` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ *PRÓXIMOS PASSOS:*
• Em breve um profissional qualificado da sua região entrará em contato
• Você receberá propostas personalizadas para sua necessidade
• Poderá avaliar e escolher o melhor profissional

🎯 *Sua solicitação está sendo direcionada para profissionais especializados em ${demandaData.categoria_id} na região de ${demandaData.cidade}/${demandaData.estado}*

💬 *Obrigado por confiar em nossos serviços!*
*Nossa equipe está trabalhando para conectar você ao profissional ideal!* 🤝

━━━━━━━━━━━━━━━━━━━━━━━━━━
*📞 Em caso de dúvidas, responda esta mensagem*`;

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
