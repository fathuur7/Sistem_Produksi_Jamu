const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Tabel komposisi: menghubungkan Jamu dengan Bahan dan takaran kebutuhan
const Komposisi = sequelize.define('Komposisi', {
  id_komposisi:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_jamu:          { type: DataTypes.INTEGER, allowNull: false },
  id_bahan:         { type: DataTypes.INTEGER, allowNull: false },
  kebutuhan:        { type: DataTypes.DECIMAL(10, 2), allowNull: false, comment: 'Takaran angka pasti, misal: 2.50' },
  satuan_kebutuhan: { type: DataTypes.STRING(50), allowNull: false, comment: 'kg, gram, pcs, lembar, ml' },
}, {
  tableName: 'komposisi',
  timestamps: false,
});

module.exports = Komposisi;
