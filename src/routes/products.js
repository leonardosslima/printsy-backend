const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');
const { validate, validateParams, validateQuery } = require('../middleware/validation');
const { 
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  productFilterSchema
} = require('../validators/product');

/**
 * @route GET /api/products
 * @desc Listar produtos com filtros e paginação
 * @access Privado
 */
router.get('/',
  authenticateToken,
  validateQuery(productFilterSchema),
  productController.getProducts
);

/**
 * @route GET /api/products/active
 * @desc Buscar produtos ativos para formulários
 * @access Privado
 */
router.get('/active',
  authenticateToken,
  productController.getActiveProducts
);

/**
 * @route GET /api/products/categories
 * @desc Obter categorias de produtos
 * @access Privado
 */
router.get('/categories',
  authenticateToken,
  productController.getCategories
);

/**
 * @route POST /api/products
 * @desc Criar novo produto
 * @access Privado
 */
router.post('/',
  authenticateToken,
  validate(createProductSchema),
  productController.createProduct
);

/**
 * @route GET /api/products/:id
 * @desc Obter produto por ID
 * @access Privado
 */
router.get('/:id',
  authenticateToken,
  validateParams(productIdSchema),
  productController.getProductById
);

/**
 * @route PUT /api/products/:id
 * @desc Atualizar produto
 * @access Privado
 */
router.put('/:id',
  authenticateToken,
  validateParams(productIdSchema),
  validate(updateProductSchema),
  productController.updateProduct
);

/**
 * @route PUT /api/products/:id/toggle-status
 * @desc Ativar/desativar produto
 * @access Privado
 */
router.put('/:id/toggle-status',
  authenticateToken,
  validateParams(productIdSchema),
  productController.toggleProductStatus
);

/**
 * @route POST /api/products/:id/move-stock
 * @desc Movimentar estoque (entrada/saída)
 * @access Privado
 */
router.post('/:id/move-stock',
  authenticateToken,
  validateParams(productIdSchema),
  productController.moveStock
);

/**
 * @route GET /api/products/stock/movements
 * @desc Obter histórico de movimentações de estoque
 * @access Privado
 */
router.get('/stock/movements',
  authenticateToken,
  productController.getStockMovements
);

module.exports = router;