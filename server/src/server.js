import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { connectDBWithRetry } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import executionRoutes from './routes/executionRoutes.js';
import errorHandler, { notFound } from './middleware/errorHandler.js';
import initializeSocket from './socket/index.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'][
    mongoose.connection.readyState
  ];

  res.json({
    success: true,
    message: 'CodeCollab API is running',
    db: dbState,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/execute', executionRoutes);

app.use(notFound);
app.use(errorHandler);

const start = () => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  connectDBWithRetry()
    .then(() => {
      initializeSocket(httpServer);
      console.log('Socket.io initialized');
    })
    .catch((error) => {
      console.error(`Fatal: MongoDB unavailable — ${error.message}`);
      console.error('Verify MONGODB_URI in Render Environment and Atlas IP access (0.0.0.0/0)');
    });
};

start();

export default app;
