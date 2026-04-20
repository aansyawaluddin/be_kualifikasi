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

    const soalKualifikasi = [

        p(1, "b_indo", "Manakah penulisan gelar akademik yang benar menurut PUEBI?", ["A. Dr. Ir. Budi Santoso, M.T.", "B. Dr, Ir. Budi Santoso, MT.", "C. dr. Ir. Budi Santoso. M.T", "D. Dr. Ir. Budi Santoso M.T."], "A"),
        e(1, "b_indo", "Sebutkan majas yang membandingkan benda mati seolah-olah memiliki sifat seperti manusia!", "Personifikasi"),
        p(1, "b_indo", "Kalimat 'Anak itu rajin belajar sehingga ia mendapat juara kelas' merupakan jenis kalimat majemuk...", ["A. Setara", "B. Bertingkat", "C. Campuran", "D. Rapatan"], "B"),
        e(1, "b_indo", "Apa istilah linguistik untuk dua kata yang memiliki makna berlawanan?", "Antonim"),
        p(1, "b_indo", "Penggunaan tanda koma yang salah terdapat pada kalimat...", ["A. Saya membeli kertas, pena, dan tinta.", "B. Karena sibuk, ia lupa makan.", "C. Dia lupa, akan janjinya sendiri.", "D. Oleh karena itu, kita harus berhati-hati."], "C"),
        e(1, "b_indo", "Siapakah sastrawan Indonesia yang menulis tetralogi Pulau Buru?", "Pramoedya Ananta Toer"),
        p(1, "b_indo", "Kata 'merubah' sering digunakan secara salah. Bentuk kata baku yang benar dari kata dasarnya adalah...", ["A. Berubah", "B. Mengubah", "C. Peubah", "D. Mengrubah"], "B"),
        e(1, "b_indo", "Tuliskan peribahasa yang bermakna 'mendapat keuntungan atau rezeki yang tidak disangka-sangka'.", "Mendapat durian runtuh"),

        p(1, "b_inggris", "If I ___ you, I would accept the job offer.", ["A. am", "B. was", "C. were", "D. had been"], "C"),
        e(1, "b_inggris", "Change to passive voice: 'They are painting the house.'", "The house is being painted by them."),
        p(1, "b_inggris", "The synonym of the word 'ubiquitous' is...", ["A. Rare", "B. Everywhere", "C. Expensive", "D. Hidden"], "B"),
        e(1, "b_inggris", "What is the English idiom that means 'to reveal a secret'?", "Let the cat out of the bag"),
        p(1, "b_inggris", "She has been working here ___ 2015.", ["A. since", "B. for", "C. in", "D. from"], "A"),
        e(1, "b_inggris", "Provide the plural form of the word 'criterion'.", "Criteria"),
        p(1, "b_inggris", "Which of the following sentences uses the correct past perfect tense?", ["A. I had finish my homework before he arrived.", "B. I had finished my homework before he arrived.", "C. I have finished my homework before he arrived.", "D. I was finished my homework before he arrived."], "B"),

        p(1, "mtk", "Jika akar-akar x^2 - 5x + 6 = 0 adalah a dan b, berapakah nilai a + b?", ["A. -5", "B. 5", "C. 6", "D. -6"], "B"),
        e(1, "mtk", "Berapakah turunan pertama dari fungsi f(x) = 4x^3 - 2x^2 + x?", "12x^2 - 4x + 1"),
        p(1, "mtk", "Berapakah nilai dari Limit x mendekati 2 untuk (x^2 - 4)/(x - 2)?", ["A. 0", "B. 2", "C. 4", "D. Tak terhingga"], "C"),
        e(1, "mtk", "Dua buah dadu dilempar bersamaan. Berapakah peluang munculnya jumlah mata dadu 7?", "1/6"),
        p(1, "mtk", "Nilai dari log 1000 + log 100 adalah...", ["A. 5", "B. 6", "C. 500", "D. 10"], "A"),
        e(1, "mtk", "Jika matriks A berordo 2x2 memiliki determinan 0, maka matriks A disebut matriks...", "Singular"),
        p(1, "mtk", "Suku ke-10 dari barisan aritmetika 2, 5, 8, 11... adalah...", ["A. 27", "B. 29", "C. 31", "D. 32"], "B"),
        e(1, "mtk", "Berapakah nilai sin 30 derajat dikali cos 60 derajat?", "1/4"),

        p(1, "ipa", "Organel sel yang berfungsi sebagai tempat respirasi sel dan penghasil energi adalah...", ["A. Ribosom", "B. Nukleus", "C. Mitokondria", "D. Badan Golgi"], "C"),
        e(1, "ipa", "Apa nama hukum fisika yang dirumuskan dengan persamaan F = m.a?", "Hukum II Newton"),
        p(1, "ipa", "Berikut ini yang merupakan contoh perubahan kimia adalah...", ["A. Es mencair", "B. Kayu dibakar", "C. Gula dilarutkan dalam air", "D. Lilin meleleh"], "B"),
        e(1, "ipa", "Sebutkan nama unsur kimia yang memiliki lambang 'Au'!", "Emas"),
        p(1, "ipa", "Hubungan simbiosis antara bunga dan lebah diklasifikasikan sebagai...", ["A. Parasitisme", "B. Komensalisme", "C. Mutualisme", "D. Amensalisme"], "C"),
        e(1, "ipa", "Cahaya merambat paling cepat di medium apa?", "Ruang hampa / Vakum"),
        p(1, "ipa", "Gas yang paling banyak terdapat dalam atmosfer bumi adalah...", ["A. Oksigen", "B. Karbon Dioksida", "C. Nitrogen", "D. Hidrogen"], "C"),


        e(2, "b_indo", "Bentuk kata ulang 'berlari-lari' menyatakan makna...", "Melakukan pekerjaan berulang-ulang / terus-menerus / santai"),
        p(2, "b_indo", "Karangan yang bertujuan memengaruhi pembaca agar melakukan sesuatu disebut...", ["A. Narasi", "B. Deskripsi", "C. Eksposisi", "D. Persuasi"], "D"),
        e(2, "b_indo", "Apa sebutan untuk kata yang memiliki ejaan sama, pelafalan sama, tetapi maknanya berbeda (contoh: bisa)?", "Homomin / Homonim"),
        p(2, "b_indo", "Penulisan tempat dan tanggal surat yang paling tepat adalah...", ["A. Jakarta, 12-Agustus-2023", "B. Jakarta, 12 Agustus 2023", "C. Jakarta; 12 Agustus 2023", "D. Jakarta 12 Agustus 2023"], "B"),
        e(2, "b_indo", "Sinonim dari kata 'Evokatif' adalah...", "Menggugah rasa"),
        p(2, "b_indo", "Gagasan utama biasanya terletak pada kalimat utama. Paragraf yang kalimat utamanya di awal disebut...", ["A. Deduktif", "B. Induktif", "C. Campuran", "D. Naratif"], "A"),
        e(2, "b_indo", "Lengkapi peribahasa: 'Besar pasak daripada ...'", "Tiang"),

        e(2, "b_inggris", "Fill in the blank with the correct preposition: 'He is very good ___ playing chess.'", "at"),
        p(2, "b_inggris", "Identify the correct indirect speech: John said, 'I am reading a book.'", ["A. John said that he is reading a book.", "B. John said that he was reading a book.", "C. John says that he read a book.", "D. John said that I was reading a book."], "B"),
        e(2, "b_inggris", "What is the antonym of 'optimistic'?", "Pessimistic"),
        p(2, "b_inggris", "Which sentence is grammatically correct?", ["A. She don't like apples.", "B. She doesn't likes apples.", "C. She doesn't like apples.", "D. She not like apples."], "C"),
        e(2, "b_inggris", "Translate 'It is raining cats and dogs' into literal Indonesian meaning.", "Hujan lebat / Hujan deras"),
        p(2, "b_inggris", "Neither the manager nor the employees ___ aware of the new policy.", ["A. is", "B. are", "C. was", "D. has"], "B"),
        e(2, "b_inggris", "Write the comparative form of the adjective 'bad'.", "Worse"),
        p(2, "b_inggris", "I look forward to ___ from you soon.", ["A. hear", "B. heard", "C. hearing", "D. be heard"], "C"),

        e(2, "mtk", "Berapakah hasil dari 2 pangkat 5?", "32"),
        p(2, "mtk", "Jika determinan matriks A = 3, berapakah determinan dari matriks 2A untuk ordo 2x2?", ["A. 6", "B. 9", "C. 12", "D. 18"], "C"), // 2^2 * 3 = 12
        e(2, "mtk", "Diketahui f(x) = 2x - 3. Berapakah nilai dari f invers dari 5 ( f^-1(5) )?", "4"),
        p(2, "mtk", "Titik puncak grafik fungsi kuadrat y = x^2 - 4x + 3 adalah...", ["A. (2, -1)", "B. (-2, 15)", "C. (4, 3)", "D. (-4, 35)"], "A"),
        e(2, "mtk", "Berapa banyak kombinasi jabat tangan yang terjadi di antara 8 orang yang saling bersalaman tepat satu kali?", "28"),
        p(2, "mtk", "Integral dari 2x dx adalah...", ["A. x^2 + C", "B. 2x^2 + C", "C. x + C", "D. 0"], "A"),
        e(2, "mtk", "Berapakah volume dari kubus yang panjang rusuknya 5 cm?", "125 cm3 / 125"),

        e(2, "ipa", "Proses perubahan wujud dari gas menjadi padat disebut...", "Mengkristal / Deposisi"),
        p(2, "ipa", "Berikut yang termasuk kelompok besaran pokok dalam sistem internasional adalah...", ["A. Panjang, massa, gaya", "B. Waktu, suhu, kecepatan", "C. Massa, waktu, kuat arus listrik", "D. Usaha, intensitas cahaya, suhu"], "C"),
        e(2, "ipa", "Rumus kimia dari senyawa Asam Sulfat adalah...", "H2SO4"),
        p(2, "ipa", "Penyakit anemia disebabkan karena tubuh kekurangan...", ["A. Kalsium", "B. Vitamin C", "C. Zat besi", "D. Iodium"], "C"),
        e(2, "ipa", "Enzim di mulut yang berfungsi memecah amilum menjadi maltosa adalah...", "Ptialin / Amilase"),
        p(2, "ipa", "Pada cermin cembung, bayangan yang dibentuk selalu bersifat...", ["A. Nyata, terbalik, diperkecil", "B. Nyata, tegak, diperbesar", "C. Maya, tegak, diperkecil", "D. Maya, terbalik, diperbesar"], "C"),
        e(2, "ipa", "Apa nama partikel subatomik yang bermuatan negatif?", "Elektron"),
        p(2, "ipa", "Sebuah benda bermassa 2 kg bergerak dengan percepatan 3 m/s^2. Berapakah gaya yang bekerja?", ["A. 5 N", "B. 6 N", "C. 1.5 N", "D. 9 N"], "B"),


        p(3, "b_indo", "Imbuhan 'meN-' jika dirangkaikan dengan kata dasar 'sapu' akan menjadi...", ["A. Mensapu", "B. Mennyapu", "C. Menyapu", "D. Mengsapu"], "C"),
        e(3, "b_indo", "Gaya bahasa yang mengungkapkan sindiran secara kasar disebut majas...", "Sarkasme"),
        p(3, "b_indo", "Premis 1: Semua ikan bernapas dengan insang. Premis 2: Paus bukan ikan. Kesimpulan yang tepat adalah...", ["A. Paus bernapas dengan insang.", "B. Paus tidak bernapas dengan insang.", "C. Beberapa ikan bukan paus.", "D. Tidak dapat ditarik kesimpulan pasti."], "D"), // Silogisme tidak valid krn premis minor menolak premis mayor subjek
        e(3, "b_indo", "Kata 'mengomunikasikan' memiliki kata dasar...", "Komunikasi"),
        p(3, "b_indo", "Makna denotasi adalah makna yang...", ["A. Sebenarnya", "B. Kiasan", "C. Menyinggung", "D. Ganda"], "A"),
        e(3, "b_indo", "Cerita rekaan yang menceritakan asal usul suatu tempat disebut...", "Legenda"),
        p(3, "b_indo", "Pilihlah kalimat yang menggunakan kata sapaan dengan benar!", ["A. Kapan bapak akan berangkat?", "B. Kapan Bapak akan berangkat?", "C. kapan Bapak akan berangkat?", "D. Kapan bapak akan Berangkat?"], "B"),

        e(3, "b_inggris", "What is the past participle (V3) of the verb 'throw'?", "Thrown"),
        p(3, "b_inggris", "I wish I ___ a million dollars right now.", ["A. have", "B. had", "C. has", "D. am having"], "B"),
        e(3, "b_inggris", "Identify the subject in this sentence: 'Under the bed sleeps a lazy cat.'", "A lazy cat / lazy cat / cat"),
        p(3, "b_inggris", "The book ___ I borrowed from the library is very interesting.", ["A. who", "B. whom", "C. which", "D. whose"], "C"),
        e(3, "b_inggris", "Change into an active voice: 'The letter was written by her.'", "She wrote the letter."),
        p(3, "b_inggris", "If she ___ earlier, she wouldn't have missed the train.", ["A. wakes up", "B. woke up", "C. had woken up", "D. has woken up"], "C"),
        e(3, "b_inggris", "What is the English term for words that sound the same but have different meanings? (e.g. bare and bear)", "Homophones"),
        p(3, "b_inggris", "Choose the correct spelling:", ["A. Accomodation", "B. Accommodation", "C. Acommodation", "D. Acomodation"], "B"),

        e(3, "mtk", "Hitunglah nilai diskriminan dari persamaan x^2 - 4x + 4 = 0.", "0"),
        p(3, "mtk", "Sebuah segitiga siku-siku memiliki sisi tegak 3 cm dan alas 4 cm. Berapakah panjang sisi miringnya?", ["A. 5 cm", "B. 6 cm", "C. 7 cm", "D. 25 cm"], "A"),
        e(3, "mtk", "Jika sin x = 1/2 dan x berada di kuadran I, berapakah nilai cos x?", "1/2 akar 3 / (akar 3)/2"),
        p(3, "mtk", "Nilai dari 3! (3 faktorial) + 4! adalah...", ["A. 7", "B. 12", "C. 30", "D. 144"], "C"), // 6 + 24
        e(3, "mtk", "Berapakah hasil dari turunan pertama y = sin(x)?", "cos(x) / cos x"),
        p(3, "mtk", "Diketahui himpunan A = {1, 2, 3}. Berapakah jumlah himpunan bagian dari A?", ["A. 3", "B. 6", "C. 8", "D. 9"], "C"),
        e(3, "mtk", "Berapakah modus dari data berikut: 2, 3, 3, 4, 5, 5, 5, 6?", "5"),
        p(3, "mtk", "Panjang busur lingkaran dengan sudut pusat 90 derajat dan jari-jari 14 cm adalah... (pi = 22/7)", ["A. 11 cm", "B. 22 cm", "C. 44 cm", "D. 154 cm"], "B"),

        e(3, "ipa", "Apa nama proses perpindahan panas yang disertai dengan perpindahan zat perantaranya?", "Konveksi"),
        p(3, "ipa", "Bagian mata yang berfungsi mengatur jumlah cahaya yang masuk adalah...", ["A. Kornea", "B. Lensa", "C. Retina", "D. Pupil"], "D"),
        e(3, "ipa", "pH larutan basa selalu berada di kisaran angka berapa?", "Lebih dari 7 / Di atas 7 / 7.1 - 14"),
        p(3, "ipa", "Reaksi pengikatan oksigen oleh suatu zat disebut reaksi...", ["A. Reduksi", "B. Oksidasi", "C. Substitusi", "D. Eliminasi"], "B"),
        e(3, "ipa", "Berapakah jumlah kromosom pada sel somatik manusia normal?", "46 / 23 pasang"),
        p(3, "ipa", "Hukum termodinamika yang menyatakan bahwa energi tidak dapat diciptakan atau dimusnahkan adalah...", ["A. Hukum Termodinamika 0", "B. Hukum Termodinamika 1", "C. Hukum Termodinamika 2", "D. Hukum Termodinamika 3"], "B"),
        e(3, "ipa", "Unsur halogen yang berwujud cair pada suhu ruang adalah...", "Bromin / Br")
    ];

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