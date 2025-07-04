const { PrismaClient } = require('@prisma/client');

/**
 * Instância do Prisma Client
 * Singleton para evitar múltiplas conexões
 */
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

/**
 * Função para conectar ao banco de dados
 */
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Banco de dados conectado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    process.exit(1);
  }
}

/**
 * Função para desconectar do banco de dados
 */
async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Banco de dados desconectado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao desconectar do banco de dados:', error);
  }
}

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase
};