const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

// GET /api/jamu - list jamu dengan filter opsional
// Query params: ?search=kunyit&khasiat=stamina&rempah=jahe
router.get('/', async (req, res) => {
  try {
    const { search, khasiat, rempah } = req.query;
    let sql = `
      SELECT DISTINCT j.id_jamu, j.nama_jamu, j.ket_jamu,
             NULL AS jenis,
             NULL AS perizinan,
             NULL AS produsen,
             u.username AS pembuat
      FROM jamu j
      LEFT JOIN user u ON j.id_user = u.id_user
    `;
    const params = [];
    const conditions = [];
    if (search) {
      conditions.push('(j.nama_jamu LIKE ? OR j.ket_jamu LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (khasiat) {
      sql += ' LEFT JOIN khasiat_jamu kj ON j.id_jamu = kj.id_jamu LEFT JOIN khasiat kh ON kj.id_khasiat = kh.id_khasiat';
      conditions.push('kh.khasiat LIKE ?');
      params.push(`%${khasiat}%`);
    }
    if (rempah) {
      sql += ' LEFT JOIN komposisi ko ON j.id_jamu = ko.id_jamu LEFT JOIN rempah r ON ko.id_rempah = r.id_rempah';
      conditions.push('r.nama_rempah LIKE ?');
      params.push(`%${rempah}%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY j.nama_jamu ASC';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/jamu/:id - detail lengkap dengan komposisi & khasiat
router.get('/:id', async (req, res) => {
  try {
    const [jamu] = await db.query(`
      SELECT j.id_jamu, j.nama_jamu, j.ket_jamu,
             NULL AS jenis,
             NULL AS perizinan,
             NULL AS produsen,
             u.username AS pembuat
      FROM jamu j
      LEFT JOIN user u ON j.id_user = u.id_user
      WHERE j.id_jamu = ?
    `, [req.params.id]);
    if (!jamu.length) return res.status(404).json({ message: 'Jamu tidak ditemukan' });

    const [komposisi] = await db.query(`
      SELECT r.id_rempah, r.nama_rempah, k.banyak_rempah
      FROM komposisi k
      JOIN rempah r ON k.id_rempah = r.id_rempah
      WHERE k.id_jamu = ?
    `, [req.params.id]);

    const [khasiat] = await db.query(`
      SELECT kh.id_khasiat, kh.khasiat, kh.ket_khasiat
      FROM khasiat_jamu kj
      JOIN khasiat kh ON kj.id_khasiat = kh.id_khasiat
      WHERE kj.id_jamu = ?
    `, [req.params.id]);

    res.json({ ...jamu[0], komposisi, khasiat });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/jamu
router.post('/', authenticate, async (req, res) => {
  const { nama_jamu, ket_jamu, komposisi = [], khasiat = [] } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [[{ nextJamuId }]] = await conn.query(
      'SELECT COALESCE(MAX(id_jamu), 0) + 1 AS nextJamuId FROM jamu'
    );

    await conn.query(
      'INSERT INTO jamu (id_jamu, id_user, nama_jamu, ket_jamu) VALUES (?, ?, ?, ?)',
      [nextJamuId, req.user.id_user, nama_jamu ?? null, ket_jamu ?? null]
    );

    // Generate ID untuk komposisi dan khasiat_jamu karena PK tidak auto-increment
    const [[{ nextKomposisiId }]] = await conn.query(
      'SELECT COALESCE(MAX(id_komposisi), 0) + 1 AS nextKomposisiId FROM komposisi'
    );
    const [[{ nextKhasiatJamuId }]] = await conn.query(
      'SELECT COALESCE(MAX(id_khasiatjamu), 0) + 1 AS nextKhasiatJamuId FROM khasiat_jamu'
    );

    let komposisiId = nextKomposisiId;
    let khasiatJamuId = nextKhasiatJamuId;

    for (const k of komposisi) {
      await conn.query(
        'INSERT INTO komposisi (id_komposisi, id_rempah, id_jamu, banyak_rempah) VALUES (?, ?, ?, ?)',
        [komposisiId++, k.id_rempah, nextJamuId, k.banyak_rempah ?? null]
      );
    }
    for (const kh of khasiat) {
      await conn.query(
        'INSERT INTO khasiat_jamu (id_khasiatjamu, id_khasiat, id_jamu) VALUES (?, ?, ?)',
        [khasiatJamuId++, kh.id_khasiat, nextJamuId]
      );
    }

    await conn.commit();
    res.status(201).json({ id_jamu: nextJamuId, nama_jamu: nama_jamu ?? null, ket_jamu: ket_jamu ?? null });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
});

// PUT /api/jamu/:id
router.put('/:id', authenticate, async (req, res) => {
  const { nama_jamu, ket_jamu } = req.body;
  try {
    await db.query('UPDATE jamu SET nama_jamu = ?, ket_jamu = ? WHERE id_jamu = ?', [nama_jamu, ket_jamu, req.params.id]);
    res.json({ message: 'Jamu diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/jamu/:id
router.delete('/:id', authenticate, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM komposisi WHERE id_jamu = ?', [req.params.id]);
    await conn.query('DELETE FROM khasiat_jamu WHERE id_jamu = ?', [req.params.id]);
    await conn.query('DELETE FROM jamu WHERE id_jamu = ?', [req.params.id]);
    await conn.commit();
    res.json({ message: 'Jamu dihapus' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
