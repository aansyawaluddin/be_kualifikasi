import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper untuk menyusun objek soal Pilihan Ganda secara rapi
const p = (paket, kat, tanya, opsi, jwb) => ({
    paketSoalId: paket,
    kategori: kat,
    tipe: 'pilihan_ganda',
    pertanyaan: tanya,
    opsiJawaban: JSON.stringify(opsi),
    jawabanBenar: jwb
});

async function main() {
    console.log('📚 Memulai seeding 3 Paket Sesi dan 90 Soal Kualifikasi Tahun 2026...');

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

    // ==========================================
    // DATA SOAL SESI 1 (Diekstrak dari Dokumen)
    // ==========================================
    const soalSesi1Data = [
        // BAHASA INDONESIA
        { kat: 'bahasa_indonesia', tanya: 'Film ini bercerita tentang seorang anak yang terpisah dari keluarganya dan harus berjuang hidup sendiri di Tengah kota besar. Petualangan dan pertemuan dengan orang-orang baru mengubah cara pandangnya terhadap hidup. Kutipan tersebut merupakan bagian struktur teks resensi, yaitu...', opsi: ['A. pendahuluan', 'B. keunggulan', 'C. sinopsis', 'D. kelemahan', 'E. penutup'], jwb: 'C' },
        { kat: 'bahasa_indonesia', tanya: 'Polusi udara di kota-kota besar makin mengkhawatirkan. Banyak kendaraan bermotor yang mengeluarkan asap tebal dan mencemari lingkungan. Selain itu, asap dari pabrik-pabrik juga ikut menyumbang buruknya kualitas udara. Akibatnya, banyak masyarakat yang terserang penyakit saluran pernapasan. Berdasarkan letak kalimat utamanya, teks tersebut termasuk jenis paragraf...', opsi: ['A. deduktif', 'B. induktif', 'C. ineratif', 'D. naratif', 'E. campuran'], jwb: 'A' },
        { kat: 'bahasa_indonesia', tanya: 'Sementara itu, warga tetap beraktivitas dan kegiatan dengan menggunakan masker. Perbaikan kalimat yang tepat untuk kalimat tersebut adalah...', opsi: ['A. Sementara itu, warga tetap beraktivitas dan giat dengan menggunakan masker.', 'B. Sementara itu, warga tetap beraktivitas dan berkegiatan dengan menggunakan masker.', 'C. Sementara itu, warga tetap aktivitas dan berkegiatan dengan menggunakan masker.', 'D. Sementara itu, warga tetap aktivitas dan digiatkan dengan menggubakan masker.', 'E. Sementara itu, wara tetap beraktivitas dan menggiati dengan menggunakan masker.'], jwb: 'B' },

        // BAHASA INGGRIS
        { kat: 'bahasa_inggris', tanya: 'Which sentence best shows disagreement?', opsi: ['A. I totally agree with you', 'B. That’s a good idea', 'C. I’m not sure I agree with that', 'D. Exactly!', 'E. I couldn’t agree more'], jwb: 'C' },
        { kat: 'bahasa_inggris', tanya: 'Which sentence is passive voice?', opsi: ['A. The teacher explains the lesson', 'B. The lesson explains the teacher', 'C. The lesson is explained by the teacher', 'D. The teacher is explaining the lesson', 'E. The teacher has explained the lesson'], jwb: 'C' },
        { kat: 'bahasa_inggris', tanya: '“If I had more time, I would join the competition.” This sentence is…', opsi: ['A. Conditional type 0', 'B. Conditional type 1', 'C. Conditional type 2', 'D. Conditional type 3', 'E. Future continuous'], jwb: 'C' },

        // MATEMATIKA
        { kat: 'matematika', tanya: 'Di bukit yang sejuk terdapat 600 peternak domba dan sapi. Ada 400 yang beternak domba dan 300 beternak sapi. Jika A adalah jumlah minimum peternak kedua hewan tersebut dan B adalah jumlah maksimum peternak keduanya, maka B − A adalah . . .', opsi: ['A. 350', 'B. 300', 'C. 280', 'D. 200', 'E. 150'], jwb: 'D' },
        { kat: 'matematika', tanya: 'Antara tahun 1497 dan 1500 Amerigo Vespucci melakukan dua kali perjalanan ke ‘Dunia Baru’. Perjalanan pertama memakan waktu 43 hari lebih lama daripada perjalanan kedua. Dan kedua perjalanan jika digabungkan memakan waktu 1003 hari. Berapa hari total perjalanan yang kedua?', opsi: ['A. 460', 'B. 480', 'C. 960', 'D. 520', 'E. 540'], jwb: 'B' },
        { kat: 'matematika', tanya: 'Sebuah silinder A memiliki volume 22 cm3. Berapakah volume silinder lain yang memiliki jari-jari 2 kalinya silinder A, dan tingginya setengah silinder A? (dalam satuan cm3).', opsi: ['A. 11', 'B. 22', 'C. 44', 'D. 66', 'E. 77'], jwb: 'C' },

        // FISIKA (Masuk I.P.A / Kategori Terkait)
        { kat: 'ilmu_pengetahuan_alam', tanya: 'Dalam sebuah bejana yang massanya dapat diabaikan terdapat a gram 42°C. dicampur dengan b gram es -4°C. ternyata setelah diaduk 50% es melebur. Jika titik lebur es 0°C, kalor jenis es 0,5 kal/gr°C, kalor lebur es 80 kal/gr, maka perbandingan antara a dan b adalah ….', opsi: ['A. 1 : 4', 'B. 1 : 2', 'C. 1 : 1', 'D. 2 : 1', 'E. 4 : 1'], jwb: 'C' },
        { kat: 'ilmu_pengetahuan_alam', tanya: 'Pada sebuah system peredaran darah hewan, jari-jari pembuluh nadinya adalah 1,2 cm. Darah mengalir dari pembuluh nadi dengan kelajuan 0,40 m/s menuju ke semua pembuluh kapiler yang ada dengan kelajuan rata-rata 0,5 mm/s dan jari-jari pembuluh kapiler 8 x 10-4 cm. Jumlah pembuluh kapiler adalah … miliar.', opsi: ['A. 2,1', 'B. 1,8', 'C. 1,5', 'D. 1,2', 'E. 0,9'], jwb: 'B' },
        { kat: 'ilmu_pengetahuan_alam', tanya: 'Sebuah beban bermassa m yang diikatkan pada ujung kanan sebuah pegas dengan konstanta pegas k diletakkan pada lantai datar dengan ujung pegas sebelah kiri terikat pada dinding. Beban ditarik ke kanan sampai ke titik A yang berjarak a dari titik setimbang dan kemudian dilepaskan sehingga berosilasi. Setelah dilepas, beban bergerak ke kiri, melewati titik setimbang O dan berhenti sesaat di titik B sebelah kiri titik setimbang. Apabila lantai licin sempurna serta M dan K berturut-turut adalah energi mekanik dan energi kinetic system, maka…', opsi: ['A. K di O kurang dari K di B', 'B. K di O sama dengan K di B', 'C. K di O kurang dari M di A', 'D. K di O sama dengan M di A', 'E. K di O lebih dari M di A'], jwb: 'D' },

        // BIOLOGI
        { kat: 'ilmu_pengetahuan_alam', tanya: 'Perhatikan Gambar diatas\nKarbon sangat dibutuhkan oleh makhluk hidup dalam proses metabolisme dan penyusunan senyawa organik. Keberadaan karbon di alam berlangsung melalui siklus karbon yang terjadi secara terus-menerus.\n\nProses yang terjadi pada bagian X adalah ….', opsi: ['A. Fotosintesis', 'B. respirasi', 'C. asimilasi', 'D. evaporasi', 'E. transpirasi'], jwb: 'B' },
        { kat: 'ilmu_pengetahuan_alam', tanya: 'Seorang siswa meneliti kualitas air di sebuah kanal perkotaan. Ia memperoleh data seperti diatas.\nBerdasarkan data tersebut, kesimpulan yang paling tepat adalah…', opsi: ['A. kualitas air meningkat karena BOD tinggi', 'B. terjadi pencemaran bahan organik yang meningkatkan aktivitas mikroorganisme', 'C. kadar oksigen meningkat akibat penguraian bahan organik', 'D. perairan menjadi lebih layak untuk organisme air', 'E. tidak ada hubungan antara DO dan BOD'], jwb: 'B' },
        { kat: 'ilmu_pengetahuan_alam', tanya: 'Perhatikan gambar diatas.\nKetika sel sperma berhasil menembus zona pelusida maka akan terjadi fertilisasi yang akan dilanjutkan dengan perkembangan embrio. Fertilisasi dan perkembangan embrio terjadi pada bagian…', opsi: ['A. N dan L', 'B. L dan M', 'C. M dan N', 'D. L dan P', 'E. N dan O'], jwb: 'A' },

        // KIMIA
        { kat: 'ilmu_pengetahuan_alam', tanya: 'Dalam analisis air limbah industri, seorang ahli kimia menemukan ion oksigen dengan karakteristik khusus. Ion ini memiliki nomor atom 8, nomor massa 17 dan bermuatan -2. Berdasarkan data tersebut, spesi ion O2- mengandung jumlah proton dan elektron secara berturut-turut….', opsi: ['A. 8 proton dan 8 elektron', 'B. 8 proton dan 10 elektron', 'C. 10 proton dan 8 elektron', 'D. 9 proton dan 8 elektron', 'E. 6 proton dan 10 elektron'], jwb: 'B' },
        { kat: 'ilmu_pengetahuan_alam', tanya: 'Unsur X dengan konfigurasi elektron: 1s2 2s2 2p6 3s2 bereaksi dengan unsur Y : 1s2 2s2 2p4 membentuk senyawa….', opsi: ['A. XY', 'B. XY2', 'C. X2Y', 'D. X3Y', 'E. X2Y3'], jwb: 'A' },
        { kat: 'ilmu_pengetahuan_alam', tanya: 'Dalam industri pemanas ruangan, gas propana (C3H8) digunakan sebagai bahan bakar. Persamaan reaksinya sebagai berikut.\nC3H8(g) + O2(g) -> CO2(g) + H2O(g) (belum setara)\nJika terdapat 5 L gas propana, volume gas oksigen yang dibutuhkan untuk pembakaran sempurna gas propana adalah….(semua volume diukur pada kondisi yang sama)', opsi: ['A. 5 L', 'B. 10 L', 'C. 15 L', 'D. 20 L', 'E. 25 L'], jwb: 'E' },

        // PENALARAN UMUM
        { kat: 'penalaran_umum', tanya: 'Badak Jawa (Rhinoceros sondaicus) adalah spesies badak yang paling langka diantara lima spesies badak yang ada di dunia. Makin langka suatu hewan, makin besar upaya yang harus dilakukan manusia untuk mencegahnya dari kepunahan. Berdasarkan pernyataan tersebut, manakah yang paling mungkin menjadi akibat dari tingkat kelangkaan Badak Jawa?', opsi: ['A. Badak Jawa menjadi objek wisata yang paling dicari.', 'B. Badak Jawa sulit dikembangbiakkan secara alamiah.', 'C. Badak Jawa sulit ditemukan di hutan yang tidak dikelola manusia.', 'D. Badak Jawa sering menjadi sasaran objek penelitian.', 'E. Badak Jawa membutuhkan biaya konservasi yang besar.'], jwb: 'E' },
        { kat: 'penalaran_umum', tanya: 'Jumlah penjualan mie ayam di sebuah warung makan pada enam hari terakhir adalah 5, 3, 8, 11, 19, dan 30 porsi. Sementara itu, jumlah bakso yang terjual pada enam hari yang sama adalah 4, 6, 10, 16, 26, dan 42 porsi. Jika tren pembelian tersebut bersifat konstan, berapa jumlah porsi mie ayam dan bakso yang terjual pada hari ketujuh?', opsi: ['A. 28 dan 50', 'B. 46 dan 68', 'C. 49 dan 50', 'D. 28 dan 70', 'E. 49 dan 68'], jwb: 'E' },
        { kat: 'penalaran_umum', tanya: 'Syarat untuk mendapatkan posisi sebagai asisten dosen adalah memiliki gelar sarjana, pengalaman mengikuti matakuliah secara baik, dan referensi dari para dosen pengampu. Calon asisten X memiliki gelar sarjana dan referensi yang kuat. Simpulan dari informasi tersebut adalah calon X akan diterima sebagai asisten dosen. Manakah pernyataan berikut yang menggambarkan kualitas simpulan tersebut?', opsi: ['A. Simpulan tersebut pasti benar.', 'B. Simpulan tersebut mungkin benar.', 'C. Simpulan tersebut pasti salah.', 'D. Simpulan tidak dapat dinilai karena informasi tidak cukup.', 'E. Simpulan tidak relevan dengan informasi yang diberikan.'], jwb: 'B' },

        // PENGETAHUAN KUANTITATIF
        { kat: 'pengetahuan_kuantitatif', tanya: 'Jika 0°<α<90° dan tan(α)=1/3 , di antara pilihan berikut yang benar adalah ...\n(1) cos(α) = 1/3\n(2) sin(α) = 3/√10\n(3) cos(α) < tan(α)\n(4) tan(90°-α) = 3', opsi: ['A. (1), (2), dan (3) saja', 'B. (1) dan (3) saja', 'C. (2) dan (4) saja', 'D. (1), (2), (3) dan (4)', 'E. (4) saja'], jwb: 'E' },
        { kat: 'pengetahuan_kuantitatif', tanya: 'Tabel diatas menyatakan hasil operasi untuk simbol ⊛ dan ⊝.\nOperasi ⊕ didefinisikan dengan a⊕b = 2⊛(a⊝b). Untuk semua a,b ∈ {0, 1, 2, 3}. Nilai dari 0⊕2 adalah...', opsi: ['A. 0', 'B. 1', 'C. 2', 'D. 3', 'E. 4'], jwb: 'B' },
        { kat: 'pengetahuan_kuantitatif', tanya: 'Perhatikan algoritma yang disajikan pada diagram diatas.\nKeterangan : Bilangan asli m dan n memenuhi kedua pernyataan berikut:\nInput x = 3 menghasilkan z = 12.\nInput x = 4 menghasilkan z = 18.\nNilai m adalah...', opsi: ['A. 1', 'B. 2', 'C. 3', 'D. 4', 'E. 5'], jwb: 'B' },

        // PENDIDIKAN KEWARGANEGARAAN
        { kat: 'pendidikan_kewarganegaraan', tanya: 'Makna dari semboyan Bhinneka Tunggal Ika adalah Berbeda-beda tetapi tetap satu jua, yang memiliki fungsi utama bagi bangsa Indonesia sebagai . . .', opsi: ['A. simbol kekayaan budaya', 'B. alat untuk menyeragamkan budaya', 'C. landasan hukum yang berlaku', 'D. pemersatu keberagaman suku, agama, dan ras', 'E. semboyan keberagaman partai politik'], jwb: 'D' },

        // GEOGRAFI
        { kat: 'geografi', tanya: 'Letusan gunung Merapi mengeluarkan material vulkanik yang bermanfaat bagi kesuburan tanah sehingga penduduk di desa Cangkringan sekitar gunung Merapi, enggan dipindahkan dari areal yang berbahaya. Prinsip geografi yang berkaitan dengan hal tersebut adalah ....', opsi: ['A. prinsip persebaran', 'B. prinsip deskripsi', 'C. prinsip distribusi', 'D. prinsip korologi', 'E. prinsip interelasi'], jwb: 'E' },

        // SEJARAH
        { kat: 'sejarah', tanya: 'Perhatikan nama-nama suku di bawah ini :\n1) Suku Nias\n2) Suku Toraja\n3) Suku Jawa\n4) Suku Dayak\n5) Suku Baduy\nDari nama suku di atas yang merupakan bangsa Proto Melayu adalah nomor…', opsi: ['A. 1, 4, dan 5', 'B. 1, 3, dan 4', 'C. 1, 2, dan 4', 'D. 3, 4, dan 5', 'E. 2, 3, dan 5'], jwb: 'C' },

        // SOSIOLOGI
        { kat: 'sosiologi', tanya: 'Perhatikan sikap dan tindakan berikut!\n1) Mengembangkan sikap intoleransi antar individu\n2) Mengedepankan sikap saling tolong menolong\n3) Mengabaikan nilai dan norma sosial yang berlaku\n4) Menjadi media penyatu pola pikir dan tujuan yang berbeda\n5) Menyelesaikan permasalahan melalui musyawarah mufakat\nHubungan sosial yang positif ditunjukkan oleh nomor ….', opsi: ['A. 1, 2 dan 3', 'B. 1, 2 dan 4', 'C. 2, 3 dan 4', 'D. 2, 4 dan 5', 'E. 3, 4 dan 5'], jwb: 'D' },

        // EKONOMI
        { kat: 'ekonomi', tanya: 'Pernyataan berikut merupakan kelebihan sistem ekonomi.\n1) Produk yang dihasilkan lebih berkualitas.\n2) Perekonomian relatf stabil dan jarang terjadi krisis ekonomi.\n3) Fakir miskin dan anak terlantar dipelihara oleh negara.\n4) Mengutamakan kepentingan bersama daripada kepentingan individu.\n5) Daya inisiatif, kreasi, dan persaingan individu bisa berkembang.\nYang merupakan kelebihan sistem demokrasi ekonomi ditunjukkan oleh angka ….', opsi: ['A. 1), 2), dan 3)', 'B. 1), 3), dan 4)', 'C. 1), 4), dan 5)', 'D. 2), 3), dan 4)', 'E. 3), 4), dan 5)'], jwb: 'E' },

        // AGAMA
        { kat: 'pendidikan_agama', tanya: 'Al-Quran sebagai pedoman hidup umat manusia, mengajarkan agar manusia menjaga kedamaian dan tolong menolong di dalam menjalani kehidupan. Walaupun hidup dalam perbedaan tetapi harus tetap saling menghormati. Perilaku yang tidak mencerminkan beriman kepada ajaran al-Quran di lingkungan sekolah adalah….', opsi: ['A. menolong teman yang mengalami kesulitan tanpa memandang agamanya', 'B. menghormati pemeluk agama lain yang melaksanakan ibadah', 'C. bekerja sama antar pemeluk agama di sekolah untuk melakukan bakti sosial', 'D. menghindari bergaul dengan teman yang berlainan agama dengannya', 'E. menghargai semua temannya walaupun berbeda suku'], jwb: 'D' }
    ];

    // ==========================================
    // DATA SOAL SESI 2 (Diekstrak dari Dokumen)
    // ==========================================
    const soalSesi2Data = [
        // BAHASA INDONESIA
        { kat: 'bahasa_indonesia', tanya: 'Meskipun buku ini menarik, tetapi ada beberapa bagian yang terasa terlalu lambat dan berulang-ulang. Hal ini membuat pembaca agak bosan di tengah cerita. Kutipan tersebut merupakan bagian dari struktur teks resensi, yaitu', opsi: ['A. sinopsis', 'B. kelemahan', 'C. keunggulan', 'D. pendahuluan', 'E. penutup'], jwb: 'B' },
        { kat: 'bahasa_indonesia', tanya: 'Banyak masyarakat mengeluhkan sulitnya mendapatkan air bersih. Air tanah yang makin tercemar limbah membuat masyarakat harus membeli air galon untuk keperluan sehari-hari. Tidak hanya itu, sumber air dari sumur pun sudah tidak layak konsumsi. Kondisi ini menunjukkan bahwa masalah air bersih harus segera ditangani oleh pemerintah. Berdasarkan letak kalimat utamanya, teks tersebut termasuk jenis paragraf', opsi: ['A. campuran', 'B. ineratif', 'C. induktif', 'D. deduktif', 'E. deskriptif'], jwb: 'C' },
        { kat: 'bahasa_indonesia', tanya: 'Truk antikabut menyemprotkan udara di terlihat sepanjang jalan. Kalimat tersebut akan sempurna apabila diperbaiki menjadi', opsi: ['A. Truk antikabut udara di terlihat menyemprotkan sepanjang jalan.', 'B. Truk menyemprotkan antikabut udara di terlihat sepanjang jalan.', 'C. Truk antikabut terlihat menyemprotkan udara di sepanjang jalan.', 'D. Truk antikabut terlihat udara menyemprotkan di sepanjang jalan.', 'E. Truk antikabut sepanjang terlihat menyemprotkan udara jalan.'], jwb: 'C' },

        // BAHASA INGGRIS
        { kat: 'bahasa_inggris', tanya: 'Which sentence shows strong agreement?', opsi: ['A. I’m not sure', 'B. I disagree', 'C. That might be true', 'D. I completely agree', 'E. I doubt it'], jwb: 'D' },
        { kat: 'bahasa_inggris', tanya: 'Which is correct passive form?', opsi: ['A. People speak English worldwide', 'B. English is spoken worldwide', 'C. English speaks worldwide', 'D. People are spoken English', 'E. Spoken English worldwide'], jwb: 'B' },
        { kat: 'bahasa_inggris', tanya: '“If she studies hard, she will pass the exam.” This is…', opsi: ['A. Type 0', 'B. Type 1', 'C. Type 2', 'D. Type 3', 'E. Mixed conditional'], jwb: 'B' },

        // MATEMATIKA
        { kat: 'matematika', tanya: 'Rumah di Jalan Veteran dinomori secara urut mulai dari 1 sampai 150. Berapa banyak rumah yang nomornya menggunakan angka 8 sekurang-kurangnya satu kali . . .', opsi: ['A. 14', 'B. 15', 'C. 21', 'D. 24', 'E. 30'], jwb: 'D' },
        { kat: 'matematika', tanya: 'Dalam sebuah komunitas yang beranggota 800 orang, ternyata 400 orang suka membaca dan 620 orang menulis. Jika x adalah jumlah maksimal orang yang suka keduanya dan y adalah jumlah minimal yang suka keduanya, maka x + y = . . .', opsi: ['A. 400', 'B. 530', 'C. 620', 'D. 710', 'E. 890'], jwb: 'C' },
        { kat: 'matematika', tanya: 'Alas sebuah segitiga memiliki panjang b, dan memiliki hubungan dengan tinggi h. Hubungan tersebut memenuhi b = 2h. Manakah ekspresi matematika berikut yang menyatakan luas segitiga dalam bentuk h?', opsi: ['A. 1/2 h^2', 'B. 3/4 h^2', 'C. h^2', 'D. 3/2 h^2', 'E. 2 h^2'], jwb: 'C' },

        // FISIKA
        { kat: 'ilmu_pengetahuan_alam', tanya: 'Ke dalam sebuah bejana yang berisi a gram air 30°C dimasukkan b gram es -2°C. setelah isi bejana diaduk, ternyata semua es melebur. Bila massa bejana diabaikan, kalor jenis es 0,5 kal/gr°C dan kalor lebur es 80 kal/gr, maka besar perbandingan antara a dan b adalah ….', opsi: ['A. 27 : 10', 'B. 8 : 3', 'C. 10 : 27', 'D. 3 : 8', 'E. 1 : 30'], jwb: 'A' },
        { kat: 'ilmu_pengetahuan_alam', tanya: 'Pada pukul 07.00 WITA, sebuah kolam penampungan air berbentuk kubus dengan sisi 1 m akan diisi air dari keadaan kosong melalui kran air yang penampangnya 2 cm2. Jika rata-rata air mengalir dengan kecepatan 5 m/s, maka kolam akan penuh pada pukul ….', opsi: ['A. 07.16', 'B. 07.16 lebih 40 detik', 'C. 07.26', 'D. 07.26 lebih 40 detik', 'E. 07.36'], jwb: 'B' },
        { kat: 'ilmu_pengetahuan_alam', tanya: 'Sebuah beban bermassa m yang diikatkan pada ujung kanan sebuah pegas dengan konstanta pegas k diletakkan pada lantai datar dengan ujung pegas sebelah kiri terikat pada dinding. Beban ditarik ke kanan sampai ke titik A yang berjarak a dari titik setimbang dan kemudian dilepaskan sehingga berosilasi. Setelah dilepas, beban bergerak ke kiri, melewati titik setimbang O dan berhenti sesaat di titik B, di sebelah kiri titik setimbang. Apabila Ep dan Ek berturut-turut adalah energi potensial dan energi kinetic system, serta Ek di O sama dengan Ep di A, pernyataan yang benar adalah ….', opsi: ['A. Jarak titik B ke titik setimbang kurang dari a', 'B. Jarak titik B ke titik setimbang lebih dari a', 'C. Energi mekanik berkurang', 'D. Lantai licin sempurna', 'E. Lantai kasar'], jwb: 'D' },

        // BIOLOGI
        { kat: 'ilmu_pengetahuan_alam', tanya: 'Perhatikan gambar diatas.\nNitrogen sangat dibutuhkan oleh tanaman dalam pertumbuhannya. Keberadaan Nitrogen melalui proses siklus nitrogen yang terjadi di alam.\nSecara berurutan, proses yang terjadi pada bagian X dan Y adalah aktivitas bakteri dalam proses ….', opsi: ['A. nitrifikasi dan denitrifikasi', 'B. nitrifikasi dan fiksasi nitrogen', 'C. fiksasi nitrogen dan nitrifikasi', 'D. denitrifikasi dan fiksasi nitrogen', 'E. fiksasi nitrogen dan denitrifikasi'], jwb: 'C' },
        { kat: 'ilmu_pengetahuan_alam', tanya: 'Karbon dioksida menyumbang 75% emisi gas rumah kaca sehingga konsentrasi gas rumah kaca dapat meningkat drastis akibat emisi karbon dioksida dan gas-gas rumah kaca yang dihasilkan oleh berbagai aktivitas manusia di muka bumi ini. Selanjutnya secara global, 25% atau seperempat dari seluruh emisi karbon dioksida dunia berasal dari masalah-masalah kehutanan, sedangkan sisanya dihasilkan dari pembakaran bahan bakar fosil, yaitu minyak bumi dan batu bara. Emisi gas CO₂ yang berlebihan di udara menimbulkan peristiwa...', opsi: ['A. lubang ozon', 'B. asfiksi', 'C. global warming', 'D. hujan asam', 'E. eutrofikasi'], jwb: 'C' },
        { kat: 'ilmu_pengetahuan_alam', tanya: 'Perhatikan struktur nefron diatas!\nAbi sedang mempelajari proses pembentukan urin di ginjal. Ia mengamati bahwa pada bagian yang bertanda X terjadi proses penting yang berfungsi mengembalikan zat-zat yang masih dibutuhkan tubuh ke dalam darah. Proses ini sangat penting untuk menjaga keseimbangan cairan dan mencegah kehilangan zat berguna dalam urin. Berdasarkan informasi tersebut, proses yang terjadi pada bagian X adalah …', opsi: ['A. Penyerapan kembali air, glukosa, dan garam', 'B. Penyaringan darah', 'C. Pembentukan urin primer', 'D. Pembentukan senyawa NH₃', 'E. Pembentukan urin sesungguhnya'], jwb: 'A' },

        // KIMIA
        { kat: 'ilmu_pengetahuan_alam', tanya: 'Seorang dokter menjelaskan bahwa atom natrium dalam senyawa garam dapur (NaCl) berbeda dengan atom natrium murni. Dalam garam dapur, natrium berbentuk ion Na+ dengan nomor atom 11 dan nomor massa 23. Ion Na+ ini mengandung jumlah elektron dan neutron secara berturut-turut….', opsi: ['A. 8 elektron dan 10 neutron', 'B. 10 elektron dan 8 neutron', 'C. 10 elektron dan 12 neutron', 'D. 11 elektron dan 12 neutron', 'E. 12 elektron dan 10 neutron'], jwb: 'C' },
        { kat: 'ilmu_pengetahuan_alam', tanya: 'Unsur P dan Q memiliki konfigurasi elektron sebagai berikut.\nP : [Ar] 4s2\nQ : [Ne] 3s2 3p5\nApabila unsur P dan Q membentuk senyawa, rumus senyawa yang terbentuk adalah….', opsi: ['A. PQ', 'B. PQ2', 'C. PQ3', 'D. P2Q', 'E. P3Q'], jwb: 'B' },
        { kat: 'ilmu_pengetahuan_alam', tanya: 'Seorang teknisi kompor gas melakukan uji pembakaran metana (CH4) untuk memastikan efisiensi kompor. Dalam pembakaran sempurna, 5 L gas metana direaksikan dengan oksigen sesuai persamaan reaksi berikut:\nCH4(g) + O2(g) -> CO2(g) + H2O(g) (belum setara)\nVolume gas oksigen yang diperlukan untuk pembakaran sempurna tersebut adalah…. (semua volume diukur pada kondisi yang sama)', opsi: ['A. 5 L', 'B. 8 L', 'C. 10 L', 'D. 12,5 L', 'E. 15 L'], jwb: 'C' },

        // PENALARAN UMUM
        { kat: 'penalaran_umum', tanya: 'Gandum adalah bahan makanan yang paling digemari masyarakat di Negara X. Makin digemari makanan di suatu negara, makin banyak bahan makanan tersebut ditanam. Berdasarkan informasi di atas, manakah pernyataan sebab-akibat berikut yang PALING MUNGKIN BENAR?', opsi: ['A. Gandum sebagai makanan pokok Negara X tidak bisa digantikan makanan lainnya.', 'B. Banyaknya orang menanam gandum dipengaruhi oleh minat masyarakat untuk mengonsumsinya.', 'C. Pemerintah Negara X harus menyediakan bibit gandum untuk kebutuhan pokok masyarakatnya.', 'D. Kegemaran terhadap makanan menjadi bahan pertimbangan industri pertanian di suatu negara.', 'E. Makanan pokok selain gandum cenderung tidak diminati masyarakat di Negara X.'], jwb: 'B' },
        { kat: 'penalaran_umum', tanya: 'Jumlah penjualan laptop pada minggu kedua sampai keenam secara berturut-turut adalah 18, 14, 17, 13, dan 16 unit. Jika jumlah penjualan tersebut bersifat konstan, berapakah laptop yang terjual pada minggu pertama?', opsi: ['A. 11', 'B. 12', 'C. 15', 'D. 21', 'E. 22'], jwb: 'D' },
        { kat: 'penalaran_umum', tanya: 'Tedi menyatakan: Ketika saya pergi memancing beberapa hari yang lalu, setiap ikan yang saya tangkap adalah salmon, dan setiap salmon yang saya lihat saya tangkap. Simpulan dari pengamatan Tedi adalah saat Tedi memancing, dia tidak menangkap ikan apa pun selain salmon. Manakah pernyataan berikut yang menggambarkan kualitas simpulan tersebut?', opsi: ['A. Simpulan tersebut pasti benar', 'B. Simpulan tersebut mungkin benar', 'C. Simpulan tersebut pasti salah', 'D. Simpulan tidak relevan dengan informasi yang diberikan', 'E. Simpulan tidak dapat dinilai karena informasi tidak cukup'], jwb: 'A' },

        // PENGETAHUAN KUANTITATIF
        { kat: 'pengetahuan_kuantitatif', tanya: 'Jika 0°<α<90° dan cos(α)=3/4 , di antara pilihan berikut yang benar adalah . . .\n(1) tan(α) = 4/3\n(2) sin(α-90°) = -3/4\n(3) tan(90°-α) = -3/7\n(4) cos(α-180°) < sin(180°-α)', opsi: ['A. (1), (2), dan (3)', 'B. (1) dan (3)', 'C. (2) dan (4)', 'D. (4)', 'E. (1), (2), (3), dan (4)'], jwb: 'C' },
        { kat: 'pengetahuan_kuantitatif', tanya: 'Operasi ⨂ dan ⊖ pada bilangan didefinisikan sebagai berikut.\na⨂b = (2-(a x b)) / (a+b)\nc⊖d = c + 10/d\nNilai dari 3⊖(4⨂(-1)) adalah... .', opsi: ['A. 7', 'B. 8', 'C. 9', 'D. 10', 'E. 11'], jwb: 'B' },
        { kat: 'pengetahuan_kuantitatif', tanya: 'Perhatikan algoritma yang disajikan pada diagram diatas.\nKeterangan : Bilangan asli m dan n memenuhi kedua pernyataan berikut.\nInput x = 3 menghasilkan z = 12.\nInput x = 4 menghasilkan z = 18.\nNilai n adalah ...', opsi: ['A. 1', 'B. 2', 'C. 3', 'D. 4', 'E. 5'], jwb: 'B' },

        // PENDIDIKAN KEWARGANEGARAAN
        { kat: 'pendidikan_kewarganegaraan', tanya: 'Apabila presiden dan wakil presiden tidak dapat menjalankan kewajiban dalam masa jabatannya secara bersamaan, maka pelaksanaan tugas kepresidenan adalah.....', opsi: ['A. menteri luar negeri, menteri dalam negeri, dan menteri pertahanan', 'B. menteri luar negeri, menteri pertahanan, dan menteri sekretariat negara', 'C. menteri dalam negeri, menteri hukum dan HAM, serta menteri luar negeri', 'D. menteri pertahanan, menteri hukum dan ham, serta menteri sekretariatan negara', 'E. menteri dalam negeri, menteri pertahanan, serta menteri koordinator politik dan keamanan'], jwb: 'A' },

        // GEOGRAFI
        { kat: 'geografi', tanya: 'Kerak bumi merupakan bagian yang paling luar, bersifat keras karena tersusun atas berbagai macam batuan. Jika mengalami pelapukan lebih lanjut, batuan tersebut membentuk lapisan tanah yang di dalamnya terdapat berbagai mineral dan unsur hara. Unsur-unsur tersebut dalam geografi termasuk komponen . . .', opsi: ['A. atmosfer', 'B. litosfer', 'C. hidrosfer', 'D. biosfer', 'E. antroposfer'], jwb: 'B' },

        // SEJARAH
        { kat: 'sejarah', tanya: 'Perhatikan data berikut!\n1) Kejayaan masa lalu\n2) Penderitaan dan kesengsaraan akibat imperialisme\n3) Munculnya golongan terpelajar\n4) Kemenangan Jepang atas Rusia (1905)\n5) Gerakan nasionalisme bangsa Asia-Afrika\nFaktor intern yang menyebabkan lahir dan berkembangnya nasionalisme Indonesia ditunjukkan oleh nomor …', opsi: ['A. 1, 2, 3', 'B. 1, 3, 5', 'C. 2, 3, 4', 'D. 2, 4, 5', 'E. 3, 4, 5'], jwb: 'A' },

        // SOSIOLOGI
        { kat: 'sosiologi', tanya: 'Perhatikan peristiwa-peristiwa berikut:\n1) Rudi membaca buku di depan rumah\n2) Ayah berbincang-bincang dengan tamunya\n3) Ibu berangkat bekerja ke kantor naik sepeda motor\n4) Kakak mengajak adik mengerjakan pekerjaan rumah\n5) Ayah dan ibu mencuci pakaian bersama-sama di belakang rumah\nPeristiwa yang menunjukkan terjadinya interaksi sosial secara langsung adalah ….', opsi: ['A. 1, 2 dan 3', 'B. 1, 2 dan 4', 'C. 2, 3 dan 4', 'D. 2, 4 dan 5', 'E. 3, 4 dan 5'], jwb: 'D' },

        // EKONOMI
        { kat: 'ekonomi', tanya: 'Perhatikan perilaku produsen dan perilaku konsumen berikut!\n1) Ani lebih senang menggunakan tinta biru daripada hitam ketika menulis surat.\n2) Walaupun keuntungan dari tiap unit barang yang dijual kecil, Pak Alex tetap menekuni usahanya.\n3) Agar sehat sepanjang hari, Bu Laila selalu berolahraga setiap pagi di rumah.\n4) Untuk meringankan beban orang tua, Irfan membawa kue ke sekolah untuk dijual.\n5) Sebagian besar pedagang di pasar malam menawarkan barang dengan harga murah.\nDari pernyataan di atas yang termasuk perilaku produsen adalah nomor ….', opsi: ['A. 1), 2), dan 3)', 'B. 1), 3), dan 5)', 'C. 2), 3), dan 4)', 'D. 2), 4), dan 5)', 'E. 3), 4), dan 5)'], jwb: 'D' },

        // AGAMA
        { kat: 'pendidikan_agama', tanya: 'Hal yang sebaiknya dilakukan ketika menghadapi perbedaan agama di tengah masyarakat adalah …', opsi: ['A. Menyebarkan pandangan yang bertentangan untuk memperbaiki orang lain', 'B. Memaksakan orang lain untuk mengikuti keyakinan kita', 'C. Menghargai dan menghormati keyakinan orang lain', 'D. Mengabaikan keberagaman agama dalam kehidupan sehari-hari', 'E. Membentuk kelompok yang hanya terdiri dari satu agama'], jwb: 'C' }
    ];

    // Petakan data ke dalam objek Prisma untuk masing-masing sesi utama
    const soalSesi1 = soalSesi1Data.map(s => p(1, s.kat, s.tanya, s.opsi, s.jwb));
    const soalSesi2 = soalSesi2Data.map(s => p(2, s.kat, s.tanya, s.opsi, s.jwb));

    // ==========================================
    // DATA SOAL SESI 3 (Cross-Slice Campuran)
    // ==========================================
    // Skrip di bawah ini melakukan looping untuk menghasilkan 30 soal campuran
    // dengan pola selang-seling genap-ganjil antara array sesi 1 dan sesi 2.
    // Hal ini menjamin bahwa bobot kategori per sub-test 100% identik dengan sesi aslinya.
    const soalSesi3 = [];
    for (let i = 0; i < 30; i++) {
        if (i % 2 === 0) {
            soalSesi3.push({ ...soalSesi1[i], paketSoalId: 3 });
        } else {
            soalSesi3.push({ ...soalSesi2[i], paketSoalId: 3 });
        }
    }

    // Gabungkan keseluruhan soal
    const soalKualifikasi = [...soalSesi1, ...soalSesi2, ...soalSesi3];

    // Bersihkan data lama demi menghindari duplikasi
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