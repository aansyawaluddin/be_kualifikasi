import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const p = (paket, kat, tanya, opsi, jwb) => ({ paketSoalId: paket, kategori: kat, tipe: 'pilihan_ganda', pertanyaan: tanya, opsiJawaban: JSON.stringify(opsi), jawabanBenar: jwb });
const e = (paket, kat, tanya, jwb) => ({ paketSoalId: paket, kategori: kat, tipe: 'esai', pertanyaan: tanya, opsiJawaban: null, jawabanBenar: jwb });

async function main() {
    console.log('📚 Memulai seeding 3 Paket Sesi dan 90 Soal Kualifikasi...');

    const paketData = [
        { id: 1, nama: 'Sesi 1 Kualifikasi', sesi: 1 },
        { id: 2, nama: 'Sesi 2 Kualifikasi', sesi: 2 },
        { id: 3, nama: 'Sesi 3 Kualifikasi', sesi: 3 },
    ];

    for (const pkt of paketData) {
        await prisma.paketSoal.upsert({
            where: { id: pkt.id },
            update: {},
            create: pkt,
        });
    }

    // 1. Buat 30 Soal Utama (Ditugaskan ke Sesi 1 dulu)
    const soalSesi1 = [
        // ==========================================
        // BAHASA INDONESIA
        // ==========================================
        p(1, "bahasa_indonesia", "Perhatikan paragraf berikut!\n“Pagi itu udara terasa sangat sejuk. Burung-burung berkicau merdu di pepohonan, sementara matahari mulai menampakkan sinarnya.”\nJenis teks pada paragraf tersebut adalah …", ["A. Narasi", "B. Deskripsi", "C. Eksposisi", "D. Argumentasi"], "B"),
        p(1, "bahasa_indonesia", "Struktur teks eksposisi yang benar adalah …", ["A. Orientasi – Komplikasi – Resolusi", "B. Pernyataan umum – Deretan penjelas – Penutup", "C. Tesis – Argumentasi – Penegasan ulang", "D. Abstrak – Orientasi – Koda"], "C"),
        p(1, "bahasa_indonesia", "Ide pokok paragraf biasanya terdapat pada …", ["A. Semua kalimat", "B. Kalimat penjelas", "C. Kalimat utama", "D. Kalimat terakhir saja"], "C"),

        // ==========================================
        // BAHASA INGGRIS
        // ==========================================
        p(1, "bahasa_inggris", "Choose the correct greeting expression!", ["A. Goodbye, see you tomorrow", "B. Good morning, how are you?", "C. I am fine, thank you", "D. See you later"], "B"),
        p(1, "bahasa_inggris", "Complete the sentence:\n“She ____ to school every day.”", ["A. go", "B. goes", "C. going", "D. gone"], "B"),
        p(1, "bahasa_inggris", "Arrange the words into a correct sentence:\n“is / my / this / book”", ["A. My is this book", "B. This my is book", "C. This is my book", "D. Is this my book"], "C"),

        // ==========================================
        // MATEMATIKA
        // ==========================================
        p(1, "matematika", "Di sebuah parkiran terdapat 18 kendaraan yang terdiri dari motor dan mobil. Jumlah seluruh roda kendaraan tersebut adalah 54 buah. Banyak mobil adalah …", ["A. 6", "B. 7", "C. 8", "D. 9", "E. 10"], "D"),
        p(1, "matematika", "Sebuah bakteri membelah diri menjadi 2 setiap 1 jam. Jika awalnya ada 3 bakteri, maka jumlah bakteri setelah 3 jam adalah …", ["A. 12", "B. 16", "C. 20", "D. 24", "E. 32"], "D"),
        p(1, "matematika", "Seorang siswa menabung Rp2.000 di minggu pertama, Rp4.000 di minggu kedua, Rp6.000 di minggu ketiga, dan seterusnya. Jumlah tabungan pada minggu ke-5 adalah …", ["A. Rp8.000", "B. Rp10.000", "C. Rp12.000", "D. Rp14.000", "E. Rp16.000"], "B"),

        // ==========================================
        // FISIKA (Masuk kategori Ilmu Pengetahuan Alam)
        // ==========================================
        p(1, "ilmu_pengetahuan_alam", "Bayangan yang dibentuk lensa cembung bersifat nyata dan terbalik jika benda berada …", ["A. Di antara fokus dan lensa", "B. Tepat di fokus", "C. Di luar fokus", "D. Sangat dekat lensa"], "C"),
        p(1, "ilmu_pengetahuan_alam", "Sebuah benda bergerak dengan percepatan tetap 2 m/s² dari keadaan diam. Setelah 5 detik, kecepatannya adalah …", ["A. 5 m/s", "B. 10 m/s", "C. 15 m/s", "D. 20 m/s"], "B"),
        p(1, "ilmu_pengetahuan_alam", "Alat ukur yang paling tepat digunakan untuk mengukur diameter luar sebuah pipa kecil adalah", ["A. Mistar", "B. Meteran", "C. Jangka sorong", "D. Neraca"], "C"),

        // ==========================================
        // KIMIA (Masuk kategori Ilmu Pengetahuan Alam)
        // ==========================================
        p(1, "ilmu_pengetahuan_alam", "Partikel yang bermuatan negatif dalam atom adalah …", ["A. Proton", "B. Neutron", "C. Elektron", "D. Inti atom"], "C"),
        p(1, "ilmu_pengetahuan_alam", "Oksidasi adalah proses …", ["A. Penangkapan elektron", "B. Pelepasan elektron", "C. Penambahan neutron", "D. Pengurangan proton"], "B"),
        p(1, "ilmu_pengetahuan_alam", "Hukum yang menyatakan massa zat sebelum dan sesudah reaksi tetap adalah …", ["A. Hukum Avogadro", "B. Hukum Boyle", "C. Hukum Kekekalan Massa", "D. Hukum Dalton"], "C"),

        // ==========================================
        // BIOLOGI (Masuk kategori Ilmu Pengetahuan Alam)
        // ==========================================
        p(1, "ilmu_pengetahuan_alam", "Komponen abiotik utama dalam ekosistem hutan hujan tropis antara lain adalah....", ["A. Hewan, tumbuhan, dan mikroba", "B. Cahaya matahari, air, suhu, dan kelembaban", "C. Pohon, semak, dan rumput", "D. Herbivora dan karnivora"], "B"),
        p(1, "ilmu_pengetahuan_alam", "Hewan yang berperan sebagai dekomposer dalam rantai makanan adalah....", ["A. Singa", "B. Elang", "C. Jamur", "D. Ular"], "C"),
        p(1, "ilmu_pengetahuan_alam", "Dalam sistem peredaran darah manusia, darah dari paru-paru menuju ke atrium kiri melalui...", ["A. Vena pulmonalis", "B. Arteri pulmonalis", "C. Vena kava superior", "D. Vena kava inferior"], "A"),

        // ==========================================
        // PENDIDIKAN KEWARGANEGARAAN
        // ==========================================
        p(1, "pendidikan_kewarganegaraan", "Contoh sikap yang mencerminkan sila kedua Pancasila adalah …", ["A. Mengutamakan musyawarah", "B. Menjaga persatuan", "C. Menghormati hak orang lain", "D. Beribadah sesuai agama", "E. Cinta tanah air"], "C"),

        // ==========================================
        // GEOGRAFI
        // ==========================================
        p(1, "geografi", "Lapisan atmosfer yang paling dekat dengan permukaan bumi adalah …", ["A. Stratosfer", "B. Mesosfer", "C. Troposfer", "D. Termosfer", "E. Eksosfer"], "C"),

        // ==========================================
        // SEJARAH
        // ==========================================
        p(1, "sejarah", "Manusia purba yang ditemukan di Indonesia adalah …", ["A. Homo sapiens", "B. Homo erectus", "C. Homo modern", "D. Homo neanderthalensis", "E. Homo floresiensis"], "B"),

        // ==========================================
        // SOSIOLOGI
        // ==========================================
        p(1, "sosiologi", "Syarat terjadinya interaksi sosial adalah …", ["A. Simpati dan empati", "B. Kontak dan komunikasi", "C. Imitasi dan sugesti", "D. Motivasi dan identifikasi", "E. Kerja sama dan konflik"], "B"),

        // ==========================================
        // EKONOMI
        // ==========================================
        p(1, "ekonomi", "Prinsip ekonomi adalah …", ["A. Mengorbankan banyak untuk hasil sedikit", "B. Mengeluarkan biaya sebesar-besarnya", "C. Mendapatkan hasil maksimal dengan pengorbanan tertentu", "D. Menghindari kegiatan ekonomi", "E. Menggunakan sumber daya tanpa batas"], "C"),

        // ==========================================
        // PENALARAN UMUM
        // ==========================================
        p(1, "penalaran_umum", "2, 5, 10, 17, …", ["A. 20", "B. 24", "C. 26", "D. 28", "E. 30"], "C"),
        p(1, "penalaran_umum", "3, 9, 27, 81, …", ["A. 162", "B. 200", "C. 243", "D. 256", "E. 300"], "C"),
        p(1, "penalaran_umum", "Jika 4 orang dapat menyelesaikan pekerjaan dalam 6 hari, maka 2 orang akan menyelesaikan pekerjaan tersebut dalam …", ["A. 3 hari", "B. 6 hari", "C. 9 hari", "D. 12 hari", "E. 24 hari"], "D"),
        p(1, "penalaran_umum", "Sinonim dari kata “akurat” adalah …", ["A. Salah", "B. Tepat", "C. Lambat", "D. Cepat", "E. Rumit"], "B"),

        // ==========================================
        // PENGETAHUAN KUANTITATIF
        // ==========================================
        p(1, "pengetahuan_kuantitatif", "Dalam sebuah kotak terdapat 5 bola merah dan 5 bola biru. Peluang mengambil bola merah adalah …", ["A. 1/5", "B. 1/4", "C. 1/3", "D. 1/2", "E. 2/3"], "D"),
        p(1, "pengetahuan_kuantitatif", "Jika sekarang pukul 08.30, maka 2 jam 45 menit kemudian adalah …", ["A. 10.45", "B. 11.00", "C. 11.15", "D. 11.30", "E. 11.45"], "C"),
        p(1, "pengetahuan_kuantitatif", "Dalam sebuah kotak terdapat 4 bola merah, 3 bola biru, dan 3 bola hijau. Peluang terambil bola bukan merah adalah …", ["A. 3/10", "B. 4/10", "C. 6/10", "D. 7/10", "E. 8/10"], "C")
    ];

    // 2. Duplikasi otomatis untuk Sesi 2 dan Sesi 3 (Mengubah paketSoalId)
    const soalSesi2 = soalSesi1.map(soal => ({ ...soal, paketSoalId: 2 }));
    const soalSesi3 = soalSesi1.map(soal => ({ ...soal, paketSoalId: 3 }));

    // 3. Gabungkan semuanya menjadi satu array besar (Total 90 Soal)
    const soalKualifikasi = [...soalSesi1, ...soalSesi2, ...soalSesi3];

    await prisma.riwayatJawaban.deleteMany({});
    await prisma.soal.deleteMany({});

    console.log(`⏳ Menyimpan ${soalKualifikasi.length} soal ke database...`);
    await prisma.soal.createMany({
        data: soalKualifikasi
    });

    console.log(`✅ Seeding berhasil! Tepat 30 Soal per Sesi telah disiapkan (Total 90 Soal).`);
}

main()
    .catch((e) => {
        console.error('❌ Terjadi kesalahan saat seeding Soal:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });