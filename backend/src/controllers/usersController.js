const bcrypt = require('bcryptjs');
const { User, Kota } = require('../models');

const VALID_ROLES = ['admin', 'supervisor', 'staff'];

function parseIdKota(value) {
  if (value === undefined || value === null || value === '') {
    return { value: null };
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return { error: 'Kota tidak valid' };
  }

  return { value: parsed };
}

function validateUserPayload(body, { requirePassword = false } = {}) {
  const username = body.username?.trim();
  const email = body.email?.trim().toLowerCase();
  const role = body.role;
  const password = body.password?.trim();
  const idKota = parseIdKota(body.id_kota);

  if (!username) {
    return { error: 'Username wajib diisi' };
  }

  if (!email) {
    return { error: 'Email wajib diisi' };
  }

  if (!role || !VALID_ROLES.includes(role)) {
    return { error: 'Role pengguna tidak valid' };
  }

  if (idKota.error) {
    return { error: idKota.error };
  }

  if (requirePassword) {
    if (!password) {
      return { error: 'Password wajib diisi' };
    }

    if (password.length < 6) {
      return { error: 'Password minimal 6 karakter' };
    }
  }

  return {
    data: {
      username,
      email,
      role,
      id_kota: idKota.value,
      password,
    },
  };
}

// GET /api/users - list semua user
const getAll = async (req, res) => {
  try {
    const rows = await User.findAll({
      attributes: ['id_user', 'id_kota', 'username', 'email', 'role', 'created_at'],
      include: [{ model: Kota, as: 'kota', attributes: ['nama_kota'] }],
      order: [['created_at', 'DESC']],
    });
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/me - profil user yang sedang login
const getMe = async (req, res) => {
  try {
    const row = await User.findByPk(req.user.id_user, {
      attributes: ['id_user', 'id_kota', 'username', 'email', 'role'],
      include: [{ model: Kota, as: 'kota', attributes: ['nama_kota'] }],
    });
    if (!row) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json({ data: row });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/:id
const getById = async (req, res) => {
  try {
    const row = await User.findByPk(req.params.id, {
      attributes: ['id_user', 'id_kota', 'username', 'email', 'role', 'created_at'],
      include: [{ model: Kota, as: 'kota', attributes: ['nama_kota'] }],
    });
    if (!row) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json({ data: row });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users - tambah user baru
const create = async (req, res) => {
  const validation = validateUserPayload(req.body, { requirePassword: true });

  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  try {
    const hashed = await bcrypt.hash(validation.data.password, 10);
    const user = await User.create({
      username: validation.data.username,
      email: validation.data.email,
      role: validation.data.role,
      id_kota: validation.data.id_kota,
      pw: hashed,
    });

    res.status(201).json({
      message: 'User ditambahkan',
      data: {
        id_user: user.id_user,
        id_kota: user.id_kota,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Username atau email sudah digunakan' });
    }

    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/:id - update profil / role
const update = async (req, res) => {
  const validation = validateUserPayload(req.body);

  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    await User.update(
      {
        username: validation.data.username,
        email: validation.data.email,
        role: validation.data.role,
        id_kota: validation.data.id_kota,
      },
      { where: { id_user: req.params.id } }
    );

    res.json({ message: 'User diperbarui' });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Username atau email sudah digunakan' });
    }

    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/:id/password - ganti password
const updatePassword = async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password minimal 6 karakter' });
  }
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.update({ pw: hashed }, { where: { id_user: req.params.id } });
    res.json({ message: 'Password diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/:id
const remove = async (req, res) => {
  try {
    if (req.user?.id_user === Number(req.params.id)) {
      return res.status(400).json({ message: 'Akun yang sedang dipakai tidak bisa dihapus' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    await User.destroy({ where: { id_user: req.params.id } });
    res.json({ message: 'User dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { create, getAll, getMe, getById, update, updatePassword, remove };
