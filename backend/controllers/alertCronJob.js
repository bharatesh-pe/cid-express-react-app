const cron = require("node-cron");
const runDailyAlertCron = require("./cron-progress-report-alert");


//To run the cron every single minute
// cron.schedule("* * * * *", async () => {
//     console.log("Running Daily Alert Cron Job at", new Date().toISOString());
//     await runDailyAlertCron.runDailyAlertCronNATURE_OF_DISPOSAL();
// }, {
//     scheduled: true,
//     timezone: "Asia/Kolkata"
// });

//sample time set 
// cron.schedule("0 9 * * *", async () => {
//     console.log("Running Daily 9 AM Alert Cron Job at", new Date().toISOString());
//     await runDailyAlertCron.runDailyAlertCronAP();
// }, {
//     scheduled: true,
//     timezone: "Asia/Kolkata"
// });

// ┌───────────── minute (0)
// │ ┌───────────── hour (9)
// │ │ ┌───────────── day of month (* = every day)
// │ │ │ ┌───────────── month (* = every month)
// │ │ │ │ ┌───────────── day of week (* = every day of week)
// │ │ │ │ │
// │ │ │ │ │
// 0  9  * * *

// cron.schedule("0 0 * * *", async () => {
//     console.log("Running Daily Alert Cron Job at", new Date().toISOString());
//     await runDailyAlertCron.runDailyAlertCronPR();
// }, {
//     scheduled: true,
//     timezone: "Asia/Kolkata"
// });


// cron.schedule("0 0 * * *", async () => {
//     console.log("Running Daily Alert Cron Job at", new Date().toISOString());
//     await runDailyAlertCron.runDailyAlertCronAP();
// }, {
//     scheduled: true,
//     timezone: "Asia/Kolkata"
// });

// cron.schedule("0 0 * * *", async () => {
//     console.log("Running Daily Alert Cron Job at", new Date().toISOString());
//     await runDailyAlertCron.runDailyAlertCronFSL_PF();
// }, {
//     scheduled: true,
//     timezone: "Asia/Kolkata"
// });

exports.refreshAlertCron = async (req, res) => {
    try {
        await Promise.all([
            runDailyAlertCron.runDailyAlertCronIO(),
            runDailyAlertCron.runDailyAlertCronAP(),
            runDailyAlertCron.runDailyAlertCronFSL_PF(),
            runDailyAlertCron.runDailyAlertCronNATURE_OF_DISPOSAL(),
            runDailyAlertCron.runMonthlyAlertCronPR(),
        ]);

        const currentTime = new Date().toISOString(); // e.g., "2025-05-26T08:34:12.000Z"

        res.status(200).json({
            message: 'Alert cron refreshed successfully',
            refreshedAt: currentTime
        });
    } catch (error) {
        console.error('Error refreshing alert cron:', error);
        res.status(500).json({
            message: 'Failed to refresh alert cron',
            error: error.message,
            failedAt: new Date().toISOString()
        });
    }
};


