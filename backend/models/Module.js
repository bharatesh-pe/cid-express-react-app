"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Module extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  Module.init(
    {
      module_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ui_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      active_location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_main_module: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      sub_modules: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_sub_module: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      }, order: {  // <-- Added this field
        type: DataTypes.INTEGER,
        allowNull: true, // Change to false if required
      },
      icon_svg: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Module",
      tableName: "module",
      schema: process.env.DB_SCHEMA || "public",
      timestamps: false,
    }
  );

  return Module;
};
