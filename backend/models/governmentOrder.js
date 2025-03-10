'use strict';

module.exports = (sequelize, DataTypes) => {
    const GovernmentOrder = sequelize.define('GovernmentOrder', {
    repository_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    subject: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    tags: {
        type: DataTypes.STRING,
        allowNull: false
    },
    documents: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.TEXT,
        defaultValue:'approved'
    },
    dev_status:{
        type: DataTypes.TEXT,
         defaultValue:'active'
    },
    bin_last_date:{
        type: DataTypes.DATE
    }
    }, {
    tableName: 'government_orders',
    timestamps: false
    });
    return GovernmentOrder;
}