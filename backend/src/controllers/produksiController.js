const { Produksi, Jamu, User, Bahan, Produsen, Komposisi } = require('../models');
const { Op } = require('sequelize');

// Urutan status yang valid di database
const STATUS_ORDER = ['antrian', 'ekstraksi', 'botolisasi', 'selesai'];

// GET /api/produksi - list semua batch produksi
const getAll = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const rows = await Produksi.findAll({
      where,
      include: [
        { model: Jamu, as: 'jamu', attributes: ['nama_jamu', 'jenis'] },
        { model: User, as: 'operator', attributes: ['username'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/produksi/metrics - statistik dashboard
const getMetrics = async (req, res) => {
  try {
    const totalBatch      = await Produksi.count();
    const produksiAktif   = await Produksi.count({
      where: { status: { [Op.in]: ['antrian', 'ekstraksi', 'botolisasi'] } },
    });
    const produksiSelesai = await Produksi.count({ where: { status: 'selesai' } });
    const stokKritis      = await Bahan.count({
      where: {
        stokAwal: { [Op.lte]: Bahan.sequelize.col('threshold'), [Op.gt]: 0 },
      },
    });
    const stokKosong      = await Bahan.count({ where: { stokAwal: 0 } });

    res.json({
      data: { totalBatch, produksiAktif, produksiSelesai, stokKritis, stokKosong },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/produksi/:id - detail batch
const getById = async (req, res) => {
  try {
    const row = await Produksi.findByPk(req.params.id, {
      include: [
        { model: Jamu, as: 'jamu', attributes: ['nama_jamu', 'jenis', 'ket_jamu'] },
        { model: User, as: 'operator', attributes: ['username'] },
      ],
    });
    if (!row) return res.status(404).json({ message: 'Batch tidak ditemukan' });
    res.json({ data: row });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/produksi - buat batch baru
const create = async (req, res) => {
  const { id_jamu, ukuran_batch, catatan } = req.body;
  if (!id_jamu) return res.status(400).json({ message: 'id_jamu wajib diisi' });

  try {
    const total      = await Produksi.count();
    const kode_batch = `BAT-${new Date().getFullYear()}-${String(total + 1).padStart(3, '0')}`;

    const row = await Produksi.create({
      id_jamu,
      id_user: req.user.id_user,
      kode_batch,
      ukuran_batch: ukuran_batch || 0,
      status: 'antrian',
      catatan: catatan || null,
    });
    res.status(201).json({
      message: 'Batch produksi dibuat',
      data: { id_produksi: row.id_produksi, kode_batch, status: 'antrian' },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/produksi/:id - update status/data batch
const update = async (req, res) => {
  const { status, volume_output, efisiensi, catatan } = req.body;
  try {
    await Produksi.update(
      { status, volume_output, efisiensi, catatan },
      { where: { id_produksi: req.params.id } }
    );
    res.json({ message: 'Batch diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/produksi/:id
const remove = async (req, res) => {
  try {
    await Produksi.destroy({ where: { id_produksi: req.params.id } });
    res.json({ message: 'Batch dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/produksi/:id/advance - naikkan status satu tahap
const advanceStatus = async (req, res) => {
  try {
    const row = await Produksi.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'Batch tidak ditemukan' });

    const currentIdx = STATUS_ORDER.indexOf(row.status);
    if (currentIdx === -1 || currentIdx === STATUS_ORDER.length - 1) {
      return res.status(400).json({ message: 'Batch sudah selesai atau status tidak dikenal' });
    }

    const nextStatus = STATUS_ORDER[currentIdx + 1];
    const updatePayload = { status: nextStatus };

    // Jika selesai, hitung efisiensi otomatis jika belum ada
    if (nextStatus === 'selesai' && !row.efisiensi && row.ukuran_batch) {
      const volume = req.body.volume_output || row.volume_output || row.ukuran_batch * 0.85;
      updatePayload.volume_output = volume;
      updatePayload.efisiensi = parseFloat(((volume / row.ukuran_batch) * 100).toFixed(2));
    }

    await Produksi.update(updatePayload, { where: { id_produksi: req.params.id } });

    res.json({
      message: `Status batch diperbarui ke ${nextStatus}`,
      data: { id_produksi: row.id_produksi, previousStatus: row.status, nextStatus },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, getMetrics, getById, create, update, remove, advanceStatus };

// GET /api/produksi/requirements?id_jamu=1&ukuran_batch=5
// Mengembalikan detail jamu + daftar komposisi dengan perkiraan pemakaian dan status stok.
module.exports.getRequirements = async (req, res) => {
  try {
    const id_jamu = Number(req.query.id_jamu);
    if (!id_jamu) return res.status(400).json({ message: 'id_jamu wajib diisi' });

    const jamu = await Jamu.findByPk(id_jamu, {
      attributes: ['id_jamu', 'nama_jamu', 'ket_jamu', 'jenis', 'perizinan'],
      include: [
        { model: Produsen, as: 'produsen', attributes: ['nama_produsen', 'alamat', 'kota', 'kontak', 'email', 'status'] },
      ],
    });

    if (!jamu) return res.status(404).json({ message: 'Jamu tidak ditemukan' });

    // Ambil komposisi dari database
    const komposisiRows = await Komposisi.findAll({
      where: { id_jamu },
      include: [
        { model: Bahan, attributes: ['id', 'nama', 'kategori', 'satuan', 'stokAwal', 'threshold'] },
      ],
    });

    const komposisi = komposisiRows.map((k) => {
      const bahan = k.Bahan || {};
      const kebutuhan = k.kebutuhan ?? 0;
      const satuan = k.satuan_kebutuhan ?? bahan.satuan;
      const stok = bahan.stokAwal ?? 0;
      const threshold = bahan.threshold ?? 0;

      let status = 'OK';
      if (stok <= 0) status = 'KOSONG';
      else if (stok <= threshold) status = 'KRITIS';
      else if (stok < kebutuhan) status = 'KURANG';

      return {
        id_komposisi: k.id_komposisi,
        id_bahan: k.id_bahan,
        nama_bahan: bahan.nama,
        kebutuhan,
        satuan_kebutuhan: satuan,
        bahan_stok: stok,
        bahan_satuan: bahan.satuan,
        threshold,
        status,
      };
    });

    res.json({
      data: {
        jamu: jamu.toJSON(),
        komposisi,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/produksi/execute
// Body: { id_jamu, ukuran_batch, catatan?, materials: [{ id_bahan, qty, unit }] }
// Membuat batch dan mengurangi stok bahan secara atomik.
module.exports.execute = async (req, res) => {
  const { id_jamu, ukuran_batch, catatan, materials } = req.body;
  if (!id_jamu) return res.status(400).json({ message: 'id_jamu wajib diisi' });
  if (!Array.isArray(materials) || materials.length === 0) {
    return res.status(400).json({ message: 'materials wajib diisi (minimal 1 item)' });
  }

  const t = await Produksi.sequelize.transaction();
  try {
    // Buat kode batch
    const total = await Produksi.count({ transaction: t });
    const kode_batch = `BAT-${new Date().getFullYear()}-${String(total + 1).padStart(3, '0')}`;

    // Validasi bahan & stok
    const errors = [];
    for (const m of materials) {
      const idBahan = Number(m.id_bahan);
      const qty = Number(m.qty);
      if (!idBahan || !Number.isFinite(qty) || qty <= 0) {
        errors.push({ id_bahan: m.id_bahan, message: 'Item bahan tidak valid' });
        continue;
      }

      const bahan = await Bahan.findByPk(idBahan, { transaction: t });
      if (!bahan) {
        errors.push({ id_bahan: idBahan, message: 'Bahan tidak ditemukan' });
        continue;
      }

      const currentStock = Number(bahan.stokAwal);
      const remaining = currentStock - qty;
      if (remaining < 0) {
        errors.push({
          id_bahan: idBahan,
          nama: bahan.nama,
          message: 'Stok tidak mencukupi',
          stok: currentStock,
          butuh: qty,
          satuan: bahan.satuan,
        });
      }
    }

    if (errors.length > 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Validasi stok gagal', errors });
    }

    // Create batch
    const produksi = await Produksi.create({
      id_jamu,
      id_user: req.user.id_user,
      kode_batch,
      ukuran_batch: ukuran_batch || 0,
      status: 'antrian',
      catatan: catatan || null,
    }, { transaction: t });

    // Reduce stok
    for (const m of materials) {
      const idBahan = Number(m.id_bahan);
      const qty = Number(m.qty);
      const bahan = await Bahan.findByPk(idBahan, { transaction: t });
      const currentStock = Number(bahan.stokAwal);
      const remaining = currentStock - qty;
      await Bahan.update(
        { stokAwal: remaining },
        { where: { id: idBahan }, transaction: t }
      );
    }

    await t.commit();
    res.status(201).json({
      message: 'Batch dieksekusi dan stok diperbarui',
      data: { id_produksi: produksi.id_produksi, kode_batch, status: 'antrian' },
    });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};
