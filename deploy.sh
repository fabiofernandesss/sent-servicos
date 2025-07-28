#!/bin/bash

echo "🚀 Iniciando deploy na Vercel..."

# Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

# Verificar se está logado
if ! vercel whoami &> /dev/null; then
    echo "🔐 Fazendo login na Vercel..."
    vercel login
fi

# Build do projeto
echo "📦 Fazendo build do projeto..."
npm run build

# Deploy
echo "🚀 Fazendo deploy..."
vercel --prod

echo "✅ Deploy concluído!"
echo "🌐 Acesse: https://seu-projeto.vercel.app"
echo "📱 Teste a recarga: https://seu-projeto.vercel.app/recarga" 