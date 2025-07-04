import { Router } from 'express';
import {
  // Contas a receber
  createAccountReceivable,
  getAccountsReceivable,
  markAccountReceivableAsPaid,
  
  // Contas a pagar
  createAccountPayable,
  getAccountsPayable,
  markAccountPayableAsPaid,
  
  // Dashboard financeiro
  getFinancialSummary,
  getCashFlow,
  getExpenseCategories,
  getOverdueAccounts
} from '../controllers/financialController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// =============================================================================
// ROTAS DE CONTAS A RECEBER
// =============================================================================

/**
 * @swagger
 * /api/financial/receivables:
 *   get:
 *     summary: Listar contas a receber
 *     tags: [Financial]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Página para paginação
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limite de itens por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por status
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *         description: Filtrar por cliente
 *       - in: query
 *         name: overdue
 *         schema:
 *           type: boolean
 *         description: Filtrar contas vencidas
 *     responses:
 *       200:
 *         description: Lista de contas a receber
 */
router.get('/receivables', getAccountsReceivable);

/**
 * @swagger
 * /api/financial/receivables:
 *   post:
 *     summary: Criar conta a receber
 *     tags: [Financial]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - amount
 *               - dueDate
 *             properties:
 *               customerId:
 *                 type: string
 *               invoiceId:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               dueDate:
 *                 type: string
 *                 format: date
 *               paymentMethod:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conta a receber criada com sucesso
 */
router.post('/receivables', createAccountReceivable);

/**
 * @swagger
 * /api/financial/receivables/{id}/pay:
 *   patch:
 *     summary: Marcar conta a receber como paga
 *     tags: [Financial]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paidDate:
 *                 type: string
 *                 format: date
 *               paymentMethod:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Conta marcada como paga
 */
router.patch('/receivables/:id/pay', markAccountReceivableAsPaid);

// =============================================================================
// ROTAS DE CONTAS A PAGAR
// =============================================================================

/**
 * @swagger
 * /api/financial/payables:
 *   get:
 *     summary: Listar contas a pagar
 *     tags: [Financial]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Página para paginação
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limite de itens por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoria
 *       - in: query
 *         name: supplier
 *         schema:
 *           type: string
 *         description: Filtrar por fornecedor
 *       - in: query
 *         name: overdue
 *         schema:
 *           type: boolean
 *         description: Filtrar contas vencidas
 *     responses:
 *       200:
 *         description: Lista de contas a pagar
 */
router.get('/payables', getAccountsPayable);

/**
 * @swagger
 * /api/financial/payables:
 *   post:
 *     summary: Criar conta a pagar
 *     tags: [Financial]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - amount
 *               - dueDate
 *               - category
 *             properties:
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               dueDate:
 *                 type: string
 *                 format: date
 *               category:
 *                 type: string
 *               supplier:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conta a pagar criada com sucesso
 */
router.post('/payables', createAccountPayable);

/**
 * @swagger
 * /api/financial/payables/{id}/pay:
 *   patch:
 *     summary: Marcar conta a pagar como paga
 *     tags: [Financial]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paidDate:
 *                 type: string
 *                 format: date
 *               paymentMethod:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Conta marcada como paga
 */
router.patch('/payables/:id/pay', markAccountPayableAsPaid);

// =============================================================================
// ROTAS DE DASHBOARD FINANCEIRO
// =============================================================================

/**
 * @swagger
 * /api/financial/summary:
 *   get:
 *     summary: Obter resumo financeiro
 *     tags: [Financial]
 *     responses:
 *       200:
 *         description: Resumo financeiro com totais e estatísticas
 */
router.get('/summary', getFinancialSummary);

/**
 * @swagger
 * /api/financial/cash-flow:
 *   get:
 *     summary: Obter fluxo de caixa
 *     tags: [Financial]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *         description: Agrupar por período
 *     responses:
 *       200:
 *         description: Dados do fluxo de caixa
 */
router.get('/cash-flow', getCashFlow);

/**
 * @swagger
 * /api/financial/expense-categories:
 *   get:
 *     summary: Obter categorias de despesas
 *     tags: [Financial]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim
 *     responses:
 *       200:
 *         description: Categorias de despesas com valores e percentuais
 */
router.get('/expense-categories', getExpenseCategories);

/**
 * @swagger
 * /api/financial/overdue:
 *   get:
 *     summary: Obter contas vencidas
 *     tags: [Financial]
 *     responses:
 *       200:
 *         description: Lista de contas vencidas (a pagar e a receber)
 */
router.get('/overdue', getOverdueAccounts);

export default router;