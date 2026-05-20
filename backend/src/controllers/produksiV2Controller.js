// controller/produksiV2Controller.js
const { sequelize, Produksi, KhasiatJamu } = require('../models');

// ==========================================
// UTILITY KONVERSI (Dipakai untuk Produksi)
// ==========================================
function normalizeUnit(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return null;
  const map = {
    g: 'g', gram: 'g', gr: 'g', kg: 'kg', mg: 'mg',
    ml: 'ml', l: 'l', liter: 'l', litre: 'l',
    pcs: 'pcs', buah: 'pcs', butir: 'pcs', lembar: 'lembar', botol: 'botol',
  };
  return map[raw] ?? raw;
}

function convertQty(value, fromUnit, toUnit) {
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);
  if (!from || !to) return null;
  if (from === to) return parseFloat(value);

  const massFactorToG = { mg: 0.001, g: 1, kg: 1000 };
  const volFactorToMl = { ml: 1, l: 1000 };

  if (massFactorToG[from] != null && massFactorToG[to] != null) {
    return (value * massFactorToG[from]) / massFactorToG[to];
  }
  if (volFactorToMl[from] != null && volFactorToMl[to] != null) {
    return (value * volFactorToMl[from]) / volFactorToMl[to];
  }
  return null;
}


// ==========================================
// 1. ADMIN: BIKIN RESEP JAMU BARU (TAHAP 2)
// ==========================================
const createResepBaru = async (req, res) => {
  const { 
    nama_jamu, jenis, perizinan, aturan_pakai, 
    kandungan, lokasi_produksi, target_output, satuan_output,
    komposisi, khasiat = [] 
  } = req.body;

  if (!nama_jamu) return res.status(400).json({ message: 'Nama jamu wajib diisi!' });

  const t = await sequelize.transaction();
  try {
    const [insertResult] = await sequelize.query(`
      INSERT INTO jamu (id_user, nama_jamu, jenis, perizinan, aturan_pakai, kandungan, lokasi_produksi, target_output, satuan_output)
      VALUES (:id_user, :nama_jamu, :jenis, :perizinan, :aturan_pakai, :kandungan, :lokasi_produksi, :target_output, :satuan_output)
    `, {
      replacements: {
        id_user: req.user?.id_user || 1,
        nama_jamu,
        jenis: jenis || null,
        perizinan: perizinan || null,
        aturan_pakai: aturan_pakai || null,
        kandungan: kandungan || null,
        lokasi_produksi: lokasi_produksi || null,
        target_output: target_output ? Number(target_output) : null,
        satuan_output: satuan_output || 'botol',
      },
      type: sequelize.QueryTypes.INSERT,
      transaction: t,
    });

    const id_jamu = insertResult;

    if (Array.isArray(komposisi) && komposisi.length > 0) {
      for (const item of komposisi) {
        if (!item.id_bahan || !item.kebutuhan) continue;

        await sequelize.query(`
          INSERT INTO komposisi (id_jamu, id_bahan, kebutuhan, satuan_kebutuhan)
          VALUES (:id_jamu, :id_bahan, :kebutuhan, :satuan_kebutuhan)
        `, {
          replacements: {
            id_jamu,
            id_bahan: Number(item.id_bahan),
            kebutuhan: parseFloat(item.kebutuhan),
            satuan_kebutuhan: item.satuan_kebutuhan || 'kg',
          },
          type: sequelize.QueryTypes.INSERT,
          transaction: t,
        });
      }
    }

    await t.commit();
    res.status(201).json({ message: 'Resep berhasil dibuat', data: { id_jamu } });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Gagal membuat resep: ' + err.message });
  }
};


