import prisma from '../utils/prisma.js';

let timerInterval = null;
let sisaWaktu = 0;
let soalAktifId = null;
let paketAktifId = null;
let faseAktif = 'idle';
let isPaused = false;
let waktuTarget = null;
let tahapAktif = null; 

const jalankanTimer = (io) => {
    if (timerInterval) clearInterval(timerInterval);

    waktuTarget = Date.now() + (sisaWaktu * 1000);

    timerInterval = setInterval(async () => {
        const waktuSekarang = Date.now();
        sisaWaktu = Math.max(0, Math.round((waktuTarget - waktuSekarang) / 1000));

        io.emit('timer_update', { sisaWaktu });

        if (sisaWaktu <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;

            await prisma.soal.update({
                where: { id: soalAktifId },
                data: { status: 'selesai' }
            });

            faseAktif = 'menunggu';

            io.emit('waktu_habis', { soalId: soalAktifId, faseAktif });
            console.log(`[GAME] Waktu Habis (Soal ID: ${soalAktifId}). Menunggu Admin klik Selanjutnya...`);
        }
    }, 1000);
};

/**
 * Menjalankan satu soal berikutnya dari SATU tahap saja (uji_coba ATAU soal_real).
 * Tidak ada lagi auto-lompat antar tahap — kalau pool soal tahap ini habis,
 * game berhenti dan menunggu aksi admin (Selesai Uji Coba / Cut-off).
 */
export const mulaiTahap = async (io, paketId, tahap) => {
    try {
        if (tahap !== 'uji_coba' && tahap !== 'soal_real') {
            throw new Error("Tahap tidak valid. Gunakan 'uji_coba' atau 'soal_real'.");
        }

        const DURASI = parseInt(process.env.DURASI_SOAL) || 180;

        paketAktifId = paketId;
        tahapAktif = tahap;
        isPaused = false;

        await prisma.soal.updateMany({
            where: { status: 'aktif', paketSoalId: parseInt(paketId) },
            data: { status: 'selesai' }
        });

        const poolSoal = await prisma.soal.findMany({
            where: {
                paketSoalId: parseInt(paketId),
                status: 'belum',
                isUjiCoba: tahap === 'uji_coba'
            },
            select: { id: true, isUjiCoba: true }
        });

        if (poolSoal.length === 0) {
            console.log(`[GAME] Soal tahap '${tahap}' pada Paket ID ${paketId} sudah habis.`);
            faseAktif = 'selesai';

            soalAktifId = null;
            sisaWaktu = 0;

            io.emit('kualifikasi_selesai', {
                tahap,
                message: tahap === 'uji_coba'
                    ? "Seluruh soal uji coba telah dijawab! Admin bisa menutup sesi uji coba (Selesai)."
                    : "Seluruh soal telah selesai! Menunggu proses Cut-off dari Admin."
            });
            return null;
        }

        const randomIndex = Math.floor(Math.random() * poolSoal.length);
        const soalTerpilih = poolSoal[randomIndex];

        const soalAktif = await prisma.soal.update({
            where: { id: soalTerpilih.id },
            data: { status: 'aktif', waktuMulai: new Date() }
        });

        soalAktifId = soalAktif.id;
        sisaWaktu = DURASI;
        faseAktif = 'soal';

        io.emit('game_mulai', { soalId: soalAktifId, sisaWaktu, faseAktif, isUjiCoba: soalAktif.isUjiCoba, tahap });
        console.log(`[GAME] Menjalankan Soal (${tahap}) ID: ${soalAktifId} | Sisa Soal: ${poolSoal.length} | Durasi: ${DURASI} detik`);

        jalankanTimer(io);

        return soalAktif;

    } catch (error) {
        console.error("[ERROR SIKLUS GAME]:", error);
        throw error;
    }
};

/**
 * Menutup tahap Uji Coba: wajib semua soal isUjiCoba=true sudah 'selesai'.
 * Reset poin seluruh tim di sesi ini ke 0, reset game state, lalu suruh
 * SEMUA client (peserta, LED, admin) balik ke halaman awal.
 */
