# 🖨️ Printsy.io - Sistema Completo de Gestão de Gráficas

Sistema **fullstack integrado** para gestão completa de gráficas de pequeno e médio porte, desenvolvido com **React + TypeScript** no frontend e **Node.js + Express + TypeScript** no backend.

## 🚀 **STATUS DO PROJETO**

✅ **BACKEND COMPLETO** - API REST funcional com todas as rotas  
🚧 **FRONTEND EM DESENVOLVIMENTO** - Estrutura criada, integração em andamento  
🔗 **INTEGRAÇÃO** - Frontend conectado com backend via proxy

## � **TECNOLOGIAS**

### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** + **Prisma ORM**
- **JWT Authentication**
- **Swagger/OpenAPI** Documentation
- **Rate Limiting** & Security

### Frontend
- **React** + **TypeScript** + **Vite**
- **TailwindCSS** para estilização
- **React Router** para navegação
- **React Query** para cache e sincronização
- **Axios** com interceptors JWT
- **React Hook Form** para formulários

## 🏗️ **ESTRUTURA DO PROJETO**

```
printsy-fullstack/
├── frontend/                 # 🎨 Frontend React
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── hooks/          # Hooks customizados
│   │   ├── lib/            # Configurações (API, utils)
│   │   └── main.tsx        # Entrada da aplicação
│   ├── package.json
│   └── vite.config.ts
│
├── src/                     # 🔧 Backend API
│   ├── controllers/        # Lógica de negócio
│   ├── routes/            # Rotas da API
│   ├── middleware/        # Middlewares
│   ├── validators/        # Validação de dados
│   └── server.ts          # Servidor principal
│
├── prisma/                 # 🗄️ Banco de dados
│   ├── schema.prisma      # Schema do banco
│   └── seed.ts           # Dados iniciais
│
├── package.json           # Scripts principais
└── README.md
```

## ⚡ **INSTALAÇÃO E EXECUÇÃO**

### 1️⃣ **Configuração Inicial (Apenas uma vez)**

```bash
# 1. Instalar dependências do projeto inteiro
npm run setup

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Editar o arquivo .env com suas configurações:
# DATABASE_URL="postgresql://user:password@localhost:5432/printsy"
# JWT_SECRET="seu-jwt-secret-super-seguro"
# NODE_ENV="development"
# PORT=3001

# 4. Configurar banco de dados
npm run db:migrate
npm run db:seed
```

### 2️⃣ **Rodar o Sistema Completo**

```bash
# 🚀 Comando principal - roda frontend + backend juntos
npm run dev
```

Isso vai iniciar:
- **Backend**: http://localhost:3001 (API)
- **Frontend**: http://localhost:3000 (Interface)

### 3️⃣ **Comandos Individuais (Se necessário)**

```bash
# Rodar apenas o backend
npm run backend:dev

# Rodar apenas o frontend
npm run frontend:dev

# Build para produção
npm run build

# Visualizar banco de dados
npm run db:studio
```

## 🔐 **USUÁRIOS DE TESTE**

Após executar `npm run db:seed`, você terá:

```
👨‍💼 ADMINISTRADOR
Email: admin@printsy.io
Senha: 123456

👤 USUÁRIO
Email: user@printsy.io  
Senha: 123456
```

## 🎯 **FUNCIONALIDADES IMPLEMENTADAS**

### ✅ **Backend (100% Funcional)**

#### 🔐 **Autenticação**
- Login/registro com JWT
- Middleware de autenticação
- Controle de acesso por roles

#### 📊 **Dashboard**
- Métricas em tempo real
- Gráficos de vendas
- Alertas do sistema

#### 👥 **CRM/Clientes**
- CRUD completo de clientes
- Busca e filtros
- Histórico de interações

#### 📦 **Produtos/Estoque**
- Gestão de produtos
- Controle de estoque
- Movimentações automáticas
- Alertas de estoque baixo

#### 💰 **Orçamentos**
- Criação de orçamentos
- Conversão para pedidos
- Gestão de status
- Duplicação de orçamentos

#### 📋 **Pedidos**
- Gestão completa de pedidos
- Kanban por status
- Baixa automática de estoque
- Controle de prazos

