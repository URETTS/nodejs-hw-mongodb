import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import bcrypt from 'bcrypt';
import { User } from '../ models/userModel.js';
import { Session } from '../ models/sessionModel.js'; 

export const handleResetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let email;

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      email = payload.email;
    } catch  {
      throw createError(401, 'Token is expired or invalid.');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw createError(404, 'User not found!');
    }

    // Хешування нового пароля
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    // Видалення поточних сесій користувача 
    await Session.deleteMany({ user: user._id });

    res.status(200).json({
      status: 200,
      message: 'Password has been successfully reset.',
      data: {},
    });

  } catch (err) {
    next(err);
  }
};
