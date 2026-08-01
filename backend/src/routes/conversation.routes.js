// Path: backend\src\routes\conversation.routes.js
import { Router } from 'express';
import * as conversationController from '../controllers/conversation.controller.js';

const router = Router();

// Route to create a conversation between two users
router.post('/', conversationController.createConversation);

// Route to get all conversations for a specific user
router.get('/:userId', conversationController.getUserConversations);

export default router;
