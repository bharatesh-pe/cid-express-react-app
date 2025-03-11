'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class event_summary extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      event_summary.belongsTo(models.event, {
        foreignKey: 'event_id',
        targetKey: 'event_id',
        onDelete: 'CASCADE'
      });
      event_summary.belongsTo(models.Users, {
        foreignKey: 'user_id',
        targetKey: 'user_id',
        onDelete: 'NO ACTION'
      });
    }
  }
  event_summary.init({
    event_summary_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    user_id: DataTypes.INTEGER,
    event_id: DataTypes.INTEGER,
    summary: DataTypes.TEXT,
    created_date: DataTypes.DATE,
    modified_date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'event_summary',
    timestamps: false,
    freezeTableName: true
  });
  return event_summary;
};