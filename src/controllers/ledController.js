import prisma from '../utils/prisma.js';
import { getGameState } from '../sockets/gameHandler.js';

export const ledController = {
    getLiveGameState: async (req, res) => {
        try {
            const gameState = getGameState();
            let soalAktif = null;
            let sesiAktif = 1;
            let paketNama = "Menunggu Game Dimulai...";

            if (gameState.paketAktifId) {
                const paket = await prisma.paketSoal.findUnique({
                    where: { id: parseInt(gameState.paketAktifId) }
                });
                if (paket) {
                    sesiAktif = paket.sesi;
                    paketNama = paket.nama;
                }
            }

            if (gameState.soalAktifId) {
                soalAktif = await prisma.soal.findUnique({
                    where: { id: gameState.soalAktifId },
                    select: {
                        id: true,
                        gambar: true,
                        pertanyaan: true,
                        opsiJawaban: true
                    }
                });
            }

            const daftarTim = await prisma.tim.findMany({
                where: { role: 'peserta', sesi: sesiAktif },
                select: {
                    id: true,
                    nama: true,
                    totalPoin: true,
                    wilayah: true,
                    status: true
                }
            });

            let riwayatSoalAktif = [];
            if (soalAktif) {
                riwayatSoalAktif = await prisma.riwayatJawaban.findMany({
                    where: { soalId: soalAktif.id },
                    select: { timId: true, isBenar: true }
                });
            }

            const leaderboardPerWilayah = {};

            daftarTim.forEach(tim => {
                if (!leaderboardPerWilayah[tim.wilayah]) {
                    leaderboardPerWilayah[tim.wilayah] = [];
                }

                const riwayatTim = riwayatSoalAktif.find(r => r.timId === tim.id);
                let statusMenjawab = 'BELUM';

                if (riwayatTim) {
                    if (gameState.faseAktif === 'soal') {
                        statusMenjawab = 'SUDAH';
                    }
                    else if (gameState.faseAktif === 'menunggu') {
                        statusMenjawab = riwayatTim.isBenar ? 'BENAR' : 'SALAH';
                    }
                }

                leaderboardPerWilayah[tim.wilayah].push({
                    id: tim.id,
                    nama: tim.nama,
                    totalPoin: tim.totalPoin,
                    statusKelulusan: tim.status
                });
            });

            for (const wilayah in leaderboardPerWilayah) {
                leaderboardPerWilayah[wilayah].sort((a, b) => b.totalPoin - a.totalPoin);
            }

            return res.status(200).json({
                success: true,
                data: {
                    paketNama: paketNama,
                    sesiAktif: sesiAktif,
                    faseAktif: gameState.faseAktif,
                    sisaWaktuDetik: gameState.sisaWaktu,
                    soalAktif: soalAktif,
                    timBertanding: leaderboardPerWilayah
                }
            });

        } catch (error) {
            console.error("Error Get LED Live Game:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    },

    getFinalLeaderboard: async (req, res) => {
        try {
            const { sesi } = req.query;
            const whereClause = { role: 'peserta' };
            if (sesi) whereClause.sesi = parseInt(sesi);

            const daftarTim = await prisma.tim.findMany({
                where: whereClause,
                select: {
                    id: true,
                    nama: true,
                    totalPoin: true,
                    wilayah: true,
                    status: true,
                    riwayat: {
                        where: { isBenar: true }, 
                        select: {
                            waktuMenjawab: true,
                            soal: { select: { waktuMulai: true } }
                        }
                    }
                }
            });

            const timDenganWaktu = daftarTim.map(tim => {
                let totalWaktu = 0;

                tim.riwayat.forEach(r => {
                    if (r.soal && r.soal.waktuMulai) {
                        const durasi = new Date(r.waktuMenjawab).getTime() - new Date(r.soal.waktuMulai).getTime();
                        totalWaktu += durasi;
                    }
                });

                const { riwayat, ...timData } = tim;

                return {
                    ...timData,
                    totalWaktu
                };
            });

            timDenganWaktu.sort((a, b) => {
                if (b.totalPoin !== a.totalPoin) {
                    return b.totalPoin - a.totalPoin; 
                }
                return a.totalWaktu - b.totalWaktu; 
            });

            const rankedData = timDenganWaktu.map((tim, index) => ({
                rank: index + 1,
                ...tim
            }));

            const leaderboardPerWilayah = {};
            rankedData.forEach(tim => {
                if (!leaderboardPerWilayah[tim.wilayah]) {
                    leaderboardPerWilayah[tim.wilayah] = [];
                }
                leaderboardPerWilayah[tim.wilayah].push(tim);
            });

            return res.status(200).json({
                success: true,
                data: {
                    overall: rankedData,
                    perWilayah: leaderboardPerWilayah
                }
            });

        } catch (error) {
            console.error("Error Get Final Leaderboard:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
};