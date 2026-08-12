import prisma from '../utils/prisma.js';
import { getGameState } from '../sockets/gameHandler.js';
import { hitungTotalWaktu, kelompokkanPerWilayah } from '../utils/klasemenHelper.js';

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
                        opsiJawaban: true,
                        isUjiCoba: true
                    }
                });
            }

            const teams = await prisma.tim.findMany({
                where: { role: 'peserta', sesi: sesiAktif },
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

            let riwayatSoalAktif = [];
            if (soalAktif) {
                riwayatSoalAktif = await prisma.riwayatJawaban.findMany({
                    where: { soalId: soalAktif.id },
                    select: { timId: true, isBenar: true }
                });
            }

            const daftarTimDenganWaktu = teams.map(tim => {
                const totalWaktu = hitungTotalWaktu(tim);

                const riwayatTim = riwayatSoalAktif.find(r => r.timId === tim.id);
                let statusMenjawab = 'BELUM';

                if (riwayatTim) {
                    if (gameState.faseAktif === 'soal') {
                        statusMenjawab = 'SUDAH';
                    } else if (gameState.faseAktif === 'menunggu') {
                        statusMenjawab = riwayatTim.isBenar ? 'BENAR' : 'SALAH';
                    }
                }

                return {
                    id: tim.id,
                    nama: tim.nama,
                    totalPoin: tim.totalPoin,
                    totalWaktu: totalWaktu,
                    wilayah: tim.wilayah,
                    statusKelulusan: tim.status,
                    statusMenjawab: statusMenjawab
                };
            });

            const timBertandingPerWilayah = kelompokkanPerWilayah(daftarTimDenganWaktu, 10);

            return res.status(200).json({
                success: true,
                data: {
                    paketNama: paketNama,
                    sesiAktif: sesiAktif,
                    faseAktif: gameState.faseAktif,
                    tahapAktif: gameState.tahapAktif,
                    isPaused: gameState.isPaused,
                    sisaWaktuDetik: gameState.sisaWaktu,
                    soalAktif: soalAktif,
                    timBertandingPerWilayah: timBertandingPerWilayah
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
            let sesiTarget = 1;

            if (sesi) {
                sesiTarget = parseInt(sesi);
            } else {
                const gameState = getGameState();
                if (gameState.paketAktifId) {
                    const paket = await prisma.paketSoal.findUnique({
                        where: { id: parseInt(gameState.paketAktifId) }
                    });
                    if (paket) {
                        sesiTarget = paket.sesi;
                    }
                }
            }

            const daftarTim = await prisma.tim.findMany({
                where: { role: 'peserta', sesi: sesiTarget },
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

            const daftarTimDenganWaktu = daftarTim.map(tim => {
                const totalWaktu = hitungTotalWaktu(tim);
                const { riwayat, ...timData } = tim;

                return {
                    ...timData,
                    totalWaktu: Number((totalWaktu / 1000).toFixed(3))
                };
            });

            const klasemenPerWilayah = kelompokkanPerWilayah(daftarTimDenganWaktu);

            return res.status(200).json({
                success: true,
                data: {
                    sesiAktif: sesiTarget,
                    klasemenPerWilayah: klasemenPerWilayah
                }
            });

        } catch (error) {
            console.error("Error Get Final Leaderboard:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
};