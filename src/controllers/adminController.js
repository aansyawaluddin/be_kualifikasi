import prisma from '../utils/prisma.js';
import { mulaiKualifikasi, lanjutSoalBerikutnya, getGameState } from '../sockets/gameHandler.js';

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
            const io = req.app.get('io');

            await mulaiKualifikasi(io, paketId);

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
                select: { id: true, nama: true, totalPoin: true, wilayah: true }
            });

            const leaderboardPerWilayah = {};
            daftarTim.forEach(tim => {
                if (!leaderboardPerWilayah[tim.wilayah]) leaderboardPerWilayah[tim.wilayah] = [];
                leaderboardPerWilayah[tim.wilayah].push(tim);
            });

            for (const wilayah in leaderboardPerWilayah) {
                leaderboardPerWilayah[wilayah].sort((a, b) => b.totalPoin - a.totalPoin);
            }

            return res.status(200).json({
                success: true,
                data: {
                    sesiAktif: sesiAktif,
                    faseAktif: gameState.faseAktif,
                    sisaWaktuDetik: gameState.sisaWaktu,
                    soalAktif: soalAktif,
                    leaderboard: leaderboardPerWilayah
                }
            });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    },

    eksekusiCutOff: async (req, res) => {
        try {
            const { kuotaPerWilayah } = req.body;
            const gameState = getGameState();

            if (!kuotaPerWilayah) {
                return res.status(400).json({ success: false, message: "Masukkan kuota kelulusan per wilayah!" });
            }

            if (!gameState.paketAktifId) {
                return res.status(400).json({ success: false, message: "Belum ada kualifikasi yang dijalankan." });
            }

            const paket = await prisma.paketSoal.findUnique({ where: { id: parseInt(gameState.paketAktifId) } });
            const sesiTarget = paket.sesi;
            const limit = parseInt(kuotaPerWilayah);

            const daftarTim = await prisma.tim.findMany({
                where: { status: 'kualifikasi', role: 'peserta', sesi: sesiTarget },
                include: { riwayat: { include: { soal: true } } }
            });

            const groupedTim = {};

            daftarTim.forEach(tim => {
                let totalWaktu = 0;
                tim.riwayat.forEach(r => {
                    if (r.isBenar && r.soal.waktuMulai) {
                        const durasi = new Date(r.waktuMenjawab).getTime() - new Date(r.soal.waktuMulai).getTime();
                        totalWaktu += durasi;
                    }
                });

                if (!groupedTim[tim.wilayah]) groupedTim[tim.wilayah] = [];
                groupedTim[tim.wilayah].push({ id: tim.id, nama: tim.nama, totalPoin: tim.totalPoin, totalWaktu });
            });

            let timLolosTotal = [];
            let timGugurTotal = [];

            for (const wilayah in groupedTim) {
                const klasemenWilayah = groupedTim[wilayah];

                klasemenWilayah.sort((a, b) => {
                    if (a.totalPoin !== b.totalPoin) return b.totalPoin - a.totalPoin;
                    return a.totalWaktu - b.totalWaktu;
                });

                timLolosTotal.push(...klasemenWilayah.slice(0, limit));
                timGugurTotal.push(...klasemenWilayah.slice(limit));
            }

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
                message: `Cut-off Sesi ${sesiTarget} berhasil dieksekusi per wilayah.`,
                data: { totalLolos: timLolosTotal.length, totalGugur: timGugurTotal.length }
            });

        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
};