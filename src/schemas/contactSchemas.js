import Joi from 'joi';

const stringField = Joi.string().min(3).max(20).required();

export const createContactSchema = Joi.object({
  name: stringField,
  phoneNumber: stringField,
  contactType: Joi.string().valid('work', 'home', 'personal').required(),
  email: Joi.string().email().min(3).max(50).optional(),
  isFavourite: Joi.boolean().optional(),
});

export const patchContactSchema = Joi.object({
  name: Joi.string().min(3).max(20),
  phoneNumber: Joi.string().min(3).max(20),
  contactType: Joi.string().valid('work', 'home', 'personal'),
  email: Joi.string().email().min(3).max(50),
  isFavourite: Joi.boolean(),
}).min(1); 
