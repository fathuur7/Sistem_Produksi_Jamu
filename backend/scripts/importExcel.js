/**
 * Script Import Data Excel ke MySQL
 * File: backend/scripts/importExcel.js
 *
 * Cara pakai:
 *   node backend/scripts/importExcel.js
 *
 * Pastikan:
 *   1. File jamu206.xlsx ada di root project (sejajar folder backend/)
 *   2. Database `jamu` sudah diimport dari jamu.sql (schema minimal 7 tabel)
 *   3. File backend/.env sudah dikonfigurasi
 *   4. Minimal ada 1 user (jalankan: node scripts/seedJamuDb.js)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const XLSX = require('xlsx');
const mysql = require('mysql2/promise');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, '../../jamu206.xlsx');

function normalizeText(value) {
  return (value ?? '').toString().trim();
}

function normalizeKey(value) {
  return normalizeText(value).toLowerCase();
}

function truncate(value, maxLen) {
  const s = normalizeText(value);
  if (!s) return null;
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

async function getMaxId(conn, table, idColumn) {
  if (!/^[a-zA-Z0-9_]+$/.test(table) || !/^[a-zA-Z0-9_]+$/.test(idColumn)) {
    throw new Error('Invalid identifier');
  }
  const [rows] = await conn.query(
    'SELECT COALESCE(MAX(`' + idColumn + '`), 0) AS maxId FROM `' + table + '`'
  );
  return rows[0].maxId;
}

function splitParts(value) {
  const raw = normalizeText(value);
  if (!raw) return [];
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'jamu',
  });

  console.log('✅ Terhubung ke database:', process.env.DB_NAME || 'jamu');

  try {
    const [userRows] = await conn.query('SELECT id_user FROM user ORDER BY id_user ASC LIMIT 1');
    if (!userRows.length) {
      throw new Error('Tabel `user` masih kosong. Jalankan dulu: node scripts/seedJamuDb.js');
    }
    const defaultUserId = userRows[0].id_user;

    const wb = XLSX.readFile(EXCEL_PATH);
    console.log('📂 Sheet ditemukan:', wb.SheetNames.join(', '));

    const allRows = [];
    for (const sheetName of wb.SheetNames) {
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: null });
      for (const row of rows) {
        allRows.push({ ...row, _sheet: sheetName });
      }
    }
    console.log(`📊 Total baris data: ${allRows.length}`);

    // Preload existing master data
    const [rempahRows] = await conn.query('SELECT id_rempah, nama_rempah FROM rempah');
    const rempahMap = new Map(rempahRows.map((r) => [normalizeKey(r.nama_rempah), r.id_rempah]));

    const [khasiatRows] = await conn.query('SELECT id_khasiat, khasiat FROM khasiat');
    const khasiatMap = new Map(khasiatRows.map((k) => [normalizeKey(k.khasiat), k.id_khasiat]));

    const [jamuRows] = await conn.query('SELECT id_jamu, nama_jamu FROM jamu');
    const jamuMap = new Map(jamuRows.map((j) => [normalizeKey(j.nama_jamu), j.id_jamu]));

    const [komposisiRows] = await conn.query('SELECT id_jamu, id_rempah FROM komposisi');
    const komposisiPairs = new Set(komposisiRows.map((r) => `${r.id_jamu}:${r.id_rempah}`));

    const [khasiatJamuRows] = await conn.query('SELECT id_jamu, id_khasiat FROM khasiat_jamu');
    const khasiatJamuPairs = new Set(khasiatJamuRows.map((r) => `${r.id_jamu}:${r.id_khasiat}`));

    // Next IDs (schema `jamu` saat ini: PK bukan AUTO_INCREMENT)
    let nextRempahId = (await getMaxId(conn, 'rempah', 'id_rempah')) + 1;
    let nextKhasiatId = (await getMaxId(conn, 'khasiat', 'id_khasiat')) + 1;
    let nextJamuId = (await getMaxId(conn, 'jamu', 'id_jamu')) + 1;
    let nextKomposisiId = (await getMaxId(conn, 'komposisi', 'id_komposisi')) + 1;
    let nextKhasiatJamuId = (await getMaxId(conn, 'khasiat_jamu', 'id_khasiatjamu')) + 1;

    // 1) Insert missing rempah from KANDUNGAN
    const rempahSet = new Set();
    for (const row of allRows) {
      for (const part of splitParts(row['KANDUNGAN'])) {
        const nama = truncate(part, 50);
        if (!nama) continue;
        rempahSet.add(normalizeKey(nama));
      }
    }

    let rempahInserted = 0;
    for (const key of rempahSet) {
      if (rempahMap.has(key)) continue;
      const nama = truncate(key, 50);
      await conn.query(
        'INSERT INTO rempah (id_rempah, nama_rempah, ket_rempah) VALUES (?, ?, ?)',
        [nextRempahId, nama, null]
      );
      rempahMap.set(key, nextRempahId);
      nextRempahId += 1;
      rempahInserted += 1;
    }
    console.log(`🌿 Rempah baru dimasukkan: ${rempahInserted}`);

    // 2) Insert missing khasiat from KHASIAT
    const khasiatSet = new Set();
    for (const row of allRows) {
      const teks = truncate(row['KHASIAT'], 100);
      if (!teks) continue;
      khasiatSet.add(normalizeKey(teks));
    }

    let khasiatInserted = 0;
    for (const key of khasiatSet) {
      if (khasiatMap.has(key)) continue;
      const teks = truncate(key, 100);
      await conn.query(
        'INSERT INTO khasiat (id_khasiat, khasiat, ket_khasiat) VALUES (?, ?, ?)',
        [nextKhasiatId, teks, null]
      );
      khasiatMap.set(key, nextKhasiatId);
      nextKhasiatId += 1;
      khasiatInserted += 1;
    }
    console.log(`💊 Khasiat baru dimasukkan: ${khasiatInserted}`);

    // 3) Insert/relate jamu, komposisi, khasiat_jamu
    let jamuInserted = 0;
    let komposisiInserted = 0;
    let khasiatJamuInserted = 0;

    await conn.beginTransaction();
    for (const row of allRows) {
      const namaJamu = truncate(row['NAMA JAMU'], 50);
      if (!namaJamu) continue;

      const jamuKey = normalizeKey(namaJamu);
      let jamuId = jamuMap.get(jamuKey);

      if (!jamuId) {
        const ketJamu = truncate(row['KHASIAT'], 100);
        jamuId = nextJamuId;
        await conn.query(
          'INSERT INTO jamu (id_jamu, id_user, nama_jamu, ket_jamu) VALUES (?, ?, ?, ?)',
          [jamuId, defaultUserId, namaJamu, ketJamu]
        );
        jamuMap.set(jamuKey, jamuId);
        nextJamuId += 1;
        jamuInserted += 1;
      }

      // komposisi (rempah)
      for (const part of splitParts(row['KANDUNGAN'])) {
        const nama = truncate(part, 50);
        if (!nama) continue;
        const rempahId = rempahMap.get(normalizeKey(nama));
        if (!rempahId) continue;

        const pairKey = `${jamuId}:${rempahId}`;
        if (komposisiPairs.has(pairKey)) continue;

        await conn.query(
          'INSERT INTO komposisi (id_komposisi, id_rempah, id_jamu, banyak_rempah) VALUES (?, ?, ?, ?)',
          [nextKomposisiId, rempahId, jamuId, null]
        );
        komposisiPairs.add(pairKey);
        nextKomposisiId += 1;
        komposisiInserted += 1;
      }

      // khasiat_jamu
      {
        const teks = truncate(row['KHASIAT'], 100);
        if (teks) {
          const khId = khasiatMap.get(normalizeKey(teks));
          if (khId) {
            const pairKey = `${jamuId}:${khId}`;
            if (!khasiatJamuPairs.has(pairKey)) {
              await conn.query(
                'INSERT INTO khasiat_jamu (id_khasiatjamu, id_khasiat, id_jamu) VALUES (?, ?, ?)',
                [nextKhasiatJamuId, khId, jamuId]
              );
              khasiatJamuPairs.add(pairKey);
              nextKhasiatJamuId += 1;
              khasiatJamuInserted += 1;
            }
          }
        }
      }
    }
    await conn.commit();

    console.log('\n✅ Import selesai!');
    console.log(`   Jamu baru dimasukkan      : ${jamuInserted}`);
    console.log(`   Komposisi baru dimasukkan : ${komposisiInserted}`);
    console.log(`   Relasi khasiat baru       : ${khasiatJamuInserted}`);
  } catch (err) {
    try {
      await conn.rollback();
    } catch {
      // ignore
    }
    console.error('❌ Error:', err.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
    console.log('\n🔌 Koneksi database ditutup.');
  }
}

main();
