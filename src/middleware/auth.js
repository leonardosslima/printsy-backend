const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const authConfig = require('../config/auth');

/**
 * Middleware para verificar autenticação JWT
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, authConfig.secret);
    
    // Buscar o usuário no banco para verificar se ainda está ativo
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        active: true 
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo'
      });
    }

    // Adicionar informações do usuário à requisição
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Middleware para verificar se o usuário é admin
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Permissões de administrador requeridas.'
    });
  }
  next();
};

/**
 * Middleware opcional de autenticação (não falha se não tiver token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, authConfig.secret);
      const user = await prisma.user.findUnique({
        where: { 
          id: decoded.userId,
          active: true 
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          active: true
        }
      });

      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }

    next();
  } catch (error) {
    // Em caso de erro, continua sem autenticação
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
};