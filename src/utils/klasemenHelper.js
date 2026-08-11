export const hitungTotalWaktu = (tim) => {
    let totalWaktuMs = 0;
    (tim.riwayat || []).forEach(r => {
        if (r.soal && r.soal.waktuMulai && r.waktuMenjawab) {
            const durasi = new Date(r.waktuMenjawab).getTime() - new Date(r.soal.waktuMulai).getTime();
            totalWaktuMs += durasi;
        }
    });
    return totalWaktuMs;
};

export const urutkanKlasemen = (daftar) => {
    return [...daftar].sort((a, b) => {
        if (b.totalPoin !== a.totalPoin) return b.totalPoin - a.totalPoin;
        return a.totalWaktu - b.totalWaktu;
    });
};

/**
 * Mengelompokkan daftar tim (yang sudah punya field totalWaktu) menjadi
 * klasemen per wilayah cabang dinas. Satu sesi bisa berisi beberapa wilayah,
 * masing-masing wilayah dapat papan klasemen (dan rank) sendiri-sendiri.
 *
 * @param {Array} daftarTimDenganWaktu - array tim { id, nama, totalPoin, wilayah, totalWaktu, ... }
 * @param {number|null} limitPerWilayah - batasi jumlah tim ditampilkan per wilayah (mis. untuk Top 10 LED)
 * @returns {Object} { [namaWilayah]: [{ rank, ...tim }] }
 */
export const kelompokkanPerWilayah = (daftarTimDenganWaktu, limitPerWilayah = null) => {
    const grup = {};

    daftarTimDenganWaktu.forEach(tim => {
        const wilayah = tim.wilayah || 'Tanpa Wilayah';
        if (!grup[wilayah]) grup[wilayah] = [];
        grup[wilayah].push(tim);
    });

    const hasil = {};
    Object.keys(grup).sort().forEach(wilayah => {
        const sorted = urutkanKlasemen(grup[wilayah]);
        let dengan_rank = sorted.map((tim, index) => ({ rank: index + 1, ...tim }));

        if (limitPerWilayah) {
            dengan_rank = dengan_rank.slice(0, limitPerWilayah);
        }

        hasil[wilayah] = dengan_rank;
    });

    return hasil;
};
