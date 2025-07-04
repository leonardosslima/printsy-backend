# 🚀 Primeiros Passos - Gráfica SaaS

Guia rápido para colocar seu sistema de gestão para gráficas funcionando em minutos!

## ⚡ Setup Rápido

### 1. Preparar ambiente

```bash
# Instalar dependências
npm install

# Verificar se tudo está configurado
node scripts/check-setup.js
```

### 2. Configurar banco de dados

```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrations (criar tabelas)
npm run db:migrate

# Popular dados iniciais
npm run db:seed
```

### 3. Iniciar servidor

```bash
# Modo desenvolvimento (com reload automático)
npm run dev
```

🎉 **Pronto!** Sua API estará rodando em `http://localhost:3001`

## 🧪 Teste a API

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Login (obter token)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@grafica.com",
    "password": "admin123"
  }'
```

### Listar clientes (com token)
```bash
curl http://localhost:3001/api/customers \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 👥 Credenciais Padrão

Após executar o seed, você terá:

- **Admin**: `admin@grafica.com` / `admin123`
- **User**: `usuario@grafica.com` / `user123`

## 🎯 Principais Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/health` | Status da API |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/dashboard` | Dashboard principal |
| `GET` | `/api/customers` | Lista de clientes |
| `POST` | `/api/customers` | Criar cliente |
| `GET` | `/api/products` | Lista de produtos |
| `POST` | `/api/products` | Criar produto |

## 🔧 Ferramentas Úteis

### Prisma Studio (Interface visual do banco)
```bash
npx prisma studio
# Abre em http://localhost:5555
```

### Logs em tempo real
```bash
npm run dev
# Mostra logs detalhados das requisições
```

### Reset do banco (se necessário)
```bash
npx prisma migrate reset
npm run db:seed
```

## 📱 Integrando com Frontend

### Headers obrigatórios
```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}` // Após login
};
```

### Exemplo de uso (JavaScript)
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    return data.data.user;
  }
  throw new Error(data.message);
};

// Listar clientes
const getCustomers = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3001/api/customers', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  return data.success ? data.data : [];
};
```

## 🚧 Próximas Implementações

Módulos planejados para as próximas versões:

- [ ] **Orçamentos** - Criação e envio por email
- [ ] **Pedidos** - Gestão completa de produção
- [ ] **Financeiro** - Contas a pagar/receber
- [ ] **Relatórios** - Analytics avançadas
- [ ] **Configurações** - Personalização da empresa

## 📞 Suporte

- 📖 Documentação completa: `README.md`
- 🐛 Problemas: Crie uma issue no repositório
- 💬 Dúvidas: Entre em contato

---

**Desenvolvido para digitalizar gráficas brasileiras com eficiência e simplicidade! 🇧🇷**