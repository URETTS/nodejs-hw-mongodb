import express from 'express';
import { handleRegister, handleLogin, handleRefresh, handleLogout } from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import { loginSchema } from '../schemas/userSchemas.js';
import { registerSchema } from '../schemas/authSchemas.js';
import { handleSendResetEmail } from '../controllers/handleSendResetEmail.js';
import { emailSchema } from '../schemas/authSchemas.js';
import { resetPwdSchema } from '../schemas/resetPwdSchema.js';
import { handleResetPassword } from '../controllers/resetPassword.js'; 


const router = express.Router();

// Роут для реєстрації
router.post('/register', validateBody(registerSchema), handleRegister);

// Роут для логіну
router.post('/login', validateBody(loginSchema), handleLogin);

router.post('/refresh', handleRefresh);
router.post('/logout', handleLogout);

router.post(
    '/send-reset-email',
    validateBody(emailSchema),
    handleSendResetEmail
);
router.post(
  '/reset-pwd',
  validateBody(resetPwdSchema),
  handleResetPassword
);

export default router;
