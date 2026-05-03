const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

function looksLikeBcryptHash(value) {
  return typeof value === 'string' && value.startsWith('$2') && value.length >= 50;
}

// POST /api/auth/login
// Menerima email atau username
router.post('/login', async (req, res) => {
  const { email, username, password } = req.body;
  const loginIdentifier = email || username; // Terima email atau username
  
  if (!loginIdentifier || !password) {
    return res.status(400).json({ message: 'Email/username dan password wajib diisi' });
  }

  try {
    // Cari user berdasarkan email ATAU username
    const [rows] = await db.query(
      'SELECT * FROM user WHERE email = ? OR username = ?',
      [loginIdentifier, loginIdentifier]
    );
    
    if (!rows.length) {
      return res.status(401).json({ message: 'Email/username atau password salah' });
    }

    const user = rows[0];
    const storedPw = user.pw ?? '';

    let valid = false;
    if (looksLikeBcryptHash(storedPw)) {
      try {
        valid = await bcrypt.compare(password, storedPw);
      } catch {
        valid = false;
      }
    } else {
      // Schema DB `jamu` saat ini memakai `pw` varchar(30) sehingga biasanya plaintext.
      valid = password === storedPw;
    }

    if (!valid) {
      return res.status(401).json({ message: 'Email/username atau password salah' });
    }

    const token = jwt.sign(
      { id_user: user.id_user, username: user.username, email: user.email, id_kota: user.id_kota },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    res.json({ 
      token, 
      user: { 
        id_user: user.id_user, 
        username: user.username, 
        email: user.email, 
        id_kota: user.id_kota ?? null
      } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { id_kota, username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, dan password wajib diisi' });
  }
  try {
    if (String(password).length > 30) {
      return res.status(400).json({ message: 'Password maksimal 30 karakter' });
    }

    const [[{ nextId }]] = await db.query(
      'SELECT COALESCE(MAX(id_user), 0) + 1 AS nextId FROM user'
    );

    // DB `jamu` (schema saat ini) memakai `pw` varchar(30) → simpan plaintext.
    const [result] = await db.query(
      'INSERT INTO user (id_user, id_kota, username, email, pw) VALUES (?, ?, ?, ?, ?)',
      [nextId, id_kota || null, username, email, String(password)]
    );
    res.status(201).json({
      message: 'Registrasi berhasil',
      data: { id_user: result.insertId || nextId, username, email, id_kota: id_kota || null }
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Username atau email sudah digunakan' });
    }
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
