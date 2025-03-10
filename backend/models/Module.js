'use strict';
module.exports = (sequelize, DataTypes) => {
  const Module = sequelize.define('Module', {
    module_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ui_name: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'module',
    timestamps: false
  });

  return Module;
}; 