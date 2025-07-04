/**
 * Middleware global para tratamento de erros
 */
const errorHandler = (err, req, res, next) => {
  console.error('Erro capturado:', err);

  // Erro de validação do Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Dados já existem no sistema',
      error: 'Conflito de dados únicos'
    });
  }

  // Erro de registro não encontrado no Prisma
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro não encontrado',
      error: 'Recurso não existe'
    });
  }

  // Erro de conexão com banco de dados
  if (err.code === 'P1001') {
    return res.status(503).json({
      success: false,
      message: 'Serviço temporariamente indisponível',
      error: 'Falha na conexão com banco de dados'
    });
  }

  // Erro de sintaxe JSON
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Dados JSON inválidos',
      error: 'Formato de dados incorreto'
    });
  }

  // Erro de payload muito grande
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Dados enviados são muito grandes',
      error: 'Limite de tamanho excedido'
    });
  }

  // Erro 404 - rota não encontrada
  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      message: 'Rota não encontrada',
      error: 'Endpoint não existe'
    });
  }

  // Erro personalizado com status
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message || 'Erro no servidor',
      error: err.error || 'Erro interno'
    });
  }

  // Erro interno do servidor (fallback)
  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno'
  });
};

/**
 * Middleware para capturar rotas não encontradas
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Rota não encontrada: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler
};