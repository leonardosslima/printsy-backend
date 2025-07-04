require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { connectDatabase } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

/**
 * Criar aplicação Express
 */
const app = express();

/**
 * Configurações de segurança
 */
app.use(helmet()); // Configurações de segurança HTTP

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // máximo 1000 requests por IP
  message: {
    success: false,
    message: 'Muitas tentativas. Tente novamente em 15 minutos.',
    type: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Rate limiting específico para autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    type: 'AUTH_RATE_LIMIT_EXCEEDED'
  }
});

app.use('/api/auth/login', authLimiter);

/**
 * Middlewares gerais
 */
app.use(compression()); // Compressão gzip
app.use(morgan('combined')); // Logs de requisições

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Parser JSON com limite de tamanho
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

/**
 * Rotas principais
 */
app.use('/api', routes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bem-vindo à API do Gráfica SaaS!',
    version: '1.0.0',
    documentation: '/api/health',
    timestamp: new Date().toISOString()
  });
});

/**
 * Middleware de tratamento de erros
 */
app.use(notFoundHandler); // 404 handler
app.use(errorHandler);    // Error handler global

/**
 * Configurações do servidor
 */
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Função para iniciar o servidor
 */
async function startServer() {
  try {
    // Conectar ao banco de dados
    await connectDatabase();
    
    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Ambiente: ${NODE_ENV}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📖 API Base: http://localhost:${PORT}/api`);
      
      if (NODE_ENV === 'development') {
        console.log(`🔧 Prisma Studio: npx prisma studio`);
        console.log(`📝 Logs: Habilitados`);
      }
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n📴 Recebido sinal ${signal}. Encerrando servidor...`);
      
      server.close(async () => {
        console.log('✅ Servidor HTTP encerrado.');
        
        try {
          const { disconnectDatabase } = require('./config/database');
          await disconnectDatabase();
          console.log('✅ Desconectado do banco de dados.');
          process.exit(0);
        } catch (error) {
          console.error('❌ Erro ao desconectar do banco:', error);
          process.exit(1);
        }
      });
    };

    // Escutar sinais de encerramento
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Executar servidor se este arquivo for chamado diretamente
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };