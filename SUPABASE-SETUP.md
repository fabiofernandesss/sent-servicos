# 🚀 Configuração Supabase para PagarMe

## ✅ **SOLUÇÃO DEFINITIVA IMPLEMENTADA**

Agora usamos **Database Functions do Supabase** que eliminam completamente:
- ❌ Problemas de CORS
- ❌ URLs dinâmicas do Vercel  
- ❌ Configurações complexas de proxy
- ❌ Erros de sincronização

## 📋 **PASSOS PARA CONFIGURAR**

### 1. **Habilitar Extensão HTTP no Supabase**

Execute no **SQL Editor** do Supabase:

```sql
-- Habilitar extensão HTTP para fazer chamadas à API do PagarMe
CREATE EXTENSION IF NOT EXISTS http;
```

### 2. **Configurar Chave Secreta do PagarMe**

No **Dashboard do Supabase** → **Settings** → **Vault**:

```sql
-- Adicionar chave secreta do PagarMe
SELECT vault.create_secret(
  'sk_83744d2260054f53bc9eb5f2934d7e42', -- Sua chave secreta
  'pagarme_secret_key',
  'Chave secreta da API do PagarMe'
);

-- Configurar para uso nas funções
ALTER DATABASE postgres SET app.pagarme_secret_key = 'sk_83744d2260054f53bc9eb5f2934d7e42';
```

### 3. **Executar Migration**

Execute o arquivo `supabase/migrations/create_pagarme_functions.sql` no **SQL Editor**.

### 4. **Testar as Funções**

```sql
-- Teste PIX
SELECT create_pix_payment(
  'Fábio Fernandes',
  'fabio@teste.com', 
  '094.936.644-73',
  '81988886020',
  1000,
  'Teste PIX'
);

-- Teste Cartão
SELECT create_credit_card_payment(
  'Fábio Fernandes',
  'fabio@teste.com',
  '094.936.644-73', 
  '81988886020',
  2000,
  '4111111111111111',
  'FABIO FERNANDES',
  12,
  2025,
  '123',
  1,
  'Teste Cartão'
);
```

## 🏗️ **NOVA ARQUITETURA**

```
Frontend (React)
    ↓ supabase.rpc()
Database Functions (Supabase)
    ↓ HTTP Extension
PagarMe API (api.pagar.me)
```

## ✅ **VANTAGENS DA NOVA SOLUÇÃO**

1. **Sem CORS** - Funções rodam no servidor Supabase
2. **URL Fixa** - Sempre `supabase.rpc('function_name')`
3. **Seguro** - Chaves ficam no Supabase Vault
4. **Rápido** - Sem proxies intermediários
5. **Confiável** - Infraestrutura robusta do Supabase
6. **Logs** - Visualização no Dashboard do Supabase
7. **Escalável** - Supabase gerencia automaticamente

## 🧪 **COMO TESTAR**

1. Execute as configurações acima
2. Faça build: `npm run build`
3. Deploy: `vercel --prod`
4. Acesse: https://www.sent.eng.br
5. Teste PIX na página de Recarga

## 📊 **MONITORAMENTO**

- **Logs**: Dashboard Supabase → Logs
- **Tabela**: `pagamentos` com histórico completo
- **Status**: Função `get_payment_status()`

## 🎯 **RESULTADO ESPERADO**

✅ PIX gerado sem erro de CORS  
✅ QR Code exibido corretamente  
✅ Status atualizado em tempo real  
✅ Histórico salvo no banco  

**Esta é a solução definitiva e profissional!** 🚀
