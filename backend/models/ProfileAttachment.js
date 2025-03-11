'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('profile_attachments', {
      profile_attachment_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      template_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'template',
          key: 'template_id'
        },
      },
      table_row_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      attachment_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      attachment_extension: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      attachment_size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      s3_key: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      field_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      folder_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'folder_categories',
          key: 'folder_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('profile_attachments');
  },
};