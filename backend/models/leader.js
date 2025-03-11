'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class leader extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            leader.belongsTo(models.section, {
                foreignKey: 'section_id',
                targetKey: 'section_id',
                onDelete: 'CASCADE'
            })
            leader.belongsTo(models.desk, {
                foreignKey: 'desk_id',
                targetKey: 'desk_id',
                onDelete: 'CASCADE'
            })
            leader.belongsTo(models.units, {
                foreignKey: 'unit_id',
                targetKey: 'unit_id',
                onDelete: 'CASCADE'
            }),
                // leader.hasMany(models.state, {
                //     foreignKey: 'state_id',
                //     targetKey: 'state_id',
                //     onDelete: 'No Action'
                // })
            leader.belongsTo(models.district, {
                foreignKey: 'district_id',
                targetKey: 'district_id',
                onDelete: 'CASCADE'
            })
            leader.belongsTo(models.admin_user, {
                foreignKey: 'modified_by',
                targetKey: 'admin_user_id',
                onDelete: 'CASCADE'
            })
        }
    };

    leader.init({
        leader_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        leader_name: DataTypes.STRING,
        unit_id: DataTypes.INTEGER,
        section_id: DataTypes.INTEGER,
        desk_id: DataTypes.INTEGER,
        district_id: DataTypes.INTEGER,
        // state_id: DataTypes.INTEGER,
        is_active: DataTypes.BOOLEAN,
        created_by: DataTypes.INTEGER,
        created_date: DataTypes.DATE,
        modified_by: DataTypes.INTEGER,
        modified_date: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'leader',
        timestamps: false,
        freezeTableName: true
    });
    return leader;
};