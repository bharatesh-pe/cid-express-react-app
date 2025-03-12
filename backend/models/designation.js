"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Designation extends Model {
    static associate(models) {
      // If there are any associations, define them here
      // Example: this.hasMany(models.UserDesignation, { foreignKey: "designation_id" });
    }
  }

  Designation.init(
    {
      designation_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      designation_name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Designation",
      tableName: "designation",
      schema: process.env.DB_SCHEMA || "public",
      timestamps: false,
    }
  );

  return Designation;
};

