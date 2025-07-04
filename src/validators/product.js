const Joi = require('joi');

/**
 * Validação para criação de produto
 */
const createProductSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
  description: Joi.string()
    .max(500)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Descrição deve ter no máximo 500 caracteres'
    }),
  category: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Categoria deve ter pelo menos 2 caracteres',
      'string.max': 'Categoria deve ter no máximo 50 caracteres',
      'any.required': 'Categoria é obrigatória'
    }),
  unit: Joi.string()
    .min(1)
    .max(10)
    .required()
    .messages({
      'string.min': 'Unidade deve ter pelo menos 1 caractere',
      'string.max': 'Unidade deve ter no máximo 10 caracteres',
      'any.required': 'Unidade é obrigatória'
    }),
  price: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Preço deve ser maior que zero',
      'any.required': 'Preço é obrigatório'
    }),
  stock: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.min': 'Estoque não pode ser negativo'
    }),
  minStock: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.min': 'Estoque mínimo não pode ser negativo'
    })
});

/**
 * Validação para atualização de produto
 */
const updateProductSchema = createProductSchema.fork(
  ['name', 'category', 'unit', 'price'], 
  (schema) => schema.optional()
);

/**
 * Validação para parâmetros de ID
 */
const productIdSchema = Joi.object({
  id: Joi.string()
    .required()
    .messages({
      'any.required': 'ID do produto é obrigatório'
    })
});

/**
 * Validação para filtros de busca
 */
const productFilterSchema = Joi.object({
  search: Joi.string()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Termo de busca deve ter no máximo 100 caracteres'
    }),
  category: Joi.string()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Categoria deve ter no máximo 50 caracteres'
    }),
  active: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status ativo deve ser verdadeiro ou falso'
    }),
  lowStock: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Filtro de estoque baixo deve ser verdadeiro ou falso'
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
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  productFilterSchema
};