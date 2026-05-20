const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Jamu = sequelize.define('Jamu', {
  id_jamu:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_user:         { type: DataTypes.INTEGER },
  id_produsen:     { type: DataTypes.INTEGER },
  nama_jamu:       { type: DataTypes.STRING(150), allowNull: false },
  ket_jamu:        { type: DataTypes.TEXT },
  jenis:           { type: DataTypes.STRING(50) },
  perizinan:       { type: DataTypes.STRING(100) },
  aturan_pakai:    { type: DataTypes.TEXT },
  kandungan:       { type: DataTypes.TEXT },
  lokasi_produksi: { type: DataTypes.STRING(255) },
  target_output:   { type: DataTypes.INTEGER },
  satuan_output:   { type: DataTypes.STRING(50) },
}, {
  tableName: 'jamu',
  timestamps: false,
});

module.exports = Jamu;
