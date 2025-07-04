const Joi = require('joi');

/**
 * Validação para criação de cliente
 */
const createCustomerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
  email: Joi.string()
    .email()
    .optional()
    .allow(null, '')
    .messages({
      'string.email': 'Email deve ter um formato válido'
    }),
  phone: Joi.string()
    .pattern(/^[\d\s\(\)\-\+]+$/)
    .optional()
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Telefone deve conter apenas números e caracteres de formatação'
    }),
  document: Joi.string()
    .optional()
    .allow(null, '')
    .messages({
      'string.base': 'Documento deve ser um texto válido'
    }),
  address: Joi.string()
    .max(200)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Endereço deve ter no máximo 200 caracteres'
    }),
  city: Joi.string()
    .max(100)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Cidade deve ter no máximo 100 caracteres'
    }),
  state: Joi.string()
    .max(2)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Estado deve ter no máximo 2 caracteres'
    }),
  zipCode: Joi.string()
    .pattern(/^\d{5}-?\d{3}$/)
    .optional()
    .allow(null, '')
    .messages({
      'string.pattern.base': 'CEP deve ter formato válido (12345-678)'
    }),
  notes: Joi.string()
    .max(500)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Observações devem ter no máximo 500 caracteres'
    })
});

/**
 * Validação para atualização de cliente
 */
const updateCustomerSchema = createCustomerSchema.fork(
  ['name'], 
  (schema) => schema.optional()
);

/**
 * Validação para parâmetros de ID
 */
const customerIdSchema = Joi.object({
  id: Joi.string()
    .required()
    .messages({
      'any.required': 'ID do cliente é obrigatório'
    })
});

/**
 * Validação para filtros de busca
 */
const customerFilterSchema = Joi.object({
  search: Joi.string()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Termo de busca deve ter no máximo 100 caracteres'
    }),
  active: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status ativo deve ser verdadeiro ou falso'
    }),
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.min': 'Página deve ser maior que 0'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.min': 'Limite deve ser maior que 0',
      'number.max': 'Limite deve ser menor ou igual a 100'
    })
});

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
  customerIdSchema,
  customerFilterSchema
};