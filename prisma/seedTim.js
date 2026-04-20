import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('👥 Memulai seeding data Tim untuk 8 Wilayah di Sesi 1...');

    const plainPassword = '123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const dataTim = [
        // 1. Wilayah Makassar
        { nama: 'SMAN 1 Makassar', username: 'sman1_mks', password: hashedPassword, role: 'peserta', wilayah: 'Makassar', sesi: 1 },
        { nama: 'SMAN 2 Makassar', username: 'sman2_mks', password: hashedPassword, role: 'peserta', wilayah: 'Makassar', sesi: 1 },
        { nama: 'SMAN 5 Makassar', username: 'sman5_mks', password: hashedPassword, role: 'peserta', wilayah: 'Makassar', sesi: 1 },
        { nama: 'SMAN 17 Makassar', username: 'sman17_mks', password: hashedPassword, role: 'peserta', wilayah: 'Makassar', sesi: 1 },
        { nama: 'SMA Zion Makassar', username: 'zion_mks', password: hashedPassword, role: 'peserta', wilayah: 'Makassar', sesi: 1 },

        // 2. Wilayah Gowa
        { nama: 'SMAN 1 Gowa', username: 'sman1_gwa', password: hashedPassword, role: 'peserta', wilayah: 'Gowa', sesi: 1 },
        { nama: 'SMAN 2 Gowa', username: 'sman2_gwa', password: hashedPassword, role: 'peserta', wilayah: 'Gowa', sesi: 1 },
        { nama: 'SMAN 3 Gowa', username: 'sman3_gwa', password: hashedPassword, role: 'peserta', wilayah: 'Gowa', sesi: 1 },

        // 3. Wilayah Maros
        { nama: 'SMAN 1 Maros', username: 'sman1_mrs', password: hashedPassword, role: 'peserta', wilayah: 'Maros', sesi: 1 },
        { nama: 'SMAN 3 Maros', username: 'sman3_mrs', password: hashedPassword, role: 'peserta', wilayah: 'Maros', sesi: 1 },
        { nama: 'SMAN 4 Maros', username: 'sman4_mrs', password: hashedPassword, role: 'peserta', wilayah: 'Maros', sesi: 1 },

        // 4. Wilayah Bone
        { nama: 'SMAN 1 Bone', username: 'sman1_bne', password: hashedPassword, role: 'peserta', wilayah: 'Bone', sesi: 1 },
        { nama: 'SMAN 3 Bone', username: 'sman3_bne', password: hashedPassword, role: 'peserta', wilayah: 'Bone', sesi: 1 },
        { nama: 'SMAN 7 Bone', username: 'sman7_bne', password: hashedPassword, role: 'peserta', wilayah: 'Bone', sesi: 1 },

        // 5. Wilayah Parepare
        { nama: 'SMAN 1 Parepare', username: 'sman1_pre', password: hashedPassword, role: 'peserta', wilayah: 'Parepare', sesi: 1 },
        { nama: 'SMAN 2 Parepare', username: 'sman2_pre', password: hashedPassword, role: 'peserta', wilayah: 'Parepare', sesi: 1 },
        { nama: 'SMAN 5 Parepare', username: 'sman5_pre', password: hashedPassword, role: 'peserta', wilayah: 'Parepare', sesi: 1 },

        // 6. Wilayah Palopo
        { nama: 'SMAN 1 Palopo', username: 'sman1_plp', password: hashedPassword, role: 'peserta', wilayah: 'Palopo', sesi: 1 },
        { nama: 'SMAN 3 Palopo', username: 'sman3_plp', password: hashedPassword, role: 'peserta', wilayah: 'Palopo', sesi: 1 },
        { nama: 'SMAN 5 Palopo', username: 'sman5_plp', password: hashedPassword, role: 'peserta', wilayah: 'Palopo', sesi: 1 },

        // 7. Wilayah Bulukumba
        { nama: 'SMAN 1 Bulukumba', username: 'sman1_blk', password: hashedPassword, role: 'peserta', wilayah: 'Bulukumba', sesi: 1 },
        { nama: 'SMAN 2 Bulukumba', username: 'sman2_blk', password: hashedPassword, role: 'peserta', wilayah: 'Bulukumba', sesi: 1 },
        { nama: 'SMAN 8 Bulukumba', username: 'sman8_blk', password: hashedPassword, role: 'peserta', wilayah: 'Bulukumba', sesi: 1 },

        // 8. Wilayah Bantaeng
        { nama: 'SMAN 1 Bantaeng', username: 'sman1_btg', password: hashedPassword, role: 'peserta', wilayah: 'Bantaeng', sesi: 1 },
        { nama: 'SMAN 4 Bantaeng', username: 'sman4_btg', password: hashedPassword, role: 'peserta', wilayah: 'Bantaeng', sesi: 1 },
        { nama: 'SMAN 5 Bantaeng', username: 'sman5_btg', password: hashedPassword, role: 'peserta', wilayah: 'Bantaeng', sesi: 1 }
    ];

    console.log(`⏳ Menyimpan ${dataTim.length} akun ke database...`);

    for (const tim of dataTim) {
        await prisma.tim.upsert({
            where: { username: tim.username },
            update: {}, // Tidak mengubah apa-apa jika user sudah ada (seperti Makassar)
            create: tim,
        });
    }

    console.log(`✅ Seeding Tim berhasil! Total ${dataTim.length} tim dari 8 wilayah disiapkan dengan password: ${plainPassword}`);
}

main()
    .catch((e) => {
        console.error('❌ Terjadi kesalahan saat seeding Tim:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });