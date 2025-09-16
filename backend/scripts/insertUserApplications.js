const { sequelize } = require('../config/database');
const UserApplication = require('../models/UserApplication');

async function insertUserApplications() {
  try {
    // Sample data to insert
    const userApplications = [
      // Admin user (ID: 1) - has all applications
      { userId: 1, applicationCode: 'SIIMS', isActive: true },
      { userId: 1, applicationCode: 'Snapshot', isActive: true },
      { userId: 1, applicationCode: 'PMMC', isActive: true },
      { userId: 1, applicationCode: 'Rowdy Sheeter', isActive: true },
      { userId: 1, applicationCode: 'Muddemal', isActive: true },
      { userId: 1, applicationCode: 'MOB', isActive: true },
      { userId: 1, applicationCode: 'BCP Chat', isActive: true },
      { userId: 1, applicationCode: 'NDPS Analytics', isActive: true },
      { userId: 1, applicationCode: 'Tapal Tracker', isActive: true },
      { userId: 1, applicationCode: 'Crime Analytics', isActive: true },
      { userId: 1, applicationCode: 'DMS', isActive: true },
      { userId: 1, applicationCode: 'Inventory Management', isActive: true },
      { userId: 1, applicationCode: 'Lokayukta Digitalization', isActive: true },
      { userId: 1, applicationCode: 'Dex-P', isActive: true },
      { userId: 1, applicationCode: 'CMS', isActive: true },
      { userId: 1, applicationCode: 'CNR', isActive: true },
      
      // Police Officer 1 (ID: 2)
      { userId: 2, applicationCode: 'SIIMS', isActive: true },
      { userId: 2, applicationCode: 'Snapshot', isActive: true },
      { userId: 2, applicationCode: 'PMMC', isActive: true },
      { userId: 2, applicationCode: 'Rowdy Sheeter', isActive: true },
      { userId: 2, applicationCode: 'Muddemal', isActive: true },
      
      // Police Officer 2 (ID: 3)
      { userId: 3, applicationCode: 'MOB', isActive: true },
      { userId: 3, applicationCode: 'BCP Chat', isActive: true },
      { userId: 3, applicationCode: 'NDPS Analytics', isActive: true },
      { userId: 3, applicationCode: 'Tapal Tracker', isActive: true },
      { userId: 3, applicationCode: 'Crime Analytics', isActive: true },
      
      // Fire Officer (ID: 4)
      { userId: 4, applicationCode: 'DMS', isActive: true },
      { userId: 4, applicationCode: 'Inventory Management', isActive: true },
      
      // Lokayukta Officer (ID: 5)
      { userId: 5, applicationCode: 'Lokayukta Digitalization', isActive: true },
      
      // Excise Officer (ID: 6)
      { userId: 6, applicationCode: 'Dex-P', isActive: true },
      
      // CID Officer (ID: 7)
      { userId: 7, applicationCode: 'CMS', isActive: true },
      { userId: 7, applicationCode: 'CNR', isActive: true }
    ];

    console.log('Inserting user applications...');
    
    // Clear existing data first
    await UserApplication.destroy({ where: {} });
    console.log('Cleared existing user applications');
    
    // Insert new data
    for (const ua of userApplications) {
      await UserApplication.create({
        ...ua,
        assignedAt: new Date()
      });
    }
    
    console.log(`Successfully inserted ${userApplications.length} user applications`);
    
    // Display summary
    const summary = await UserApplication.findAll({
      attributes: ['userId', 'applicationCode'],
      order: [['userId', 'ASC'], ['applicationCode', 'ASC']]
    });
    
    console.log('\nSummary of inserted data:');
    summary.forEach(ua => {
      console.log(`User ${ua.userId} -> ${ua.applicationCode}`);
    });
    
  } catch (error) {
    console.error('Error inserting user applications:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
insertUserApplications();
