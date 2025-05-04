'use strict';

module.exports = (sequelize, DataTypes) => {
  const Section = sequelize.define('Section', {
    section_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    section_name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    act_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'section',
    timestamps: false
  });

  Section.associate = (models) => {
    Section.belongsTo(models.Act, {
      foreignKey: "act_id",
      as: "act",
    });
  };

  return Section;
};
