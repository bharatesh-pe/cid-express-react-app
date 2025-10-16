const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const User = require('../models/User');
const UserApplication = require('../models/UserApplication');
const Application = require('../models/Application');

async function updateUserApplications() {
    try {
        console.log('🔄 Starting user application updates...\n');
        console.log('🔍 Script is running...');

        // Step 1: Remove Analytics applications for users with "PS" in their names
        console.log('📊 Step 1: Removing Analytics applications for PS users...');
        
        // Get all analytics applications (fallback to name-based if is_analytics field is not properly set)
        let analyticsApps = await Application.findAll({
            where: { 
                is_analytics: true,
                isActive: true 
            },
            attributes: ['code']
        });

        // If no analytics apps found by is_analytics field, fallback to name-based detection
        if (analyticsApps.length === 0) {
            console.log('⚠️  No analytics apps found by is_analytics field, using name-based detection...');
            analyticsApps = await Application.findAll({
                where: sequelize.where(
                    sequelize.fn('LOWER', sequelize.col('code')), 
                    'LIKE', 
                    '%analytics%'
                ),
                attributes: ['code']
            });
        }
        
        const analyticsAppCodes = analyticsApps.map(app => app.code);
        console.log(`Found analytics applications: ${analyticsAppCodes.join(', ')}`);

        // Double-check: filter out any non-analytics apps that might have been included
        // Also include BCP Chat Usage as it's considered an analytics application
        const confirmedAnalyticsApps = [...analyticsAppCodes, 'BCP Chat Usage'];

        // Get users with "PS" in their names (case-insensitive for MySQL/MariaDB)
        const psUsers = await User.findAll({
            where: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('user_name')), 
                'LIKE', 
                '%ps%'
            ),
            attributes: ['id', 'user_name']
        });

        console.log(`Found ${psUsers.length} users with "PS" in their names`);

        let removedCount = 0;
        for (const user of psUsers) {
            console.log(`\n👤 Processing user: ${user.user_name} (ID: ${user.id})`);
            
            for (const appCode of confirmedAnalyticsApps) {
                // Check if user has this analytics application
                const userApp = await UserApplication.findOne({
                    where: {
                        userId: user.id,
                        applicationCode: appCode,
                        isActive: true
                    }
                });

                if (userApp) {
                    // DELETE the record instead of setting isActive = false
                    await UserApplication.destroy({
                        where: {
                            userId: user.id,
                            applicationCode: appCode
                        }
                    });
                    console.log(`   ❌ Deleted: ${appCode}`);
                    removedCount++;
                } else {
                    console.log(`   ⏭️  Not assigned: ${appCode}`);
                }
            }
        }

        console.log(`\n✅ Removed ${removedCount} analytics application assignments for PS users`);

        // Step 2: Add BCP Chat Usage for users who don't have it
        console.log('\n💬 Step 2: Adding BCP Chat Usage for users who don\'t have it...');
        
        // Get BCP Chat Usage application
        const bcpChatApp = await Application.findOne({
            where: { code: 'BCP Chat Usage' },
            attributes: ['code']
        });

        if (!bcpChatApp) {
            console.log('❌ BCP Chat Usage application not found in database');
            return;
        }

        // Get all active users
        const allUsers = await User.findAll({
            where: { isActive: true },
            attributes: ['id', 'user_name']
        });

        console.log(`Found ${allUsers.length} active users`);

        let addedCount = 0;
        let alreadyHadCount = 0;

        for (const user of allUsers) {
            // Skip PS users - they should not have BCP Chat Usage
            if (user.user_name.toLowerCase().includes('ps')) {
                console.log(`   ⏭️ ${user.user_name}: Skipping PS user (BCP Chat Usage not added)`);
                continue;
            }

            // Check if user already has BCP Chat Usage
            const existingUserApp = await UserApplication.findOne({
                where: {
                    userId: user.id,
                    applicationCode: bcpChatApp.code,
                    isActive: true
                }
            });

            if (existingUserApp) {
                console.log(`   ✅ ${user.user_name}: Already has BCP Chat Usage`);
                alreadyHadCount++;
            } else {
                // Check if there's an inactive assignment
                const inactiveUserApp = await UserApplication.findOne({
                    where: {
                        userId: user.id,
                        applicationCode: bcpChatApp.code,
                        isActive: false
                    }
                });

                if (inactiveUserApp) {
                    // Reactivate the assignment
                    await inactiveUserApp.update({ isActive: true });
                    console.log(`   🔄 ${user.user_name}: Reactivated BCP Chat Usage`);
                } else {
                    // Create new assignment
                    await UserApplication.assignApplication(user.id, bcpChatApp.code);
                    console.log(`   ➕ ${user.user_name}: Added BCP Chat Usage`);
                }
                addedCount++;
            }
        }

        console.log(`\n✅ Summary:`);
        console.log(`   • Analytics apps removed for PS users: ${removedCount}`);
        console.log(`   • BCP Chat Usage added: ${addedCount}`);
        console.log(`   • Users who already had BCP Chat Usage: ${alreadyHadCount}`);

        // Step 3: Show final status for PS users (using direct DB query)
        console.log('\n📋 Final status for PS users:');
        for (const user of psUsers) {
            // Get current applications directly from database
            const userApps = await UserApplication.findAll({
                where: {
                    userId: user.id,
                    isActive: true
                },
                attributes: ['applicationCode']
            });
            
            const currentApps = userApps.map(app => app.applicationCode);
            const analyticsApps = currentApps.filter(app => 
                confirmedAnalyticsApps.includes(app)
            );
            const hasBcpChat = currentApps.includes('BCP Chat Usage');
            
            console.log(`\n👤 ${user.user_name}:`);
            console.log(`   📊 Analytics apps: ${analyticsApps.length > 0 ? analyticsApps.join(', ') : 'None'}`);
            console.log(`   💬 BCP Chat Usage: ${hasBcpChat ? '✅ Yes' : '❌ No'}`);
            console.log(`   📱 Total apps: ${currentApps.length}`);
            console.log(`   📱 All apps: ${currentApps.join(', ')}`);
        }

        console.log('\n🎉 User application updates completed successfully!');

    } catch (error) {
        console.error('❌ Error updating user applications:', error);
    } finally {
        await sequelize.close();
    }
}

// Run the update
updateUserApplications();
