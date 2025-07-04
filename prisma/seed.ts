import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.notification.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.accountPayable.deleteMany();
  await prisma.accountReceivable.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.companySettings.deleteMany();

  console.log('🧹 Dados existentes removidos');

  // Criar usuários
  const hashedPassword = await bcrypt.hash('123456', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@printsy.io',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
      active: true,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@printsy.io',
      name: 'Gerente',
      password: hashedPassword,
      role: 'MANAGER',
      active: true,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@printsy.io',
      name: 'Usuário',
      password: hashedPassword,
      role: 'USER',
      active: true,
    },
  });

  console.log('👥 Usuários criados');

  // Criar configurações da empresa
  await prisma.companySettings.create({
    data: {
      companyName: 'Printsy Gráfica Ltda',
      tradeName: 'Printsy',
      cnpj: '12.345.678/0001-99',
      email: 'contato@printsy.io',
      phone: '(11) 99999-9999',
      website: 'https://printsy.io',
      address: 'Rua das Impressoras, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      primaryColor: '#3B82F6',
    },
  });

  console.log('🏢 Configurações da empresa criadas');

  // Criar clientes
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '(11) 98765-4321',
        cpfCnpj: '123.456.789-00',
        type: 'INDIVIDUAL',
        address: 'Rua A, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01000-000',
        userId: adminUser.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Maria Oliveira',
        email: 'maria@empresa.com',
        phone: '(11) 91234-5678',
        cpfCnpj: '98.765.432/0001-10',
        type: 'COMPANY',
        companyName: 'Empresa ABC Ltda',
        address: 'Av. B, 456',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '02000-000',
        userId: adminUser.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Carlos Santos',
        email: 'carlos@email.com',
        phone: '(11) 95555-5555',
        cpfCnpj: '111.222.333-44',
        type: 'INDIVIDUAL',
        address: 'Rua C, 789',
        city: 'Guarulhos',
        state: 'SP',
        zipCode: '03000-000',
        userId: managerUser.id,
      },
    }),
  ]);

  console.log('🏪 Clientes criados');

  // Criar produtos
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Cartão de Visita',
        description: 'Cartão de visita 9x5cm, papel couché 300g',
        code: 'CV001',
        category: 'Cartões',
        price: 150.00,
        cost: 50.00,
        stock: 1000,
        minStock: 100,
        unit: 'UN',
        userId: adminUser.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Flyer A4',
        description: 'Flyer A4, papel couché 115g, 4x0 cores',
        code: 'FL001',
        category: 'Panfletos',
        price: 0.50,
        cost: 0.15,
        stock: 5000,
        minStock: 500,
        unit: 'UN',
        userId: adminUser.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Banner 1x1m',
        description: 'Banner lona 1x1m, impressão digital',
        code: 'BN001',
        category: 'Banners',
        price: 80.00,
        cost: 30.00,
        stock: 50,
        minStock: 10,
        unit: 'UN',
        userId: adminUser.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Camiseta Personalizada',
        description: 'Camiseta 100% algodão com estampa',
        code: 'CM001',
        category: 'Vestuário',
        price: 35.00,
        cost: 15.00,
        stock: 200,
        minStock: 50,
        unit: 'UN',
        userId: adminUser.id,
      },
    }),
  ]);

  console.log('📦 Produtos criados');

  // Criar orçamentos
  const quotes = await Promise.all([
    prisma.quote.create({
      data: {
        number: 'ORC-2024-001',
        status: 'SENT',
        validUntil: new Date('2024-12-31'),
        observations: 'Prazo de entrega: 5 dias úteis',
        discount: 10.00,
        discountType: 'PERCENTAGE',
        subtotal: 300.00,
        total: 270.00,
        customerId: customers[0].id,
        userId: adminUser.id,
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 1000,
              unitPrice: 0.15,
              total: 150.00,
              description: 'Cartões de visita personalizados',
            },
            {
              productId: products[1].id,
              quantity: 300,
              unitPrice: 0.50,
              total: 150.00,
              description: 'Flyers promocionais',
            },
          ],
        },
      },
    }),
    prisma.quote.create({
      data: {
        number: 'ORC-2024-002',
        status: 'APPROVED',
        validUntil: new Date('2024-12-31'),
        observations: 'Material premium',
        discount: 5.00,
        discountType: 'PERCENTAGE',
        subtotal: 400.00,
        total: 380.00,
        customerId: customers[1].id,
        userId: adminUser.id,
        items: {
          create: [
            {
              productId: products[2].id,
              quantity: 5,
              unitPrice: 80.00,
              total: 400.00,
              description: 'Banners para evento',
            },
          ],
        },
      },
    }),
  ]);

  console.log('💰 Orçamentos criados');

  // Criar pedidos
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        number: 'PED-2024-001',
        status: 'IN_PRODUCTION',
        priority: 'HIGH',
        deadline: new Date('2024-08-15'),
        observations: 'Cliente tem pressa',
        discount: 0.00,
        subtotal: 175.00,
        total: 175.00,
        customerId: customers[2].id,
        userId: adminUser.id,
        items: {
          create: [
            {
              productId: products[3].id,
              quantity: 5,
              unitPrice: 35.00,
              total: 175.00,
              description: 'Camisetas para evento',
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        number: 'PED-2024-002',
        status: 'DELIVERED',
        priority: 'NORMAL',
        deadline: new Date('2024-07-30'),
        deliveryDate: new Date('2024-07-28'),
        observations: 'Entregue no prazo',
        discount: 20.00,
        discountType: 'FIXED',
        subtotal: 500.00,
        total: 480.00,
        customerId: customers[0].id,
        userId: managerUser.id,
        quoteId: quotes[0].id,
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 2000,
              unitPrice: 0.15,
              total: 300.00,
              description: 'Cartões corporativos',
            },
            {
              productId: products[1].id,
              quantity: 400,
              unitPrice: 0.50,
              total: 200.00,
              description: 'Material promocional',
            },
          ],
        },
      },
    }),
  ]);

  console.log('📋 Pedidos criados');

  // Criar movimentações de estoque
  await Promise.all([
    prisma.stockMovement.create({
      data: {
        type: 'OUT',
        quantity: 2000,
        reason: 'Venda - Pedido PED-2024-002',
        reference: 'PED-2024-002',
        productId: products[0].id,
        userId: adminUser.id,
      },
    }),
    prisma.stockMovement.create({
      data: {
        type: 'OUT',
        quantity: 400,
        reason: 'Venda - Pedido PED-2024-002',
        reference: 'PED-2024-002',
        productId: products[1].id,
        userId: adminUser.id,
      },
    }),
    prisma.stockMovement.create({
      data: {
        type: 'IN',
        quantity: 1000,
        reason: 'Compra de material',
        reference: 'NF-123456',
        productId: products[0].id,
        userId: adminUser.id,
      },
    }),
  ]);

  console.log('📊 Movimentações de estoque criadas');

  // Criar contas a receber
  await Promise.all([
    prisma.accountReceivable.create({
      data: {
        description: 'Pagamento Pedido PED-2024-002',
        amount: 480.00,
        dueDate: new Date('2024-08-15'),
        status: 'PAID',
        paidDate: new Date('2024-07-30'),
        reference: 'PED-2024-002',
        customerId: customers[0].id,
        userId: adminUser.id,
      },
    }),
    prisma.accountReceivable.create({
      data: {
        description: 'Pagamento Pedido PED-2024-001',
        amount: 175.00,
        dueDate: new Date('2024-08-20'),
        status: 'PENDING',
        reference: 'PED-2024-001',
        customerId: customers[2].id,
        userId: adminUser.id,
      },
    }),
  ]);

  console.log('💳 Contas a receber criadas');

  // Criar contas a pagar
  await Promise.all([
    prisma.accountPayable.create({
      data: {
        description: 'Compra de papel couché',
        amount: 850.00,
        dueDate: new Date('2024-08-10'),
        status: 'PENDING',
        supplier: 'Papelaria XYZ',
        category: 'Material',
        reference: 'NF-789123',
        userId: adminUser.id,
      },
    }),
    prisma.accountPayable.create({
      data: {
        description: 'Aluguel da impressora',
        amount: 1200.00,
        dueDate: new Date('2024-08-05'),
        status: 'PAID',
        paidDate: new Date('2024-08-01'),
        supplier: 'Locadora ABC',
        category: 'Equipamento',
        reference: 'CONT-456',
        userId: adminUser.id,
      },
    }),
  ]);

  console.log('💸 Contas a pagar criadas');

  // Criar interações
  await Promise.all([
    prisma.interaction.create({
      data: {
        type: 'CALL',
        subject: 'Contato inicial',
        description: 'Cliente interessado em cartões de visita',
        customerId: customers[0].id,
        userId: adminUser.id,
      },
    }),
    prisma.interaction.create({
      data: {
        type: 'EMAIL',
        subject: 'Envio de orçamento',
        description: 'Orçamento ORC-2024-001 enviado por email',
        customerId: customers[0].id,
        userId: adminUser.id,
      },
    }),
    prisma.interaction.create({
      data: {
        type: 'MEETING',
        subject: 'Reunião de briefing',
        description: 'Definição dos detalhes do projeto de banners',
        customerId: customers[1].id,
        userId: managerUser.id,
      },
    }),
  ]);

  console.log('📞 Interações criadas');

  // Criar notificações
  await Promise.all([
    prisma.notification.create({
      data: {
        type: 'WARNING',
        title: 'Estoque Baixo',
        message: 'O produto "Banner 1x1m" está com estoque baixo (50 unidades)',
        userId: adminUser.id,
      },
    }),
    prisma.notification.create({
      data: {
        type: 'INFO',
        title: 'Novo Pedido',
        message: 'Novo pedido PED-2024-001 criado',
        userId: adminUser.id,
      },
    }),
    prisma.notification.create({
      data: {
        type: 'SUCCESS',
        title: 'Pedido Entregue',
        message: 'Pedido PED-2024-002 foi entregue com sucesso',
        userId: managerUser.id,
      },
    }),
  ]);

  console.log('🔔 Notificações criadas');

  console.log('✅ Seed concluído com sucesso!');
  console.log('');
  console.log('👥 Usuários criados:');
  console.log('📧 admin@printsy.io - Senha: 123456 (Administrador)');
  console.log('📧 manager@printsy.io - Senha: 123456 (Gerente)');
  console.log('📧 user@printsy.io - Senha: 123456 (Usuário)');
  console.log('');
  console.log('🎯 Sistema pronto para uso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });