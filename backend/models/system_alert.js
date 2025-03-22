'use strict';

module.exports = (sequelize, DataTypes) => {
  const System_Alerts = sequelize.define('System_Alerts', {
    system_alert_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    module_name: {
      type: DataTypes.TEXT,
      allowNull: false,  // Required field
      index: true, // Index for performance optimization
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true,  // Optional field
    },
    alert_message: {
      type: DataTypes.TEXT,
      allowNull: false,  // Required field
    },
    alert_type: {
      type: DataTypes.TEXT,
      allowNull: false,  // Required field
    },
    alert_status: {
      type: DataTypes.TEXT,
      allowNull: false,  // Required field
      defaultValue: 'pending', // Default status for new alerts
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,  // Required field
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    transaction_id: {
      type: DataTypes.STRING,
      allowNull: true,  // Optional field
    },
  }, {
    tableName: 'system_alerts', // Specifies the table name
    timestamps: true,  // Sequelize will handle createdAt and updatedAt automatically
    createdAt: 'created_at',  // Custom name for createdAt field
    updatedAt: false, // If you don't want to automatically update the updatedAt field
    underscored: true,  // Ensures snake_case column naming (e.g., created_at, updated_at)
  });

  System_Alerts.associate = (models) => {
    System_Alerts.hasMany(models.Users, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return System_Alerts;
};