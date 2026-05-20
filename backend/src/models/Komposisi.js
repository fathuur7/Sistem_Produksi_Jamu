const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Tabel junction antara Jamu dan Rempah
const Komposisi = sequelize.define('Komposisi', {
  id_komposisi:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_rempah:     { type: DataTypes.INTEGER, allowNull: false },
  id_jamu:       { type: DataTypes.INTEGER, allowNull: false },
  // Di schema MySQL kolom ini VARCHAR(100) (sering berisi "200 gram")
  banyak_rempah: { type: DataTypes.STRING(100) },
}, {
  tableName: 'komposisi',
  timestamps: false,
});

module.exports = Komposisi;