// ==========================================
// 2. STAFF: CEK KEBUTUHAN STOK (TAHAP 3)
// ==========================================
const getRequirementsV2 = async (req, res) => {
  try {
    const id_jamu = Number(req.query.id_jamu);
    const ukuran_batch = req.query.ukuran_batch != null ? Number(req.query.ukuran_batch) : 1;
    if (!id_jamu) return res.status(400).json({ message: 'id_jamu wajib diisi' });

    const [jamuData] = await sequelize.query(`SELECT * FROM jamu WHERE id_jamu = :id_jamu`, { replacements: { id_jamu }, type: sequelize.QueryTypes.SELECT });
    if (!jamuData) return res.status(404).json({ message: 'Jamu tidak ditemukan' });

    const komposisiData = await sequelize.query(`
      SELECT k.kebutuhan, k.satuan_kebutuhan, b.id AS id_bahan, b.nama AS nama_bahan, b.stokAwal AS stok_gudang, b.satuan AS satuan_gudang
      FROM komposisi k JOIN bahan b ON k.id_bahan = b.id WHERE k.id_jamu = :id_jamu
    `, { replacements: { id_jamu }, type: sequelize.QueryTypes.SELECT });

    const komposisiList = komposisiData.map(k => {
      const totalKebutuhan = parseFloat(k.kebutuhan) * ukuran_batch;
      const kebutuhanInStokUnit = convertQty(totalKebutuhan, k.satuan_kebutuhan, k.satuan_gudang) || totalKebutuhan;
      const sisaStok = parseFloat(k.stok_gudang) - kebutuhanInStokUnit;
      
      return {
        id_bahan: k.id_bahan,
        nama_bahan: k.nama_bahan,
        kebutuhan_resep: parseFloat(k.kebutuhan),
        satuan_resep: k.satuan_kebutuhan,
        kebutuhan_total: totalKebutuhan,
        kebutuhan_in_stok_unit: kebutuhanInStokUnit,
        stok_gudang: parseFloat(k.stok_gudang),
        satuan_gudang: k.satuan_gudang,
        sisa_stok_estimasi: sisaStok,
        status: sisaStok >= 0 ? 'AMAN' : 'KURANG'
      };
    });

    res.json({
      data: {
        jamu: jamuData,
        ukuran_batch,
        total_estimasi_output: jamuData.target_output ? (jamuData.target_output * ukuran_batch) : null,
        satuan_output: jamuData.satuan_output,
        komposisi_detail: komposisiList,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ==========================================
// 3. STAFF: EKSEKUSI POTONG STOK (TAHAP 3)
// ==========================================
const executeBatchV2 = async (req, res) => {
  const { id_jamu, ukuran_batch, catatan } = req.body;
  const batchMultiplier = Number(ukuran_batch) || 1;

  if (!id_jamu) return res.status(400).json({ message: 'id_jamu wajib diisi' });

  const t = await sequelize.transaction();
  try {
    const komposisiData = await sequelize.query(`
      SELECT k.kebutuhan, k.satuan_kebutuhan, b.id AS id_bahan, b.nama, b.stokAwal, b.satuan AS satuan_gudang
      FROM komposisi k JOIN bahan b ON k.id_bahan = b.id WHERE k.id_jamu = :id_jamu
    `, { replacements: { id_jamu }, type: sequelize.QueryTypes.SELECT, transaction: t });

    if (komposisiData.length === 0) throw new Error('Resep belum memiliki komposisi bahan');

    const errors = [];
    for (const item of komposisiData) {
      const totalKebutuhan = parseFloat(item.kebutuhan) * batchMultiplier;
      const kebutuhanInStokUnit = convertQty(totalKebutuhan, item.satuan_kebutuhan, item.satuan_gudang) || totalKebutuhan;
      if ((parseFloat(item.stokAwal) - kebutuhanInStokUnit) < 0) {
        errors.push(`Stok ${item.nama} kurang! Butuh ${kebutuhanInStokUnit} ${item.satuan_gudang}`);
      }
    }

    if (errors.length > 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Validasi stok gagal', errors });
    }

    const [totalResult] = await sequelize.query(`SELECT COUNT(*) as count FROM produksi`, { type: sequelize.QueryTypes.SELECT, transaction: t });
    const total = totalResult ? parseInt(totalResult.count, 10) : 0;
    const kode_batch = `BAT-${new Date().getFullYear()}-${String(total + 1).padStart(3, '0')}`;

    const [insertProd] = await sequelize.query(`
      INSERT INTO produksi (id_jamu, id_user, kode_batch, ukuran_batch, status, catatan)
      VALUES (:id_jamu, :id_user, :kode_batch, :ukuran_batch, :status, :catatan)
    `, {
      replacements: {
        id_jamu,
        id_user: req.user.id_user,
        kode_batch,
        ukuran_batch: batchMultiplier,
        status: 'antrian',
        catatan: catatan || null,
      },
      type: sequelize.QueryTypes.INSERT,
      transaction: t,
    });

    const id_produksi = insertProd;

    for (const item of komposisiData) {
      const totalKebutuhan = parseFloat(item.kebutuhan) * batchMultiplier;
      const kebutuhanInStokUnit = convertQty(totalKebutuhan, item.satuan_kebutuhan, item.satuan_gudang) || totalKebutuhan;
      const queryResult = await sequelize.query(`
        UPDATE bahan SET stokAwal = stokAwal - :pengurangan 
        WHERE id = :id_bahan AND stokAwal >= :pengurangan
      `, {
        replacements: { pengurangan: kebutuhanInStokUnit, id_bahan: item.id_bahan },
        type: sequelize.QueryTypes.UPDATE,
        transaction: t,
      });

      // Di MySQL, raw query UPDATE dengan type UPDATE mengembalikan [undefined, affectedRows]
      // di mana element kedua adalah integer jumlah baris yang berhasil diubah.
      const affectedRows = Array.isArray(queryResult) ? queryResult[1] : 0;
      if (affectedRows === 0) {
        throw new Error(`Stok bahan ${item.nama} tidak mencukupi saat pengurangan`);
      }
    }

    await t.commit();
    res.status(201).json({ message: 'Batch sukses! Stok dipotong.', data: { id_produksi, kode_batch } });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};


// ==========================================
// 4. ADMIN: GET ALL JAMU (Raw SQL, includes target_output)
// ==========================================
const getAllJamuV2 = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT id_jamu, nama_jamu, ket_jamu, jenis, perizinan, target_output, satuan_output FROM jamu ORDER BY nama_jamu ASC`,
      { type: sequelize.QueryTypes.SELECT }
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ==========================================
// 5. ADMIN: GET DETAIL RESEP + KOMPOSISI (Raw SQL)
// ==========================================
const getResepDetail = async (req, res) => {
  try {
    const id_jamu = Number(req.params.id);
    if (!id_jamu) return res.status(400).json({ message: 'id_jamu wajib diisi' });

    const [jamuData] = await sequelize.query(
      `SELECT * FROM jamu WHERE id_jamu = :id_jamu`,
      { replacements: { id_jamu }, type: sequelize.QueryTypes.SELECT }
    );
    if (!jamuData) return res.status(404).json({ message: 'Jamu tidak ditemukan' });

    const komposisiData = await sequelize.query(`
      SELECT k.id_bahan, k.kebutuhan, k.satuan_kebutuhan, b.nama AS nama_bahan, b.satuan AS satuan_gudang, b.stokAwal AS stok_gudang
      FROM komposisi k
      LEFT JOIN bahan b ON k.id_bahan = b.id
      WHERE k.id_jamu = :id_jamu
    `, { replacements: { id_jamu }, type: sequelize.QueryTypes.SELECT });

    res.json({
      data: {
        jamu: jamuData,
        komposisi_detail: komposisiData.map(k => ({
          id_bahan: k.id_bahan,
          nama_bahan: k.nama_bahan,
          kebutuhan_resep: parseFloat(k.kebutuhan),
          satuan_resep: k.satuan_kebutuhan,
          stok_gudang: k.stok_gudang != null ? parseFloat(k.stok_gudang) : null,
          satuan_gudang: k.satuan_gudang,
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ==========================================
// 6. ADMIN: UPDATE RESEP + KOMPOSISI (Raw SQL)
// ==========================================
const updateResep = async (req, res) => {
  const id_jamu = Number(req.params.id);
  const {
    nama_jamu, jenis, perizinan, aturan_pakai,
    kandungan, lokasi_produksi, target_output, satuan_output,
    komposisi
  } = req.body;

  if (!id_jamu) return res.status(400).json({ message: 'id_jamu wajib diisi' });

  const t = await sequelize.transaction();
  try {
    await sequelize.query(`
      UPDATE jamu SET nama_jamu = :nama_jamu, jenis = :jenis, perizinan = :perizinan,
        aturan_pakai = :aturan_pakai, kandungan = :kandungan, lokasi_produksi = :lokasi_produksi,
        target_output = :target_output, satuan_output = :satuan_output
      WHERE id_jamu = :id_jamu
    `, {
      replacements: {
        id_jamu,
        nama_jamu: nama_jamu || null,
        jenis: jenis || null,
        perizinan: perizinan || null,
        aturan_pakai: aturan_pakai || null,
        kandungan: kandungan || null,
        lokasi_produksi: lokasi_produksi || null,
        target_output: target_output ? Number(target_output) : null,
        satuan_output: satuan_output || 'botol',
      },
      type: sequelize.QueryTypes.UPDATE,
      transaction: t,
    });

    // Hapus komposisi lama, insert ulang
    await sequelize.query(`DELETE FROM komposisi WHERE id_jamu = :id_jamu`, {
      replacements: { id_jamu },
      transaction: t,
    });

    if (Array.isArray(komposisi) && komposisi.length > 0) {
      for (const item of komposisi) {
        if (!item.id_bahan || !item.kebutuhan) continue;
        await sequelize.query(`
          INSERT INTO komposisi (id_jamu, id_bahan, kebutuhan, satuan_kebutuhan)
          VALUES (:id_jamu, :id_bahan, :kebutuhan, :satuan_kebutuhan)
        `, {
          replacements: {
            id_jamu,
            id_bahan: Number(item.id_bahan),
            kebutuhan: parseFloat(item.kebutuhan),
            satuan_kebutuhan: item.satuan_kebutuhan || 'kg',
          },
          type: sequelize.QueryTypes.INSERT,
          transaction: t,
        });
      }
    }

    await t.commit();
    res.json({ message: 'Resep berhasil diperbarui' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Gagal memperbarui resep: ' + err.message });
  }
};


// ==========================================
// 7. ADMIN: DELETE RESEP (Raw SQL)
// ==========================================
const deleteResep = async (req, res) => {
  const id_jamu = Number(req.params.id);
  if (!id_jamu) return res.status(400).json({ message: 'id_jamu wajib diisi' });

  const t = await sequelize.transaction();
  try {
    await sequelize.query(`DELETE FROM komposisi WHERE id_jamu = :id_jamu`, {
      replacements: { id_jamu }, transaction: t,
    });
    await sequelize.query(`DELETE FROM jamu WHERE id_jamu = :id_jamu`, {
      replacements: { id_jamu }, transaction: t,
    });
    await t.commit();
    res.json({ message: 'Resep berhasil dihapus' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Gagal menghapus: ' + err.message });
  }
};

module.exports = { createResepBaru, getRequirementsV2, executeBatchV2, getAllJamuV2, getResepDetail, updateResep, deleteResep };