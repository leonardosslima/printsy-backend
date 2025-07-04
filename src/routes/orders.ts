import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  duplicateOrder,
  getOrderStats,
  getOrdersByStatus
} from '../controllers/ordersController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Listar pedidos
 *     tags: [Orders]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca por número, título ou cliente
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filtrar por prioridade
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *         description: Filtrar por cliente
 *       - in: query
 *         name: overdue
 *         schema:
 *           type: boolean
 *         description: Filtrar pedidos vencidos
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */
router.get('/', getOrders);

/**
 * @swagger
 * /api/orders/stats:
 *   get:
 *     summary: Obter estatísticas de pedidos
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Estatísticas dos pedidos
 */
router.get('/stats', getOrderStats);

/**
 * @swagger
 * /api/orders/kanban:
 *   get:
 *     summary: Obter pedidos agrupados por status (kanban)
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Pedidos agrupados por status
 */
router.get('/kanban', getOrdersByStatus);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Obter pedido por ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Dados do pedido
 *       404:
 *         description: Pedido não encontrado
 */
router.get('/:id', getOrderById);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Criar novo pedido
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - title
 *               - items
 *             properties:
 *               customerId:
 *                 type: string
 *               quoteId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date
 *               priority:
 *                 type: string
 *                 enum: [LOW, NORMAL, HIGH, URGENT]
 *               discount:
 *                 type: number
 *               discountType:
 *                 type: string
 *                 enum: [PERCENTAGE, FIXED]
 *               notes:
 *                 type: string
 *               production_notes:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 */
router.post('/', createOrder);

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Atualizar pedido
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Pedido atualizado com sucesso
 *       404:
 *         description: Pedido não encontrado
 */
router.put('/:id', updateOrder);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Alterar status do pedido
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, IN_PRODUCTION, READY, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 */
router.patch('/:id/status', updateOrderStatus);

/**
 * @swagger
 * /api/orders/{id}/duplicate:
 *   post:
 *     summary: Duplicar pedido
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedido duplicado com sucesso
 *       404:
 *         description: Pedido não encontrado
 */
router.post('/:id/duplicate', duplicateOrder);

export default router;