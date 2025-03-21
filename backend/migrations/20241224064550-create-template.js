'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('templates', {
      template_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      table_name: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      template_name: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      template_type: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      template_module: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      link_module: {
        allowNull: true,
        type: Sequelize.STRING(50)
      },


      fields: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      no_of_sections: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      sections: {
        type: Sequelize.ARRAY(Sequelize.STRING), // Correct for storing an array of strings
        allowNull: true,
      },
      sys_status: {
        allowNull: true,
        type: Sequelize.STRING(50)
      },

      is_link_to_leader: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_link_to_organization: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      created_by: {
        allowNull: true,
        type: Sequelize.STRING
      },
      updated_by: {
        allowNull: true,
        type: Sequelize.STRING
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('templates');
  }
};