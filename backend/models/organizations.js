'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class organizations extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            // organizations.hasMany(models.office_bearer_ca_orgnizations, {
            //     foreignKey: 'organization_id',
            //     targetKey: 'organization_id',
            //     onDelete: 'CASCADE'
            //   });

            // organizations.hasMany(models.state, {
            //     foreignKey: 'state_id',
            //     targetKey: 'state_id',
            //     onDelete: 'No Action'
            // })

            organizations.belongsTo(models.units, {
                foreignKey: 'unit_id',
                targetKey: 'unit_id',
                onDelete: 'NO ACTION'
            });
            organizations.belongsTo(models.section, {
                foreignKey: 'section_id',
                targetKey: 'section_id',
                onDelete: 'NO ACTION'
            });
            organizations.belongsTo(models.desk, {
                foreignKey: 'desk_id',
                targetKey: 'desk_id',
                onDelete: 'NO ACTION'
            });
            organizations.belongsTo(models.district, {
                foreignKey: 'district_id',
                targetKey: 'district_id',
                onDelete: 'NO ACTION'
            });
            organizations.belongsTo(models.leader, {
                foreignKey: 'leader_id',
                targetKey: 'leader_id',
                onDelete: 'NO ACTION'
            });
        }
    };
    organizations.init({
        organization_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        organization_name: DataTypes.STRING,
        // state_id: DataTypes.INTEGER,
        unit_id: DataTypes.INTEGER,
        section_id: DataTypes.INTEGER,
        desk_id: DataTypes.INTEGER,
        district_id: DataTypes.INTEGER,
        leader_id: DataTypes.INTEGER,
        is_active: DataTypes.BOOLEAN,
        created_by: DataTypes.INTEGER,
        created_date: DataTypes.DATE,
        modified_by: DataTypes.INTEGER,
        modified_date: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'organizations',
        timestamps: false,
        freezeTableName: true
    });
    return organizations;
};