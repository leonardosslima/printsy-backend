# 🖨️ Gráfica SaaS - Backend API

Micro SaaS voltado para gráficas de pequeno e médio porte. Sistema completo para digitalizar a gestão com foco em automação, controle financeiro, organização de pedidos e orçamentos, além de controle de estoque e CRM.

## 🚀 Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: JWT
- **Validação**: Joi
- **Documentação**: JSDoc
- **Logs**: Morgan
- **Segurança**: Helmet + Rate Limiting

## 📁 Estrutura do Projeto

```
grafica-saas-backend/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── seed.js               # Script para popular dados iniciais
├── src/
│   ├── config/
│   │   ├── database.js       # Configuração do Prisma
│   │   └── auth.js          # Configurações de autenticação
│   ├── controllers/
│   │   ├── authController.js # Autenticação e usuários
│   │   ├── customerController.js # Gestão de clientes (CRM)
│   │   ├── productController.js  # Produtos e estoque
│   │   └── dashboardController.js # Dashboard e métricas
│   ├── middleware/
│   │   ├── auth.js          # Middleware de autenticação JWT
│   │   ├── validation.js    # Middleware de validação Joi
│   │   └── errorHandler.js  # Tratamento global de erros
│   ├── routes/
│   │   ├── auth.js          # Rotas de autenticação
│   │   ├── customers.js     # Rotas de clientes
│   │   ├── products.js      # Rotas de produtos
│   │   ├── dashboard.js     # Rotas do dashboard
│   │   └── index.js         # Agregador de rotas
│   ├── utils/
│   │   ├── response.js      # Padronização de respostas
│   │   └── helpers.js       # Funções auxiliares
│   ├── validators/
│   │   ├── auth.js          # Validações de autenticação
│   │   ├── customer.js      # Validações de clientes
│   │   └── product.js       # Validações de produtos
│   └── server.js            # Servidor principal
├── .env.example             # Exemplo de variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Instalação e Configuração

### 1. Pré-requisitos

- Node.js 18+ 
- PostgreSQL 12+
- npm ou yarn

### 2. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd grafica-saas-backend
```

### 3. Instalar dependências

```bash
npm install
```

### 4. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/grafica_saas?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# Email (para envio de orçamentos)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Upload
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=5242880
```

### 5. Configurar banco de dados

```bash
# Gerar o cliente Prisma
npm run db:generate

# Executar migrations
npm run db:migrate

# Popular dados iniciais
npm run db:seed
```

### 6. Iniciar o servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📊 Funcionalidades Implementadas

### ✅ Módulos Completos

- **🔐 Autenticação e Usuários**
  - Login/logout com JWT
  - Registro de usuários
  - Perfis (Admin/User)
  - Gerenciamento de usuários

- **👥 CRM (Gestão de Clientes)**
  - CRUD completo de clientes
  - Busca e filtros avançados
  - Histórico de interações
  - Soft delete

- **📦 Gestão de Produtos e Estoque**
  - CRUD de produtos/serviços
  - Controle de estoque com movimentações
  - Alertas de estoque baixo
  - Categorização

- **📈 Dashboard e Métricas**
  - Visão geral do negócio
  - Gráficos de faturamento
  - Alertas importantes
  - Relatórios básicos

### 🚧 Módulos Planejados (TODO)

- **💰 Orçamentos**
  - Criação e edição
  - Envio por email
  - Conversão para pedidos

- **📋 Pedidos**
  - Gestão de produção
  - Status e prioridades
  - Prazos de entrega

- **💳 Gestão Financeira**
  - Contas a pagar/receber
  - Fluxo de caixa
  - Relatórios financeiros

- **📄 Relatórios Avançados**
  - Relatórios por período
  - Análises de vendas
  - Exportação PDF/Excel

- **⚙️ Configurações**
  - Dados da empresa
  - Personalização de temas
  - Configurações de sistema

## 🔌 API Endpoints

### Autenticação
```
POST   /api/auth/login           # Login
POST   /api/auth/register        # Registro (admin)
GET    /api/auth/profile         # Perfil do usuário
PUT    /api/auth/profile         # Atualizar perfil
PUT    /api/auth/change-password # Alterar senha
GET    /api/auth/users           # Listar usuários (admin)
PUT    /api/auth/users/:id/toggle-status # Ativar/desativar usuário
```

### Dashboard
```
GET    /api/dashboard            # Dados gerais
GET    /api/dashboard/revenue-chart # Gráfico de faturamento
GET    /api/dashboard/recent-orders # Pedidos recentes
GET    /api/dashboard/overdue-accounts # Contas vencidas
GET    /api/dashboard/low-stock  # Produtos com estoque baixo
GET    /api/dashboard/sales-summary # Resumo de vendas
```

### Clientes
```
GET    /api/customers            # Listar clientes
GET    /api/customers/active     # Clientes ativos (para forms)
POST   /api/customers            # Criar cliente
GET    /api/customers/:id        # Obter cliente por ID
PUT    /api/customers/:id        # Atualizar cliente
PUT    /api/customers/:id/toggle-status # Ativar/desativar
DELETE /api/customers/:id        # Excluir cliente
```

### Produtos
```
GET    /api/products             # Listar produtos
GET    /api/products/active      # Produtos ativos (para forms)
GET    /api/products/categories  # Categorias
POST   /api/products             # Criar produto
GET    /api/products/:id         # Obter produto por ID
PUT    /api/products/:id         # Atualizar produto
PUT    /api/products/:id/toggle-status # Ativar/desativar
POST   /api/products/:id/move-stock # Movimentar estoque
GET    /api/products/stock/movements # Histórico movimentações
```

## 🔒 Autenticação

O sistema utiliza JWT (JSON Web Token) para autenticação. Inclua o token no header:

```
Authorization: Bearer <seu-jwt-token>
```

### Credenciais Padrão (após seed)
- **Admin**: `admin@grafica.com` / `admin123`
- **User**: `usuario@grafica.com` / `user123`

## 📝 Padrões de Resposta

### Sucesso
```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Erro
```json
{
  "success": false,
  "message": "Erro na operação",
  "errors": [],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Paginação
```json
{
  "success": true,
  "message": "Dados recuperados com sucesso",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🧪 Scripts Disponíveis

```bash
npm start          # Iniciar servidor (produção)
npm run dev        # Iniciar servidor (desenvolvimento)
npm run db:migrate # Executar migrations
npm run db:generate # Gerar cliente Prisma
npm run db:studio  # Abrir Prisma Studio
npm run db:seed    # Popular dados iniciais
npm test           # Executar testes (TODO)
```

## 🛡️ Segurança

- **Rate Limiting**: Proteção contra spam e ataques
- **Helmet**: Headers de segurança HTTP
- **JWT**: Autenticação stateless
- **Bcrypt**: Hash seguro de senhas
- **Validação**: Joi para validação de dados
- **CORS**: Configurado para domínios específicos

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas:

1. **Rotas**: Definição de endpoints
2. **Middlewares**: Autenticação, validação, tratamento de erros
3. **Controladores**: Lógica de negócio
4. **Prisma**: Camada de dados (ORM)
5. **PostgreSQL**: Banco de dados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através dos issues do repositório.

---

**Desenvolvido com ❤️ para digitalizar gráficas brasileiras**
