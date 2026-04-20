import prisma from '../utils/prisma.js';
import { getGameState } from '../sockets/gameHandler.js';

export const pesertaController = {
    getSoalAktif: async (req, res) => {
        try {
            const timId = req.user.id;
            const tim = await prisma.tim.findUnique({ where: { id: timId } });
            const gameState = getGameState();

            let soalAktif = null;

            if (gameState.soalAktifId) {
                soalAktif = await prisma.soal.findUnique({
                    where: { id: gameState.soalAktifId },
                    select: {
                        id: true,
                        pertanyaan: true,
                        gambar: true,
                        opsiJawaban: true,
                        waktuMulai: true,
                        paketSoal: true
                    }
                });
            }

            if (!soalAktif || soalAktif.paketSoal.sesi !== tim.sesi) {
                return res.status(200).json({
                    success: true,
                    message: "Belum ada soal dimulai untuk sesi Anda.",
                    data: null,
                    faseAktif: gameState.faseAktif
                });
            }

            const riwayat = await prisma.riwayatJawaban.findFirst({
                where: { timId: timId, soalId: soalAktif.id }
            });

            return res.status(200).json({
                success: true,
                data: {
                    id: soalAktif.id,
                    pertanyaan: soalAktif.pertanyaan,
                    gambar: soalAktif.gambar,
                    opsiJawaban: soalAktif.opsiJawaban,
                    waktuMulai: soalAktif.waktuMulai
                },
                sisaWaktuDetik: gameState.sisaWaktu,
                sudahMenjawab: !!riwayat,
                faseAktif: gameState.faseAktif
            });

        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    },

    submitJawaban: async (req, res) => {
        try {
            const timId = req.user.id;
            const { soalId, jawabanTim } = req.body;

            const gameState = getGameState();
            if (gameState.sisaWaktu <= 0 || gameState.faseAktif !== 'soal') {
                return res.status(400).json({ success: false, message: "Waktu habis atau soal ditutup." });
            }

            const tim = await prisma.tim.findUnique({ where: { id: timId } });
            if (!tim) return res.status(404).json({ success: false, message: "Tim tidak ditemukan" });

            const soal = await prisma.soal.findUnique({
                where: { id: parseInt(soalId) },
                include: { paketSoal: true }
            });

            if (!soal || soal.status !== 'aktif') return res.status(400).json({ success: false, message: "Soal tidak aktif!" });

            if (tim.sesi !== soal.paketSoal.sesi) {
                return res.status(403).json({ success: false, message: "Anda tidak bisa menjawab soal dari sesi lain!" });
            }

            const cekRiwayat = await prisma.riwayatJawaban.findFirst({ where: { timId: timId, soalId: soal.id } });
            if (cekRiwayat) return res.status(400).json({ success: false, message: "Anda sudah menjawab!" });

            const isBenar = jawabanTim.toString().trim().toLowerCase() === soal.jawabanBenar.trim().toLowerCase();
            let poinDidapat = 0;

            if (isBenar) {
                const urutanBenarRegional = await prisma.riwayatJawaban.count({
                    where: {
                        soalId: soal.id,
                        isBenar: true,
                        tim: { wilayah: tim.wilayah }
                    }
                });

                const poinPeringkat = [25, 15, 10, 5];

                poinDidapat = poinPeringkat[urutanBenarRegional] !== undefined ? poinPeringkat[urutanBenarRegional] : 2;
            }

            await prisma.$transaction(async (tx) => {
                await tx.riwayatJawaban.create({
                    data: { timId, soalId: soal.id, jawabanTim: jawabanTim.toString(), isBenar, poinDidapat }
                });

                if (poinDidapat > 0) {
                    await tx.tim.update({
                        where: { id: timId },
                        data: { totalPoin: { increment: poinDidapat } }
                    });
                }
            });

            return res.status(200).json({ success: true, data: { isBenar, poinDidapat } });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    },

    getLeaderboardPeserta: async (req, res) => {
        try {
            const timId = req.user.id;
            const myTim = await prisma.tim.findUnique({ where: { id: timId } });

            if (!myTim) return res.status(404).json({ success: false, message: "Tim tidak ditemukan" });

            const daftarTim = await prisma.tim.findMany({
                where: { role: 'peserta', sesi: myTim.sesi, wilayah: myTim.wilayah },
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
                return { ...timData, totalWaktu };
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

            const timSaya = rankedData.find(t => t.id === timId);
            const timLainnya = rankedData.filter(t => t.id !== timId);

            const finalLeaderboard = [timSaya, ...timLainnya];

            return res.status(200).json({
                success: true,
                data: finalLeaderboard
            });

        } catch (error) {
            console.error("Error Get Leaderboard Peserta:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
};