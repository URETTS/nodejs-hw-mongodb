import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import dotenv from 'dotenv';
import contactsRouter from './routes/contactsRouter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import authRouter from './routes/auth.js';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';


dotenv.config();

const PORT = process.env.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger/swagger.yaml'));

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

  app.get('/', (req, res) => {
    res.send('API is working');
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use(notFoundHandler);


  app.use(errorHandler);
  


  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};