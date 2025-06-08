import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import dotenv from 'dotenv';
import contactsRouter from './routes/contactsRouter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import authRouter from './routes/auth.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const PORT = process.env.PORT;

export const startServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    })
  );

  app.use('/contacts', contactsRouter);

  app.use('/auth', authRouter);

  app.use(notFoundHandler);

  app.get('/', (req, res) => {
    res.send('API is working');
  });

  app.use(errorHandler);
  


  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};