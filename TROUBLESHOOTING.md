# 🔧 Guia de Troubleshooting - Pagar.me

## Problemas Comuns e Soluções

### 1. ❌ Erro: "Proxy não está rodando"

**Sintomas:**
- Erro de conexão recusada
- Frontend não consegue se conectar ao proxy

**Solução:**
```bash
# Verificar se o proxy está rodando
curl http://localhost:3001/health

# Se não estiver rodando, inicie:
npm run proxy
```

### 2. ❌ Erro: "Chave da API inválida"

**Sintomas:**
- Erro 401 (Unauthorized)
- "Invalid API key" na resposta

**Solução:**
1. Verifique se a chave está correta em `server/proxy.js`
2. Teste a conexão:
```bash
npm run test:pagarme
```

### 3. ❌ Erro: "CORS policy"

**Sintomas:**
- Erro no console do navegador sobre CORS
- Requisições bloqueadas

**Solução:**
- O proxy já está configurado com CORS
- Verifique se está acessando via `http://localhost:8080`

### 4. ❌ Erro: "Estrutura de dados inválida"

**Sintomas:**
- Erro 400 (Bad Request)
- "Invalid request body"

**Solução:**
- Verifique se os dados estão no formato correto
- Use o script de teste para validar:
```bash
npm run test:pagarme
```

### 5. ❌ Erro: "Cliente não encontrado"

**Sintomas:**
- Erro ao criar pedido
- "Customer not found"

**Solução:**
- O sistema cria clientes automaticamente
- Verifique se o CPF está no formato correto (apenas números)

### 6. ❌ Erro: "PIX não gerado"

**Sintomas:**
- QR Code não aparece
- Erro ao gerar PIX

**Solução:**
1. Verifique os logs do proxy
2. Teste a criação de pedido:
```bash
curl -X POST http://localhost:3001/api/pagarme/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{
      "amount": 1000,
      "description": "Teste",
      "quantity": 1
    }],
    "customer": {
      "name": "Teste",
      "email": "teste@teste.com",
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
        "expires_in": 300
      }
    }]
  }'
```

### 7. ❌ Erro: "Cartão rejeitado"

**Sintomas:**
- Pagamento com cartão falha
- "Card declined"

**Solução:**
- Use cartões de teste da Pagar.me:
  - **Visa:** 4111111111111111
  - **Mastercard:** 5555555555554444
  - **CVV:** 123
  - **Data:** Qualquer data futura

### 8. ❌ Erro: "Status não atualizado"

**Sintomas:**
- PIX pago mas saldo não creditado
- Status não muda para "paid"

**Solução:**
1. Verifique se o webhook está configurado
2. O sistema verifica status a cada 5 segundos
3. Aguarde alguns segundos após o pagamento

## 🔍 Logs de Debug

### Proxy Logs
```bash
# Ver logs em tempo real
npm run proxy

# Logs esperados:
# 🚀 Proxy Pagar.me rodando na porta 3001
# 🔍 Buscando cliente por documento: 12345678901
# ✅ Cliente criado: { id: "cus_123", ... }
# 🔥 Criando PIX REAL com dados: { ... }
# ✅ Pedido REAL criado pela API Pagar.me: { ... }
```

### Frontend Logs
Abra o DevTools do navegador (F12) e vá para a aba Console:
```javascript
// Logs esperados:
// 🔥 FAZENDO REQUISIÇÃO REAL POST para: http://localhost:3001/api/pagarme/orders
// 📊 RESPOSTA REAL (200): { id: "order_123", ... }
// ✅ DADOS RECEBIDOS DA API - ASSUMINDO COMO REAIS
```

## 🧪 Testes Automáticos

### Teste Completo
```bash
npm run test:pagarme
```

### Teste Manual
```bash
# 1. Health check
curl http://localhost:3001/health

# 2. Teste API
curl http://localhost:3001/test-pagarme

# 3. Criar cliente
curl -X POST http://localhost:3001/api/pagarme/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@teste.com","type":"individual","document":"12345678901"}'
```

## 📞 Suporte

Se os problemas persistirem:

1. **Verifique os logs** do proxy e frontend
2. **Execute o teste automático** para identificar o problema
3. **Verifique a documentação** da Pagar.me
4. **Teste com dados mínimos** para isolar o problema

## 🔧 Configurações Avançadas

### Variáveis de Ambiente
```bash
# .env
VITE_PAGARME_SECRET_KEY=sk_83744d2260054f53bc9eb5f2934d7e42
VITE_PROXY_URL=http://localhost:3001
```

### Webhook (Opcional)
Para atualizações automáticas de status, configure webhooks no painel da Pagar.me:
```
URL: https://seu-dominio.com/webhook/pagarme
Eventos: charge.paid, charge.overpaid, charge.underpaid
```

## ✅ Checklist de Verificação

Antes de reportar um problema, verifique:

- [ ] Proxy está rodando na porta 3001
- [ ] Frontend está rodando na porta 8080
- [ ] Chave da API está correta
- [ ] Conexão com internet funcionando
- [ ] Teste automático passa: `npm run test:pagarme`
- [ ] Logs não mostram erros críticos
- [ ] Dados do cliente estão completos (nome, email, CPF, telefone) 