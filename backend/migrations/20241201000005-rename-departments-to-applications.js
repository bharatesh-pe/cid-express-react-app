'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if departments table exists
    const tableExists = await queryInterface.showAllTables().then(tables => 
      tables.includes('departments')
    );
    
    if (tableExists) {
      // Rename table from departments to applications
      await queryInterface.renameTable('departments', 'applications');
      
      // Rename title column to code
      await queryInterface.renameColumn('applications', 'title', 'code');
      
      // Update indexes - remove old title index and add new code index
      try {
        await queryInterface.removeIndex('applications', ['title']);
      } catch (error) {
        // Index might not exist, continue
        console.log('Title index not found, continuing...');
      }
      await queryInterface.addIndex('applications', ['code']);
    } else {
      // If departments table doesn't exist, create applications table directly
      await queryInterface.createTable('applications', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        code: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true
        },
        link: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        image: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        description: {
          type: Sequelize.STRING(500),
          allowNull: true
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        order: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });

      // Add indexes
      await queryInterface.addIndex('applications', ['code']);
      await queryInterface.addIndex('applications', ['isActive']);
      await queryInterface.addIndex('applications', ['order']);
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if applications table exists
    const tableExists = await queryInterface.showAllTables().then(tables => 
      tables.includes('applications')
    );
    
    if (tableExists) {
      // Check if this was created from departments table or created directly
      const departmentsExists = await queryInterface.showAllTables().then(tables => 
        tables.includes('departments')
      );
      
      if (!departmentsExists) {
        // If departments doesn't exist, this was created directly, so drop applications table
        await queryInterface.dropTable('applications');
      } else {
        // Revert column rename
        await queryInterface.renameColumn('applications', 'code', 'title');
        
        // Revert table rename
        await queryInterface.renameTable('applications', 'departments');
        
        // Revert indexes
        try {
          await queryInterface.removeIndex('applications', ['code']);
        } catch (error) {
          console.log('Code index not found, continuing...');
        }
        await queryInterface.addIndex('departments', ['title']);
      }
    }
  }
};
