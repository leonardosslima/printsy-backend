const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route GET /api/dashboard
 * @desc Obter dados gerais do dashboard
 * @access Privado
 */
router.get('/',
  authenticateToken,
  dashboardController.getDashboardData
);

/**
 * @route GET /api/dashboard/revenue-chart
 * @desc Obter gráfico de faturamento mensal
 * @access Privado
 */
router.get('/revenue-chart',
  authenticateToken,
  dashboardController.getMonthlyRevenueChart
);

/**
 * @route GET /api/dashboard/recent-orders
 * @desc Obter pedidos recentes
 * @access Privado
 */
router.get('/recent-orders',
  authenticateToken,
  dashboardController.getRecentOrders
);

/**
 * @route GET /api/dashboard/overdue-accounts
 * @desc Obter contas vencidas
 * @access Privado
 */
router.get('/overdue-accounts',
  authenticateToken,
  dashboardController.getOverdueAccounts
);

/**
 * @route GET /api/dashboard/low-stock
 * @desc Obter produtos com estoque baixo
 * @access Privado
 */
router.get('/low-stock',
  authenticateToken,
  dashboardController.getLowStockProducts
);

/**
 * @route GET /api/dashboard/sales-summary
 * @desc Obter resumo de vendas por período
 * @access Privado
 */
router.get('/sales-summary',
  authenticateToken,
  dashboardController.getSalesSummary
);

module.exports = router;