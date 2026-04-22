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

    // Jika Admin menekan tombol saat waktu masih berjalan (fase 'soal')
    if (faseAktif === 'soal') {
        const paket = await prisma.paketSoal.findUnique({
            where: { id: parseInt(paketAktifId) }
        });

        const totalJawabanMasuk = await prisma.riwayatJawaban.count({
            where: { soalId: soalAktifId }
        });

        // Cek tim dari wilayah mana yang sedang bertanding di soal ini
        const sampleRiwayat = await prisma.riwayatJawaban.findFirst({
            where: { soalId: soalAktifId },
            include: { tim: { select: { wilayah: true } } }
        });

        let filterTim = {
            role: 'peserta',
            sesi: paket.sesi
        };

        if (sampleRiwayat && sampleRiwayat.tim.wilayah) {
            filterTim.wilayah = sampleRiwayat.tim.wilayah;
        }

        const totalPesertaSeharusnya = await prisma.tim.count({ where: filterTim });

        // CEGAT JIKA BELUM SEMUA MENJAWAB
        if (totalJawabanMasuk === 0 || totalJawabanMasuk < totalPesertaSeharusnya) {
            throw new Error(`Waktu masih jalan! Baru ${totalJawabanMasuk} dari ${totalPesertaSeharusnya} tim aktif yang sudah menjawab.`);
        }

        // Jika semua sudah menjawab, bersihkan timer dari soal yang lama agar tidak membocorkan memori
        if (timerInterval) clearInterval(timerInterval);
        console.log(`[GAME] Semua ${totalPesertaSeharusnya} tim telah menjawab. Langsung beralih ke soal berikutnya.`);
    }

    // EKSEKUSI FINAL: 
    // Apapun kondisinya (baik waktu dipotong karena semua sudah jawab, atau memang waktu sudah habis), 
    // cukup 1x klik langsung mengocok dan memunculkan soal baru!
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