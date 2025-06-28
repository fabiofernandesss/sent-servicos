
import { getProfissionaisTelefonesByCategoriaECidade } from './supabaseService';

interface RecursiveWhatsappRequest {
  recipients: string;
  message: string;
  interval: string;
}

export const sendRecursiveWhatsappMessage = async (
  categoriaId: string,
  cidade: string,
  message: string,
  interval: string = '5-10'
): Promise<{ success: boolean; recipientsCount: number; error?: string }> => {
  try {
    console.log('Iniciando envio recursivo de WhatsApp:', { categoriaId, cidade, interval });

    // Buscar telefones dos profissionais da categoria e cidade
    const telefones = await getProfissionaisTelefonesByCategoriaECidade(categoriaId, cidade);

    if (telefones.length === 0) {
      console.log('Nenhum telefone encontrado para a categoria e cidade especificadas');
      return {
        success: false,
        recipientsCount: 0,
        error: 'Nenhum profissional encontrado para esta categoria e cidade'
      };
    }

    // Juntar todos os telefones separados por vírgula
    const recipients = telefones.join(',');
    console.log('Recipients para API:', recipients);

    const requestBody: RecursiveWhatsappRequest = {
      recipients,
      message,
      interval
    };

    console.log('Enviando para API recursiva:', requestBody);

    // Fazer a requisição para a API
    const response = await fetch('https://9045.bubblewhats.com/recursive-send-message', {
      method: 'POST',
      headers: {
        'Authorization': 'YzFkMGVkNzUwYzBjMjlhYzg0ZmJjYmU3',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API recursiva:', errorText);
      throw new Error(`Erro ao enviar mensagens (${response.status}): ${errorText}`);
    }

    const responseData = await response.text();
    console.log('Resposta da API recursiva:', responseData);

    return {
      success: true,
      recipientsCount: telefones.length
    };

  } catch (error) {
    console.error('Erro no envio recursivo de WhatsApp:', error);
    return {
      success: false,
      recipientsCount: 0,
      error: error.message || 'Erro desconhecido'
    };
  }
};
