const { sequelize } = require('./config/database');
const User = require('./models/User');
const Department = require('./models/Department');
const OTP = require('./models/OTP');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Create tables
    console.log('📋 Creating tables...');
    await sequelize.sync({ force: false });
    console.log('✅ Tables created successfully');
    
    // Check if data already exists
    const userCount = await User.count();
    const deptCount = await Department.count();
    
    if (deptCount === 0) {
      console.log('🌱 Seeding departments...');
      const departments = [
        {
          title: 'SIIMS',
          link: 'https://staging.raguva.in/siims/#/login',
          image: '/images/siims_logo.svg',
          description: 'State Intelligence Information Management System',
          order: 1
        },
        {
          title: 'Snapshot',
          link: '',
          image: '/images/rowdy_sheet.png',
          description: 'Snapshot system for quick access',
          order: 2
        },
        {
          title: 'PMMC',
          link: 'https://pmmc.raguva.karnataka.gov.in/login',
          image: '/images/rowdy_sheet.png',
          description: 'Police Management and Monitoring Center',
          order: 3
        },
        {
          title: 'Rowdy Sheeter',
          link: 'https://rs.patterneffects.in/#/',
          image: '/images/rowdy_sheet.png',
          description: 'Rowdy Sheeter Management System',
          order: 4
        },
        {
          title: 'Muddemal',
          link: 'https://muddemal.patterneffects.in/#/',
          image: '/images/rowdy_sheet.png',
          description: 'Muddemal Management System',
          order: 5
        },
        {
          title: 'MOB',
          link: 'https://mob.patterneffects.in/#/',
          image: '/images/rowdy_sheet.png',
          description: 'MOB Management System',
          order: 6
        },
        {
          title: 'BCP Chat',
          link: '',
          image: '/images/rowdy_sheet.png',
          description: 'BCP Chat System',
          order: 7
        },
        {
          title: 'NDPS Analytics',
          link: 'https://app.powerbi.com/reportEmbed?reportId=f6ae9972-1499-45c9-8264-3850069e9c0d&autoAuth=true&ctid=94dbcc7c-6e32-4329-a59a-3fb79b6fb70e',
          image: '/images/rowdy_sheet.png',
          description: 'NDPS Analytics Dashboard',
          order: 8
        },
        {
          title: 'Tapal Tracker',
          link: '',
          image: '/images/rowdy_sheet.png',
          description: 'Tapal Tracking System',
          order: 9
        },
        {
          title: 'Crime Analytics',
          link: 'https://app.powerbi.com/reportEmbed?reportId=95ee3cd6-a079-412c-b345-193d0b836be3&autoAuth=true&ctid=94dbcc7c-6e32-4329-a59a-3fb79b6fb70e',
          image: '/images/rowdy_sheet.png',
          description: 'Crime Analytics Dashboard',
          order: 10
        },
        {
          title: 'DMS',
          link: 'https://fire-emergency.patterneffects.in/estorage/login/?next=/estorage/',
          image: '/images/fire_emergency.png',
          description: 'Document Management System',
          order: 11
        },
        {
          title: 'Inventory Management',
          link: 'http://139.59.4.148/',
          image: '/images/fire_emergency.png',
          description: 'Inventory Management System',
          order: 12
        },
        {
          title: 'Lokayukta Digitalization',
          link: 'https://lokayuktabeta.patterneffects.in/login.php',
          image: '/images/rowdy_sheet.png',
          description: 'Lokayukta Digitalization (Investigation module)',
          order: 13
        },
        {
          title: 'Dex-P',
          link: '',
          image: '/images/rowdy_sheet.png',
          description: 'State Excise Department System',
          order: 14
        },
        {
          title: 'CMS',
          link: 'http://onlinecms.net/',
          image: '/images/cid.png',
          description: 'Case Management System',
          order: 15
        },
        {
          title: 'CNR',
          link: 'http://93.127.194.179/',
          image: '/images/cid.png',
          description: 'CNR System',
          order: 16
        }
      ];
      
      await Department.bulkCreate(departments);
      console.log('✅ Departments seeded successfully');
    } else {
      console.log(`✅ Departments already exist (${deptCount} records)`);
    }
    
    if (userCount === 0) {
      console.log('👥 Seeding users...');
      const users = [
        {
          username: 'admin',
          mobile: '9698273271',
          designation: 'System Administrator',
          departments: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16']
        },
        {
          username: 'police_officer_1',
          mobile: '9876543211',
          designation: 'Police Inspector',
          departments: ['1', '2', '3', '4', '5']
        },
        {
          username: 'police_officer_2',
          mobile: '9876543212',
          designation: 'Sub Inspector',
          departments: ['6', '7', '8', '9', '10']
        },
        {
          username: 'fire_officer',
          mobile: '9876543213',
          designation: 'Fire Officer',
          departments: ['11', '12']
        },
        {
          username: 'lokayukta_officer',
          mobile: '9876543214',
          designation: 'Lokayukta Officer',
          departments: ['13']
        },
        {
          username: 'excise_officer',
          mobile: '9876543215',
          designation: 'Excise Officer',
          departments: ['14']
        },
        {
          username: 'cid_officer',
          mobile: '9876543216',
          designation: 'CID Officer',
          departments: ['15', '16']
        }
      ];
      
      await User.bulkCreate(users);
      console.log('✅ Users seeded successfully');
    } else {
      console.log(`✅ Users already exist (${userCount} records)`);
    }
    
    console.log('🎉 Database setup complete!');
    console.log('\n📱 You can now test the OTP functionality with these mobile numbers:');
    console.log('   - 9698273271 (admin)');
    console.log('   - 9876543211 (police_officer_1)');
    console.log('   - 9876543212 (police_officer_2)');
    console.log('   - 9876543213 (fire_officer)');
    console.log('   - 9876543214 (lokayukta_officer)');
    console.log('   - 9876543215 (excise_officer)');
    console.log('   - 9876543216 (cid_officer)');
    
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
    console.error('Full error:', error);
  } finally {
    await sequelize.close();
  }
}

setupDatabase();
