const { Produksi, Jamu, User, Bahan, Produsen, Rempah } = require('../models');
const { Op } = require('sequelize');

function normalizeUnit(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return null;

  const map = {
    g: 'g', gram: 'g', gr: 'g',
    kg: 'kg',
    mg: 'mg',
    ml: 'ml',
    l: 'l', liter: 'l', litre: 'l',
    pcs: 'pcs', buah: 'pcs', butir: 'pcs',
  };

  return map[raw] ?? raw;
}

function parseLocaleNumber(input) {
  const str = String(input ?? '').trim();
  if (!str) return null;

  // Ambil token angka pertama
  const m = str.match(/[-+]?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?|[-+]?\d+(?:[.,]\d+)?/);
  if (!m) return null;
  const token = m[0];

  const lastComma = token.lastIndexOf(',');
  const lastDot = token.lastIndexOf('.');

  // Heuristik pemisah ribuan/desimal
  let normalized = token;
  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) {
      // 1.234,56 -> 1234.56
      normalized = token.replace(/\./g, '').replace(',', '.');
    } else {
      // 1,234.56 -> 1234.56
      normalized = token.replace(/,/g, '');
    }
  } else if (lastComma !== -1) {
    // 123,45 -> 123.45 (anggap koma desimal)
    normalized = token.replace(',', '.');
  }

  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

function parseAmountString(text) {
  const raw = String(text ?? '').trim();
  if (!raw) return null;

  const value = parseLocaleNumber(raw);
  if (value == null) return null;

  // Cari unit
  const unitMatch = raw.toLowerCase().match(/\b(kg|gram|gr|g|mg|ml|l|liter|pcs|buah|butir)\b/);
  const unit = normalizeUnit(unitMatch?.[1] ?? 'g');
  return { value, unit };
}

function convertQty(value, fromUnit, toUnit) {
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);
  if (!from || !to) return null;
  if (from === to) return value;

  // mass base: g
  const massFactorToG = { mg: 0.001, g: 1, kg: 1000 };
  // volume base: ml
  const volFactorToMl = { ml: 1, l: 1000 };

  if (massFactorToG[from] != null && massFactorToG[to] != null) {
    const inG = value * massFactorToG[from];
    return inG / massFactorToG[to];
  }
  if (volFactorToMl[from] != null && volFactorToMl[to] != null) {
    const inMl = value * volFactorToMl[from];
    return inMl / volFactorToMl[to];
  }

  // pcs tidak bisa dikonversi
  return null;
}

