"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class DesignationDivision extends Model {
    static associate(models) {
      // No need to define associations here if used as a junction table
    }
  }

  DesignationDivision.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      designation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      division_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      modelName: "DesignationDivision",
      tableName: "designation_division",
      schema: process.env.DB_SCHEMA || "public",
      timestamps: false,
    }
  );

    DesignationDivision.associate = (models) => {
        DesignationDivision.belongsTo(models.Department, {
        foreignKey: "designation_id",
        as: "designation_id_reference",
        });
        DesignationDivision.belongsTo(models.Division, {
        foreignKey: "division_id",
        as: "designation_division",
        });
    };

  return DesignationDivision;
};
