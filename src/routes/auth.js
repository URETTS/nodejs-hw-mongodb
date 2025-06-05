import express from 'express';
import { handleRegister, handleLogin } from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import { loginSchema } from '../schemas/userSchemas.js';
import { registerSchema } from '../schemas/authSchemas.js';

const router = express.Router();

// Роут для реєстрації
router.post('/register', validateBody(registerSchema), handleRegister);

// Роут для логіну
router.post('/login', validateBody(loginSchema), handleLogin);

export default router;

