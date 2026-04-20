import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('👥 Memulai seeding data Tim untuk Sesi 1...');

    const plainPassword = '123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const dataTim = [

        // Data Peserta Sesi 1 (Wilayah Makassar)
        {
            nama: 'SMAN 1 Makassar',
            username: 'sman1_mks',
            password: hashedPassword,
            role: 'peserta',
            wilayah: 'Makassar',
            sesi: 1,
        },
        {
            nama: 'SMAN 2 Makassar',
            username: 'sman2_mks',
            password: hashedPassword,
            role: 'peserta',
            wilayah: 'Makassar',
            sesi: 1,
        },
        {
            nama: 'SMAN 5 Makassar',
            username: 'sman5_mks',
            password: hashedPassword,
            role: 'peserta',
            wilayah: 'Makassar',
            sesi: 1,
        },
        {
            nama: 'SMAN 17 Makassar',
            username: 'sman17_mks',
            password: hashedPassword,
            role: 'peserta',
            wilayah: 'Makassar',
            sesi: 1,
        },
        {
            nama: 'SMA Zion Makassar',
            username: 'zion_mks',
            password: hashedPassword,
            role: 'peserta',
            wilayah: 'Makassar',
            sesi: 1,
        }
    ];

    console.log(`⏳ Menyimpan ${dataTim.length} akun ke database...`);

    for (const tim of dataTim) {
        await prisma.tim.upsert({
            where: { username: tim.username },
            update: {},
            create: tim,
        });
    }

    console.log(`✅ Seeding Tim berhasil! Semua akun menggunakan password: ${plainPassword}`);
}

main()
    .catch((e) => {
        console.error('❌ Terjadi kesalahan saat seeding Tim:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });