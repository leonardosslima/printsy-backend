/**
 * Middleware para validação de dados usando Joi
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // retorna todos os erros
      stripUnknown: true, // remove campos não definidos no schema
      convert: true // converte tipos automaticamente
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.context?.key || detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors
      });
    }

    // Substitui os dados originais pelos dados validados e limpos
    req[property] = value;
    next();
  };
};

/**
 * Middleware para validar parâmetros da URL
 */
const validateParams = (schema) => {
  return validate(schema, 'params');
};

/**
 * Middleware para validar query parameters
 */
const validateQuery = (schema) => {
  return validate(schema, 'query');
};

module.exports = {
  validate,
  validateParams,
  validateQuery
};