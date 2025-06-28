
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppMessagePanelProps {
  filteredProfissionais: Array<{ whatsapp: string }>;
  onSendComplete: () => void;
}

const WhatsAppMessagePanel = ({ filteredProfissionais, onSendComplete }: WhatsAppMessagePanelProps) => {
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [whatsappButtonState, setWhatsappButtonState] = useState<'draft' | 'ready' | 'sending'>('draft');
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);
  const { toast } = useToast();

  const addBrazilCode = (whatsapp: string): string => {
    const cleaned = whatsapp.replace(/\D/g, '');
    if (cleaned.startsWith('55')) {
      return cleaned;
    }
    return '55' + cleaned;
  };

  const handleWhatsappButtonClick = async () => {
    if (whatsappButtonState === 'draft') {
      setWhatsappButtonState('ready');
      return;
    }

    if (whatsappButtonState === 'ready' && whatsappMessage.trim()) {
      await sendWhatsappToFiltered();
    }
  };

  const sendWhatsappToFiltered = async () => {
    if (!whatsappMessage.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma mensagem antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    if (filteredProfissionais.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum profissional encontrado para enviar a mensagem.",
        variant: "destructive",
      });
      return;
    }

    setWhatsappButtonState('sending');
    setSendingWhatsapp(true);

    try {
      // Extrair telefones dos profissionais filtrados e adicionar código 55
      const telefones = filteredProfissionais
        .map(p => p.whatsapp)
        .filter(whatsapp => whatsapp && whatsapp.trim() !== '')
        .map(whatsapp => addBrazilCode(whatsapp));

      console.log('Telefones originais:', filteredProfissionais.map(p => p.whatsapp));
      console.log('Telefones com código 55:', telefones);

      if (telefones.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhum telefone válido encontrado nos profissionais filtrados.",
          variant: "destructive",
        });
        return;
      }

      // Enviar mensagem usando a API recursiva
      const response = await fetch('https://9045.bubblewhats.com/recursive-send-message', {
        method: 'POST',
        headers: {
          'Authorization': 'YzFkMGVkNzUwYzBjMjlhYzg0ZmJjYmU3',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipients: telefones.join(','),
          message: whatsappMessage,
          interval: '5-10'
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Resposta da API WhatsApp:', responseData);

      toast({
        title: "Sucesso! 🎉",
        description: `Mensagem enviada para ${telefones.length} profissionais filtrados.`,
        duration: 5000,
      });

      // Reset do estado
      setWhatsappMessage('');
      setWhatsappButtonState('draft');
      onSendComplete();

    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagens via WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setSendingWhatsapp(false);
      setWhatsappButtonState('draft');
    }
  };

  const handleCancel = () => {
    setWhatsappButtonState('draft');
    setWhatsappMessage('');
  };

  return (
    <div className="space-y-4">
      <Button
        variant={whatsappButtonState === 'draft' ? 'outline' : whatsappButtonState === 'ready' ? 'default' : 'secondary'}
        onClick={handleWhatsappButtonClick}
        disabled={sendingWhatsapp || filteredProfissionais.length === 0}
        className={whatsappButtonState === 'ready' ? 'bg-green-600 hover:bg-green-700' : ''}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        {whatsappButtonState === 'draft' && 'Enviar WhatsApp'}
        {whatsappButtonState === 'ready' && `Enviar para ${filteredProfissionais.length}`}
        {whatsappButtonState === 'sending' && 'Enviando...'}
      </Button>

      {whatsappButtonState === 'ready' && (
        <div className="p-4 border rounded-lg bg-green-50">
          <label className="block text-sm font-medium mb-2">
            Mensagem para {filteredProfissionais.length} profissionais:
          </label>
          <Input
            placeholder="Digite sua mensagem..."
            value={whatsappMessage}
            onChange={(e) => setWhatsappMessage(e.target.value)}
            className="mb-2"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppMessagePanel;
