"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("charge_sheet", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            case_id: {
                type: Sequelize.STRING,
            },
            module: {
                type: Sequelize.STRING,
            },
            cs_no: {
                type: Sequelize.STRING,
            },
            CS_field_date: {
                type: Sequelize.DATE,
            },
            name_addr_informant: {
                type: Sequelize.TEXT,
            },
            magistrate_case_no: {
                type: Sequelize.STRING,
            },
            accused_name_per_gov: {
                type: Sequelize.STRING,
            },
            magistrate: {
                type: Sequelize.STRING,
            },
            det_accused_or_not_ind_absconders: {
                type: Sequelize.TEXT,
            },
            custody: {
                type: Sequelize.TEXT,
            },
            on_bail_or_bond: {
                type: Sequelize.TEXT,
            },
            prop_desc: {
                type: Sequelize.TEXT,
            },
            name_addr_witnesses: {
                type: Sequelize.TEXT,
            },
            det_circumstances: {
                type: Sequelize.TEXT,
            },
            textEditor_01: {
                type: Sequelize.TEXT,
            },
            textEditor_02: {
                type: Sequelize.TEXT,
            },
            textEditor_03: {
                type: Sequelize.TEXT,
            },
            place: {
                type: Sequelize.STRING,
            },
            cs_fields_date2: {
                type: Sequelize.DATE,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("charge_sheet");
    },
};
