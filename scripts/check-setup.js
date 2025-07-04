#!/usr/bin/env node
/**
 * Script para verificar se o projeto está configurado corretamente
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuração do projeto...\n');

// Verificar arquivos essenciais
const essentialFiles = [
  '.env',
  'package.json',
  'prisma/schema.prisma',
  'src/server.js'
];

let allGood = true;

console.log('📄 Verificando arquivos essenciais:');
essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FALTANDO!`);
    allGood = false;
  }
});

// Verificar node_modules
console.log('\n📦 Verificando dependências:');
if (fs.existsSync('node_modules')) {
  console.log('✅ node_modules (dependências instaladas)');
} else {
  console.log('❌ node_modules - Execute: npm install');
  allGood = false;
}

// Verificar estrutura de pastas
console.log('\n📁 Verificando estrutura de pastas:');
const folders = [
  'src/config',
  'src/controllers',
  'src/middleware',
  'src/routes',
  'src/utils',
  'src/validators',
  'prisma'
];

folders.forEach(folder => {
  if (fs.existsSync(folder)) {
    console.log(`✅ ${folder}`);
  } else {
    console.log(`❌ ${folder} - FALTANDO!`);
    allGood = false;
  }
});

// Verificar .env
console.log('\n🔐 Verificando variáveis de ambiente:');
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName}`);
    } else {
      console.log(`❌ ${varName} - Configure no .env`);
      allGood = false;
    }
  });
} else {
  console.log('❌ Arquivo .env não encontrado');
  allGood = false;
}

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('🎉 Projeto configurado corretamente!');
  console.log('\n📋 Próximos passos:');
  console.log('1. npm run db:generate');
  console.log('2. npm run db:migrate');
  console.log('3. npm run db:seed');
  console.log('4. npm run dev');
  console.log('\n🌐 API estará disponível em: http://localhost:3001');
} else {
  console.log('⚠️  Corrija os problemas acima antes de continuar');
}

console.log('\n📚 Documentação completa no README.md');
console.log('🔧 Para administrar o banco: npx prisma studio');
console.log('\n' + '='.repeat(50));