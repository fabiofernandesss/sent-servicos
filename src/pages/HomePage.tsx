import React from 'react'

const HomePage = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Sent Serviços</h1>
      <p className="text-center text-muted-foreground">
        Plataforma de serviços profissionais
      </p>
      
      <div className="mt-8 p-6 bg-card rounded-lg border">
        <h2 className="text-2xl font-semibold mb-4">Sistema de Notificações</h2>
        <p className="text-muted-foreground">
          Aqui será implementado o sistema que envia mensagens para profissionais 
          com o domínio correto: www.sent.eng.br
        </p>
      </div>
    </div>
  )
}

export default HomePage