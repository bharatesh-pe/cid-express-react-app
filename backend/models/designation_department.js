"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class DesignationDepartment extends Model {
    static associate(models) {
      // No need to define associations here if used as a junction table
    }
  }

  DesignationDepartment.init(
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
      department_id: {
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
      modelName: "DesignationDepartment",
      tableName: "designation_department",
      schema: process.env.DB_SCHEMA || "public",
      timestamps: false,
    }
  );

    DesignationDepartment.associate = (models) => {
        DesignationDepartment.belongsTo(models.Designation, {
        foreignKey: "designation_id",
        as: "designation_id_reference",
        });
        DesignationDepartment.belongsTo(models.Department, {
        foreignKey: "department_id",
        as: "designation_department",
        });
    };

  return DesignationDepartment;
};
