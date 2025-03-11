'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class event extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            event.hasOne(models.event_summary, {
                foreignKey: 'event_id',
                sourceKey: 'event_id',
                onDelete: 'CASCADE'
            });
        }
    };
    event.init({
        event_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        event_type_id: DataTypes.INTEGER,
        event_status_type_id: DataTypes.INTEGER,
        unit_id: DataTypes.INTEGER,
        section_id: DataTypes.INTEGER,
        desk_id: DataTypes.INTEGER,
        event_number: DataTypes.INTEGER,
        event_message_type_id: DataTypes.INTEGER,
        event_message_sub_type_id: DataTypes.INTEGER,
        source_of_message: DataTypes.STRING,
        subject: DataTypes.STRING,
        description: DataTypes.STRING,
        grade_id: DataTypes.INTEGER,
        classification_level_id: DataTypes.INTEGER,
        event_firudr_type_id: DataTypes.INTEGER,
        other_tags: DataTypes.STRING,
        final_summary: DataTypes.STRING,
        created_by: DataTypes.INTEGER,
        created_date: DataTypes.DATE,
        modified_by: DataTypes.INTEGER,
        modified_date: DataTypes.DATE,
        informant_name: DataTypes.STRING,
        informant_mobile_number: DataTypes.STRING,
        latitude: DataTypes.STRING,
        longitude: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'event',
        timestamps: false,
        freezeTableName: true
    });
    return event;
};