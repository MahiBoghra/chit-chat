// Path: backend\src\routes\message.routes.js
import { Router } from 'express';
import * as messageController from '../controllers/message.controller.js';

const router = Router();

// Route to send a message within a conversation
router.post('/', messageController.sendMessage);

// Route to get all messages of a conversation
router.get('/:conversationId', messageController.getMessages);

export default router;
