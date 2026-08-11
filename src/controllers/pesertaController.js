import prisma from '../utils/prisma.js';
import { getGameState } from '../sockets/gameHandler.js';
import { hitungTotalWaktu, kelompokkanPerWilayah } from '../utils/klasemenHelper.js';

export const pesertaController = {

    getInformasiTim: async (req, res) => {
        try {
            const timId = req.user.id;

            const tim = await prisma.tim.findUnique({
                where: { id: timId },
                select: {
                    foto: true,
                    nama: true,
                    wilayah: true
                }
            });

            if (!tim) {
                return res.status(404).json({ success: false, message: "Tim tidak ditemukan!" });
            }

            return res.status(200).json({
                success: true,
                data: tim
            });

        } catch (error) {
            console.error("Error Get Informasi Tim:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    },

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
                        tipe: true,
                        kategori: true,
                        pertanyaan: true,
                        gambar: true,
                        opsiJawaban: true,
                        waktuMulai: true,
                        isUjiCoba: true,
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
                    tipeSoal: soalAktif.tipe,
                    kategori: soalAktif.kategori,
                    pertanyaan: soalAktif.pertanyaan,
                    gambar: soalAktif.gambar,
                    opsiJawaban: soalAktif.opsiJawaban,
                    waktuMulai: soalAktif.waktuMulai,
                    isUjiCoba: soalAktif.isUjiCoba
                },
                sisaWaktuDetik: gameState.sisaWaktu,
                sudahMenjawab: !!riwayat,
                faseAktif: gameState.faseAktif,
                isPaused: gameState.isPaused
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
            if (gameState.isPaused) {
                return res.status(400).json({ success: false, message: "Sesi sedang dipause oleh Admin. Mohon tunggu sampai dilanjutkan." });
            }
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
                const urutanBenarSesi = await prisma.riwayatJawaban.count({
                    where: {
                        soalId: soal.id,
                        isBenar: true,
                        tim: { sesi: tim.sesi }
                    }
                });

                const poinPeringkat = [20, 15, 10, 5];

                poinDidapat = poinPeringkat[urutanBenarSesi] !== undefined ? poinPeringkat[urutanBenarSesi] : 2;
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
                where: { role: 'peserta', sesi: myTim.sesi },
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
                return { ...timData, totalWaktu };
            });
            
            const klasemenPerWilayah = kelompokkanPerWilayah(daftarTimDenganWaktu);

            return res.status(200).json({
                success: true,
                data: {
                    timSayaId: timId,
                    wilayahSaya: myTim.wilayah,
                    klasemenPerWilayah
                }
            });

        } catch (error) {
            console.error("Error Get Leaderboard Peserta:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
};