function normalizeName(input) {
  return String(input ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function findBestBahanForRempah(rempahName, bahanList) {
  const key = normalizeName(rempahName);
  if (!key) return null;
  // 1) exact normalize match
  const exact = bahanList.find(b => normalizeName(b.nama) === key);
  if (exact) return exact;
  // 2) contains either way
  const contains = bahanList.find(b => normalizeName(b.nama).includes(key) || key.includes(normalizeName(b.nama)));
  return contains ?? null;
}

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
        { model: Jamu, as: 'jamu', attributes: ['nama_jamu', 'jenis', 'satuan_output'] },
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
        { model: Jamu, as: 'jamu', attributes: ['nama_jamu', 'jenis', 'ket_jamu', 'satuan_output'] },
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
      let targetOutput = null;
      try {
        const [jamuRows] = await row.sequelize.query(
          'SELECT target_output FROM jamu WHERE id_jamu = :id_jamu',
          {
            replacements: { id_jamu: row.id_jamu },
            type: row.sequelize.QueryTypes.SELECT
          }
        );
        if (jamuRows && jamuRows.target_output) {
          targetOutput = parseFloat(jamuRows.target_output);
        }
      } catch (e) {
        console.error('Gagal mengambil target_output jamu:', e);
      }

      const defaultVol = targetOutput ? (targetOutput * parseFloat(row.ukuran_batch)) : (parseFloat(row.ukuran_batch) * 0.85);
      const volume = req.body.volume_output || row.volume_output || defaultVol;
      updatePayload.volume_output = volume;

      const baseForEfisiensi = targetOutput ? (targetOutput * parseFloat(row.ukuran_batch)) : parseFloat(row.ukuran_batch);
      updatePayload.efisiensi = parseFloat(((volume / baseForEfisiensi) * 100).toFixed(2));
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
    const ukuran_batch = req.query.ukuran_batch != null ? Number(req.query.ukuran_batch) : null;
    if (!id_jamu) return res.status(400).json({ message: 'id_jamu wajib diisi' });

    const jamu = await Jamu.findByPk(id_jamu, {
      attributes: ['id_jamu', 'nama_jamu', 'ket_jamu', 'jenis', 'perizinan'],
      include: [
        { model: Produsen, as: 'produsen', attributes: ['nama_produsen', 'alamat', 'kota', 'kontak', 'email', 'status'] },
        {
          model: Rempah,
          as: 'komposisi',
          attributes: ['id_rempah', 'nama_rempah'],
          through: { attributes: ['banyak_rempah'] },
        },
      ],
    });

    if (!jamu) return res.status(404).json({ message: 'Jamu tidak ditemukan' });

    const bahanList = await Bahan.findAll({
      attributes: ['id', 'nama', 'kategori', 'satuan', 'stokAwal', 'threshold'],
      order: [['nama', 'ASC']],
    });

    const jamuJson = jamu.toJSON();

    const komposisi = Array.isArray(jamuJson.komposisi) ? jamuJson.komposisi.map((r) => {
      const banyakRaw = r?.Komposisi?.banyak_rempah ?? null;
      const parsed = parseAmountString(banyakRaw);

      // Asumsi sederhana: banyak_rempah = kebutuhan per 1kg batch.
      const targetPerUnit = parsed ? { qty: parsed.value, unit: parsed.unit } : null;
      const targetTotal = (parsed && ukuran_batch && Number.isFinite(ukuran_batch))
        ? { qty: parsed.value * ukuran_batch, unit: parsed.unit }
        : null;

      const bahan = findBestBahanForRempah(r.nama_rempah, bahanList);
      const stock = bahan ? Number(bahan.stokAwal) : null;
      const threshold = bahan ? Number(bahan.threshold) : null;
      const unitStock = bahan?.satuan ?? null;

      // Convert targetTotal ke satuan stock kalau memungkinkan
      const targetInStockUnit = (targetTotal && unitStock)
        ? convertQty(targetTotal.qty, targetTotal.unit, unitStock)
        : null;

      let remaining = null;
      let status = 'TIDAK TERDAFTAR';
      if (bahan) {
        if (targetInStockUnit == null) {
          status = 'BUTUH INPUT';
        } else {
          remaining = stock - targetInStockUnit;
          if (remaining < 0) status = 'KURANG';
          else if (threshold != null && remaining <= threshold) status = 'LOW';
          else status = 'OK';
        }
      }

      return {
        id_rempah: r.id_rempah,
        nama_rempah: r.nama_rempah,
        banyak_rempah: banyakRaw,
        target_per_kg: targetPerUnit,
        target_total: targetTotal,
        bahan: bahan ? {
          id: bahan.id,
          nama: bahan.nama,
          kategori: bahan.kategori,
          satuan: bahan.satuan,
          stok: stock,
          threshold,
        } : null,
        target_in_stock_unit: targetInStockUnit,
        remaining_stock: remaining,
        status,
      };
    }) : [];

    // Flatten untuk kebutuhan frontend lama: banyak_rempah di root (bukan nested Komposisi)
    const flattenedKomposisiForLegacy = Array.isArray(jamuJson.komposisi)
      ? jamuJson.komposisi.map((r) => ({
        id_rempah: r.id_rempah,
        nama_rempah: r.nama_rempah,
        banyak_rempah: r?.Komposisi?.banyak_rempah ?? null,
      }))
      : [];

    res.json({
      data: {
        jamu: {
          id_jamu: jamuJson.id_jamu,
          nama_jamu: jamuJson.nama_jamu,
          ket_jamu: jamuJson.ket_jamu,
          jenis: jamuJson.jenis,
          perizinan: jamuJson.perizinan,
          produsen: jamuJson.produsen ?? null,
          komposisi: flattenedKomposisiForLegacy,
        },
        ukuran_batch,
        komposisi_detail: komposisi,
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
      const unit = normalizeUnit(m.unit);
      if (!idBahan || !Number.isFinite(qty) || qty <= 0 || !unit) {
        errors.push({ id_bahan: m.id_bahan, message: 'Item bahan tidak valid' });
        continue;
      }

      const bahan = await Bahan.findByPk(idBahan, { transaction: t });
      if (!bahan) {
        errors.push({ id_bahan: idBahan, message: 'Bahan tidak ditemukan' });
        continue;
      }

      const targetUnit = normalizeUnit(bahan.satuan);
      const qtyInStockUnit = convertQty(qty, unit, targetUnit);
      if (qtyInStockUnit == null) {
        errors.push({ id_bahan: idBahan, message: `Satuan tidak kompatibel (${unit} -> ${bahan.satuan})` });
        continue;
      }

      const currentStock = Number(bahan.stokAwal);
      const remaining = currentStock - qtyInStockUnit;
      if (remaining < 0) {
        errors.push({
          id_bahan: idBahan,
          nama: bahan.nama,
          message: 'Stok tidak mencukupi',
          stok: currentStock,
          butuh: qtyInStockUnit,
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
      const unit = normalizeUnit(m.unit);
      const bahan = await Bahan.findByPk(idBahan, { transaction: t });
      const targetUnit = normalizeUnit(bahan.satuan);
      const qtyInStockUnit = convertQty(qty, unit, targetUnit);
      const currentStock = Number(bahan.stokAwal);
      const remaining = currentStock - qtyInStockUnit;
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
