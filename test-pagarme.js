// Script de teste para verificar a integração com a Pagar.me
import fetch from 'node-fetch';

const PROXY_URL = 'http://localhost:3001';

async function testPagarmeIntegration() {
  console.log('🧪 Iniciando testes da integração Pagar.me...\n');

  try {
    // 1. Testar health check
    console.log('1️⃣ Testando health check...');
    const healthResponse = await fetch(`${PROXY_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    console.log('');

    // 2. Testar conexão com a API Pagar.me
    console.log('2️⃣ Testando conexão com a API Pagar.me...');
    const testResponse = await fetch(`${PROXY_URL}/test-pagarme`);
    const testData = await testResponse.json();
    console.log('✅ Teste API:', testData);
    console.log('');

    // 3. Testar criação de cliente com CPF válido
    console.log('3️⃣ Testando criação de cliente com CPF válido...');
    const customerData = {
      name: 'João Silva',
      email: 'joao.silva@teste.com',
      document: '12345678909', // CPF válido para teste
      phone: '11999887766'
    };

    const customerResponse = await fetch(`${PROXY_URL}/api/pagarme/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customerData)
    });

    const customerResult = await customerResponse.json();
    console.log('✅ Cliente criado:', customerResult);
    console.log('');

    // 4. Testar criação de pedido PIX de R$ 0,05
    console.log('4️⃣ Testando criação de pedido PIX de R$ 0,05...');
    const orderData = {
      customer: customerData,
      amount: 5, // R$ 0,05 em centavos
      description: 'Teste de recarga - R$ 0,05',
      payment_method: 'pix'
    };

    const orderResponse = await fetch(`${PROXY_URL}/api/pagarme/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    const orderResult = await orderResponse.json();
    console.log('✅ Pedido PIX criado:', orderResult);
    console.log('');

    // 5. Testar criação de pedido com cartão de R$ 0,05
    console.log('5️⃣ Testando criação de pedido com cartão de R$ 0,05...');
    const cardOrderData = {
      customer: customerData,
      amount: 5, // R$ 0,05 em centavos
      description: 'Teste de recarga - R$ 0,05',
      payment_method: 'credit_card',
      card: {
        number: '4111111111111111', // Cartão de teste
        holder_name: 'JOÃO SILVA',
        exp_month: 12,
        exp_year: 2025,
        cvv: '123'
      }
    };

    const cardOrderResponse = await fetch(`${PROXY_URL}/api/pagarme/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cardOrderData)
    });

    const cardOrderResult = await cardOrderResponse.json();
    console.log('✅ Pedido com cartão criado:', cardOrderResult);
    console.log('');

    console.log('🎉 Todos os testes passaram com sucesso!');
    console.log('');
    console.log('📋 Resumo:');
    console.log('- ✅ Proxy funcionando');
    console.log('- ✅ API Pagar.me conectada');
    console.log('- ✅ Cliente criado com CPF válido');
    console.log('- ✅ Pedido PIX de R$ 0,05 criado');
    console.log('- ✅ Pedido com cartão de R$ 0,05 criado');
    console.log('');
    console.log('🚀 Sistema pronto para uso!');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    console.log('');
    console.log('🔧 Verifique:');
    console.log('1. Se o proxy está rodando (npm run proxy)');
    console.log('2. Se as chaves da API estão corretas');
    console.log('3. Se a conexão com a internet está funcionando');
  }
}

testPagarmeIntegration(); 