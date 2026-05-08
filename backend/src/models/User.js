const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id_user:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_kota:    { type: DataTypes.INTEGER },
  username:   { type: DataTypes.STRING(50), allowNull: false, unique: true },
  email:      { type: DataTypes.STRING(100), allowNull: false, unique: true },
  pw:         { type: DataTypes.STRING(255), allowNull: false },
  role:       { type: DataTypes.ENUM('admin', 'supervisor', 'staff'), defaultValue: 'staff' },
  created_at: { type: DataTypes.DATE },
}, {
  tableName: 'user',
  timestamps: false,
});

module.exports = User;
