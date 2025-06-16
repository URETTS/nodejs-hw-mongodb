import Joi from 'joi';

export const resetPwdSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Token is required',
    'string.empty': 'Token cannot be empty',
  }),
  password: Joi.string().min(6).max(30).required().messages({
    'any.required': 'Password is required',
    'string.min': 'Password must be at least 6 characters',
    'string.max': 'Password must not exceed 30 characters',
  }),
});
