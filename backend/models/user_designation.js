"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserDesignation extends Model {
    static associate(models) {
      UserDesignation.belongsTo(models.Users, { foreignKey: "user_id", as: "user" });
      UserDesignation.belongsTo(models.Designation, { foreignKey: "designation_id", as: "designation" });
      UserDesignation.belongsTo(models.Users, { foreignKey: "created_by", as: "creator" });
    }
  }

  UserDesignation.init(
    {
      user_designation_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      designation_id: {
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
      modelName: "UserDesignation",
      tableName: "user_designation",
      timestamps: false, // If using created_at manually
    }
  );

  return UserDesignation;
};
