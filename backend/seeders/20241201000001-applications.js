'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('applications', [
      {
        code: 'SIIMS',
        link: 'https://staging.raguva.in/siims/#/login',
        image: '/images/siims_logo.svg',
        description: 'State Intelligence Information Management System',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'Snapshot',
        link: 'https://snapshot.example.com',
        image: '/images/rowdy_sheet.png',
        description: 'Snapshot system for quick access',
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PMMC',
        link: 'https://pmmc.raguva.karnataka.gov.in/login',
        image: '/images/rowdy_sheet.png',
        description: 'Police Management and Monitoring Center',
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
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
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'Tapal Tracker',
        link: 'https://tapal-tracker.example.com',
        image: '/images/rowdy_sheet.png',
        description: 'Tapal Tracking System',
        order: 9,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'Crime Analytics',
        link: 'https://app.powerbi.com/reportEmbed?reportId=95ee3cd6-a079-412c-b345-193d0b836be3&autoAuth=true&ctid=94dbcc7c-6e32-4329-a59a-3fb79b6fb70e',
        image: '/images/rowdy_sheet.png',
        description: 'Crime Analytics Dashboard',
        order: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'DMS',
        link: 'https://fire-emergency.patterneffects.in/estorage/login/?next=/estorage/',
        image: '/images/fire_emergency.png',
        description: 'Document Management System',
        order: 11,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'Inventory Management',
        link: 'http://139.59.4.148/',
        image: '/images/fire_emergency.png',
        description: 'Inventory Management System',
        order: 12,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'Lokayukta Digitalization',
        link: 'https://lokayuktabeta.patterneffects.in/login.php',
        image: '/images/rowdy_sheet.png',
        description: 'Lokayukta Digitalization (Investigation module)',
        order: 13,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'Dex-P',
        link: 'https://dex-p.example.com',
        image: '/images/rowdy_sheet.png',
        description: 'State Excise Department System',
        order: 14,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CMS',
        link: 'http://onlinecms.net/',
        image: '/images/cid.png',
        description: 'Case Management System',
        order: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CNR',
        link: 'http://93.127.194.179/',
        image: '/images/cid.png',
        description: 'CNR System',
        order: 16,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('applications', null, {});
  }
};
