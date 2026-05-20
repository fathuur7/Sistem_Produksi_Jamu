const { Jamu, User, Produsen, Rempah, Khasiat, Komposisi, KhasiatJamu } = require('../models');
const { Op } = require('sequelize');

// GET /api/jamu - list jamu dengan filter opsional
const getAll = async (req, res) => {
  try {
    const { jenis, search } = req.query;
    const where = {};

    if (jenis) where.jenis = jenis;
    if (search) {
      where[Op.or] = [
        { nama_jamu: { [Op.like]: `%${search}%` } },
        { ket_jamu:  { [Op.like]: `%${search}%` } },
      ];
    }

    const rows = await Jamu.findAll({
      where,
      attributes: ['id_jamu', 'nama_jamu', 'ket_jamu', 'jenis', 'perizinan'],
      include: [
        { model: User,     as: 'pembuat',  attributes: ['username'] },
        { model: Produsen, as: 'produsen', attributes: ['nama_produsen'] },
      ],
      order: [['nama_jamu', 'ASC']],
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/jamu/:id - detail lengkap dengan komposisi & khasiat
const getById = async (req, res) => {
  try {
    const jamu = await Jamu.findByPk(req.params.id, {
      attributes: ['id_jamu', 'nama_jamu', 'ket_jamu', 'jenis', 'perizinan'],
      include: [
        { model: User, as: 'pembuat', attributes: ['username'] },
        { model: Produsen, as: 'produsen', attributes: ['nama_produsen', 'alamat', 'kota', 'kontak', 'email', 'status'] },
        {
          model: Rempah,
          as: 'komposisi',
          attributes: ['id_rempah', 'nama_rempah'],
          through: { attributes: ['banyak_rempah'] },
        },
        {
          model: Khasiat,
          as: 'khasiat',
          attributes: ['id_khasiat', 'khasiat', 'ket_khasiat'],
          through: { attributes: [] },
        },
      ],
    });
    if (!jamu) return res.status(404).json({ message: 'Jamu tidak ditemukan' });
    const json = jamu.toJSON();
    if (Array.isArray(json.komposisi)) {
      json.komposisi = json.komposisi.map((item) => ({
        id_rempah: item.id_rempah,
        nama_rempah: item.nama_rempah,
        banyak_rempah: item?.Komposisi?.banyak_rempah ?? null,
      }));
    }
    res.json(json);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/jamu
const create = async (req, res) => {
  const { nama_jamu, ket_jamu, komposisi = [], khasiat = [] } = req.body;
  const t = await Jamu.sequelize.transaction();
  try {
    const jamu = await Jamu.create(
      { id_user: req.user.id_user, nama_jamu, ket_jamu },
      { transaction: t }
    );

    for (const k of komposisi) {
      await Komposisi.create(
        { id_rempah: k.id_rempah, id_jamu: jamu.id_jamu, banyak_rempah: k.banyak_rempah },
        { transaction: t }
      );
    }
    for (const kh of khasiat) {
      await KhasiatJamu.create(
        { id_khasiat: kh.id_khasiat, id_jamu: jamu.id_jamu },
        { transaction: t }
      );
    }

    await t.commit();
    res.status(201).json({ id_jamu: jamu.id_jamu, nama_jamu, ket_jamu });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/jamu/:id
const update = async (req, res) => {
  const { nama_jamu, ket_jamu } = req.body;
  try {
    await Jamu.update({ nama_jamu, ket_jamu }, { where: { id_jamu: req.params.id } });
    res.json({ message: 'Jamu diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/jamu/:id
const remove = async (req, res) => {
  const t = await Jamu.sequelize.transaction();
  try {
    await Komposisi.destroy(  { where: { id_jamu: req.params.id }, transaction: t });
    await KhasiatJamu.destroy({ where: { id_jamu: req.params.id }, transaction: t });
    await Jamu.destroy(       { where: { id_jamu: req.params.id }, transaction: t });
    await t.commit();
    res.json({ message: 'Jamu dihapus' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
