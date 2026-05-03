const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

// GET /api/users - list semua user (admin only)
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id_user, u.username, u.email, u.id_kota,
             k.nama_kota
      FROM user u
      LEFT JOIN kota k ON u.id_kota = k.id_kota
      ORDER BY u.id_user ASC
    `);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/me - profil user yang sedang login
router.get('/me', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id_user, u.username, u.email, u.id_kota, k.nama_kota
      FROM user u
      LEFT JOIN kota k ON u.id_kota = k.id_kota
      WHERE u.id_user = ?
    `, [req.user.id_user]);
    if (!rows.length) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json({ data: rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id_user, u.username, u.email, u.id_kota,
             k.nama_kota
      FROM user u
      LEFT JOIN kota k ON u.id_kota = k.id_kota
      WHERE u.id_user = ?
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json({ data: rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/:id - update profil / role
router.put('/:id', authenticate, async (req, res) => {
  const { username, email, id_kota } = req.body;
  try {
    await db.query(
      'UPDATE user SET username = ?, email = ?, id_kota = ? WHERE id_user = ?',
      [username, email, id_kota ?? null, req.params.id]
    );
    res.json({ message: 'User diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/:id/password - ganti password
router.put('/:id/password', authenticate, async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: 'Password wajib diisi' });
  }
  if (String(password).length > 30) {
    return res.status(400).json({ message: 'Password maksimal 30 karakter' });
  }
  try {
    // Schema DB `jamu` saat ini: `pw` varchar(30) → simpan plaintext.
    await db.query('UPDATE user SET pw = ? WHERE id_user = ?', [String(password), req.params.id]);
    res.json({ message: 'Password diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await db.query('DELETE FROM user WHERE id_user = ?', [req.params.id]);
    res.json({ message: 'User dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
