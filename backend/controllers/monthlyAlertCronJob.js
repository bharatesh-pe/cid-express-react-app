const cron = require("node-cron");
const runMonthlyAlertCron = require("./cron-progress-report-alert");

cron.schedule("* * * * *", async () => {
    console.log("Running Monthly Alert Cron Job at", new Date().toISOString());
    await runMonthlyAlertCron();
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});