export const selesaiUjiCoba = async (io, paketId) => {
    const paket = await prisma.paketSoal.findUnique({ where: { id: parseInt(paketId) } });
    if (!paket) {
        throw new Error("Paket soal tidak ditemukan!");
    }

    const sisaSoalUjiCoba = await prisma.soal.count({
        where: {
            paketSoalId: parseInt(paketId),
            isUjiCoba: true,
            status: { not: 'selesai' }
        }
    });

    if (sisaSoalUjiCoba > 0) {
        throw new Error(`Masih ada ${sisaSoalUjiCoba} soal uji coba yang belum selesai dijawab.`);
    }

    await prisma.tim.updateMany({
        where: { sesi: paket.sesi, role: 'peserta' },
        data: { totalPoin: 0 }
    });

    await prisma.paketSoal.update({
        where: { id: parseInt(paketId) },
        data: { statusUjiCoba: 'selesai' }
    });

    resetGameState();

    io.emit('uji_coba_selesai', {
        paketId: parseInt(paketId),
        message: "Sesi Uji Coba telah selesai! Poin direset ke 0. Semua diarahkan ke halaman awal."
    });

    console.log(`[GAME] Uji Coba Paket ${paketId} ditutup oleh Admin. Poin Sesi ${paket.sesi} direset ke 0.`);
};

export const pauseKualifikasi = (io) => {
    if (faseAktif !== 'soal') {
        throw new Error("Tidak ada soal yang sedang berjalan untuk dipause.");
    }
    if (isPaused) {
        throw new Error("Sesi sudah dalam kondisi pause.");
    }

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    isPaused = true;
    console.log(`[GAME] Sesi dipause pada sisa waktu ${sisaWaktu} detik (Soal ID: ${soalAktifId}).`);

    io.emit('sesi_dipause', { soalId: soalAktifId, sisaWaktu, isPaused: true });

    return { sisaWaktu, soalAktifId, faseAktif };
};

export const resumeKualifikasi = (io) => {
    if (!isPaused) {
        throw new Error("Sesi tidak sedang dalam kondisi pause.");
    }
    if (sisaWaktu <= 0) {
        throw new Error("Waktu sudah habis, tidak bisa dilanjutkan. Gunakan 'Soal Berikutnya'.");
    }

    isPaused = false;
    console.log(`[GAME] Sesi dilanjutkan dari sisa waktu ${sisaWaktu} detik (Soal ID: ${soalAktifId}).`);

    io.emit('sesi_dilanjutkan', { soalId: soalAktifId, sisaWaktu, isPaused: false });

    jalankanTimer(io);

    return { sisaWaktu, soalAktifId, faseAktif };
};

export const lanjutSoalBerikutnya = async (io) => {
    if (!paketAktifId || !tahapAktif) {
        throw new Error("Tidak ada sesi (uji coba/soal real) yang sedang berjalan saat ini.");
    }

    if (isPaused) {
        throw new Error("Sesi sedang dipause. Lanjutkan (resume) dulu sebelum pindah ke soal berikutnya.");
    }

    if (faseAktif === 'soal') {
        const paket = await prisma.paketSoal.findUnique({
            where: { id: parseInt(paketAktifId) }
        });

        const totalJawabanMasuk = await prisma.riwayatJawaban.count({
            where: { soalId: soalAktifId }
        });

        const totalPesertaSeharusnya = await prisma.tim.count({
            where: { role: 'peserta', sesi: paket.sesi }
        });

        if (totalJawabanMasuk === 0 || totalJawabanMasuk < totalPesertaSeharusnya) {
            throw new Error(`Waktu masih jalan! Baru ${totalJawabanMasuk} dari ${totalPesertaSeharusnya} tim aktif yang sudah menjawab.`);
        }

        if (timerInterval) clearInterval(timerInterval);
        console.log(`[GAME] Semua ${totalPesertaSeharusnya} tim telah menjawab. Langsung beralih ke soal berikutnya.`);
    }

    return await mulaiTahap(io, paketAktifId, tahapAktif);
};

export const getGameState = () => {
    return {
        sisaWaktu,
        soalAktifId,
        paketAktifId,
        faseAktif,
        isPaused,
        tahapAktif
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
    isPaused = false;
    tahapAktif = null;
};