// ============================================================
// SEEDER - Sistem Produksi Jamu Penjamu Handal
// ============================================================

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'jamu',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Koneksi database berhasil.\n');

    const queryInterface = sequelize.getQueryInterface();
    const now = new Date();

    // ============================================================
    // 0. RESET DATA
    // ============================================================
    console.log('🗑️ Menghapus data lama...');
    await sequelize.query(`DELETE FROM khasiat_jamu`);
    await sequelize.query(`DELETE FROM komposisi`);
    await sequelize.query(`DELETE FROM produksi`);
    await sequelize.query(`DELETE FROM jamu`);
    await sequelize.query(`DELETE FROM bahan`);
    await sequelize.query(`DELETE FROM rempah`);
    await sequelize.query(`DELETE FROM khasiat`);
    await sequelize.query(`DELETE FROM produsen`);
    await sequelize.query(`DELETE FROM user`);
    await sequelize.query(`DELETE FROM kota`);

    const tables = ['khasiat_jamu','komposisi','produksi','jamu','bahan','rempah','khasiat','produsen','user','kota'];
    for (const t of tables) {
      await sequelize.query(`ALTER TABLE \`${t}\` AUTO_INCREMENT = 1`);
    }

    // ============================================================
    // 1. KOTA (Tanpa timestamp di ERD)
    // ============================================================
    console.log('🌆 Seeding tabel kota...');
    await queryInterface.bulkInsert('kota', [
      { nama_kota: 'Sampang',   ket_kota: 'Kabupaten Sampang, Madura' },
      { nama_kota: 'Sumenep',   ket_kota: 'Kabupaten Sumenep, Madura' },
      { nama_kota: 'Pamekasan', ket_kota: 'Kabupaten Pamekasan, Madura' },
      { nama_kota: 'Bangkalan', ket_kota: 'Kabupaten Bangkalan, Madura' },
    ]);

    // ============================================================
    // 2. USER (Hanya created_at di ERD)
    // ============================================================
    console.log('👤 Seeding tabel user...');
    const hashAdmin = await bcrypt.hash('admin123', 10);
    const hashStaff = await bcrypt.hash('staff123', 10);

    await queryInterface.bulkInsert('user', [
      { id_kota: 1, username: 'admin',         email: 'admin@penjamuhandal.id',    pw: hashAdmin, role: 'admin', created_at: now },
      // 👇 INI AKUN STAF PRODUKSI YANG KAMU BUTUHIN 👇
      { id_kota: 1, username: 'staf_produksi', email: 'staf@penjamuhandal.id',     pw: hashStaff, role: 'staff', created_at: now },
    ]);

    // ============================================================
    // 3. PRODUSEN (Hanya created_at di ERD)
    // ============================================================
    console.log('🏭 Seeding tabel produsen...');
    await queryInterface.bulkInsert('produsen', [
      { nama_produsen: 'CV. Rempah Nusantara', alamat: 'Jl. Raya Sampang No. 12', kota: 'Sampang', kontak: '08123456789', email: 'rempah.nusantara@gmail.com', status: 'aktif', created_at: now },
      { nama_produsen: 'UD. Herbal Madura Jaya', alamat: 'Jl. Trunojoyo No. 45', kota: 'Sumenep', kontak: '08234567890', email: 'herbal.madura@gmail.com', status: 'aktif', created_at: now },
    ]);

    // ============================================================
    // 4. REMPAH (Tanpa timestamp di ERD)
    // ============================================================
    console.log('🌿 Seeding tabel rempah...');
    await queryInterface.bulkInsert('rempah', [
      { nama_rempah: 'Jahe Merah', ket_rempah: 'Zingiber officinale var. rubrum' },
      { nama_rempah: 'Kunyit',     ket_rempah: 'Curcuma longa' },
    ]);

    // ============================================================
    // 5. BAHAN (created_at & updated_at di ERD)
    // ============================================================
    console.log('📦 Seeding tabel bahan...');
    await queryInterface.bulkInsert('bahan', [
      { nama: 'Jahe Merah Segar', kategori: 'Rimpang', satuan: 'kg', stokAwal: 150.00, hargaSatuan: 25000, threshold: 20, created_at: now, updated_at: now },
      { nama: 'Kunyit Bubuk',     kategori: 'Rimpang', satuan: 'kg', stokAwal: 80.00,  hargaSatuan: 30000, threshold: 15, created_at: now, updated_at: now },
    ]);

    // ============================================================
    // 6. KHASIAT (Tanpa timestamp di ERD)
    // ============================================================
    console.log('💊 Seeding tabel khasiat...');
    await queryInterface.bulkInsert('khasiat', [
      { khasiat: 'Meningkatkan Imunitas', ket_khasiat: 'Membantu tubuh melawan infeksi' },
      { khasiat: 'Anti-Inflamasi',        ket_khasiat: 'Mengurangi peradangan' },
    ]);

    // ============================================================
    // 7. JAMU (Hanya created_at di ERD)
    // ============================================================
    console.log('🫙 Seeding tabel jamu...');
    await queryInterface.bulkInsert('jamu', [
      { id_user: 1, id_produsen: 1, nama_jamu: 'Jamu Jahe Merah Kunyit', ket_jamu: 'Minuman herbal', jenis: 'minuman', perizinan: 'BPOM', created_at: now },
    ]);

    // ============================================================
    // 8. KOMPOSISI (Tanpa timestamp di ERD)
    // ============================================================
    console.log('🔗 Seeding tabel komposisi...');
    await queryInterface.bulkInsert('komposisi', [
      { id_jamu: 1, id_rempah: 1, banyak_rempah: '200 gram' },
      { id_jamu: 1, id_rempah: 2, banyak_rempah: '150 gram' },
    ]);

    // ============================================================
    // 9. KHASIAT_JAMU (Tanpa timestamp di ERD)
    // ============================================================
    console.log('🔗 Seeding tabel khasiat_jamu...');
    await queryInterface.bulkInsert('khasiat_jamu', [
      { id_jamu: 1, id_khasiat: 1 },
      { id_jamu: 1, id_khasiat: 2 },
    ]);

    // ============================================================
    // 10. PRODUKSI (created_at & updated_at di ERD)
    // ============================================================
    console.log('⚙️  Seeding tabel produksi...');
    // id_user: 2 merujuk pada akun staf_produksi yang baru dibuat di atas
    await queryInterface.bulkInsert('produksi', [
      { id_jamu: 1, id_user: 2, kode_batch: 'BATCH-001', ukuran_batch: 100.00, volume_output: 92.50, efisiensi: 92.50, status: 'selesai', catatan: 'Lancar', created_at: now, updated_at: now },
    ]);

    console.log('\n🎉 Seeding SELESAI!');
    
    console.log('\n=======================================');
    console.log('🔑 KREDENSIAL LOGIN');
    console.log('=======================================');
    console.log('👨‍💼 AKUN ADMIN:');
    console.log('   Email    : admin@penjamuhandal.id');
    console.log('   Password : admin123\n');
    console.log('👷‍♂️ AKUN STAF PRODUKSI:');
    console.log('   Email    : staf@penjamuhandal.id');
    console.log('   Password : staff123');
    console.log('=======================================\n');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding gagal:', error.message);
    if (error.parent) console.error('   Detail:', error.parent.sqlMessage);
    await sequelize.close();
    process.exit(1);
  }
}

seed();