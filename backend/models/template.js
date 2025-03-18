'use strict';

module.exports = (sequelize, DataTypes) => {
  const Template = sequelize.define('Template', {
    template_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    table_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    template_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    template_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    template_module: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    link_module: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    fields: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    no_of_sections: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    sections: {
      type: DataTypes.ARRAY(DataTypes.STRING), // Correct for storing an array of strings
      allowNull: true,
    },
    is_link_to_leader: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_link_to_organization: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    updated_by: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'templates',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true, // Ensures snake_case column naming
  });

  return Template;
};
