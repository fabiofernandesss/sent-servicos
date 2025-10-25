import { supabase } from '@/integrations/supabase/client';

export interface CompraDemanda {
  compra_id: number;
  demanda_id: string; // UUID como string
  valor_pago: number;
  status: 'comprada' | 'cancelada' | 'expirada';
  created_at: string;
  dados_demanda: {
    nome: string;
    whatsapp: string;
    email: string;
    cidade: string;
    estado: string;
    observacao: string;
    categoria_nome: string;
    subcategoria_nome: string;
  };
}

export interface DadosCliente {
  nome: string;
  whatsapp: string;
  email: string;
  cidade: string;
  estado: string;
  observacao: string;
}

class DemandasService {
  /**
   * Comprar uma demanda
   */
  async comprarDemanda(demandaId: string, profissionalId: number, valorPago: number = 5.00) {
    try {
      console.log('🛒 Comprando demanda:', { demandaId, profissionalId, valorPago });

      const { data, error } = await supabase.rpc('comprar_demanda', {
        p_demanda_id: demandaId, // UUID como string
        p_profissional_id: profissionalId,
        p_valor_pago: valorPago
      });

      if (error) {
        console.error('❌ Erro ao comprar demanda:', error);
        throw new Error(error.message || 'Erro ao comprar demanda');
      }

      if (!data?.success) {
        console.error('❌ Compra não realizada:', data);
        throw new Error(data?.error || 'Erro desconhecido ao comprar demanda');
      }

      console.log('✅ Demanda comprada com sucesso:', data);
      return data;

    } catch (error) {
      console.error('❌ Erro ao comprar demanda:', error);
      throw error;
    }
  }

  /**
   * Verificar se uma demanda foi comprada
   */
  async verificarDemandaComprada(demandaId: string) {
    try {
      console.log('🔍 Verificando se demanda foi comprada:', demandaId);

      const { data, error } = await supabase.rpc('verificar_demanda_comprada', {
        p_demanda_id: demandaId // UUID como string
      });

      if (error) {
        console.error('❌ Erro ao verificar demanda:', error);
        throw new Error(error.message || 'Erro ao verificar demanda');
      }

      if (!data?.success) {
        console.error('❌ Erro na verificação:', data);
        throw new Error(data?.error || 'Erro desconhecido na verificação');
      }

      console.log('✅ Verificação concluída:', data);
      return data;

    } catch (error) {
      console.error('❌ Erro ao verificar demanda:', error);
      throw error;
    }
  }

  /**
   * Listar compras de um profissional
   */
  async listarComprasProfissional(profissionalId: number): Promise<CompraDemanda[]> {
    try {
      console.log('📋 Listando compras do profissional:', profissionalId);

      const { data, error } = await supabase.rpc('listar_compras_profissional', {
        p_profissional_id: profissionalId
      });

      // Se a função RPC retornar erro, faz fallback para consulta direta
      if (error) {
        console.error('❌ Erro ao listar compras (RPC):', error);
        return await this.listarComprasProfissionalFallback(profissionalId);
      }

      // Alguns ambientes retornam sem a chave "success"
      const compras = (data?.compras ?? (data?.success ? data?.compras : null)) as any[] | null;
      if (!compras) {
        console.error('❌ Erro na listagem (estrutura inesperada):', data);
        // Tenta fallback para garantir funcionamento da tela
        return await this.listarComprasProfissionalFallback(profissionalId);
      }

      console.log('✅ Compras listadas via RPC:', compras?.length || 0);
      // Normaliza tipos (valor_pago pode vir como string do Postgres)
      return compras.map((c: any) => ({
        compra_id: Number(c.compra_id ?? c.id),
        demanda_id: String(c.demanda_id),
        valor_pago: typeof c.valor_pago === 'string' ? parseFloat(c.valor_pago) : Number(c.valor_pago ?? 0),
        status: c.status,
        created_at: c.created_at,
        dados_demanda: {
          nome: c.dados_demanda?.nome ?? '',
          whatsapp: c.dados_demanda?.whatsapp ?? '',
          email: c.dados_demanda?.email ?? '',
          cidade: c.dados_demanda?.cidade ?? '',
          estado: c.dados_demanda?.estado ?? '',
          observacao: c.dados_demanda?.observacao ?? '',
          categoria_nome: c.dados_demanda?.categoria_nome ?? '',
          subcategoria_nome: c.dados_demanda?.subcategoria_nome ?? ''
        }
      }));

    } catch (error) {
      console.error('❌ Erro ao listar compras (geral):', error);
      // Como última tentativa, usa fallback
      return await this.listarComprasProfissionalFallback(profissionalId);
    }
  }

