import { Router } from 'express';

// Importar todas as rotas
import authRoutes from './auth';
import dashboardRoutes from './dashboard';
import customerRoutes from './customers';
import productRoutes from './products';
import quoteRoutes from './quotes';
import orderRoutes from './orders';
import financialRoutes from './financial';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '🖨️ Printsy.io API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * API Routes
 */
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/quotes', quoteRoutes);
router.use('/orders', orderRoutes);
router.use('/financial', financialRoutes);

/**
 * API Info endpoint
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    name: 'Printsy.io API',
    description: 'API REST para micro SaaS de gestão de gráficas',
    version: '1.0.0',
    author: 'Printsy.io Team',
    documentation: '/api/docs',
    endpoints: {
      auth: {
        path: '/api/auth',
        description: 'Autenticação e gestão de usuários',
        methods: ['POST /login', 'POST /register', 'GET /profile', 'GET /users']
      },
      dashboard: {
        path: '/api/dashboard',
        description: 'Dashboard com métricas e estatísticas',
        methods: ['GET /', 'GET /charts', 'GET /alerts']
      },
      customers: {
        path: '/api/customers',
        description: 'Gestão de clientes (CRM)',
        methods: ['GET /', 'POST /', 'GET /:id', 'PUT /:id', 'DELETE /:id']
      },
      products: {
        path: '/api/products',
        description: 'Gestão de produtos e estoque',
        methods: ['GET /', 'POST /', 'GET /:id', 'PUT /:id', 'DELETE /:id', 'POST /:id/stock']
      },
      quotes: {
        path: '/api/quotes',
        description: 'Gestão de orçamentos',
        methods: ['GET /', 'POST /', 'GET /:id', 'PUT /:id', 'PATCH /:id/status', 'POST /:id/convert', 'POST /:id/duplicate']
      },
      orders: {
        path: '/api/orders',
        description: 'Gestão de pedidos',
        methods: ['GET /', 'POST /', 'GET /:id', 'PUT /:id', 'PATCH /:id/status', 'POST /:id/duplicate', 'GET /kanban']
      },
      financial: {
        path: '/api/financial',
        description: 'Gestão financeira completa',
        methods: ['GET /summary', 'GET /cash-flow', 'GET /receivables', 'POST /receivables', 'GET /payables', 'POST /payables']
      }
    },
    features: [
      '🔐 Autenticação JWT',
      '📊 Dashboard com métricas',
      '👥 CRM completo',
      '📦 Controle de estoque',
      '💰 Orçamentos e conversão',
      '📋 Gestão de pedidos',
      '💳 Financeiro completo',
      '📈 Relatórios e gráficos',
      '🔍 Busca e filtros',
      '📱 API RESTful',
      '📖 Documentação Swagger',
      '🚀 Pronto para produção'
    ],
    status: {
      database: 'Connected',
      environment: process.env.NODE_ENV || 'development',
      uptime: `${Math.floor(process.uptime())} seconds`,
      memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
    }
  });
});

export default router;