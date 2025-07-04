const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // Criar usuário administrador padrão
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@grafica.com' },
      update: {},
      create: {
        name: 'Administrador',
        email: 'admin@grafica.com',
        password: adminPassword,
        role: 'ADMIN',
        active: true
      }
    });

    console.log('✅ Usuário administrador criado:', adminUser.email);

    // Criar usuário comum de exemplo
    const userPassword = await bcrypt.hash('user123', 12);
    
    const normalUser = await prisma.user.upsert({
      where: { email: 'usuario@grafica.com' },
      update: {},
      create: {
        name: 'Usuário Exemplo',
        email: 'usuario@grafica.com',
        password: userPassword,
        role: 'USER',
        active: true
      }
    });

    console.log('✅ Usuário comum criado:', normalUser.email);

    // Criar configurações da empresa
    await prisma.companySettings.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        name: 'Gráfica Exemplo',
        document: '12.345.678/0001-99',
        email: 'contato@grafica.com',
        phone: '(11) 99999-9999',
        address: 'Rua das Gráficas, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        theme: 'light'
      }
    });

    console.log('✅ Configurações da empresa criadas');

    // Criar alguns clientes de exemplo
    const customers = [
      {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        phone: '(11) 98888-8888',
        document: '123.456.789-00',
        address: 'Rua A, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01000-000'
      },
      {
        name: 'Empresa XYZ Ltda',
        email: 'contato@empresaxyz.com',
        phone: '(11) 97777-7777',
        document: '98.765.432/0001-10',
        address: 'Av. B, 456',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '02000-000'
      },
      {
        name: 'Maria Santos',
        email: 'maria@exemplo.com',
        phone: '(11) 96666-6666',
        document: '987.654.321-00',
        address: 'Rua C, 789',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '03000-000'
      }
    ];

    for (const customerData of customers) {
      await prisma.customer.upsert({
        where: { email: customerData.email },
        update: {},
        create: customerData
      });
    }

    console.log('✅ Clientes de exemplo criados');

    // Criar produtos/serviços de exemplo
    const products = [
      {
        name: 'Impressão Digital A4',
        description: 'Impressão digital colorida em papel A4',
        category: 'Impressão Digital',
        unit: 'un',
        price: 0.50,
        stock: 1000,
        minStock: 100
      },
      {
        name: 'Banner 0,80x1,20m',
        description: 'Banner em lona com impressão digital',
        category: 'Banner',
        unit: 'un',
        price: 35.00,
        stock: 50,
        minStock: 10
      },
      {
        name: 'Cartão de Visita',
        description: 'Cartão de visita 4x4 cores, papel couché 300g',
        category: 'Cartão',
        unit: 'milheiro',
        price: 80.00,
        stock: 20,
        minStock: 5
      },
      {
        name: 'Flyer A5',
        description: 'Flyer A5 4x0 cores, papel couché 115g',
        category: 'Flyer',
        unit: 'milheiro',
        price: 120.00,
        stock: 15,
        minStock: 3
      },
      {
        name: 'Adesivo Vinil',
        description: 'Adesivo em vinil branco com recorte',
        category: 'Adesivo',
        unit: 'm²',
        price: 25.00,
        stock: 100,
        minStock: 20
      }
    ];

    for (const productData of products) {
      const product = await prisma.product.upsert({
        where: { name: productData.name },
        update: {},
        create: productData
      });

      // Criar movimentação inicial de estoque
      if (productData.stock > 0) {
        await prisma.stockMovement.create({
          data: {
            productId: product.id,
            type: 'IN',
            quantity: productData.stock,
            unitPrice: productData.price,
            total: productData.stock * productData.price,
            reason: 'Estoque inicial - seed database'
          }
        });
      }
    }

    console.log('✅ Produtos de exemplo criados');

    // Criar algumas contas a receber de exemplo
    const accountsReceivable = [
      {
        description: 'Serviços gráficos - Janeiro',
        amount: 1500.00,
        dueDate: new Date('2024-02-15'),
        status: 'PENDING'
      },
      {
        description: 'Impressão banners',
        amount: 850.00,
        dueDate: new Date('2024-01-30'),
        status: 'OVERDUE'
      }
    ];

    for (const account of accountsReceivable) {
      await prisma.accountReceivable.create({
        data: account
      });
    }

    console.log('✅ Contas a receber de exemplo criadas');

    // Criar algumas contas a pagar de exemplo
    const accountsPayable = [
      {
        description: 'Fornecedor papel - Janeiro',
        amount: 2500.00,
        dueDate: new Date('2024-02-10'),
        status: 'PENDING',
        category: 'Material',
        supplier: 'Papéis e Cia'
      },
      {
        description: 'Manutenção equipamentos',
        amount: 350.00,
        dueDate: new Date('2024-01-25'),
        status: 'OVERDUE',
        category: 'Manutenção',
        supplier: 'TecServ'
      }
    ];

    for (const account of accountsPayable) {
      await prisma.accountPayable.create({
        data: account
      });
    }

    console.log('✅ Contas a pagar de exemplo criadas');

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📧 Credenciais de acesso:');
    console.log('👤 Admin: admin@grafica.com / admin123');
    console.log('👤 User: usuario@grafica.com / user123');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });