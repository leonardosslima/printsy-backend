# 🖨️ Printsy.io - Guia de Integração Backend ↔ Frontend

## 📋 Visão Geral

Este guia detalha como integrar o backend TypeScript do **Printsy.io** com o frontend React criado no Lovable. O backend foi desenvolvido especificamente para se conectar com as páginas e componentes do projeto Lovable.

## 🚀 Status do Projeto

### ✅ Backend Completo Implementado

- **Framework**: Node.js + Express + TypeScript
- **Banco**: PostgreSQL + Prisma ORM
- **Autenticação**: JWT
- **Documentação**: Swagger/OpenAPI
- **Validação**: Joi
- **Segurança**: Helmet, CORS, Rate Limiting

### 📦 Módulos Implementados

1. **🔐 Autenticação** (`/api/auth`)
2. **📊 Dashboard** (`/api/dashboard`) 
3. **👥 CRM/Clientes** (`/api/customers`)
4. **📦 Produtos/Estoque** (`/api/products`)
5. **💰 Orçamentos** (`/api/quotes`)
6. **📋 Pedidos** (`/api/orders`)
7. **💳 Financeiro** (`/api/financial`)

## 🔧 Configuração Inicial

### 1. Instalar Dependências

```bash
cd printsy-backend
npm install
```

### 2. Configurar Banco de Dados

```bash
# Copiar arquivo de configuração
cp .env.example .env

# Editar .env com suas configurações
DATABASE_URL="postgresql://user:password@localhost:5432/printsy"
JWT_SECRET="seu-jwt-secret-super-seguro"
FRONTEND_URL="https://lovable.dev"
```

### 3. Executar Migrações

```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev

# Popular dados de exemplo
npm run db:seed
```

### 4. Iniciar Servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build && npm start
```

**Servidor rodará em**: http://localhost:3001

## 📱 Endpoints da API

### 🔐 Autenticação

```typescript
// Login
POST /api/auth/login
{
  "email": "admin@printsy.io",
  "password": "123456"
}

// Registro
POST /api/auth/register
{
  "name": "Nome do Usuário",
  "email": "user@example.com", 
  "password": "senha123"
}

// Perfil do usuário
GET /api/auth/profile
// Headers: Authorization: Bearer <token>
```

### 📊 Dashboard

```typescript
// Métricas gerais
GET /api/dashboard

// Gráficos e charts
GET /api/dashboard/charts

// Alertas do sistema
GET /api/dashboard/alerts
```

### 👥 Clientes (CRM)

```typescript
// Listar clientes
GET /api/customers?page=1&limit=10&search=nome

// Criar cliente
POST /api/customers
{
  "name": "Empresa XYZ",
  "email": "contato@empresa.com",
  "phone": "(11) 99999-9999",
  "document": "12.345.678/0001-90",
  "type": "COMPANY",
  "address": "Rua das Flores, 123"
}

// Obter cliente
GET /api/customers/:id

// Atualizar cliente
PUT /api/customers/:id

// Deletar cliente (soft delete)
DELETE /api/customers/:id
```

### 📦 Produtos e Estoque

```typescript
// Listar produtos
GET /api/products?page=1&limit=10&category=impressao

// Criar produto
POST /api/products
{
  "name": "Impressão A4 Colorida",
  "description": "Impressão em papel A4 colorida",
  "category": "Impressão",
  "unit": "un",
  "price": 0.50,
  "cost": 0.25,
  "stock": 1000,
  "minStock": 100
}

// Movimentar estoque
POST /api/products/:id/stock
{
  "type": "IN",
  "quantity": 500,
  "reason": "Compra de material",
  "reference": "NF-001"
}
```

### 💰 Orçamentos

```typescript
// Listar orçamentos
GET /api/quotes?status=PENDING&customerId=123

// Criar orçamento
POST /api/quotes
{
  "customerId": "customer-id",
  "title": "Impressão de Catálogos",
  "description": "Impressão de 1000 catálogos A4",
  "validUntil": "2024-02-15",
  "items": [
    {
      "productId": "product-id",
      "quantity": 1000,
      "unitPrice": 0.50,
      "discount": 5
    }
  ]
}

// Converter orçamento em pedido
POST /api/quotes/:id/convert

// Duplicar orçamento
POST /api/quotes/:id/duplicate

// Estatísticas
GET /api/quotes/stats
```

### 📋 Pedidos

```typescript
// Listar pedidos
GET /api/orders?status=IN_PRODUCTION&priority=HIGH

// Criar pedido
POST /api/orders
{
  "customerId": "customer-id",
  "title": "Produção de Catálogos",
  "deadline": "2024-02-10",
  "priority": "HIGH",
  "items": [...]
}

// Alterar status
PATCH /api/orders/:id/status
{
  "status": "IN_PRODUCTION"
}

// Kanban (pedidos por status)
GET /api/orders/kanban

// Estatísticas
GET /api/orders/stats
```

### 💳 Financeiro

```typescript
// Resumo financeiro
GET /api/financial/summary

// Fluxo de caixa
GET /api/financial/cash-flow?startDate=2024-01-01&endDate=2024-01-31

// Contas a receber
GET /api/financial/receivables?overdue=true
POST /api/financial/receivables

// Contas a pagar
GET /api/financial/payables?category=Material
POST /api/financial/payables

// Marcar como pago
PATCH /api/financial/receivables/:id/pay
PATCH /api/financial/payables/:id/pay

