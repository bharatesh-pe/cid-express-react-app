const cron = require("node-cron");
const runMonthlyAlertCron = require("./cron-progress-report-alert");

// cron.schedule("* * * * *", async () => {
//     console.log("Running Monthly Alert Cron Job at", new Date().toISOString());
//     await runMonthlyAlertCron();
// }, {
//     scheduled: true,
//     timezone: "Asia/Kolkata"
// });

// cron.schedule("0 9 * * *", async () => {
//     console.log("Running Daily 9 AM Alert Cron Job at", new Date().toISOString());
//     await runMonthlyAlertCron();
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

cron.schedule("08 12 * * *", async () => {
    console.log("Running Monthly Alert Cron Job at", new Date().toISOString());
    await runMonthlyAlertCron();
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

