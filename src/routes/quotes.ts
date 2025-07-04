import { Router } from 'express';
import {
  createQuote,
  getQuotes,
  getQuoteById,
  updateQuote,
  updateQuoteStatus,
  convertQuoteToOrder,
  duplicateQuote,
  getQuoteStats
} from '../controllers/quotesController';
import { authenticateToken } from '../middleware/auth';
import { validateQuote, validateQuoteUpdate } from '../validators/quotes';

const router = Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

/**
 * @swagger
 * /api/quotes:
 *   get:
 *     summary: Listar orçamentos
 *     tags: [Quotes]
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
 *         name: customerId
 *         schema:
 *           type: string
 *         description: Filtrar por cliente
 *     responses:
 *       200:
 *         description: Lista de orçamentos
 */
router.get('/', getQuotes);

/**
 * @swagger
 * /api/quotes/stats:
 *   get:
 *     summary: Obter estatísticas de orçamentos
 *     tags: [Quotes]
 *     responses:
 *       200:
 *         description: Estatísticas dos orçamentos
 */
router.get('/stats', getQuoteStats);

/**
 * @swagger
 * /api/quotes/{id}:
 *   get:
 *     summary: Obter orçamento por ID
 *     tags: [Quotes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do orçamento
 *     responses:
 *       200:
 *         description: Dados do orçamento
 *       404:
 *         description: Orçamento não encontrado
 */
router.get('/:id', getQuoteById);

/**
 * @swagger
 * /api/quotes:
 *   post:
 *     summary: Criar novo orçamento
 *     tags: [Quotes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - title
 *               - validUntil
 *               - items
 *             properties:
 *               customerId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               validUntil:
 *                 type: string
 *                 format: date
 *               discount:
 *                 type: number
 *               discountType:
 *                 type: string
 *                 enum: [PERCENTAGE, FIXED]
 *               notes:
 *                 type: string
 *               terms:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Orçamento criado com sucesso
 */
router.post('/', validateQuote, createQuote);

/**
 * @swagger
 * /api/quotes/{id}:
 *   put:
 *     summary: Atualizar orçamento
 *     tags: [Quotes]
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
 *         description: Orçamento atualizado com sucesso
 *       404:
 *         description: Orçamento não encontrado
 */
router.put('/:id', validateQuoteUpdate, updateQuote);

/**
 * @swagger
 * /api/quotes/{id}/status:
 *   patch:
 *     summary: Alterar status do orçamento
 *     tags: [Quotes]
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
 *                 enum: [DRAFT, SENT, VIEWED, APPROVED, REJECTED, EXPIRED, CONVERTED]
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 */
router.patch('/:id/status', updateQuoteStatus);

/**
 * @swagger
 * /api/quotes/{id}/convert:
 *   post:
 *     summary: Converter orçamento em pedido
 *     tags: [Quotes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orçamento convertido em pedido
 *       400:
 *         description: Orçamento não pode ser convertido
 */
router.post('/:id/convert', convertQuoteToOrder);

/**
 * @swagger
 * /api/quotes/{id}/duplicate:
 *   post:
 *     summary: Duplicar orçamento
 *     tags: [Quotes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orçamento duplicado com sucesso
 *       404:
 *         description: Orçamento não encontrado
 */
router.post('/:id/duplicate', duplicateQuote);

export default router;