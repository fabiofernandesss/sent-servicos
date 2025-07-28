# 🚀 Integração Real com Pagar.me - CORRIGIDA

## ⚡ Como rodar o sistema completo

### 1. Instalar dependências
```bash
npm install
```

### 2. Executar as tabelas no Supabase
Execute o arquivo `database-setup.sql` no SQL Editor do Supabase.

### 3. Rodar o sistema completo
```bash
# Roda o proxy (porta 3001) + frontend (porta 8080) simultaneamente
npm run dev:full
```

**OU rodar separadamente:**

```bash
# Terminal 1 - Proxy do Pagar.me
npm run proxy

# Terminal 2 - Frontend
npm run dev
```

### 4. Testar a integração
```bash
# Em outro terminal, testar se tudo está funcionando
npm run test:pagarme
```

## 🔧 Como funciona

### Arquitetura
```
Frontend (React) → Proxy (Node.js) → API Pagar.me
     ↓
  Supabase (Cache + Transações)
```

### Fluxo de Pagamento

1. **PIX Real:**
   - Cria cliente no Pagar.me (se não existir)
   - Gera QR Code real via API
   - Monitora status a cada 5 segundos
   - Credita saldo quando pago

2. **Cartão Real:**
   - Cria cliente no Pagar.me (se não existir)
   - Processa pagamento real
   - Verifica aprovação/rejeição
   - Credita saldo se aprovado

### URLs importantes
- **Frontend:** http://localhost:8080
- **Proxy:** http://localhost:3001
- **Health Check:** http://localhost:3001/health
- **Teste API:** http://localhost:3001/test-pagarme

## 🔑 Configurações

### Chave do Pagar.me
Configurada em `server/proxy.js`:
```javascript
const PAGARME_SECRET_KEY = 'sk_83744d2260054f53bc9eb5f2934d7e42';
```

### Endpoints do Proxy
- `GET /api/pagarme/customers?document=123` - Buscar cliente
- `POST /api/pagarme/customers` - Criar cliente
- `POST /api/pagarme/orders` - Criar pedido
- `GET /api/pagarme/orders/:id` - Status do pedido

## ✅ Funcionalidades Reais

- ✅ **Clientes reais** criados no Pagar.me
- ✅ **PIX real** com QR Code válido
- ✅ **Cartão real** com processamento
- ✅ **Cache inteligente** em memória
- ✅ **Verificação automática** de status
- ✅ **Saldo creditado** automaticamente
- ✅ **Logs detalhados** para debug
- ✅ **Estrutura de dados correta** seguindo documentação oficial

## 🐛 Debug

### Logs do Proxy
O proxy mostra logs detalhados no terminal:
```
🚀 Proxy Pagar.me rodando na porta 3001
📡 API disponível em: http://localhost:3001
🔑 Usando chave: sk_8374...
```

### Logs do Frontend
Abra o DevTools do navegador para ver:
- Requisições para o proxy
- Respostas da API Pagar.me
- Status dos pagamentos

### Teste Automático
Execute o teste para verificar se tudo está funcionando:
```bash
npm run test:pagarme
```

## 🚨 Problemas Corrigidos

### ✅ Chaves da API
- **Antes:** Chaves inconsistentes entre proxy e serviço
- **Agora:** Chaves unificadas e corretas

### ✅ Estrutura de Dados
- **Antes:** Formato incorreto para a API v5
- **Agora:** Seguindo documentação oficial da Pagar.me

### ✅ Tratamento de Erros
- **Antes:** Erros não tratados adequadamente
- **Agora:** Tratamento robusto com logs detalhados

### ✅ CORS
- **Antes:** Problemas de CORS em desenvolvimento
- **Agora:** Configuração correta para localhost

## 📱 Teste

1. Acesse http://localhost:8080/recarga
2. Escolha um valor
3. Selecione PIX ou Cartão
4. Faça o pagamento real
5. Veja o saldo sendo creditado automaticamente

## 🔧 Estrutura de Dados Corrigida

### Pedido PIX
```json
{
  "items": [{
    "amount": 1000,
    "description": "Recarga de créditos",
    "quantity": 1,
    "code": "recarga_1234567890",
    "category": "recarga"
  }],
  "customer": {
    "name": "João Silva",
    "email": "joao@email.com",
    "type": "individual",
    "document": "12345678901",
    "phones": {
      "mobile_phone": {
        "country_code": "55",
        "area_code": "11",
        "number": "999999999"
      }
    }
  },
  "payments": [{
    "payment_method": "pix",
    "pix": {
      "expires_in": 300,
      "additional_information": [{
        "name": "Recarga",
        "value": "R$ 10,00"
      }]
    }
  }],
  "code": "order_1234567890",
  "closed": true
}
```

### Pedido Cartão
```json
{
  "items": [{
    "amount": 1000,
    "description": "Recarga de créditos",
    "quantity": 1,
    "code": "recarga_1234567890",
    "category": "recarga"
  }],
  "customer": {
    "name": "João Silva",
    "email": "joao@email.com",
    "type": "individual",
    "document": "12345678901",
    "phones": {
      "mobile_phone": {
        "country_code": "55",
        "area_code": "11",
        "number": "999999999"
      }
    }
  },
  "payments": [{
    "payment_method": "credit_card",
    "credit_card": {
      "installments": 1,
      "statement_descriptor": "SENT SERVICOS",
      "card": {
        "number": "4111111111111111",
        "holder_name": "JOÃO SILVA",
        "exp_month": 12,
        "exp_year": 2025,
        "cvv": "123"
      }
    }
  }],
  "code": "order_1234567890",
  "closed": true
}
```

**Pronto! Sistema 100% funcional com pagamentos reais! 🎉**