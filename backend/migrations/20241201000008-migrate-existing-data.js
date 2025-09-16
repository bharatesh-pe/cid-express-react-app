'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // This migration handles the data migration from old schema to new schema
    // It should be run after the table structure changes
    
    // Check if departments table exists and migrate data
    const tables = await queryInterface.showAllTables();
    const departmentsExists = tables.includes('departments');
    
    if (departmentsExists) {
      // Migrate departments to applications (if any exist)
      const departments = await queryInterface.sequelize.query(
        'SELECT * FROM departments',
        { type: Sequelize.QueryTypes.SELECT }
      );
      
      if (departments.length > 0) {
        // Insert departments as applications
        const applications = departments.map(dept => ({
          code: dept.title,
          link: dept.link,
          image: dept.image,
          description: dept.description,
          isActive: dept.isActive,
          order: dept.order,
          createdAt: dept.createdAt,
          updatedAt: dept.updatedAt
        }));
        
        await queryInterface.bulkInsert('applications', applications);
      }
    }
    
    // Check if users table has old schema columns
    const userColumns = await queryInterface.describeTable('users');
    const hasOldColumns = userColumns.username || userColumns.mobile || userColumns.designation || userColumns.departments;
    
    if (hasOldColumns) {
      // Migrate users (if any exist with old schema)
      const users = await queryInterface.sequelize.query(
        'SELECT * FROM users WHERE username IS NOT NULL',
        { type: Sequelize.QueryTypes.SELECT }
      );
      
      if (users.length > 0) {
        // Update existing users to new schema
        for (const user of users) {
          await queryInterface.sequelize.query(
            `UPDATE users SET 
              user_name = '${user.username}',
              mobile_number = '${user.mobile}'
            WHERE id = ${user.id}`,
            { type: Sequelize.QueryTypes.UPDATE }
          );
        }
        
        // Remove old columns if they exist
        try {
          if (userColumns.username) await queryInterface.removeColumn('users', 'username');
          if (userColumns.mobile) await queryInterface.removeColumn('users', 'mobile');
          if (userColumns.designation) await queryInterface.removeColumn('users', 'designation');
          if (userColumns.departments) await queryInterface.removeColumn('users', 'departments');
        } catch (error) {
          // Columns might already be removed by previous migration
          console.log('Some columns already removed:', error.message);
        }
      }
    }
    
    // Migrate user-department relationships to user-application relationships
    // Only if departments column still exists
    if (hasOldColumns && userColumns.departments) {
      const userDepartments = await queryInterface.sequelize.query(
        'SELECT * FROM users WHERE departments IS NOT NULL',
        { type: Sequelize.QueryTypes.SELECT }
      );
      
      if (userDepartments.length > 0) {
        const userApplications = [];
        
        for (const user of userDepartments) {
          if (user.departments) {
            let departments;
            try {
              departments = JSON.parse(user.departments);
            } catch (e) {
              departments = user.departments;
            }
            
            if (Array.isArray(departments)) {
              for (const deptId of departments) {
                userApplications.push({
                  userId: user.id,
                  applicationId: parseInt(deptId),
                  createdAt: new Date(),
                  updatedAt: new Date()
                });
              }
            }
          }
        }
        
        if (userApplications.length > 0) {
          await queryInterface.bulkInsert('user_applications', userApplications);
        }
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // This is a complex migration, so we'll just clean up the new tables
    await queryInterface.bulkDelete('user_applications', null, {});
    await queryInterface.bulkDelete('applications', null, {});
  }
};
