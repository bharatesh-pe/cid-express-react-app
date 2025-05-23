const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const db = require("../models");
const sequelize = db.sequelize;

const moment = require("moment");

const {
    UiProgressReportMonthWise,
    CaseAlerts,
    Template
} = db;

const runMonthlyAlertCron = async () => {
    try {
        console.log("checking yuvaraj cron")
        const today = moment();
        const currentDate = today.date();
        const monthStart = today.clone().startOf("month").toDate();
        const monthEnd = today.clone().endOf("month").toDate();

        console.log(" Fetching template");
        const template = await Template.findOne({ where: { table_name: "cid_under_investigation" } });

        if (!template) {
            console.error("Template not found.");
            return;
        }

        const tableName = template.table_name;
        console.log(`Using table: ${tableName}`);

        const [allCases] = await sequelize.query(`SELECT id FROM ${tableName} WHERE id IS NOT NULL`);
        console.log(`Found ${allCases.length} cases.`);

        for (const caseEntry of allCases) {
            const ui_case_id = caseEntry.id;
            console.log(`Processing case ID: ${ui_case_id}`);

            const recordThisMonth = await UiProgressReportMonthWise.findOne({
                where: {
                    ui_case_id,
                    created_at: {
                        [Op.between]: [monthStart, monthEnd],
                    },
                },
            });

            if (recordThisMonth) {
                console.log(`Progress report exists. Marking alert as Completed.`);
                await CaseAlerts.update(
                    { status: "Completed" },
                    {
                        where: {
                            module: "ProgressReport",
                            record_id: ui_case_id,
                            alert_type: "MonthlySubmission",
                            alert_level: "low",
                            status: "Pending",
                            due_date: {
                                [Op.between]: [
                                    today.clone().startOf("month").toDate(),
                                    today.clone().date(5).endOf("day").toDate(),
                                ],
                            },
                        },
                    }
                );
                continue;
            }

            let alertMessage = "";
            const daysLeft = 6 - currentDate;

            if (currentDate >= 1 && currentDate <= 5) {
                alertMessage = daysLeft > 1
                    ? `${daysLeft} days left to submit Monthly Progress Report`
                    : `Last day to submit Monthly Progress Report`;
            } else if (currentDate === 6) {
                alertMessage = "Monthly Progress Report Not Submitted!";
            }

            if (currentDate <= 5) {
                const existingAlert = await CaseAlerts.findOne({
                    where: {
                        module: "ProgressReport",
                        record_id: ui_case_id,
                        alert_type: "MonthlySubmission",
                        alert_level: "low",
                        due_date: today.clone().startOf("day").toDate(),
                    },
                });

                if (existingAlert) {
                    console.log(`Updating alert for case ${ui_case_id}`);
                    await existingAlert.update({ alert_message: alertMessage });
                } else {
                    console.log(`Creating new alert for case ${ui_case_id}`);
                    await CaseAlerts.create({
                        module: "ProgressReport",
                        main_table: "ui_progress_report_month",
                        record_id: ui_case_id,
                        alert_type: "MonthlySubmission",
                        alert_level: "low",
                        alert_message: alertMessage,
                        due_date: today.toDate(),
                        triggered_on: new Date(),
                        status: "Pending",
                        created_by: 0,
                        created_at: new Date(),
                    });
                }
            }

            if (currentDate === 6) {
                const pendingLowAlerts = await CaseAlerts.findAll({
                    where: {
                        module: "ProgressReport",
                        record_id: ui_case_id,
                        alert_type: "MonthlySubmission",
                        alert_level: "low",
                        status: "Pending",
                        due_date: {
                            [Op.between]: [
                                today.clone().startOf("month").toDate(),
                                today.clone().date(5).endOf("day").toDate(),
                            ],
                        },
                    },
                });

                for (const alert of pendingLowAlerts) {
                    console.log(`Escalating missed alert for case ${ui_case_id}`);
                    await alert.update({ status: "Not Completed" });

                    await CaseAlerts.create({
                        module: "ProgressReport",
                        main_table: "ui_progress_report_month",
                        record_id: ui_case_id,
                        alert_type: "MonthlySubmission",
                        alert_level: "high",
                        alert_message: "Missed deadline: Monthly Progress Report not submitted.",
                        due_date: today.toDate(),
                        triggered_on: new Date(),
                        status: "Not Completed",
                        created_by: 0,
                        created_at: new Date(),
                    });
                }
            }
        }

        console.log("Monthly Alert Cron completed successfully.");
    } catch (error) {
        console.error("Error running Monthly Alert Cron:", error);
    } finally {
        await sequelize.close();
        console.log("Database connection closed.");
    }
};

module.exports = runMonthlyAlertCron;
