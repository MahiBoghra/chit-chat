// Path: backend\src\routes\auth.routes.js
import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

// Sign Up route
router.post('/signUp', authController.signUp);
router.post('/signup', authController.signUp); // Alias for lowercase

// Login route
router.post('/login', authController.login);

// Get all other users route
router.get('/users', authController.getAllUsers);

export default router;
