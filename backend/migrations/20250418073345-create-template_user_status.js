'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('template_user_status', {
            template_user_status_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            template_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'templates',
                    key: 'template_id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            table_row_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users', // make sure this matches your actual users table name
                    key: 'user_id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('template_user_status');
    }
};
