'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class event_tag_leader extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */

    };
    event_tag_leader.init({
        event_tag_leader_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        event_id: DataTypes.INTEGER,
        leader_id: DataTypes.INTEGER,
        is_active: DataTypes.BOOLEAN,
        created_by: DataTypes.INTEGER,
        created_date: DataTypes.DATE,
        modified_by: DataTypes.INTEGER,
        modified_date: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'event_tag_leader',
        timestamps: false,
        freezeTableName: true
    });
    return event_tag_leader;
};