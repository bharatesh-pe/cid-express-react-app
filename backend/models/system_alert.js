"use strict";

module.exports = (sequelize, DataTypes) => {
  const System_Alerts = sequelize.define(
    "System_Alerts",
    {
      system_alert_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      approval_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "ui_case_approvals", // Table name, not model name
          key: "id", // Adjust if the primary key is named differently
        },
      },
      reference_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      alert_message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      alert_type: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      alert_status: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "Pending",
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "system_alerts",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      underscored: true,
    }
  );

  System_Alerts.associate = (models) => {
    System_Alerts.belongsTo(models.Users, {
      foreignKey: "created_by",
      as: "user",
    });

    System_Alerts.belongsTo(models.UiCaseApproval, {
      foreignKey: "approval_id",
      as: "approval",
    });
  };

  return System_Alerts;
};
