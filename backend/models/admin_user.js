'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class admin_user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

    }
  };
  admin_user.init({
    admin_user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    full_name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    password: DataTypes.STRING,
    profile_image_path: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN,
    failed_login_count: DataTypes.INTEGER,
    password_updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'admin_user',
    timestamps: false,
    freezeTableName: true
  });
  return admin_user;
};