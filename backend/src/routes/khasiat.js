const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM khasiat');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM khasiat WHERE id_khasiat = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Khasiat tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { khasiat, ket_khasiat } = req.body;
  try {
    const [[{ nextId }]] = await db.query(
      'SELECT COALESCE(MAX(id_khasiat), 0) + 1 AS nextId FROM khasiat'
    );
    await db.query(
      'INSERT INTO khasiat (id_khasiat, khasiat, ket_khasiat) VALUES (?, ?, ?)',
      [nextId, khasiat ?? null, ket_khasiat ?? null]
    );
    res.status(201).json({ id_khasiat: nextId, khasiat: khasiat ?? null, ket_khasiat: ket_khasiat ?? null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  const { khasiat, ket_khasiat } = req.body;
  try {
    await db.query('UPDATE khasiat SET khasiat = ?, ket_khasiat = ? WHERE id_khasiat = ?', [khasiat, ket_khasiat, req.params.id]);
    res.json({ message: 'Khasiat diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    await db.query('DELETE FROM khasiat WHERE id_khasiat = ?', [req.params.id]);
    res.json({ message: 'Khasiat dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
