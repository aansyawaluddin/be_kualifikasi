import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('👥 Memulai seeding data Tim untuk Sesi 1 dan Sesi 3 x 3 Wilayah...');

    const plainPassword = '123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const dataTim = [
        // ---------- SESI 1 ----------
        // Wilayah 1 (sebelumnya "Makassar")
        { nama: 'SMAN 1 Makassar', username: 'sman1_mks', password: hashedPassword, role: 'peserta', wilayah: 'Wilayah 1', sesi: 1 },
        { nama: 'SMAN 2 Makassar', username: 'sman2_mks', password: hashedPassword, role: 'peserta', wilayah: 'Wilayah 1', sesi: 1 },
        { nama: 'SMAN 5 Makassar', username: 'sman5_mks', password: hashedPassword, role: 'peserta', wilayah: 'Wilayah 1', sesi: 1 },

        // Wilayah 2 (sebelumnya "Gowa")
        { nama: 'SMAN 1 Gowa', username: 'sman1_gwa', password: hashedPassword, role: 'peserta', wilayah: 'Wilayah 2', sesi: 1 },
        { nama: 'SMAN 2 Gowa', username: 'sman2_gwa', password: hashedPassword, role: 'peserta', wilayah: 'Wilayah 2', sesi: 1 },
        { nama: 'SMAN 3 Gowa', username: 'sman3_gwa', password: hashedPassword, role: 'peserta', wilayah: 'Wilayah 2', sesi: 1 },

        // Wilayah 3 (sebelumnya "Maros")
        { nama: 'SMAN 1 Maros', username: 'sman1_mrs', password: hashedPassword, role: 'peserta', wilayah: 'Wilayah 3', sesi: 1 },
        { nama: 'SMAN 3 Maros', username: 'sman3_mrs', password: hashedPassword, role: 'peserta', wilayah: 'Wilayah 3', sesi: 1 },
        { nama: 'SMAN 4 Maros', username: 'sman4_mrs', password: hashedPassword, role: 'peserta', wilayah: 'Wilayah 3', sesi: 1 },

        // ---------- SESI 3 ----------
        // Wilayah 1 (sebelumnya "Pangkep")
        { nama: 'SMAN 1 Pangkep', username: 'sman1_pkp', password: hashedPassword, role: 'peserta', wilayah: 'Wilayah 4', sesi: 3 },
        { nama: 'SMAN 2 Pangkep', username: 'sman2_pkp', password: hashedPassword, role: 'peserta', wilayah: 'Wilayah 4', sesi: 3 },
        { nama: 'SMAN 11 Pangkep', username: 'sman11_pkp', password: hashedPassword, role: 'peserta', wilayah: 'Wilayah 4', sesi: 3 },

        // Wilayah 2 (sebelumnya "Barru")
        { nama: 'SMAN 1 Barru', username: 'sman1_bru', password: hashedPassword, role: 'peserta', wilayah: 'Wilayah 5', sesi: 3 },
        { nama: 'SMAN 2 Barru', username: 'sman2_bru', password: hashedPassword, role: 'peserta', wilayah: 'Wilayah 5', sesi: 3 },
        { nama: 'SMAN 6 Barru', username: 'sman6_bru', password: hashedPassword, role: 'peserta', wilayah: 'Wilayah 5', sesi: 3 },

        // Wilayah 3 (sebelumnya "Pinrang")
        { nama: 'SMAN 1 Pinrang', username: 'sman1_prg', password: hashedPassword, role: 'peserta', wilayah: 'Wilayah 6', sesi: 3 },
        { nama: 'SMAN 3 Pinrang', username: 'sman3_prg', password: hashedPassword, role: 'peserta', wilayah: 'Wilayah 6', sesi: 3 },
        { nama: 'SMAN 11 Pinrang', username: 'sman11_prg', password: hashedPassword, role: 'peserta', wilayah: 'Wilayah 6', sesi: 3 },
    ];

    console.log('🗑️  Menghapus riwayat jawaban & data tim (peserta) lama...');
    await prisma.riwayatJawaban.deleteMany({
        where: { tim: { role: 'peserta' } }
    });
    await prisma.tim.deleteMany({
        where: { role: 'peserta' }
    });

    // Reset ID auto-increment supaya tim baru mulai lagi dari id = 1
    await prisma.$executeRawUnsafe('ALTER TABLE Tim AUTO_INCREMENT = 1');

    console.log(`⏳ Menyimpan ${dataTim.length} akun tim ke database...`);
    await prisma.tim.createMany({
        data: dataTim
    });

    console.log(`✅ Seeding Tim berhasil! 2 Sesi x 3 Wilayah, total ${dataTim.length} tim disiapkan dengan password: ${plainPassword}`);
}

main()
    .catch((e) => {
        console.error('❌ Terjadi kesalahan saat seeding Tim:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });