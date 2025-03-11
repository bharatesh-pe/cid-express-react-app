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
    },
    location: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    active_location: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_main_module : {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_sub_module : {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sub_modules : {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'module',
    timestamps: false
  });

  return Module;
}; 