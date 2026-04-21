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

        const soalBerikutnya = await prisma.soal.findFirst({
            where: { paketSoalId: parseInt(paketId), status: 'belum' },
            orderBy: { id: 'asc' }
        });

        if (!soalBerikutnya) {
            console.log(`[GAME] Paket Kualifikasi ID ${paketId} Selesai.`);
            faseAktif = 'selesai';

            soalAktifId = null;
            sisaWaktu = 0;

            io.emit('kualifikasi_selesai', {
                message: "Seluruh soal pada sesi ini telah selesai! Menunggu proses Cut-off dari Admin."
            });
            return null;
        }

        const soalAktif = await prisma.soal.update({
            where: { id: soalBerikutnya.id },
            data: { status: 'aktif', waktuMulai: new Date() }
        });

        soalAktifId = soalAktif.id;
        sisaWaktu = DURASI;
        faseAktif = 'soal';

        io.emit('game_mulai', { soalId: soalAktifId, sisaWaktu, faseAktif });
        console.log(`[GAME] Menjalankan Soal ID: ${soalAktifId} | Durasi: ${DURASI} detik`);

        if (timerInterval) {
            clearInterval(timerInterval);
        }

        // Hitung target waktu selesai secara absolut
        const waktuTarget = Date.now() + (DURASI * 1000);

        timerInterval = setInterval(async () => {
            const waktuSekarang = Date.now();

            sisaWaktu = Math.max(0, Math.round((waktuTarget - waktuSekarang) / 1000));

            io.emit('timer_update', { sisaWaktu });

            if (sisaWaktu <= 0) {
                // Hentikan timer
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
        throw new Error("Tidak ada paket kualifikasi yang aktif saat ini.");
    }
    if (faseAktif === 'soal') {
        throw new Error("Waktu soal saat ini belum habis! Tunggu timer selesai untuk lanjut.");
    }

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