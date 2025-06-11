import jwt from 'jsonwebtoken';
import { Session } from '../ models/sessionModel.js';
import { User } from '../ models/userModel.js';
import createError from 'http-errors';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';



const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

// Генерация токенов
const createTokens = ({ id, sessionId }) => {
  const payload = { id, sessionId };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 хв
  const refreshTokenValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 днів

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

export const loginUser = async (email, password, res) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw createError(401, 'Email or password is incorrect');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw createError(401, 'Email or password is incorrect');
  }

  // Створюємо попередньо sessionId (для включення його в токени)
const sessionId = new mongoose.Types.ObjectId();

const tokens = createTokens({ id: user._id, sessionId });

await Session.create({
  _id: sessionId,
  userId: user._id,
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
  accessTokenValidUntil: tokens.accessTokenValidUntil,
  refreshTokenValidUntil: tokens.refreshTokenValidUntil,
});


res.cookie('refreshToken', tokens.refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'None',
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

res.cookie('sessionId', sessionId.toString(), {
  httpOnly: true,
  secure: true,
  sameSite: 'None',
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

return { accessToken: tokens.accessToken };

};

// ОБНОВЛЕНИЕ СЕССИИ
export const refreshSession = async (refreshToken, sessionId, res) => {
  if (!refreshToken || !sessionId) throw createError(401, 'Missing refresh token or session ID');

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch  {
    throw createError(401, 'Invalid or expired refresh token');
  }

  if (payload.sessionId !== sessionId) {
    throw createError(401, 'Session ID mismatch');
  }

  const existingSession = await Session.findById(sessionId);
  if (!existingSession) {
    throw createError(401, 'Session not found');
  }

  const tokens = createTokens({ id: payload.id, sessionId });

existingSession.accessToken = tokens.accessToken;
existingSession.refreshToken = tokens.refreshToken;
existingSession.accessTokenValidUntil = tokens.accessTokenValidUntil;
existingSession.refreshTokenValidUntil = tokens.refreshTokenValidUntil;

await existingSession.save();

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    expires: tokens.refreshTokenValidUntil,
  });

  return { accessToken: tokens.accessToken };
};


// ЛОГАУТ
export const logoutUser = async (refreshToken, res) => {
  if (!refreshToken) return;

  // Видалити сесію з бази
  await Session.findOneAndDelete({ refreshToken });

  // Очистити кукі
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
  });

  res.clearCookie('sessionId', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
  });
};

