'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('system_alerts', {
      system_alert_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      module_name: {
        type: Sequelize.TEXT
      },
      reference_id: {
        type: Sequelize.INTEGER
      },
      alert_message: {
        type: Sequelize.TEXT
      },
      alert_type: {
        type: Sequelize.TEXT
      },
      alert_status: {
        type: Sequelize.TEXT
      },
      created_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'user_id'
        }
      },
      created_at: {
        type: Sequelize.DATE
      },
      transaction_id: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('system_alerts');
  }
};