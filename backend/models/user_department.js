"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserDepartment extends Model {
    static associate(models) {
      UserDepartment.belongsTo(models.Users, { foreignKey: "user_id", as: "user" });
      UserDepartment.belongsTo(models.Department, { foreignKey: "department_id", as: "department" });
      UserDepartment.belongsTo(models.Users, { foreignKey: "created_by", as: "creator" });
    }
  }

  UserDepartment.init(
    {
      user_department_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
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
      modelName: "UserDepartment",
      tableName: "user_department",
      timestamps: false, // If using created_at manually
    }
  );

  return UserDepartment;
};
