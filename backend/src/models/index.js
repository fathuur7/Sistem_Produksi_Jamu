const sequelize = require('../config/db');

const Kota       = require('./Kota');
const User       = require('./User');
const Bahan      = require('./Bahan');
const Rempah     = require('./Rempah');
const Khasiat    = require('./Khasiat');
const Produsen   = require('./Produsen');
const Jamu       = require('./Jamu');
const Komposisi  = require('./Komposisi');
const KhasiatJamu= require('./KhasiatJamu');
const Produksi   = require('./Produksi');

// ── Asosiasi ──────────────────────────────────────────────────

// User ↔ Kota
User.belongsTo(Kota, { foreignKey: 'id_kota', as: 'kota' });
Kota.hasMany(User,   { foreignKey: 'id_kota' });

// Jamu ↔ User (pembuat)
Jamu.belongsTo(User,     { foreignKey: 'id_user',     as: 'pembuat' });
User.hasMany(Jamu,       { foreignKey: 'id_user' });

// Jamu ↔ Produsen
Jamu.belongsTo(Produsen, { foreignKey: 'id_produsen', as: 'produsen' });
Produsen.hasMany(Jamu,   { foreignKey: 'id_produsen' });

// Jamu ↔ Bahan (many-to-many via komposisi)
Jamu.belongsToMany(Bahan, {
  through: Komposisi,
  foreignKey: 'id_jamu',
  otherKey: 'id_bahan',
  as: 'komposisi',
});
Bahan.belongsToMany(Jamu, {
  through: Komposisi,
  foreignKey: 'id_bahan',
  otherKey: 'id_jamu',
});

// Jamu ↔ Khasiat (many-to-many via khasiat_jamu)
Jamu.belongsToMany(Khasiat, {
  through: KhasiatJamu,
  foreignKey: 'id_jamu',
  otherKey: 'id_khasiat',
  as: 'khasiat',
});
Khasiat.belongsToMany(Jamu, {
  through: KhasiatJamu,
  foreignKey: 'id_khasiat',
  otherKey: 'id_jamu',
});

// Produksi ↔ Jamu & User
Produksi.belongsTo(Jamu, { foreignKey: 'id_jamu', as: 'jamu' });
Produksi.belongsTo(User, { foreignKey: 'id_user', as: 'operator' });
Jamu.hasMany(Produksi,   { foreignKey: 'id_jamu' });
User.hasMany(Produksi,   { foreignKey: 'id_user' });

module.exports = {
  sequelize,
  Kota,
  User,
  Bahan,
  Rempah,
  Khasiat,
  Produsen,
  Jamu,
  Komposisi,
  KhasiatJamu,
  Produksi,
};
