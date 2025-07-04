const Joi = require('joi');

/**
 * Validação para login
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'any.required': 'Senha é obrigatória'
    })
});

/**
 * Validação para registro de usuário
 */
const registerSchema = Joi.object({
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
    .required()
    .messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório'
    }),
  password: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'string.max': 'Senha deve ter no máximo 100 caracteres',
      'any.required': 'Senha é obrigatória'
    }),
  role: Joi.string()
    .valid('ADMIN', 'USER')
    .default('USER')
    .messages({
      'any.only': 'Role deve ser ADMIN ou USER'
    })
});

/**
 * Validação para alteração de senha
 */
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Senha atual é obrigatória'
    }),
  newPassword: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      'string.min': 'Nova senha deve ter pelo menos 6 caracteres',
      'string.max': 'Nova senha deve ter no máximo 100 caracteres',
      'any.required': 'Nova senha é obrigatória'
    })
});

module.exports = {
  loginSchema,
  registerSchema,
  changePasswordSchema
};