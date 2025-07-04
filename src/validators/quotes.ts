import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Schema para criar orçamento
const createQuoteSchema = Joi.object({
  customerId: Joi.string().required().messages({
    'string.empty': 'Cliente é obrigatório',
    'any.required': 'Cliente é obrigatório'
  }),
  title: Joi.string().min(3).max(255).required().messages({
    'string.empty': 'Título é obrigatório',
    'string.min': 'Título deve ter pelo menos 3 caracteres',
    'string.max': 'Título deve ter no máximo 255 caracteres',
    'any.required': 'Título é obrigatório'
  }),
  description: Joi.string().max(1000).allow('').messages({
    'string.max': 'Descrição deve ter no máximo 1000 caracteres'
  }),
  validUntil: Joi.date().greater('now').required().messages({
    'date.base': 'Data de validade deve ser uma data válida',
    'date.greater': 'Data de validade deve ser futura',
    'any.required': 'Data de validade é obrigatória'
  }),
  discount: Joi.number().min(0).default(0).messages({
    'number.base': 'Desconto deve ser um número',
    'number.min': 'Desconto não pode ser negativo'
  }),
  discountType: Joi.string().valid('PERCENTAGE', 'FIXED').default('PERCENTAGE').messages({
    'any.only': 'Tipo de desconto deve ser PERCENTAGE ou FIXED'
  }),
  notes: Joi.string().max(1000).allow('').messages({
    'string.max': 'Observações devem ter no máximo 1000 caracteres'
  }),
  terms: Joi.string().max(2000).allow('').messages({
    'string.max': 'Termos devem ter no máximo 2000 caracteres'
  }),
  items: Joi.array().min(1).items(
    Joi.object({
      productId: Joi.string().required().messages({
        'string.empty': 'Produto é obrigatório',
        'any.required': 'Produto é obrigatório'
      }),
      quantity: Joi.number().positive().required().messages({
        'number.base': 'Quantidade deve ser um número',
        'number.positive': 'Quantidade deve ser positiva',
        'any.required': 'Quantidade é obrigatória'
      }),
      unitPrice: Joi.number().positive().required().messages({
        'number.base': 'Preço unitário deve ser um número',
        'number.positive': 'Preço unitário deve ser positivo',
        'any.required': 'Preço unitário é obrigatório'
      }),
      discount: Joi.number().min(0).max(100).default(0).messages({
        'number.base': 'Desconto do item deve ser um número',
        'number.min': 'Desconto do item não pode ser negativo',
        'number.max': 'Desconto do item não pode ser maior que 100%'
      }),
      notes: Joi.string().max(500).allow('').messages({
        'string.max': 'Observações do item devem ter no máximo 500 caracteres'
      })
    })
  ).required().messages({
    'array.min': 'Deve haver pelo menos um item no orçamento',
    'any.required': 'Itens são obrigatórios'
  })
});

// Schema para atualizar orçamento
const updateQuoteSchema = Joi.object({
  customerId: Joi.string().messages({
    'string.empty': 'Cliente não pode estar vazio'
  }),
  title: Joi.string().min(3).max(255).messages({
    'string.min': 'Título deve ter pelo menos 3 caracteres',
    'string.max': 'Título deve ter no máximo 255 caracteres'
  }),
  description: Joi.string().max(1000).allow('').messages({
    'string.max': 'Descrição deve ter no máximo 1000 caracteres'
  }),
  validUntil: Joi.date().greater('now').messages({
    'date.base': 'Data de validade deve ser uma data válida',
    'date.greater': 'Data de validade deve ser futura'
  }),
  discount: Joi.number().min(0).messages({
    'number.base': 'Desconto deve ser um número',
    'number.min': 'Desconto não pode ser negativo'
  }),
  discountType: Joi.string().valid('PERCENTAGE', 'FIXED').messages({
    'any.only': 'Tipo de desconto deve ser PERCENTAGE ou FIXED'
  }),
  notes: Joi.string().max(1000).allow('').messages({
    'string.max': 'Observações devem ter no máximo 1000 caracteres'
  }),
  terms: Joi.string().max(2000).allow('').messages({
    'string.max': 'Termos devem ter no máximo 2000 caracteres'
  }),
  items: Joi.array().min(1).items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().positive().required(),
      unitPrice: Joi.number().positive().required(),
      discount: Joi.number().min(0).max(100).default(0),
      notes: Joi.string().max(500).allow('')
    })
  ).messages({
    'array.min': 'Deve haver pelo menos um item no orçamento'
  })
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});

// Schema para alterar status
const updateQuoteStatusSchema = Joi.object({
  status: Joi.string()
    .valid('DRAFT', 'SENT', 'VIEWED', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED')
    .required()
    .messages({
      'any.only': 'Status deve ser: DRAFT, SENT, VIEWED, APPROVED, REJECTED, EXPIRED ou CONVERTED',
      'any.required': 'Status é obrigatório'
    })
});

/**
 * Middleware para validar criação de orçamento
 */
export const validateQuote = (req: Request, res: Response, next: NextFunction) => {
  const { error } = createQuoteSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errorMessages
    });
  }
  
  next();
};

/**
 * Middleware para validar atualização de orçamento
 */
export const validateQuoteUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { error } = updateQuoteSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errorMessages
    });
  }
  
  next();
};

/**
 * Middleware para validar alteração de status
 */
export const validateQuoteStatus = (req: Request, res: Response, next: NextFunction) => {
  const { error } = updateQuoteStatusSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errorMessages
    });
  }
  
  next();
};