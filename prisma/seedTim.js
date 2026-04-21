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
        { nama: 'SMAN 5 Bantaeng', username: 'sman5_btg', password: hashedPassword, role: 'peserta', wilayah: 'Bantaeng', sesi: 1 },

        // ==========================================
        // DATA TIM SESI 2 (8 Kabupaten/Kota Baru)
        // ==========================================
        // 1. Wilayah Pangkep (Sesi 2)
        { nama: 'SMAN 1 Pangkep', username: 'sman1_pkp', password: hashedPassword, role: 'peserta', wilayah: 'Pangkep', sesi: 2 },
        { nama: 'SMAN 2 Pangkep', username: 'sman2_pkp', password: hashedPassword, role: 'peserta', wilayah: 'Pangkep', sesi: 2 },
        { nama: 'SMAN 11 Pangkep', username: 'sman11_pkp', password: hashedPassword, role: 'peserta', wilayah: 'Pangkep', sesi: 2 },

        // 2. Wilayah Barru (Sesi 2)
        { nama: 'SMAN 1 Barru', username: 'sman1_bru', password: hashedPassword, role: 'peserta', wilayah: 'Barru', sesi: 2 },
        { nama: 'SMAN 2 Barru', username: 'sman2_bru', password: hashedPassword, role: 'peserta', wilayah: 'Barru', sesi: 2 },
        { nama: 'SMAN 6 Barru', username: 'sman6_bru', password: hashedPassword, role: 'peserta', wilayah: 'Barru', sesi: 2 },

        // 3. Wilayah Pinrang (Sesi 2)
        { nama: 'SMAN 1 Pinrang', username: 'sman1_prg', password: hashedPassword, role: 'peserta', wilayah: 'Pinrang', sesi: 2 },
        { nama: 'SMAN 3 Pinrang', username: 'sman3_prg', password: hashedPassword, role: 'peserta', wilayah: 'Pinrang', sesi: 2 },
        { nama: 'SMAN 11 Pinrang', username: 'sman11_prg', password: hashedPassword, role: 'peserta', wilayah: 'Pinrang', sesi: 2 },

        // 4. Wilayah Enrekang (Sesi 2)
        { nama: 'SMAN 1 Enrekang', username: 'sman1_erk', password: hashedPassword, role: 'peserta', wilayah: 'Enrekang', sesi: 2 },
        { nama: 'SMAN 2 Enrekang', username: 'sman2_erk', password: hashedPassword, role: 'peserta', wilayah: 'Enrekang', sesi: 2 },
        { nama: 'SMAN 3 Enrekang', username: 'sman3_erk', password: hashedPassword, role: 'peserta', wilayah: 'Enrekang', sesi: 2 },

        // 5. Wilayah Tana Toraja (Sesi 2)
        { nama: 'SMAN 1 Tana Toraja', username: 'sman1_ttr', password: hashedPassword, role: 'peserta', wilayah: 'Tana Toraja', sesi: 2 },
        { nama: 'SMAN 2 Tana Toraja', username: 'sman2_ttr', password: hashedPassword, role: 'peserta', wilayah: 'Tana Toraja', sesi: 2 },
        { nama: 'SMAN 3 Tana Toraja', username: 'sman3_ttr', password: hashedPassword, role: 'peserta', wilayah: 'Tana Toraja', sesi: 2 },

        // 6. Wilayah Toraja Utara (Sesi 2)
        { nama: 'SMAN 1 Toraja Utara', username: 'sman1_trt', password: hashedPassword, role: 'peserta', wilayah: 'Toraja Utara', sesi: 2 },
        { nama: 'SMAN 2 Toraja Utara', username: 'sman2_trt', password: hashedPassword, role: 'peserta', wilayah: 'Toraja Utara', sesi: 2 },
        { nama: 'SMAN 3 Toraja Utara', username: 'sman3_trt', password: hashedPassword, role: 'peserta', wilayah: 'Toraja Utara', sesi: 2 },

        // 7. Wilayah Luwu (Sesi 2)
        { nama: 'SMAN 1 Luwu', username: 'sman1_lwu', password: hashedPassword, role: 'peserta', wilayah: 'Luwu', sesi: 2 },
        { nama: 'SMAN 2 Luwu', username: 'sman2_lwu', password: hashedPassword, role: 'peserta', wilayah: 'Luwu', sesi: 2 },
        { nama: 'SMAN 3 Luwu', username: 'sman3_lwu', password: hashedPassword, role: 'peserta', wilayah: 'Luwu', sesi: 2 },

        // 8. Wilayah Luwu Utara (Sesi 2)
        { nama: 'SMAN 1 Luwu Utara', username: 'sman1_ltr', password: hashedPassword, role: 'peserta', wilayah: 'Luwu Utara', sesi: 2 },
        { nama: 'SMAN 2 Luwu Utara', username: 'sman2_ltr', password: hashedPassword, role: 'peserta', wilayah: 'Luwu Utara', sesi: 2 },
        { nama: 'SMAN 8 Luwu Utara', username: 'sman8_ltr', password: hashedPassword, role: 'peserta', wilayah: 'Luwu Utara', sesi: 2 },


        // ==========================================
        // DATA TIM SESI 3 (8 Kabupaten/Kota Terakhir)
        // ==========================================
        // 1. Wilayah Luwu Timur (Sesi 3)
        { nama: 'SMAN 1 Luwu Timur', username: 'sman1_ltm', password: hashedPassword, role: 'peserta', wilayah: 'Luwu Timur', sesi: 3 },
        { nama: 'SMAN 2 Luwu Timur', username: 'sman2_ltm', password: hashedPassword, role: 'peserta', wilayah: 'Luwu Timur', sesi: 3 },
        { nama: 'SMAN 4 Luwu Timur', username: 'sman4_ltm', password: hashedPassword, role: 'peserta', wilayah: 'Luwu Timur', sesi: 3 },

        // 2. Wilayah Sinjai (Sesi 3)
        { nama: 'SMAN 1 Sinjai', username: 'sman1_snj', password: hashedPassword, role: 'peserta', wilayah: 'Sinjai', sesi: 3 },
        { nama: 'SMAN 2 Sinjai', username: 'sman2_snj', password: hashedPassword, role: 'peserta', wilayah: 'Sinjai', sesi: 3 },
        { nama: 'SMAN 5 Sinjai', username: 'sman5_snj', password: hashedPassword, role: 'peserta', wilayah: 'Sinjai', sesi: 3 },

        // 3. Wilayah Soppeng (Sesi 3)
        { nama: 'SMAN 1 Soppeng', username: 'sman1_spg', password: hashedPassword, role: 'peserta', wilayah: 'Soppeng', sesi: 3 },
        { nama: 'SMAN 2 Soppeng', username: 'sman2_spg', password: hashedPassword, role: 'peserta', wilayah: 'Soppeng', sesi: 3 },
        { nama: 'SMAN 5 Soppeng', username: 'sman5_spg', password: hashedPassword, role: 'peserta', wilayah: 'Soppeng', sesi: 3 },

        // 4. Wilayah Wajo (Sesi 3)
        { nama: 'SMAN 1 Wajo', username: 'sman1_wjo', password: hashedPassword, role: 'peserta', wilayah: 'Wajo', sesi: 3 },
        { nama: 'SMAN 2 Wajo', username: 'sman2_wjo', password: hashedPassword, role: 'peserta', wilayah: 'Wajo', sesi: 3 },
        { nama: 'SMAN 3 Wajo', username: 'sman3_wjo', password: hashedPassword, role: 'peserta', wilayah: 'Wajo', sesi: 3 },

        // 5. Wilayah Sidrap (Sesi 3)
        { nama: 'SMAN 1 Sidrap', username: 'sman1_sdp', password: hashedPassword, role: 'peserta', wilayah: 'Sidrap', sesi: 3 },
        { nama: 'SMAN 2 Sidrap', username: 'sman2_sdp', password: hashedPassword, role: 'peserta', wilayah: 'Sidrap', sesi: 3 },
        { nama: 'SMAN 4 Sidrap', username: 'sman4_sdp', password: hashedPassword, role: 'peserta', wilayah: 'Sidrap', sesi: 3 },

        // 6. Wilayah Takalar (Sesi 3)
        { nama: 'SMAN 1 Takalar', username: 'sman1_tkr', password: hashedPassword, role: 'peserta', wilayah: 'Takalar', sesi: 3 },
        { nama: 'SMAN 2 Takalar', username: 'sman2_tkr', password: hashedPassword, role: 'peserta', wilayah: 'Takalar', sesi: 3 },
        { nama: 'SMAN 3 Takalar', username: 'sman3_tkr', password: hashedPassword, role: 'peserta', wilayah: 'Takalar', sesi: 3 },

        // 7. Wilayah Jeneponto (Sesi 3)
        { nama: 'SMAN 1 Jeneponto', username: 'sman1_jnp', password: hashedPassword, role: 'peserta', wilayah: 'Jeneponto', sesi: 3 },
        { nama: 'SMAN 2 Jeneponto', username: 'sman2_jnp', password: hashedPassword, role: 'peserta', wilayah: 'Jeneponto', sesi: 3 },
        { nama: 'SMAN 9 Jeneponto', username: 'sman9_jnp', password: hashedPassword, role: 'peserta', wilayah: 'Jeneponto', sesi: 3 },

        // 8. Wilayah Selayar (Sesi 3)
        { nama: 'SMAN 1 Selayar', username: 'sman1_sly', password: hashedPassword, role: 'peserta', wilayah: 'Selayar', sesi: 3 },
        { nama: 'SMAN 2 Selayar', username: 'sman2_sly', password: hashedPassword, role: 'peserta', wilayah: 'Selayar', sesi: 3 },
        { nama: 'SMAN 3 Selayar', username: 'sman3_sly', password: hashedPassword, role: 'peserta', wilayah: 'Selayar', sesi: 3 }
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