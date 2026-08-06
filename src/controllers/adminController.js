import prisma from '../utils/prisma.js';
import { mulaiKualifikasi, lanjutSoalBerikutnya, getGameState, resetGameState } from '../sockets/gameHandler.js';

export const adminController = {

    getPaket: async (req, res) => {
        try {
            const paket = await prisma.paketSoal.findMany({
                orderBy: { sesi: 'asc' }
            });
            return res.status(200).json({ success: true, data: paket });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    },

    getSoalByPaket: async (req, res) => {
        try {
            const { paketId } = req.params;
            const soal = await prisma.soal.findMany({
                where: { paketSoalId: parseInt(paketId) },
                orderBy: { id: 'asc' },
                select: {
                    id: true,
                    pertanyaan: true,
                    tipe: true
                }
            });
            return res.status(200).json({ success: true, data: soal });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    },

    startKualifikasi: async (req, res) => {
        try {
            const { paketId } = req.params;

            const paket = await prisma.paketSoal.findUnique({
                where: { id: parseInt(paketId) }
            });

            if (!paket) {
                return res.status(404).json({ success: false, message: "Paket soal tidak ditemukan!" });
            }
            if (paket.status === 'selesai') {
                return res.status(403).json({
                    success: false,
                    message: "Akses Ditolak! Sesi ini sudah selesai dan tidak bisa dimulai ulang."
                });
            }

            const io = req.app.get('io');
            await mulaiKualifikasi(io, paketId);

            await prisma.paketSoal.update({
                where: { id: parseInt(paketId) },
                data: { status: 'berjalan' }
            });

            return res.status(200).json({ success: true, message: "Babak Kualifikasi Dimulai!" });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    },

    lanjutSoal: async (req, res) => {
        try {
            const io = req.app.get('io');
            await lanjutSoalBerikutnya(io);

            return res.status(200).json({ success: true, message: "Beralih ke soal berikutnya!" });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    getDashboardLive: async (req, res) => {
        try {
            const gameState = getGameState();
            let soalAktif = null;
            let sesiAktif = 1;

            if (gameState.paketAktifId) {
                const paket = await prisma.paketSoal.findUnique({ where: { id: parseInt(gameState.paketAktifId) } });
                if (paket) sesiAktif = paket.sesi;
            }

            if (gameState.soalAktifId) {
                soalAktif = await prisma.soal.findUnique({ where: { id: gameState.soalAktifId } });
            }

            const daftarTim = await prisma.tim.findMany({
                where: { role: 'peserta', sesi: sesiAktif },
                select: {
                    id: true,
                    nama: true,
                    totalPoin: true,
                    wilayah: true,
                    riwayat: {
                        where: { isBenar: true },
                        select: {
                            waktuMenjawab: true,
                            soal: { select: { waktuMulai: true } }
                        }
                    }
                }
            });

            const klasemen = daftarTim.map(tim => {
                let totalWaktu = 0;
                tim.riwayat.forEach(r => {
                    if (r.soal && r.soal.waktuMulai && r.waktuMenjawab) {
                        const durasi = new Date(r.waktuMenjawab).getTime() - new Date(r.soal.waktuMulai).getTime();
                        totalWaktu += durasi;
                    }
                });

                return {
                    id: tim.id,
                    nama: tim.nama,
                    totalPoin: tim.totalPoin,
                    totalWaktu: totalWaktu,
                    wilayah: tim.wilayah
                };
            });

            klasemen.sort((a, b) => {
                if (b.totalPoin !== a.totalPoin) return b.totalPoin - a.totalPoin;
                return a.totalWaktu - b.totalWaktu;
            });

            return res.status(200).json({
                success: true,
                data: {
                    sesiAktif: sesiAktif,
                    faseAktif: gameState.faseAktif,
                    sisaWaktuDetik: gameState.sisaWaktu,
                    soalAktif: soalAktif,
                    leaderboard: klasemen
                }
            });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    },

    selesaiKualifikasi: async (req, res) => {
        try {
            const { paketId } = req.params;
            const io = req.app.get('io');

            await prisma.paketSoal.update({
                where: { id: parseInt(paketId) },
                data: { status: 'selesai' }
            });

            resetGameState();

            if (io) {
                io.emit('sesi_selesai', { message: `Sesi Kualifikasi telah resmi ditutup!` });
            }

            return res.status(200).json({
                success: true,
                message: "Sesi kualifikasi berhasil ditutup secara permanen!"
            });

        } catch (error) {
            console.error("Error Selesai Kualifikasi:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    },

    eksekusiCutOff: async (req, res) => {
        try {
            const { kuotaLolos } = req.body;
            const gameState = getGameState();

            if (!gameState.paketAktifId) {
                return res.status(400).json({ success: false, message: "Belum ada kualifikasi yang dijalankan." });
            }

            const paket = await prisma.paketSoal.findUnique({ where: { id: parseInt(gameState.paketAktifId) } });
            const sesiTarget = paket.sesi;
            const limit = parseInt(kuotaLolos) || 4;

            const daftarTim = await prisma.tim.findMany({
                where: { status: 'kualifikasi', role: 'peserta', sesi: sesiTarget },
                include: { riwayat: { include: { soal: true } } }
            });

            const klasemen = daftarTim.map(tim => {
                let totalWaktu = 0;
                tim.riwayat.forEach(r => {
                    if (r.isBenar && r.soal.waktuMulai) {
                        const durasi = new Date(r.waktuMenjawab).getTime() - new Date(r.soal.waktuMulai).getTime();
                        totalWaktu += durasi;
                    }
                });

                return { id: tim.id, nama: tim.nama, totalPoin: tim.totalPoin, totalWaktu };
            });

            klasemen.sort((a, b) => {
                if (a.totalPoin !== b.totalPoin) return b.totalPoin - a.totalPoin;
                return a.totalWaktu - b.totalWaktu;
            });

            const timLolosTotal = klasemen.slice(0, limit);
            const timGugurTotal = klasemen.slice(limit);

            await prisma.$transaction(async (tx) => {
                if (timLolosTotal.length > 0) {
                    await tx.tim.updateMany({
                        where: { id: { in: timLolosTotal.map(t => t.id) } },
                        data: { status: 'lolos' }
                    });
                }
                if (timGugurTotal.length > 0) {
                    await tx.tim.updateMany({
                        where: { id: { in: timGugurTotal.map(t => t.id) } },
                        data: { status: 'gugur' }
                    });
                }
            });

            const io = req.app.get('io');
            if (io) io.emit('pengumuman_kualifikasi', { message: `Hasil kualifikasi Sesi ${sesiTarget} telah dirilis!` });

            return res.status(200).json({
                success: true,
                message: `Cut-off Sesi ${sesiTarget} berhasil dieksekusi. Top ${limit} tim lolos ke babak berikutnya.`,
                data: { totalLolos: timLolosTotal.length, totalGugur: timGugurTotal.length }
            });

        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    },

    resetKualifikasi: async (req, res) => {
        try {
            const { paketId } = req.params;
            const io = req.app.get('io');

            const paket = await prisma.paketSoal.findUnique({
                where: { id: parseInt(paketId) }
            });

            if (!paket) {
                return res.status(404).json({ success: false, message: "Paket soal tidak ditemukan!" });
            }

            const sesiTarget = paket.sesi;

            await prisma.$transaction(async (tx) => {
                await tx.riwayatJawaban.deleteMany({
                    where: { soal: { paketSoalId: parseInt(paketId) } }
                });

                await tx.soal.updateMany({
                    where: { paketSoalId: parseInt(paketId) },
                    data: { status: 'belum', waktuMulai: null }
                });

                await tx.tim.updateMany({
                    where: { sesi: sesiTarget, role: 'peserta' },
                    data: { totalPoin: 0, status: 'kualifikasi' }
                });

                await tx.paketSoal.update({
                    where: { id: parseInt(paketId) },
                    data: { status: 'belum_mulai' }
                });
            });

            if (io) {
                io.emit('sesi_selesai', { message: `Sesi ${sesiTarget} sedang di-reset oleh Admin...` });
            }

            return res.status(200).json({
                success: true,
                message: `Testing Reset Berhasil: Sesi ${sesiTarget} bersih! Poin, soal, dan riwayat jawaban telah dikembalikan seperti semula.`
            });

        } catch (error) {
            console.error("Error Reset Kualifikasi:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
};