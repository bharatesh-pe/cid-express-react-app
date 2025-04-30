"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Designation extends Model {
    static associate(models) {
      Designation.belongsTo(models.Department, {
        foreignKey: "department_id",
        as: "designation_department",
      });

      Designation.belongsToMany(models.Division, {
        through: models.DesignationDivision,
        foreignKey: "designation_id",
        otherKey: "division_id",
        as: "divisions", // Used in includes
      });
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
      department_id: {
        type: DataTypes.INTEGER,
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
