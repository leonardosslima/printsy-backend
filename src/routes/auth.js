const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validate, validateParams } = require('../middleware/validation');
const { 
  loginSchema, 
  registerSchema, 
  changePasswordSchema 
} = require('../validators/auth');

/**
 * @route POST /api/auth/register
 * @desc Registrar novo usuário
 * @access Público (ou Admin apenas)
 */
router.post('/register', 
  validate(registerSchema),
  authController.register
);

/**
 * @route POST /api/auth/login
 * @desc Login do usuário
 * @access Público
 */
router.post('/login',
  validate(loginSchema),
  authController.login
);

/**
 * @route GET /api/auth/profile
 * @desc Obter perfil do usuário logado
 * @access Privado
 */
router.get('/profile',
  authenticateToken,
  authController.getProfile
);

/**
 * @route PUT /api/auth/profile
 * @desc Atualizar perfil do usuário
 * @access Privado
 */
router.put('/profile',
  authenticateToken,
  authController.updateProfile
);

/**
 * @route PUT /api/auth/change-password
 * @desc Alterar senha do usuário
 * @access Privado
 */
router.put('/change-password',
  authenticateToken,
  validate(changePasswordSchema),
  authController.changePassword
);

/**
 * @route GET /api/auth/users
 * @desc Listar usuários (apenas admin)
 * @access Admin
 */
router.get('/users',
  authenticateToken,
  requireAdmin,
  authController.getUsers
);

/**
 * @route PUT /api/auth/users/:id/toggle-status
 * @desc Ativar/desativar usuário (apenas admin)
 * @access Admin
 */
router.put('/users/:id/toggle-status',
  authenticateToken,
  requireAdmin,
  authController.toggleUserStatus
);

module.exports = router;