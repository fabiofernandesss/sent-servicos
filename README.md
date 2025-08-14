# Sent Serviços

Plataforma de serviços profissionais desenvolvida em React + TypeScript + Vite.

## Características

- React 18 com TypeScript
- Vite para desenvolvimento rápido
- Tailwind CSS para estilização
- React Router para navegação
- React Query para gerenciamento de estado
- Supabase para backend
- Sistema de notificações com Sonner

## Scripts Necessários

Para que o projeto funcione corretamente no Lovable, você precisa adicionar os seguintes scripts no package.json:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:dev": "vite build --mode development",
    "preview": "vite preview"
  }
}
```

## Estrutura do Projeto

```
src/
├── pages/           # Páginas da aplicação
├── components/      # Componentes reutilizáveis
├── utils/           # Utilitários e helpers
├── types/           # Definições de tipos TypeScript
└── services/        # Serviços e APIs
```

## Configuração do Domínio

O sistema está configurado para usar o domínio `www.sent.eng.br` para as notificações enviadas aos profissionais.