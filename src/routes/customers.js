const express = require('express');
const router = express.Router();

const customerController = require('../controllers/customerController');
const { authenticateToken } = require('../middleware/auth');
const { validate, validateParams, validateQuery } = require('../middleware/validation');
const { 
  createCustomerSchema,
  updateCustomerSchema,
  customerIdSchema,
  customerFilterSchema
} = require('../validators/customer');

/**
 * @route GET /api/customers
 * @desc Listar clientes com filtros e paginação
 * @access Privado
 */
router.get('/',
  authenticateToken,
  validateQuery(customerFilterSchema),
  customerController.getCustomers
);

/**
 * @route GET /api/customers/active
 * @desc Buscar clientes ativos para formulários
 * @access Privado
 */
router.get('/active',
  authenticateToken,
  customerController.getActiveCustomers
);

/**
 * @route POST /api/customers
 * @desc Criar novo cliente
 * @access Privado
 */
router.post('/',
  authenticateToken,
  validate(createCustomerSchema),
  customerController.createCustomer
);

/**
 * @route GET /api/customers/:id
 * @desc Obter cliente por ID
 * @access Privado
 */
router.get('/:id',
  authenticateToken,
  validateParams(customerIdSchema),
  customerController.getCustomerById
);

/**
 * @route PUT /api/customers/:id
 * @desc Atualizar cliente
 * @access Privado
 */
router.put('/:id',
  authenticateToken,
  validateParams(customerIdSchema),
  validate(updateCustomerSchema),
  customerController.updateCustomer
);

/**
 * @route PUT /api/customers/:id/toggle-status
 * @desc Ativar/desativar cliente
 * @access Privado
 */
router.put('/:id/toggle-status',
  authenticateToken,
  validateParams(customerIdSchema),
  customerController.toggleCustomerStatus
);

/**
 * @route DELETE /api/customers/:id
 * @desc Excluir cliente (soft delete)
 * @access Privado
 */
router.delete('/:id',
  authenticateToken,
  validateParams(customerIdSchema),
  customerController.deleteCustomer
);

module.exports = router;