#### 💳 **Financeiro**
- Contas a pagar/receber
- Fluxo de caixa
- Relatórios financeiros
- Categorização de despesas

### 🚧 **Frontend (Em Desenvolvimento)**

#### ✅ **Estrutura Criada**
- ✅ Configuração do Vite + React + TypeScript
- ✅ TailwindCSS configurado
- ✅ Roteamento com React Router
- ✅ Sistema de autenticação
- ✅ Configuração da API (Axios)
- ✅ Hooks customizados

#### 🔄 **Em Progresso**
- 🚧 Componentes das páginas
- 🚧 Formulários
- 🚧 Tabelas e listagens
- 🚧 Dashboard com gráficos

## 📚 **DOCUMENTAÇÃO DA API**

Com o backend rodando, acesse:

- **Swagger UI**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/api/health
- **API Info**: http://localhost:3001/api/info

## 🔗 **ENDPOINTS PRINCIPAIS**

```bash
# Autenticação
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/profile

# Dashboard
GET  /api/dashboard
GET  /api/dashboard/charts
GET  /api/dashboard/alerts

# Clientes
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id

# Produtos
GET  /api/products
POST /api/products
POST /api/products/:id/stock

# Orçamentos
GET  /api/quotes
POST /api/quotes
POST /api/quotes/:id/convert
GET  /api/quotes/stats

# Pedidos
GET  /api/orders
POST /api/orders
GET  /api/orders/kanban
PATCH /api/orders/:id/status

# Financeiro
GET  /api/financial/summary
GET  /api/financial/cash-flow
GET  /api/financial/receivables
GET  /api/financial/payables
```

## 🧪 **COMO TESTAR**

### 1. **Teste via Interface (Recomendado)**
```bash
npm run dev
# Acesse: http://localhost:3000
# Login: admin@printsy.io / 123456
```

### 2. **Teste via API**
```bash
# Teste de login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@printsy.io","password":"123456"}'

# Teste de dashboard (com token)
curl -X GET http://localhost:3001/api/dashboard \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 3. **Teste via Swagger**
- Acesse: http://localhost:3001/api/docs
- Use os usuários de teste para autenticar

## 🚨 **SOLUÇÃO DE PROBLEMAS**

### ❌ **Erro: Banco não conecta**
```bash
# Verifique se PostgreSQL está rodando
# Confirme a DATABASE_URL no .env
npm run db:migrate
```

### ❌ **Erro: Frontend não carrega**
```bash
cd frontend
npm install
npm run dev
```

### ❌ **Erro: CORS**
```bash
# O backend já está configurado para aceitar o frontend
# Verifique se está rodando em localhost:3000
```

### ❌ **Erro: Token inválido**
```bash
# Limpe o localStorage do navegador
localStorage.clear()
# Ou faça logout e login novamente
```

## 📋 **PRÓXIMOS PASSOS**

### 🎯 **Desenvolvimento Frontend**
1. ✅ Estrutura básica (FEITO)
2. 🚧 Páginas principais (EM ANDAMENTO)
3. 📋 Formulários e validações
4. 📊 Dashboard com gráficos
5. 📱 Responsividade
6. 🎨 Melhorias de UX/UI

### 🚀 **Funcionalidades Futuras**
- 📧 Sistema de notificações
- 📄 Geração de PDFs
- 📊 Relatórios avançados
- 🔄 Backup automático
- 📱 App mobile (React Native)

## 🤝 **CONTRIBUIÇÃO**

1. Clone o repositório
2. Execute `npm run setup`
3. Crie uma branch para sua feature
4. Desenvolva e teste
5. Envie um Pull Request

---

## 🎉 **SISTEMA PRONTO PARA DESENVOLVIMENTO!**

O Printsy.io está configurado como um **sistema fullstack moderno** no Cursor AI, com:

✅ **Backend completo e funcional**  
✅ **Frontend estruturado e conectado**  
✅ **Integração via proxy configurada**  
✅ **Autenticação JWT funcionando**  
✅ **Banco de dados populado**  
✅ **Documentação completa**  

**Para começar a desenvolver, execute:**
```bash
npm run dev
```

**E acesse:** http://localhost:3000

---

**🖨️ Printsy.io - Transformando a gestão de gráficas com tecnologia moderna!** ✨
