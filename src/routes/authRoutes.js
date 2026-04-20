import express from 'express';
import { authController } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js'; 

const router = express.Router();

router.post('/login', authController.login);

router.post('/logout', verifyToken, authController.logout);

export default router;