import jwt from 'jsonwebtoken';
import { Session } from '../ models/sessionModel.js';
import { User } from '../ models/userModel.js';
import createError from 'http-errors';
import bcrypt from 'bcrypt';

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

// Генерация токенов
const createTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 минут
  const refreshTokenValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 дней

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  };
};

// РЕГИСТРАЦИЯ
export const registerUser = async (userData) => {
  const { email, password, name } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError(409, 'User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return newUser;
};

// ЛОГИН
export const loginUser = async (email, password, res) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw createError(401, 'Invalid email or password');
  }

  // Удаляем предыдущую сессию
  await Session.deleteOne({ userId: user._id });

  // Создаем новые токены
  const tokens = createTokens(user._id);

  // Создаем сессию
  await Session.create({
    userId: user._id,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessTokenValidUntil: tokens.accessTokenValidUntil,
    refreshTokenValidUntil: tokens.refreshTokenValidUntil,
  });

  // Устанавливаем refresh токен в cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: tokens.refreshTokenValidUntil,
  });

  return { accessToken: tokens.accessToken };
};

// ОБНОВЛЕНИЕ СЕССИИ
export const refreshSession = async (refreshToken, res) => {
  if (!refreshToken) throw createError(401, 'No refresh token');

  const existingSession = await Session.findOne({ refreshToken });
  if (!existingSession) throw createError(401, 'Invalid session');

  // Проверяем refresh токен с актуальным секретом
  const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  await Session.deleteOne({ _id: existingSession._id });

  const tokens = createTokens(payload.userId);

  await Session.create({
    userId: payload.userId,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessTokenValidUntil: tokens.accessTokenValidUntil,
    refreshTokenValidUntil: tokens.refreshTokenValidUntil,
  });

  // Обновляем куку с refresh токеном
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: tokens.refreshTokenValidUntil,
  });

  return { accessToken: tokens.accessToken };
};

// ЛОГАУТ
export const logoutUser = async (refreshToken) => {
  if (!refreshToken) return;
  await Session.findOneAndDelete({ refreshToken });
};
