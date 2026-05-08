const { Produksi, Jamu, User, Bahan } = require('../models');
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
