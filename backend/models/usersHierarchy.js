"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UsersHierarchy extends Model {
    static associate(models) {
      UsersHierarchy.belongsTo(models.Designation, {
        foreignKey: "supervisor_designation_id",
        as: "supervisorDesignation",
      });

      UsersHierarchy.belongsTo(models.Designation, {
        foreignKey: "officer_designation_id",
        as: "officerDesignation",
      });
    }
  }

  UsersHierarchy.init(
    {
      users_hierarchy_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      supervisor_designation_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      officer_designation_id: {
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
      modelName: "UsersHierarchy",
      tableName: "users_hierarchy",
      schema: process.env.DB_SCHEMA || "public",
      timestamps: false,
    }
  );

  return UsersHierarchy;
};

