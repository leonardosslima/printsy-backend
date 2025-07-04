const express = require('express');
const router = express.Router();

// Importar todas as rotas
const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard');
const customerRoutes = require('./customers');
const productRoutes = require('./products');

/**
 * Configurar rotas da API
 */

// Rota de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Gráfica SaaS está funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas do dashboard
router.use('/dashboard', dashboardRoutes);

// Rotas de clientes (CRM)
router.use('/customers', customerRoutes);

// Rotas de produtos e estoque
router.use('/products', productRoutes);

// TODO: Adicionar as seguintes rotas quando implementadas:
// router.use('/quotes', quoteRoutes);        // Orçamentos
// router.use('/orders', orderRoutes);        // Pedidos
// router.use('/financial', financialRoutes); // Gestão financeira
// router.use('/reports', reportRoutes);      // Relatórios
// router.use('/settings', settingsRoutes);   // Configurações

module.exports = router;