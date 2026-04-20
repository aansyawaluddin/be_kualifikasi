import express from 'express';
import { ledController } from '../controllers/ledController.js';

const router = express.Router();

router.get('/live-game', ledController.getLiveGameState);

router.get('/leaderboard-akhir', ledController.getFinalLeaderboard);

export default router;