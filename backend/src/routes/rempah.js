const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM rempah');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM rempah WHERE id_rempah = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Rempah tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { nama_rempah, ket_rempah } = req.body;
  try {
    const [[{ nextId }]] = await db.query(
      'SELECT COALESCE(MAX(id_rempah), 0) + 1 AS nextId FROM rempah'
    );
    await db.query(
      'INSERT INTO rempah (id_rempah, nama_rempah, ket_rempah) VALUES (?, ?, ?)',
      [nextId, nama_rempah ?? null, ket_rempah ?? null]
    );
    res.status(201).json({ id_rempah: nextId, nama_rempah: nama_rempah ?? null, ket_rempah: ket_rempah ?? null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  const { nama_rempah, ket_rempah } = req.body;
  try {
    await db.query('UPDATE rempah SET nama_rempah = ?, ket_rempah = ? WHERE id_rempah = ?', [nama_rempah, ket_rempah, req.params.id]);
    res.json({ message: 'Rempah diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    await db.query('DELETE FROM rempah WHERE id_rempah = ?', [req.params.id]);
    res.json({ message: 'Rempah dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