  // Fallback direto nas tabelas caso RPC falhe
  private async listarComprasProfissionalFallback(profissionalId: number): Promise<CompraDemanda[]> {
    console.warn('⚠️ Usando fallback para listar compras (consulta direta nas tabelas).');

    // 1) Buscar compras
    const { data: compras, error: comprasError } = await supabase
      .from('compras_demandas')
      .select('id, demanda_id, valor_pago, status, created_at, profissional_id')
      .eq('profissional_id', profissionalId)
      .order('created_at', { ascending: false });

    if (comprasError) {
      console.error('❌ Fallback falhou ao buscar compras:', comprasError);
      throw new Error(comprasError.message || 'Erro ao listar compras (fallback)');
    }

    if (!compras || compras.length === 0) {
      return [];
    }

    const demandaIds = [...new Set(compras.map((c: any) => c.demanda_id))];

    // 2) Buscar demandas relacionadas
    const { data: demandas, error: demandasError } = await supabase
      .from('demandas')
      .select('id, nome, whatsapp, email, cidade, estado, observacao, categoria_id, subcategoria_id')
      .in('id', demandaIds);

    if (demandasError) {
      console.error('❌ Fallback falhou ao buscar demandas:', demandasError);
      throw new Error(demandasError.message || 'Erro ao listar demandas (fallback)');
    }

    const catIds = [...new Set((demandas ?? []).map((d: any) => d.categoria_id).filter(Boolean))];
    const subcatIds = [...new Set((demandas ?? []).map((d: any) => d.subcategoria_id).filter(Boolean))];

    // 3) Buscar categorias e subcategorias
    const [{ data: categorias }, { data: subcategorias }] = await Promise.all([
      supabase.from('categorias').select('id, nome').in('id', catIds),
      supabase.from('subcategorias').select('id, nome').in('id', subcatIds)
    ]);

    const catMap = new Map<string, string>((categorias ?? []).map((c: any) => [String(c.id), c.nome]));
    const subcatMap = new Map<string, string>((subcategorias ?? []).map((s: any) => [String(s.id), s.nome]));

    const demandaMap = new Map<string, any>((demandas ?? []).map((d: any) => [String(d.id), d]));

    // 4) Montar resultado compatível
    const resultado: CompraDemanda[] = (compras ?? []).map((c: any) => {
      const d = demandaMap.get(String(c.demanda_id));
      const categoriaNome = d ? catMap.get(String(d.categoria_id)) || '' : '';
      const subcategoriaNome = d ? subcatMap.get(String(d.subcategoria_id)) || '' : '';

      return {
        compra_id: Number(c.id),
        demanda_id: String(c.demanda_id),
        valor_pago: typeof c.valor_pago === 'string' ? parseFloat(c.valor_pago) : Number(c.valor_pago ?? 0),
        status: c.status,
        created_at: c.created_at,
        dados_demanda: {
          nome: d?.nome ?? '',
          whatsapp: d?.whatsapp ?? '',
          email: d?.email ?? '',
          cidade: d?.cidade ?? '',
          estado: d?.estado ?? '',
          observacao: d?.observacao ?? '',
          categoria_nome: categoriaNome ?? '',
          subcategoria_nome: subcategoriaNome ?? ''
        }
      } as CompraDemanda;
    });

    console.log('✅ Compras listadas via fallback:', resultado.length);
    return resultado;
  }

  /**
   * Gerar mensagem do WhatsApp para o cliente
   */
  gerarMensagemWhatsApp(dadosCliente: DadosCliente, profissionalNome: string, profissionalWhatsapp: string): string {
    const mensagem = `Olá ${dadosCliente.nome}! 👋

Sou ${profissionalNome}, profissional da plataforma Sent Serviços.

Vi que você está procurando por serviços em ${dadosCliente.cidade}/${dadosCliente.estado}.

${dadosCliente.observacao ? `Sobre sua solicitação: "${dadosCliente.observacao}"` : ''}

Gostaria de conversar sobre como posso ajudá-lo(a) com esse serviço?

Meu WhatsApp: ${profissionalWhatsapp}

Aguardo seu retorno! 😊

*Mensagem enviada via Sent Serviços*`;

    return mensagem;
  }

  /**
   * Abrir WhatsApp com mensagem pré-formatada
   */
  abrirWhatsApp(numero: string, mensagem: string) {
    const numeroLimpo = numero.replace(/\D/g, '');
    const mensagemCodificada = encodeURIComponent(mensagem);
    const url = `https://wa.me/55${numeroLimpo}?text=${mensagemCodificada}`;
    
    window.open(url, '_blank');
  }

  /**
   * Copiar dados do cliente para área de transferência
   */
  async copiarDadosCliente(dadosCliente: DadosCliente): Promise<void> {
    const dadosFormatados = `
📋 DADOS DO CLIENTE

👤 Nome: ${dadosCliente.nome}
📱 WhatsApp: ${dadosCliente.whatsapp}
📧 Email: ${dadosCliente.email}
📍 Localização: ${dadosCliente.cidade}/${dadosCliente.estado}
📝 Observação: ${dadosCliente.observacao || 'Não informado'}

---
Sent Serviços
    `.trim();

    try {
      await navigator.clipboard.writeText(dadosFormatados);
      console.log('✅ Dados copiados para área de transferência');
    } catch (error) {
      console.error('❌ Erro ao copiar dados:', error);
      throw new Error('Erro ao copiar dados para área de transferência');
    }
  }
}

// Exportar instância única
export const demandasService = new DemandasService();
