'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('applications', [
      {
        code: 'Rowdy Sheeter',
        link: 'https://rs.patterneffects.in/#/',
        image: '/images/rowdy_sheet.png',
        description: 'Rowdy Sheeter Management System',
        order: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'Muddemal',
        link: 'https://muddemal.patterneffects.in/#/',
        image: '/images/rowdy_sheet.png',
        description: 'Muddemal Management System',
        order: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MOB',
        link: 'https://mob.patterneffects.in/#/',
        image: '/images/rowdy_sheet.png',
        description: 'MOB Management System',
        order: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BCP Chat',
        link: 'https://bcp-chat.example.com',
        image: '/images/rowdy_sheet.png',
        description: 'BCP Chat System',
        order: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'NDPS Analytics',
        link: 'https://app.powerbi.com/reportEmbed?reportId=f6ae9972-1499-45c9-8264-3850069e9c0d&autoAuth=true&ctid=94dbcc7c-6e32-4329-a59a-3fb79b6fb70e',
        image: '/images/rowdy_sheet.png',
        description: 'NDPS Analytics Dashboard',
        order: 8,
        is_analytics: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'Crime Analytics',
        link: 'https://app.powerbi.com/reportEmbed?reportId=95ee3cd6-a079-412c-b345-193d0b836be3&autoAuth=true&ctid=94dbcc7c-6e32-4329-a59a-3fb79b6fb70e',
        image: '/images/rowdy_sheet.png',
        description: 'Crime Analytics Dashboard',
        order: 10,
        is_analytics: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('applications', null, {});
  }
};
