/**
 * Utilitário para padronizar respostas da API
 */

/**
 * Resposta de sucesso padrão
 */
const success = (res, data = null, message = 'Operação realizada com sucesso', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Resposta de erro padrão
 */
const error = (res, message = 'Erro interno do servidor', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};

/**
 * Resposta de sucesso com paginação
 */
const successWithPagination = (res, data, pagination, message = 'Dados recuperados com sucesso') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Resposta de recurso criado
 */
const created = (res, data, message = 'Recurso criado com sucesso') => {
  return success(res, data, message, 201);
};

/**
 * Resposta de recurso não encontrado
 */
const notFound = (res, message = 'Recurso não encontrado') => {
  return error(res, message, 404);
};

/**
 * Resposta de dados inválidos
 */
const badRequest = (res, message = 'Dados inválidos', errors = null) => {
  return error(res, message, 400, errors);
};

/**
 * Resposta de não autorizado
 */
const unauthorized = (res, message = 'Não autorizado') => {
  return error(res, message, 401);
};

/**
 * Resposta de acesso negado
 */
const forbidden = (res, message = 'Acesso negado') => {
  return error(res, message, 403);
};

/**
 * Resposta de conflito (dados duplicados)
 */
const conflict = (res, message = 'Conflito de dados') => {
  return error(res, message, 409);
};

module.exports = {
  success,
  error,
  successWithPagination,
  created,
  notFound,
  badRequest,
  unauthorized,
  forbidden,
  conflict
};