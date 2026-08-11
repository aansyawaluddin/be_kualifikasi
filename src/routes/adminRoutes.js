import express from 'express';
import { adminController } from '../controllers/adminController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken, isAdmin);

router.get('/paket', adminController.getPaket);
router.get('/paket/:paketId/soal', adminController.getSoalByPaket);

router.post('/kualifikasi/mulai/:paketId', adminController.startKualifikasi);
router.post('/kualifikasi/lanjut-soal', adminController.lanjutSoal);
router.post('/kualifikasi/pause', adminController.pauseKualifikasi);
router.post('/kualifikasi/resume', adminController.resumeKualifikasi);
router.get('/kualifikasi/dashboard-live', adminController.getDashboardLive);
router.post('/kualifikasi/selesai/:paketId', adminController.selesaiKualifikasi);
router.post('/kualifikasi/eksekusi-cutoff', adminController.eksekusiCutOff);

router.post('/kualifikasi/reset/:paketId', adminController.resetKualifikasi);

router.post('/pelanggaran/:timId', adminController.kurangiPoin);

export default router;