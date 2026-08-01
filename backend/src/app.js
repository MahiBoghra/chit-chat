// Path: backend\src\app.js
import express from 'express';
import authRoutes from './routes/auth.routes.js';
import errorHandler from './middlewares/errorHandler.middleware.js';

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Mount Authentication routes
app.use('/api/auth', authRoutes);

// Centralized error handling middleware
app.use(errorHandler);

export default app;
