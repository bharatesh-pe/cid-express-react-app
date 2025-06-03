"use strict";

module.exports = (sequelize, DataTypes) => {
    const ChargeSheet = sequelize.define(
        "ChargeSheet",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            case_id: {
                type: DataTypes.STRING,
            },
            module: {
                type: DataTypes.STRING,
            },
            cs_no: {
                type: DataTypes.STRING,
            },
            CS_field_date: {
                type: DataTypes.DATE,
                field: 'CS_field_date',
            },
            name_addr_informant: {
                type: DataTypes.TEXT,
            },
            magistrate_case_no: {
                type: DataTypes.STRING,
            },
            accused_name_per_gov: {
                type: DataTypes.STRING,
            },
            magistrate: {
                type: DataTypes.STRING,
            },
            det_accused_or_not_ind_absconders: {
                type: DataTypes.TEXT,
            },
            custody: {
                type: DataTypes.TEXT,
            },
            on_bail_or_bond: {
                type: DataTypes.TEXT,
            },
            prop_desc: {
                type: DataTypes.TEXT,
            },
            name_addr_witnesses: {
                type: DataTypes.TEXT,
            },
            det_circumstances: {
                type: DataTypes.TEXT,
            },
            textEditor_01: {
                type: DataTypes.TEXT,
                field: 'textEditor_01',
            },
            textEditor_02: {
                type: DataTypes.TEXT,
                field: 'textEditor_02',
            },
            textEditor_03: {
                type: DataTypes.TEXT,
                field: 'textEditor_03',
            },
            place: {
                type: DataTypes.STRING,
            },
            cs_fields_date2: {
                type: DataTypes.DATE,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            tableName: "charge_sheet",
            timestamps: true,
            underscored: true,
            schema: process.env.DB_SCHEMA || 'public'
        }
    );

    return ChargeSheet;
};
