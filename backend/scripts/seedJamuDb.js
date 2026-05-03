const path = require('path');

// Ensure env is loaded even when running from repo root
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const db = require('../src/config/db');

async function getNextId(conn, table, idColumn) {
  // table/idColumn berasal dari kode (bukan input user), tapi tetap kita batasi agar aman.
  if (!/^[a-zA-Z0-9_]+$/.test(table) || !/^[a-zA-Z0-9_]+$/.test(idColumn)) {
    throw new Error('Invalid identifier');
  }

  const sql =
    'SELECT COALESCE(MAX(' + idColumn + '), 0) + 1 AS nextId FROM `' + table + '`';

  const [rows] = await conn.query(sql);
  return rows[0].nextId;
}

async function main() {
  const conn = await db.getConnection();

  const ADMIN_EMAIL = 'admin@penjamuhandal.id';
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'admin123'; // <= 30 chars, cocok dengan kolom `pw` varchar(30)

  try {
    await conn.beginTransaction();

    // 1) kota
    let kotaId;
    {
      const [existing] = await conn.query('SELECT id_kota FROM kota ORDER BY id_kota ASC LIMIT 1');
      if (existing.length) {
        kotaId = existing[0].id_kota;
      } else {
        kotaId = await getNextId(conn, 'kota', 'id_kota');
        await conn.query(
          'INSERT INTO kota (id_kota, nama_kota, ket_kota) VALUES (?, ?, ?)',
          [kotaId, 'Sampang', 'Kabupaten Sampang, Madura']
        );
      }
    }

    // 2) user (admin)
    let userId;
    {
      const [existing] = await conn.query('SELECT id_user FROM user WHERE email = ? LIMIT 1', [ADMIN_EMAIL]);
      if (existing.length) {
        userId = existing[0].id_user;
        await conn.query(
          'UPDATE user SET username = ?, pw = ?, id_kota = ? WHERE id_user = ?',
          [ADMIN_USERNAME, ADMIN_PASSWORD, kotaId, userId]
        );
      } else {
        userId = await getNextId(conn, 'user', 'id_user');
        await conn.query(
          'INSERT INTO user (id_user, id_kota, username, email, pw) VALUES (?, ?, ?, ?, ?)',
          [userId, kotaId, ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD]
        );
      }
    }

    // 3) rempah
    let rempahId;
    {
      const [existing] = await conn.query('SELECT id_rempah FROM rempah ORDER BY id_rempah ASC LIMIT 1');
      if (existing.length) {
        rempahId = existing[0].id_rempah;
      } else {
        rempahId = await getNextId(conn, 'rempah', 'id_rempah');
        await conn.query(
          'INSERT INTO rempah (id_rempah, nama_rempah, ket_rempah) VALUES (?, ?, ?)',
          [rempahId, 'Kunyit', 'Rempah untuk formula jamu']
        );
      }
    }

    // 4) khasiat
    let khasiatId;
    {
      const [existing] = await conn.query('SELECT id_khasiat FROM khasiat ORDER BY id_khasiat ASC LIMIT 1');
      if (existing.length) {
        khasiatId = existing[0].id_khasiat;
      } else {
        khasiatId = await getNextId(conn, 'khasiat', 'id_khasiat');
        await conn.query(
          'INSERT INTO khasiat (id_khasiat, khasiat, ket_khasiat) VALUES (?, ?, ?)',
          [khasiatId, 'Menambah stamina', 'Membantu menjaga daya tahan tubuh']
        );
      }
    }

    // 5) jamu
    let jamuId;
    {
      const [existing] = await conn.query('SELECT id_jamu FROM jamu ORDER BY id_jamu ASC LIMIT 1');
      if (existing.length) {
        jamuId = existing[0].id_jamu;
      } else {
        jamuId = await getNextId(conn, 'jamu', 'id_jamu');
        await conn.query(
          'INSERT INTO jamu (id_jamu, id_user, nama_jamu, ket_jamu) VALUES (?, ?, ?, ?)',
          [jamuId, userId, 'Jamu Kunyit Asam', 'Minuman herbal tradisional berbahan kunyit']
        );
      }
    }

    // 6) komposisi (relasi jamu <-> rempah)
    {
      const [existing] = await conn.query(
        'SELECT id_komposisi FROM komposisi WHERE id_jamu = ? AND id_rempah = ? LIMIT 1',
        [jamuId, rempahId]
      );
      if (!existing.length) {
        const komposisiId = await getNextId(conn, 'komposisi', 'id_komposisi');
        await conn.query(
          'INSERT INTO komposisi (id_komposisi, id_rempah, id_jamu, banyak_rempah) VALUES (?, ?, ?, ?)',
          [komposisiId, rempahId, jamuId, 5]
        );
      }
    }

    // 7) khasiat_jamu (relasi jamu <-> khasiat)
    {
      const [existing] = await conn.query(
        'SELECT id_khasiatjamu FROM khasiat_jamu WHERE id_jamu = ? AND id_khasiat = ? LIMIT 1',
        [jamuId, khasiatId]
      );
      if (!existing.length) {
        const khasiatJamuId = await getNextId(conn, 'khasiat_jamu', 'id_khasiatjamu');
        await conn.query(
          'INSERT INTO khasiat_jamu (id_khasiatjamu, id_khasiat, id_jamu) VALUES (?, ?, ?)',
          [khasiatJamuId, khasiatId, jamuId]
        );
      }
    }

    await conn.commit();

    console.log('Seed selesai (tanpa CREATE/ALTER).');
    console.log('Login credential:');
    console.log(`- email    : ${ADMIN_EMAIL}`);
    console.log(`- username : ${ADMIN_USERNAME}`);
    console.log(`- password : ${ADMIN_PASSWORD}`);
  } catch (err) {
    await conn.rollback();
    console.error('Seed gagal:', err.message);
    process.exitCode = 1;
  } finally {
    conn.release();
    // Close pool so node exits
    await db.end();
  }
}

main();
