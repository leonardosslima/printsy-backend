import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { connectDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';

type Express = ReturnType<typeof express>;
type Request = express.Request;
type Response = express.Response;

/**
 * Configuração do Swagger/OpenAPI
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Printsy.io API',
      version: '1.0.0',
      description: 'API REST para o micro SaaS de gestão de gráficas Printsy.io',
      contact: {
        name: 'Printsy.io Support',
        email: 'support@printsy.io'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.printsy.io' 
          : `http://localhost:${process.env.PORT || 3001}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const specs = swaggerJsdoc(swaggerOptions);

/**
 * Criar aplicação Express
 */
const app: Express = express();

/**
 * Configurações de segurança
 */
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));

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
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// CORS configurado para o front-end do Lovable
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'https://lovable.dev',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
};

app.use(cors(corsOptions));

// Parser JSON com limite de tamanho
app.use(express.json({ 
  limit: '10mb',
  verify: (req: Request & { rawBody?: Buffer }, res: Response, buf: Buffer) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

/**
 * Documentação Swagger
 */
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Printsy.io API Documentation'
}));

/**
 * Rotas principais
 */
app.use('/api', routes);

// Rota raiz com informações da API
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: '🖨️ Bem-vindo à API do Printsy.io!',
    version: '1.0.0',
    docs: '/api/docs',
    health: '/api/health',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      customers: '/api/customers',
      products: '/api/products',
      quotes: '/api/quotes',
      orders: '/api/orders',
      invoices: '/api/invoices',
      financial: '/api/financial',
      reports: '/api/reports',
      settings: '/api/settings'
    }
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
 * Interface para extensão do servidor
 */
interface ServerInfo {
  port: number;
  environment: string;
  database: boolean;
  docs: string;
  health: string;
}

/**
 * Função para iniciar o servidor
 */
async function startServer(): Promise<{ app: Express; server: any; info: ServerInfo }> {
  try {
    // Conectar ao banco de dados
    await connectDatabase();
    
    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log('🚀 ='.repeat(50));
      console.log('🖨️  PRINTSY.IO API - SERVIDOR INICIADO');
      console.log('🚀 ='.repeat(50));
      console.log(`📡 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Ambiente: ${NODE_ENV}`);
      console.log(`🌐 API Base: http://localhost:${PORT}/api`);
      console.log(`📖 Documentação: http://localhost:${PORT}/api/docs`);
      console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
      
      if (NODE_ENV === 'development') {
        console.log('🚀 ='.repeat(50));
        console.log('🔧 FERRAMENTAS DE DESENVOLVIMENTO:');
        console.log(`🗄️  Prisma Studio: npx prisma studio`);
        console.log(`📝 Logs: Habilitados (modo dev)`);
        console.log(`🔄 Hot reload: Ativo`);
        console.log('🚀 ='.repeat(50));
        console.log('🎯 INTEGRAÇÃO COM FRONT-END:');
        console.log('📱 Cors configurado para Lovable.dev');
        console.log('📋 Swagger docs disponível');
        console.log('🔗 Pronto para conectar com React!');
      }
      
      console.log('🚀 ='.repeat(50));
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`\n📴 Recebido sinal ${signal}. Encerrando servidor...`);
      
      server.close(async () => {
        console.log('✅ Servidor HTTP encerrado.');
        
        try {
          const { disconnectDatabase } = await import('./config/database');
          await disconnectDatabase();
          console.log('✅ Desconectado do banco de dados.');
          process.exit(0);
        } catch (error) {
          console.error('❌ Erro ao desconectar do banco:', error);
          process.exit(1);
        }
      });

      // Forçar encerramento após 10 segundos
      setTimeout(() => {
        console.error('⚠️  Forçando encerramento...');
        process.exit(1);
      }, 10000);
    };

    // Escutar sinais de encerramento
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    const serverInfo: ServerInfo = {
      port: Number(PORT),
      environment: NODE_ENV,
      database: true,
      docs: `http://localhost:${PORT}/api/docs`,
      health: `http://localhost:${PORT}/api/health`
    };

    return { app, server, info: serverInfo };
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Executar servidor se este arquivo for chamado diretamente
if (require.main === module) {
  startServer().catch(console.error);
}

export { app, startServer };
export default app;