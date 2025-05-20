'use strict';
module.exports = (sequelize, DataTypes) => {
  const CaseAlerts = sequelize.define('CaseAlerts', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    module: DataTypes.STRING,
    main_table: DataTypes.STRING,
    record_id: DataTypes.INTEGER,
    alert_type: DataTypes.STRING,
    alert_level: DataTypes.STRING,
    alert_message: DataTypes.TEXT,
    due_date: DataTypes.DATE,
    triggered_on: DataTypes.DATE,
    resolved_on: DataTypes.DATE,
    status: DataTypes.STRING,
    created_by: DataTypes.INTEGER,
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    send_to_type: DataTypes.STRING,
    division_id: DataTypes.STRING,
    designation_id: DataTypes.STRING,
    assigned_io: DataTypes.STRING,
    user_id: DataTypes.STRING,
  }, {
    tableName: 'case_alerts',
    timestamps: false,
  });

  // Associations (if any)
  CaseAlerts.associate = function(models) {
    // Example associations (uncomment and customize as needed)
    // CaseAlerts.belongsTo(models.Users, { foreignKey: 'user_id' });
    // CaseAlerts.belongsTo(models.Division, { foreignKey: 'division_id' });
    // CaseAlerts.belongsTo(models.Designation, { foreignKey: 'designation_id' });
  };

  return CaseAlerts;
};
