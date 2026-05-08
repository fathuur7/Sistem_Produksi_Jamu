const { Bahan } = require('../models');
const { Op } = require('sequelize');

// Helper: determine status berdasarkan stock dan threshold
const getStatus = (stock, threshold) => {
  if (stock === 0) return 'Kosong';
  if (stock <= threshold) return 'Kritis';
  if (stock <= threshold * 1.5) return 'Peringatan';
  return 'Sehat';
};

// GET /api/inventory - list semua inventory dengan status
const getAllInventory = async (req, res) => {
  try {
    const items = await Bahan.findAll({ order: [['nama', 'ASC']] });
    
    const inventory = items.map(item => ({
      id: item.id,
      nama: item.nama,
      kategori: item.kategori,
      satuan: item.satuan,
      stokAwal: parseFloat(item.stokAwal),
      threshold: parseFloat(item.threshold),
      hargaSatuan: parseFloat(item.hargaSatuan),
      status: getStatus(parseFloat(item.stokAwal), parseFloat(item.threshold)),
      totalNilai: parseFloat(item.stokAwal) * parseFloat(item.hargaSatuan),
    }));

    res.json({
      success: true,
      message: 'Data inventory berhasil diambil',
      data: inventory,
      total: inventory.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/inventory/:id - detail inventory
const getInventoryById = async (req, res) => {
  try {
    const item = await Bahan.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item tidak ditemukan' });

    const data = {
      id: item.id,
      nama: item.nama,
      kategori: item.kategori,
      satuan: item.satuan,
      stokAwal: parseFloat(item.stokAwal),
      threshold: parseFloat(item.threshold),
      hargaSatuan: parseFloat(item.hargaSatuan),
      status: getStatus(parseFloat(item.stokAwal), parseFloat(item.threshold)),
      totalNilai: parseFloat(item.stokAwal) * parseFloat(item.hargaSatuan),
    };

    res.json({ success: true, message: 'Data inventory ditemukan', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/inventory/status/:status - filter berdasarkan status
const getInventoryByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatus = ['Sehat', 'Peringatan', 'Kritis', 'Kosong'];
    
    if (!validStatus.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Status harus salah satu dari: ${validStatus.join(', ')}` 
      });
    }

    const items = await Bahan.findAll({ order: [['nama', 'ASC']] });
    
    const inventory = items
      .map(item => ({
        id: item.id,
        nama: item.nama,
        kategori: item.kategori,
        satuan: item.satuan,
        stokAwal: parseFloat(item.stokAwal),
        threshold: parseFloat(item.threshold),
        hargaSatuan: parseFloat(item.hargaSatuan),
        status: getStatus(parseFloat(item.stokAwal), parseFloat(item.threshold)),
        totalNilai: parseFloat(item.stokAwal) * parseFloat(item.hargaSatuan),
      }))
      .filter(item => item.status === status);

    res.json({
      success: true,
      message: `Data inventory dengan status ${status}`,
      status,
      data: inventory,
      total: inventory.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/inventory/low-stock - item yang stoknya rendah (Kritis atau Kosong)
const getLowStockItems = async (req, res) => {
  try {
    const items = await Bahan.findAll({ order: [['nama', 'ASC']] });
    
    const lowStock = items
      .map(item => ({
        id: item.id,
        nama: item.nama,
        kategori: item.kategori,
        satuan: item.satuan,
        stokAwal: parseFloat(item.stokAwal),
        threshold: parseFloat(item.threshold),
        hargaSatuan: parseFloat(item.hargaSatuan),
        status: getStatus(parseFloat(item.stokAwal), parseFloat(item.threshold)),
        totalNilai: parseFloat(item.stokAwal) * parseFloat(item.hargaSatuan),
      }))
      .filter(item => item.status === 'Kritis' || item.status === 'Kosong');

    res.json({
      success: true,
      message: 'Item dengan stok rendah',
      data: lowStock,
      total: lowStock.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/inventory/adjust - adjust stok (tambah atau kurangi)
const adjustStock = async (req, res) => {
  try {
    const { id, quantity, type, reason } = req.body;

    if (!id || quantity === undefined || !type) {
      return res.status(400).json({ 
        success: false, 
        message: 'id, quantity, dan type (add/reduce) wajib diisi' 
      });
    }

    if (!['add', 'reduce'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'type harus add atau reduce' 
      });
    }

    const item = await Bahan.findByPk(id);
    if (!item) return res.status(404).json({ success: false, message: 'Item tidak ditemukan' });

    const currentStock = parseFloat(item.stokAwal);
    const newStock = type === 'add' ? currentStock + parseFloat(quantity) : currentStock - parseFloat(quantity);

    if (newStock < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Stok tidak boleh negatif' 
      });
    }

    await Bahan.update(
      { stokAwal: newStock },
      { where: { id } }
    );

    const updatedItem = await Bahan.findByPk(id);
    const newStatus = getStatus(newStock, parseFloat(item.threshold));

    res.json({
      success: true,
      message: `Stok ${type === 'add' ? 'ditambah' : 'dikurangi'}`,
      data: {
        id,
        nama: item.nama,
        stokSebelumnya: currentStock,
        stokSesudahnya: newStock,
        type,
        quantity: parseFloat(quantity),
        reason: reason || 'Penyesuaian stok',
        statusSebelumnya: getStatus(currentStock, parseFloat(item.threshold)),
        statusSesudahnya: newStatus,
        threshold: parseFloat(item.threshold),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/inventory/restock - restock ke level tertentu
const restock = async (req, res) => {
  try {
    const { id, targetStock } = req.body;

    if (!id || targetStock === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'id dan targetStock wajib diisi' 
      });
    }

    const item = await Bahan.findByPk(id);
    if (!item) return res.status(404).json({ success: false, message: 'Item tidak ditemukan' });

    const currentStock = parseFloat(item.stokAwal);
    const quantityAdded = parseFloat(targetStock) - currentStock;

    if (quantityAdded <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Target stok harus lebih besar dari stok saat ini' 
      });
    }

    await Bahan.update(
      { stokAwal: targetStock },
      { where: { id } }
    );

    res.json({
      success: true,
      message: 'Restock berhasil',
      data: {
        id,
        nama: item.nama,
        stokSebelumnya: currentStock,
        stokSesudahnya: targetStock,
        quantityAdded,
        threshold: parseFloat(item.threshold),
        statusSebelumnya: getStatus(currentStock, parseFloat(item.threshold)),
        statusSesudahnya: getStatus(targetStock, parseFloat(item.threshold)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/inventory/summary - ringkasan inventory
const getInventorySummary = async (req, res) => {
  try {
    const items = await Bahan.findAll();

    let totalSehat = 0;
    let totalPeringatan = 0;
    let totalKritis = 0;
    let totalKosong = 0;
    let totalNilaiInventory = 0;
    let totalQuantity = 0;

    items.forEach(item => {
      const stock = parseFloat(item.stokAwal);
      const threshold = parseFloat(item.threshold);
      const harga = parseFloat(item.hargaSatuan);
      const nilaiStok = stock * harga;

      totalNilaiInventory += nilaiStok;
      totalQuantity += stock;

      const status = getStatus(stock, threshold);
      if (status === 'Sehat') totalSehat++;
      else if (status === 'Peringatan') totalPeringatan++;
      else if (status === 'Kritis') totalKritis++;
      else if (status === 'Kosong') totalKosong++;
    });

    const summary = {
      totalItem: items.length,
      totalQuantity,
      totalNilaiInventory,
      statusCount: {
        sehat: totalSehat,
        peringatan: totalPeringatan,
        kritis: totalKritis,
        kosong: totalKosong,
      },
      perhatian: totalKritis + totalKosong,
      healthPercentage: items.length > 0 ? ((totalSehat / items.length) * 100).toFixed(2) : 0,
    };

    res.json({
      success: true,
      message: 'Ringkasan inventory',
      data: summary,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/inventory/analytics - analytics lengkap
const getInventoryAnalytics = async (req, res) => {
  try {
    const items = await Bahan.findAll();

    const analytics = {
      byCategory: {},
      byStatus: {
        Sehat: [],
        Peringatan: [],
        Kritis: [],
        Kosong: [],
      },
      highValue: [],
      lowValue: [],
    };

    items.forEach(item => {
      const stock = parseFloat(item.stokAwal);
      const threshold = parseFloat(item.threshold);
      const harga = parseFloat(item.hargaSatuan);
      const status = getStatus(stock, threshold);
      const kategori = item.kategori;

      const itemData = {
        id: item.id,
        nama: item.nama,
        kategori,
        satuan: item.satuan,
        stok: stock,
        threshold,
        harga,
        totalNilai: stock * harga,
        status,
      };

      // By Category
      if (!analytics.byCategory[kategori]) {
        analytics.byCategory[kategori] = { total: 0, items: [], totalValue: 0 };
      }
      analytics.byCategory[kategori].items.push(itemData);
      analytics.byCategory[kategori].total += stock;
      analytics.byCategory[kategori].totalValue += stock * harga;

      // By Status
      analytics.byStatus[status].push(itemData);

      // High Value (lebih dari 1 juta)
      if (stock * harga > 1000000) {
        analytics.highValue.push(itemData);
      }

      // Low Value (kurang dari 100 ribu)
      if (stock * harga < 100000) {
        analytics.lowValue.push(itemData);
      }
    });

    res.json({
      success: true,
      message: 'Analitik inventory lengkap',
      data: analytics,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/inventory/bulk-adjust - adjust multiple items sekaligus
const bulkAdjustStock = async (req, res) => {
  try {
    const { adjustments } = req.body;

    if (!Array.isArray(adjustments) || adjustments.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'adjustments harus array dengan minimal 1 item' 
      });
    }

    const results = [];
    const errors = [];

    for (const adj of adjustments) {
      try {
        const { id, quantity, type, reason } = adj;

        if (!id || quantity === undefined || !['add', 'reduce'].includes(type)) {
          errors.push({ id, error: 'id, quantity, dan type (add/reduce) wajib diisi dengan benar' });
          continue;
        }

        const item = await Bahan.findByPk(id);
        if (!item) {
          errors.push({ id, error: 'Item tidak ditemukan' });
          continue;
        }

        const currentStock = parseFloat(item.stokAwal);
        const newStock = type === 'add' ? currentStock + parseFloat(quantity) : currentStock - parseFloat(quantity);

        if (newStock < 0) {
          errors.push({ id, error: 'Stok tidak boleh negatif' });
          continue;
        }

        await Bahan.update({ stokAwal: newStock }, { where: { id } });
        const newStatus = getStatus(newStock, parseFloat(item.threshold));

        results.push({
          id,
          nama: item.nama,
          stokSebelumnya: currentStock,
          stokSesudahnya: newStock,
          type,
          quantity: parseFloat(quantity),
          statusSebelumnya: getStatus(currentStock, parseFloat(item.threshold)),
          statusSesudahnya: newStatus,
        });
      } catch (err) {
        errors.push({ error: err.message });
      }
    }

    res.json({
      success: errors.length === 0,
      message: `${results.length} item berhasil diperbarui${errors.length > 0 ? `, ${errors.length} error` : ''}`,
      data: { results, errors },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllInventory,
  getInventoryById,
  getInventoryByStatus,
  getLowStockItems,
  adjustStock,
  restock,
  getInventorySummary,
  getInventoryAnalytics,
  bulkAdjustStock,
};
