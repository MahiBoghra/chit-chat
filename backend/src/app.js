// Path: backend\src\app.js
import express from 'express';
import authRoutes from './routes/auth.routes.js';
import errorHandler from './middlewares/errorHandler.middleware.js';

import conversationRoutes from './routes/conversation.routes.js';
import messageRoutes from './routes/message.routes.js';

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Mount Authentication routes
app.use('/api/auth', authRoutes);

// Mount Conversation routes
app.use('/api/conversations', conversationRoutes);

// Mount Message routes
app.use('/api/messages', messageRoutes);

// Centralized error handling middleware
app.use(errorHandler);

export default app;