// Contas vencidas
GET /api/financial/overdue

// Categorias de despesas
GET /api/financial/expense-categories
```

## 🔗 Integração com Frontend React

### 1. Configurar Axios

```typescript
// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // ou sua URL de produção
  timeout: 10000,
});

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('printsy_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para lidar com erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('printsy_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 2. Hooks Customizados

```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import api from '../lib/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data.data;
    
    localStorage.setItem('printsy_token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('printsy_token');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('printsy_token');
    if (token) {
      api.get('/auth/profile')
        .then(response => setUser(response.data.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return { user, login, logout, loading };
};
```

```typescript
// src/hooks/useQuotes.ts
import { useState, useEffect } from 'react';
import api from '../lib/api';

export const useQuotes = (filters = {}) => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  const fetchQuotes = async () => {
    try {
      const response = await api.get('/quotes', { params: filters });
      setQuotes(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createQuote = async (quoteData) => {
    const response = await api.post('/quotes', quoteData);
    await fetchQuotes(); // Recarregar lista
    return response.data.data;
  };

  const updateQuoteStatus = async (id, status) => {
    await api.patch(`/quotes/${id}/status`, { status });
    await fetchQuotes();
  };

  useEffect(() => {
    fetchQuotes();
  }, [filters]);

  return { 
    quotes, 
    loading, 
    pagination, 
    createQuote, 
    updateQuoteStatus, 
    refetch: fetchQuotes 
  };
};
```

### 3. Componentes de Exemplo

```tsx
// src/components/Dashboard/DashboardCards.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

const DashboardCards = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then(res => res.data.data)
  });

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Pedidos Pendentes</h3>
        <p className="text-2xl font-bold text-gray-900">
          {dashboardData?.orders?.pending || 0}
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Faturamento Mensal</h3>
        <p className="text-2xl font-bold text-green-600">
          R$ {dashboardData?.revenue?.thisMonth?.toLocaleString() || '0,00'}
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Contas a Receber</h3>
        <p className="text-2xl font-bold text-blue-600">
          R$ {dashboardData?.receivables?.pending?.toLocaleString() || '0,00'}
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Estoque Baixo</h3>
        <p className="text-2xl font-bold text-red-600">
          {dashboardData?.lowStock?.count || 0}
        </p>
      </div>
    </div>
  );
};

export default DashboardCards;
```

### 4. Formulários

```tsx
// src/components/Quotes/QuoteForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useQuotes } from '../../hooks/useQuotes';

const QuoteForm = ({ onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { createQuote } = useQuotes();

  const onSubmit = async (data) => {
    try {
      await createQuote(data);
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Título do Orçamento
        </label>
        <input
          {...register('title', { required: 'Título é obrigatório' })}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
        />
        {errors.title && (
          <p className="text-red-500 text-sm">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Data de Validade
        </label>
        <input
          type="date"
          {...register('validUntil', { required: 'Data é obrigatória' })}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        Criar Orçamento
      </button>
    </form>
  );
};
```

## 🔒 Autenticação

### Token JWT

O backend retorna um token JWT após login bem-sucedido:

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-id",
      "name": "Nome do Usuário",
      "email": "user@example.com",
      "role": "ADMIN"
    }
  }
}
```

### Usuários Padrão (Seeded)

```
Admin:
- Email: admin@printsy.io
- Senha: 123456

Usuário:
- Email: user@printsy.io  
- Senha: 123456
```

## 📊 Estrutura de Resposta Padrão

Todas as APIs seguem o mesmo padrão de resposta:

```json
{
  "success": true,
  "message": "Mensagem descritiva",
  "data": { /* dados da resposta */ },
  "pagination": { /* info de paginação quando aplicável */ }
}
```

## 🚨 Tratamento de Erros

```json
{
  "success": false,
  "message": "Mensagem de erro",
  "errors": ["Lista de erros específicos"]
}
```

## 📖 Documentação

- **Swagger UI**: http://localhost:3001/api/docs
- **API Info**: http://localhost:3001/api/info
- **Health Check**: http://localhost:3001/api/health

## 🔧 Configurações CORS

O backend está configurado para aceitar requisições do Lovable:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'https://lovable.dev',
    process.env.FRONTEND_URL
  ],
  credentials: true
};
```

## 🚀 Deploy

### Variáveis de Ambiente

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=seu-jwt-secret-producao
FRONTEND_URL=https://seu-frontend.com
```

### Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build TypeScript
npm start           # Produção
npm run db:migrate  # Migrações
npm run db:seed     # Popular dados
npm run db:studio   # Interface visual do banco
```

## 📞 Suporte

Para dúvidas sobre a integração:

1. Consulte a documentação Swagger em `/api/docs`
2. Verifique os logs do servidor para erros
3. Use o endpoint `/api/health` para verificar status
4. Teste endpoints individualmente com Postman/Insomnia

## ✨ Próximos Passos

1. **Conectar Frontend**: Integrar as chamadas de API nos componentes React
2. **Relatórios**: Implementar módulo de relatórios avançados
3. **Notificações**: Sistema de notificações em tempo real
4. **Upload de Arquivos**: Para anexos em orçamentos/pedidos
5. **PDF Generation**: Geração de PDFs para orçamentos/faturas
6. **Email Integration**: Envio automático de orçamentos por email

---

**🖨️ Printsy.io Backend - Pronto para conectar com seu frontend!** ✅