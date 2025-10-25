import { DemandaData } from './supabaseService';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ryvcwjajgspbzxzncpfi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dmN3amFqZ3NwYnp4em5jcGZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODkzNjAsImV4cCI6MjA2MjE2NTM2MH0.1GhRnk2-YbL4awFz0c9bFWOleO_cFJKjvfyWQ30dxo8'
);

export const sendWhatsAppMessage = async (whatsapp: string, nome: string, demandaData: DemandaData) => {
  try {
    // Extrair apenas números do WhatsApp
    const phoneNumber = whatsapp.replace(/\D/g, '');
    // Formatação correta do JID conforme a API
    const jid = `55${phoneNumber}`;
    
    console.log('Enviando mensagem WhatsApp para:', jid);
    
    // Buscar nomes da categoria e subcategoria
    const [categoriaResult, subcategoriaResult] = await Promise.all([
      supabase.from('categorias').select('nome').eq('id', demandaData.categoria_id).single(),
      supabase.from('subcategorias').select('nome').eq('id', demandaData.subcategoria_id).single()
    ]);

    const categoriaNome = categoriaResult.data?.nome || 'Categoria não encontrada';
    const subcategoriaNome = subcategoriaResult.data?.nome || 'Subcategoria não encontrada';
    
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
• *Categoria:* ${categoriaNome}
• *Subcategoria:* ${subcategoriaNome}

⏰ *URGÊNCIA:*
• ${urgenciaTexto}

${demandaData.observacao ? `📝 *OBSERVAÇÕES ADICIONAIS:*\n• ${demandaData.observacao}\n\n` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ *PRÓXIMOS PASSOS:*
• Em breve um profissional qualificado da sua região entrará em contato
• Você receberá propostas personalizadas para sua necessidade
• Poderá avaliar e escolher o melhor profissional

🎯 *Sua solicitação está sendo direcionada para profissionais especializados em ${categoriaNome} na região de ${demandaData.cidade}/${demandaData.estado}*

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

// Nova função para enviar mensagem para profissionais com link da demanda
export const sendWhatsAppToProfessionals = async (
  whatsapp: string,
  demandaId: string,
  clienteNome: string,
  cidade: string,
  estado: string,
  categoriaNome: string,
  urgencia: string,
  observacao?: string
) => {
  try {
    const phoneNumber = whatsapp.replace(/\D/g, '');
    const jid = `55${phoneNumber}`;
    
    const urgenciaTexto = {
      'preciso_com_urgencia': 'Preciso com urgência',
      'quero_para_esses_dias': 'Quero para esses dias',
      'nao_tenho_tanta_pressa': 'Não tenho tanta pressa',
      'so_orcamento': 'Só orçamento'
    }[urgencia] || urgencia;

    // URL da demanda - usando o site oficial da Sent
    const demandaUrl = `https://www.sent.eng.br/demanda/${demandaId}`;

    const message = `🔔 *NOVA DEMANDA DISPONÍVEL!*

📋 *Detalhes da Solicitação:*
• *Cliente:* ${clienteNome}
• *Local:* ${cidade}/${estado}
• *Categoria:* ${categoriaNome}
• *Urgência:* ${urgenciaTexto}

${observacao ? `📝 *Observações:* ${observacao}\n\n` : ''}💼 *Uma nova oportunidade de trabalho está disponível na sua região!*

🔗 *ACESSE A DEMANDA COMPLETA:*
${demandaUrl}

📞 *Aja rápido! O primeiro profissional a responder tem mais chances de ser escolhido!*

Entre em contato com o cliente para oferecer seus serviços e fechar este negócio.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

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

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    return { success: true };

  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp para profissional:', error);
    return { success: false, error: error.message || error };
  }
};
