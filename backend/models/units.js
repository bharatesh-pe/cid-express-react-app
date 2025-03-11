'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class units extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            // units.hasMany(models.user_unit, {
            //     foreignKey: 'unit_id',
            //     onDelete: 'CASCADE'
            // })
            // units.hasMany(models.agency, {
            //     foreignKey: 'agency_id',
            //     onDelete: 'CASCADE'
            // })

        }
    };
    units.init({
        unit_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        unit_name: DataTypes.STRING,
        is_active: DataTypes.BOOLEAN,
        created_by: DataTypes.INTEGER,
        created_date: DataTypes.DATE,
        modified_by: DataTypes.INTEGER,
        modified_date: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'units',
        timestamps: false,
        freezeTableName: true
    });
    return units;
};