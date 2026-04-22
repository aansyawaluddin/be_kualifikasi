import prisma from '../utils/prisma.js';

let timerInterval = null;
let sisaWaktu = 0;
let soalAktifId = null;
let paketAktifId = null;
let faseAktif = 'idle';

export const mulaiKualifikasi = async (io, paketId) => {
    try {
        const DURASI = parseInt(process.env.DURASI_SOAL) || 180;

        paketAktifId = paketId;

        await prisma.soal.updateMany({
            where: { status: 'aktif', paketSoalId: parseInt(paketId) },
            data: { status: 'selesai' }
        });

        const semuaSoalBelum = await prisma.soal.findMany({
            where: { paketSoalId: parseInt(paketId), status: 'belum' },
            select: { id: true }
        });

        if (semuaSoalBelum.length === 0) {
            console.log(`[GAME] Paket Kualifikasi ID ${paketId} Selesai.`);
            faseAktif = 'selesai';

            soalAktifId = null;
            sisaWaktu = 0;

            io.emit('kualifikasi_selesai', {
                message: "Seluruh soal pada sesi ini telah selesai! Menunggu proses Cut-off dari Admin."
            });
            return null;
        }

        const randomIndex = Math.floor(Math.random() * semuaSoalBelum.length);
        const soalTerpilih = semuaSoalBelum[randomIndex];

        const soalAktif = await prisma.soal.update({
            where: { id: soalTerpilih.id },
            data: { status: 'aktif', waktuMulai: new Date() }
        });

        soalAktifId = soalAktif.id;
        sisaWaktu = DURASI;
        faseAktif = 'soal';

        io.emit('game_mulai', { soalId: soalAktifId, sisaWaktu, faseAktif });
        console.log(`[GAME] Menjalankan Soal Acak ID: ${soalAktifId} | Sisa Soal: ${semuaSoalBelum.length} | Durasi: ${DURASI} detik`);

        if (timerInterval) {
            clearInterval(timerInterval);
        }


        const waktuTarget = Date.now() + (DURASI * 1000);

        timerInterval = setInterval(async () => {
            const waktuSekarang = Date.now();

            sisaWaktu = Math.max(0, Math.round((waktuTarget - waktuSekarang) / 1000));

            io.emit('timer_update', { sisaWaktu });

            if (sisaWaktu <= 0) {
                clearInterval(timerInterval);

                await prisma.soal.update({
                    where: { id: soalAktifId },
                    data: { status: 'selesai' }
                });

                faseAktif = 'menunggu';

                io.emit('waktu_habis', { soalId: soalAktifId, faseAktif });
                console.log(`[GAME] Waktu Habis (Soal ID: ${soalAktifId}). Menunggu Admin klik Selanjutnya...`);
            }
        }, 1000);

        return soalAktif;

    } catch (error) {
        console.error("[ERROR SIKLUS GAME]:", error);
        return null;
    }
};


export const lanjutSoalBerikutnya = async (io) => {
    if (!paketAktifId) {
        throw new Error("Tidak ada paket soal yang aktif saat ini.");
    }

    if (faseAktif === 'soal') {
        const paket = await prisma.paketSoal.findUnique({
            where: { id: parseInt(paketAktifId) }
        });

        const totalJawabanMasuk = await prisma.riwayatJawaban.count({
            where: { soalId: soalAktifId }
        });

        const sampleRiwayat = await prisma.riwayatJawaban.findFirst({
            where: { soalId: soalAktifId },
            include: { tim: { select: { grup: true } } }
        });

        let filterTim = {
            role: 'peserta',
            tahapAktif: paket.babak,
            isEliminated: false
        };

        if (sampleRiwayat) {
            filterTim.grup = sampleRiwayat.tim.grup;
        }

        const totalPesertaSeharusnya = await prisma.tim.count({ where: filterTim });


        if (totalJawabanMasuk === 0 || totalJawabanMasuk < totalPesertaSeharusnya) {
            throw new Error(`Sabar! Waktu masih berjalan dan baru ${totalJawabanMasuk} dari ${totalPesertaSeharusnya} tim aktif yang sudah menjawab.`);
        }

        if (timerInterval) {
            clearInterval(timerInterval);
        }
        console.log(`[GAME] Timer dihentikan paksa. Semua ${totalPesertaSeharusnya} tim telah menjawab.`);
    }

    // Lanjut kocok dan jalankan soal acak berikutnya
    return await mulaiKualifikasi(io, paketAktifId);
};

export const getGameState = () => {
    return {
        sisaWaktu,
        soalAktifId,
        paketAktifId,
        faseAktif
    };
};

export const gameSocketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log(`[SOCKET] User connected: ${socket.id}`);

        socket.emit('game_state', getGameState());

        socket.on('disconnect', () => {
            console.log(`[SOCKET] User disconnected: ${socket.id}`);
        });
    });
};

export const resetGameState = () => {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    sisaWaktu = 0;
    soalAktifId = null;
    paketAktifId = null;
    faseAktif = 'idle';
};