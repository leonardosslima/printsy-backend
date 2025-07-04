require('dotenv').config();

/**
 * Configurações de autenticação JWT
 */
const authConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Configurações de refresh token (para futuras implementações)
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  
  // Salt rounds para bcrypt
  saltRounds: 12,
  
  // Configurações de rate limiting
  rateLimitWindow: 15 * 60 * 1000, // 15 minutos
  rateLimitMax: 5, // máximo 5 tentativas de login por IP
};

module.exports = authConfig;