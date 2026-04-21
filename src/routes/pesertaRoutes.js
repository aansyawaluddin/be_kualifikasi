import express from 'express';
import { pesertaController } from '../controllers/pesertaController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/info', verifyToken, pesertaController.getInformasiTim);
router.get('/soal-aktif', verifyToken, pesertaController.getSoalAktif);
router.post('/submit-jawaban', verifyToken, pesertaController.submitJawaban);
router.get('/leaderboard', verifyToken, pesertaController.getLeaderboardPeserta);

export default router;