const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * GET /api/search?q=kunyit
 * Mencari di jamu, rempah, dan khasiat (sesuai schema DB `jamu` saat ini)
 */
router.get('/', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ message: 'Query minimal 2 karakter' });
  }

  const keyword = `%${q.trim()}%`;

  try {
    // Cari di tabel jamu
    const [jamu] = await db.query(`
      SELECT j.id_jamu AS id, j.nama_jamu AS nama, j.ket_jamu AS deskripsi,
             'jamu' AS tipe
      FROM jamu j
      WHERE j.nama_jamu LIKE ? OR j.ket_jamu LIKE ?
      LIMIT 20
    `, [keyword, keyword]);

    // Cari di tabel rempah
    const [rempah] = await db.query(`
      SELECT id_rempah AS id, nama_rempah AS nama, ket_rempah AS deskripsi,
             'rempah' AS tipe
      FROM rempah
      WHERE nama_rempah LIKE ? OR ket_rempah LIKE ?
      LIMIT 20
    `, [keyword, keyword]);

    // Cari di tabel khasiat
    const [khasiat] = await db.query(`
      SELECT id_khasiat AS id, khasiat AS nama, ket_khasiat AS deskripsi,
             'khasiat' AS tipe
      FROM khasiat
      WHERE khasiat LIKE ? OR ket_khasiat LIKE ?
      LIMIT 20
    `, [keyword, keyword]);

    // Cari jamu berdasarkan khasiat
    const [byKhasiat] = await db.query(`
      SELECT j.id_jamu AS id, j.nama_jamu AS nama, kh.khasiat AS deskripsi,
             'jamu' AS tipe
      FROM khasiat_jamu kj
      JOIN khasiat kh ON kj.id_khasiat = kh.id_khasiat
      JOIN jamu j ON kj.id_jamu = j.id_jamu
      WHERE kh.khasiat LIKE ?
      LIMIT 20
    `, [keyword]);

    // Cari jamu berdasarkan kandungan rempah
    const [byRempah] = await db.query(`
      SELECT DISTINCT j.id_jamu AS id, j.nama_jamu AS nama,
             r.nama_rempah AS deskripsi, 'jamu' AS tipe
      FROM komposisi k
      JOIN rempah r ON k.id_rempah = r.id_rempah
      JOIN jamu j ON k.id_jamu = j.id_jamu
      WHERE r.nama_rempah LIKE ?
      LIMIT 20
    `, [keyword]);

    res.json({
      query: q,
      results: {
        jamu,
        rempah,
        khasiat,
        byKhasiat,
        byRempah,
      },
      total: jamu.length + rempah.length + khasiat.length + byKhasiat.length + byRempah.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
