import jwt from 'jsonwebtoken';
import { Session } from '../ models/sessionModel.js';
import { User } from '../ models/userModel.js';
import createError from 'http-errors';
import bcrypt from 'bcrypt';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

export const loginUser = async (email, password, res) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw createError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw createError(401, 'Invalid email or password');
  }

  // Remove old session
  await Session.deleteOne({ userId: user._id });

  // Generate tokens
  const accessToken = jwt.sign({ userId: user._id }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

  const refreshToken = jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  const accessTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  const refreshTokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  // Create new session
  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: accessTokenExpires,
    refreshTokenValidUntil: refreshTokenExpires,
  });

  // Set refresh token in cookies
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: refreshTokenExpires,
  });

  return { accessToken };
};

export const registerUser = async (userData) => {
  const { email, password, name } = userData;

  // Проверка, существует ли пользователь с таким email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError(409, 'User with this email already exists');
  }

  // Хешируем пароль
  const hashedPassword = await bcrypt.hash(password, 10);

  // Создаем пользователя
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return newUser;
};

const createTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  };
};

// Оновлення сесії
export const refreshSession = async (refreshToken) => {
  if (!refreshToken) throw createError(401, 'No refresh token');

  const existingSession = await Session.findOne({ refreshToken });
  if (!existingSession) throw createError(401, 'Invalid session');

  const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);

  await Session.deleteOne({ _id: existingSession._id });

  const tokens = createTokens(payload.userId);

  await Session.create({
    userId: payload.userId,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessTokenValidUntil: tokens.accessTokenValidUntil,
    refreshTokenValidUntil: tokens.refreshTokenValidUntil,
  });

  return { accessToken: tokens.accessToken };
};

// Видалення сесії
export const logoutUser = async (refreshToken) => {
  if (!refreshToken) return;
  await Session.findOneAndDelete({ refreshToken });
};