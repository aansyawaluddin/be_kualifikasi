import prisma from '../utils/prisma.js';
import {
    mulaiTahap,
    selesaiUjiCoba as selesaiUjiCobaGame,
    lanjutSoalBerikutnya,
    getGameState,
    resetGameState,
    pauseKualifikasi as pauseGameSession,
    resumeKualifikasi as resumeGameSession
} from '../sockets/gameHandler.js';
import { hitungTotalWaktu, kelompokkanPerWilayah } from '../utils/klasemenHelper.js';

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
                    tipe: true,
                    isUjiCoba: true
                }
            });
            return res.status(200).json({ success: true, data: soal });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    },

    // Card 1: "Uji Coba" -> tombol Mulai
    startUjiCoba: async (req, res) => {
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
            if (paket.statusUjiCoba === 'selesai') {
                return res.status(403).json({
                    success: false,
                    message: "Uji coba untuk paket ini sudah ditutup. Lanjut ke Soal Real."
                });
            }

            const totalSoalUjiCoba = await prisma.soal.count({
                where: { paketSoalId: parseInt(paketId), isUjiCoba: true }
            });
            if (totalSoalUjiCoba === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Paket ini tidak memiliki soal uji coba. Langsung mulai Soal Real."
                });
            }

            const io = req.app.get('io');
            await mulaiTahap(io, paketId, 'uji_coba');

            await prisma.paketSoal.update({
                where: { id: parseInt(paketId) },
                data: { status: 'berjalan', statusUjiCoba: 'berjalan' }
            });

            return res.status(200).json({ success: true, message: "Sesi Uji Coba dimulai!" });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    },

    // Card 1: tombol "Selesai" -> baru bisa kalau semua soal uji coba sudah kepake.
    // Semua client (peserta, LED, admin) diarahkan balik ke halaman awal via socket 'uji_coba_selesai'.
    selesaiUjiCoba: async (req, res) => {
        try {
            const { paketId } = req.params;
            const io = req.app.get('io');

            await selesaiUjiCobaGame(io, paketId);

            return res.status(200).json({
                success: true,
                message: "Sesi Uji Coba selesai! Poin direset, semua diarahkan ke halaman awal."
            });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    // Card 2: "Soal Real" -> tombol Mulai. Ditolak kalau paket punya soal uji coba
    // tapi belum diselesaikan lewat tombol Selesai di atas.
    startSoalReal: async (req, res) => {
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

            const totalSoalUjiCoba = await prisma.soal.count({
                where: { paketSoalId: parseInt(paketId), isUjiCoba: true }
            });
            if (totalSoalUjiCoba > 0 && paket.statusUjiCoba !== 'selesai') {
                return res.status(403).json({
                    success: false,
                    message: "Sesi Uji Coba belum diselesaikan admin. Klik 'Selesai' di card Uji Coba dulu."
                });
            }

            const io = req.app.get('io');
            await mulaiTahap(io, paketId, 'soal_real');

            await prisma.paketSoal.update({
                where: { id: parseInt(paketId) },
                data: { status: 'berjalan' }
            });

            return res.status(200).json({ success: true, message: "Soal Real dimulai!" });
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

    pauseKualifikasi: async (req, res) => {
        try {
            const io = req.app.get('io');
            const hasil = pauseGameSession(io);
            return res.status(200).json({ success: true, message: "Sesi berhasil dipause.", data: hasil });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    resumeKualifikasi: async (req, res) => {
        try {
            const io = req.app.get('io');
            const hasil = resumeGameSession(io);
            return res.status(200).json({ success: true, message: "Sesi berhasil dilanjutkan.", data: hasil });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    getDashboardLive: async (req, res) => {
        try {
            const gameState = getGameState();
            let soalAktif = null;
            let sesiAktif = 1;
            let statusUjiCoba = null;

            if (gameState.paketAktifId) {
                const paket = await prisma.paketSoal.findUnique({ where: { id: parseInt(gameState.paketAktifId) } });
                if (paket) {
                    sesiAktif = paket.sesi;
                    statusUjiCoba = paket.statusUjiCoba;
                }
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

            const daftarTimDenganWaktu = daftarTim.map(tim => ({
                id: tim.id,
                nama: tim.nama,
                totalPoin: tim.totalPoin,
                wilayah: tim.wilayah,
                totalWaktu: parseFloat((hitungTotalWaktu(tim) / 1000).toFixed(3))
            }));

            const leaderboardPerWilayah = kelompokkanPerWilayah(daftarTimDenganWaktu, 10);

            let sudahMenjawab = 0;
            if (gameState.soalAktifId) {
                sudahMenjawab = await prisma.riwayatJawaban.count({
                    where: { soalId: gameState.soalAktifId }
                });
            }

            return res.status(200).json({
                success: true,
                data: {
                    sesiAktif: sesiAktif,
                    tahapAktif: gameState.tahapAktif,
                    statusUjiCoba: statusUjiCoba,
                    faseAktif: gameState.faseAktif,
                    isPaused: gameState.isPaused,
                    sisaWaktuDetik: gameState.sisaWaktu,
                    soalAktif: soalAktif,
                    progresMenjawab: {
                        sudahMenjawab: sudahMenjawab,
                        totalTim: daftarTim.length
                    },
                    leaderboardPerWilayah: leaderboardPerWilayah
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
            const limitPerWilayah = parseInt(kuotaLolos) || 1;

            const daftarTim = await prisma.tim.findMany({
                where: { status: 'kualifikasi', role: 'peserta', sesi: sesiTarget },
                include: { riwayat: { include: { soal: true } } }
            });

            const daftarTimDenganWaktu = daftarTim.map(tim => ({
                id: tim.id,
                nama: tim.nama,
                totalPoin: tim.totalPoin,
                wilayah: tim.wilayah,
                totalWaktu: hitungTotalWaktu(tim)
            }));

            const klasemenPerWilayah = kelompokkanPerWilayah(daftarTimDenganWaktu);

            const timLolosTotal = [];
            const timGugurTotal = [];
            const rincianPerWilayah = {};

            Object.entries(klasemenPerWilayah).forEach(([wilayah, klasemen]) => {
                const lolos = klasemen.slice(0, limitPerWilayah);
                const gugur = klasemen.slice(limitPerWilayah);

                timLolosTotal.push(...lolos);
                timGugurTotal.push(...gugur);

                rincianPerWilayah[wilayah] = {
                    totalTim: klasemen.length,
                    lolos: lolos.map(t => ({ id: t.id, nama: t.nama, totalPoin: t.totalPoin }))
                };
            });

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
            if (io) io.emit('pengumuman_kualifikasi', { message: `Hasil kualifikasi Sesi ${sesiTarget} telah dirilis!`, rincianPerWilayah });

            return res.status(200).json({
                success: true,
                message: `Cut-off Sesi ${sesiTarget} berhasil dieksekusi. Top ${limitPerWilayah} tim per wilayah lolos ke babak berikutnya.`,
                data: {
                    totalLolos: timLolosTotal.length,
                    totalGugur: timGugurTotal.length,
                    totalWilayah: Object.keys(klasemenPerWilayah).length,
                    rincianPerWilayah
                }
            });

        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    },

    kurangiPoin: async (req, res) => {
        try {
            const { timId } = req.params;
            const { keterangan, poinDikurangi } = req.body;

            const poin = parseInt(poinDikurangi);
            if (!poin || poin <= 0) {
                return res.status(400).json({ success: false, message: "Poin pengurangan harus berupa angka positif." });
            }

            const tim = await prisma.tim.findUnique({ where: { id: parseInt(timId) } });
            if (!tim) return res.status(404).json({ success: false, message: "Tim tidak ditemukan." });

            const poinBaru = Math.max(0, tim.totalPoin - poin);

            await prisma.tim.update({
                where: { id: tim.id },
                data: { totalPoin: poinBaru }
            });

            const io = req.app.get('io');
            if (io) {
                io.emit('poin_dikurangi', {
                    timId: tim.id,
                    nama: tim.nama,
                    wilayah: tim.wilayah,
                    poinDikurangi: poin,
                    totalPoinBaru: poinBaru,
                    keterangan: keterangan ? keterangan.trim() : null
                });
            }

            return res.status(200).json({
                success: true,
                message: `Poin ${tim.nama} dikurangi ${poin}. Total poin sekarang: ${poinBaru}.`,
                data: { timId: tim.id, totalPoinBaru: poinBaru }
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
                    data: { status: 'belum_mulai', statusUjiCoba: 'belum' }
                });
            });

            resetGameState();

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