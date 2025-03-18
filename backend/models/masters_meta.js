'use strict';

module.exports = (sequelize, DataTypes) => {
  const MastersMeta = sequelize.define('MastersMeta', {
    masters_meta_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    tableName: 'masters_meta',
    timestamps: false,
    underscored: true
  });

  return MastersMeta;
};