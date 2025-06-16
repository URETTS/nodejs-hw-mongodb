import { sendResetEmail } from '../services/sendResetEmail.js';
import createError from 'http-errors';


export const handleSendResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw createError(400, 'Missing email in request body');
    }

    await sendResetEmail(email);

    res.status(200).json({
      status: 200,
      message: 'Reset email sent successfully',
    });
  } catch (err) {
    next(err);
  }
};
