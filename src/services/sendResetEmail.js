import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import createError from 'http-errors';
import { User } from '../ models/userModel.js';


export const sendResetEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createError(404, 'User not found!');
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: '5m',
  });
  const resetUrl = `${process.env.APP_DOMAIN}/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD || 'unused',
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html: `
        <p>Hello,</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 5 minutes.</p>
      `,
    });
  } catch  {
    throw createError(500, 'Failed to send the email, please try again later.');
  }
};
