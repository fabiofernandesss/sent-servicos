# 🚀 Guia de Deploy na Vercel

## 📋 Pré-requisitos

1. **Conta na Vercel**: [vercel.com](https://vercel.com)
2. **Conta na Pagar.me**: [pagar.me](https://pagar.me)
3. **Chave da API Pagar.me**: Secret Key de produção

## 🔧 Configuração

### 1. **Instalar Vercel CLI**
```bash
npm i -g vercel
```

### 2. **Login na Vercel**
```bash
vercel login
```

### 3. **Configurar Variáveis de Ambiente**

Na Vercel Dashboard:
- **Environment Variable**: `PAGARME_SECRET_KEY`
- **Value**: Sua chave secreta da Pagar.me (produção)

### 4. **Deploy**

```bash
# Deploy inicial
vercel

# Para produção
vercel --prod
```

## 🏗️ Estrutura do Projeto

```
sent-servicos/
├── api/                    # Vercel Functions
│   └── pagarme/
│       ├── orders.js       # Criar pedidos
│       ├── customers.js    # Gerenciar clientes
│       └── orders/[id].js  # Status do pedido
├── src/                    # Frontend React
├── vercel.json            # Configuração Vercel
└── package.json           # Scripts e dependências
```

## 🔄 URLs das APIs

### **Desenvolvimento (Local)**
- Frontend: `http://localhost:8080`
- API: `http://localhost:3001/api/pagarme/*`

### **Produção (Vercel)**
- Frontend: `https://seu-projeto.vercel.app`
- API: `https://seu-projeto.vercel.app/api/pagarme/*`

## 📱 Endpoints Disponíveis

### **Pedidos**
- `POST /api/pagarme/orders` - Criar pedido
- `GET /api/pagarme/orders/[id]` - Status do pedido

### **Clientes**
- `GET /api/pagarme/customers?document=12345678909` - Buscar cliente
- `POST /api/pagarme/customers` - Criar cliente

## 🧪 Testando o Deploy

### **1. Teste Local**
```bash
npm run dev:full
```

### **2. Teste Produção**
```bash
# Após o deploy, acesse:
https://seu-projeto.vercel.app/recarga
```

## 🔍 Logs e Debug

### **Vercel Dashboard**
- Acesse: [vercel.com/dashboard](https://vercel.com/dashboard)
- Selecione seu projeto
- Vá em "Functions" para ver logs

### **Vercel CLI**
```bash
vercel logs
```

## 🚨 Troubleshooting

### **Erro: "PAGARME_SECRET_KEY not found"**
1. Verifique se a variável está configurada na Vercel
2. Reinicie o deploy: `vercel --prod`

### **Erro: "CORS"**
- As Vercel Functions já têm CORS configurado
- Verifique se está usando a URL correta

### **Erro: "Function not found"**
- Verifique se os arquivos estão em `/api/`
- Reinicie o deploy

## 📊 Monitoramento

### **Vercel Analytics**
- Performance da aplicação
- Uso das Functions
- Erros em tempo real

### **Pagar.me Dashboard**
- Transações
- Status dos pagamentos
- Logs da API

## 🎯 Comandos Úteis

```bash
# Deploy rápido
vercel

# Deploy para produção
vercel --prod

# Ver logs
vercel logs

# Listar projetos
vercel ls

# Remover projeto
vercel remove
```

## ✅ Checklist de Deploy

- [ ] Vercel CLI instalado
- [ ] Login na Vercel feito
- [ ] Variável `PAGARME_SECRET_KEY` configurada
- [ ] Deploy executado com sucesso
- [ ] Frontend funcionando
- [ ] APIs respondendo
- [ ] Pagamentos testados
- [ ] QR Code aparecendo
- [ ] Logs verificados

## 🎉 Sucesso!

Após seguir todos os passos, sua aplicação estará rodando na Vercel com:
- ✅ Frontend React
- ✅ APIs serverless
- ✅ Integração Pagar.me
- ✅ Sistema de pagamentos completo
- ✅ QR Code PIX funcionando
- ✅ Monitoramento e logs

**URL final**: `https://seu-projeto.vercel.app` 