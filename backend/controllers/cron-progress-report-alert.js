const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const db = require("../models");
const moment = require("moment");
const sequelize = db.sequelize;
const typeMapping = {
  STRING: Sequelize.DataTypes.STRING,
  INTEGER: Sequelize.DataTypes.INTEGER,
  TEXT: Sequelize.DataTypes.TEXT,
  DATE: Sequelize.DataTypes.DATE,
  BOOLEAN: Sequelize.DataTypes.BOOLEAN,
  FLOAT: Sequelize.DataTypes.FLOAT,
  DOUBLE: Sequelize.DataTypes.DOUBLE,
  JSONB: Sequelize.DataTypes.JSONB,
};

const {
    UiProgressReportMonthWise,
    CaseAlerts,
    Template
} = db;

//cron for Progress Report
exports.runMonthlyAlertCronPR = async () => {
    try {
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

        console.log("Monthly Alert Cron completed for Progress Report, Successfully.");
    } catch (error) {
        console.error("Error running Monthly Alert Cron for Progress report:", error);
    } finally {
        await sequelize.close();
        console.log("Database connection closed.");
    }
};

//cron for Action Plan
exports.runMonthlyAlertCronAP = async () => {
    try {
        const today = moment();
    
        console.log("Fetching CID Under Investigation template...");
        const template = await Template.findOne({ where: { table_name: "cid_under_investigation" } });
    
        if (!template) {
            console.error("Template not found.");
            return;
        }
  
        const tableName = template.table_name;
        console.log(`Using table: ${tableName}`);
    
        const [allCases] = await sequelize.query(`SELECT id, created_at FROM ${tableName} WHERE id IS NOT NULL`);
        const allIds = allCases.map(row => row.id);
        console.log(`Found ${allIds.length} cases.`);
    
        // Fetch Action Plan template metadata
        const APtableData = await Template.findOne({ where: { table_name: "cid_ui_case_action_plan" } });
    
        if (!APtableData) {
            console.error(`Table cid_ui_case_action_plan does not exist.`);
            return;
        }
    
        // Parse schema and build model
        const schema = typeof APtableData.fields === "string" ? JSON.parse(APtableData.fields) : APtableData.fields;
        schema.push({ name: "sys_status", data_type: "TEXT", not_null: false });
  
        const APmodelAttributes = {
            id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            },
            created_at: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
            },
            updated_at: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
            },
            created_by: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
            },
        };
  
        for (const field of schema) {
            const { name, data_type, not_null, default_value } = field;
            const sequelizeType = typeMapping[data_type?.toUpperCase()] || Sequelize.DataTypes.STRING;
    
            APmodelAttributes[name] = {
            type: sequelizeType,
            allowNull: !not_null,
            defaultValue: default_value || null,
            };
        }
  
        const APModel = sequelize.define(APtableData.table_name, APmodelAttributes, {
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        });
    
        await APModel.sync();
    
        const approval = [];
        const over_due = [];
    
        for (const caseEntry of allCases) {
            const ui_case_id = caseEntry.id;
            const createdAt = moment(caseEntry.created_at);
            const isOlderThan7Days = today.diff(createdAt, "days") > 7;
    
            const actionPlanRecord = await APModel.findOne({
            where: { ui_case_id },
            order: [["created_at", "DESC"]],
            });
    
            if (actionPlanRecord) {
            if (actionPlanRecord.field_submit_status !== "submit") {
                if (isOlderThan7Days) {
                over_due.push(ui_case_id);
                } else {
                approval.push(ui_case_id);
                }
            }
            } else {
            if (isOlderThan7Days) {
                over_due.push(ui_case_id);
            } else {
                approval.push(ui_case_id);
            }
            }
        }

        // Common alert fields
        const alert_type = "ACTION_PLAN";
        const created_by = 0;
        const module = "ActionPlan";
        const main_table = "cid_ui_case_action_plan";

        for (const caseId of over_due) {
            // Delete any existing alerts for this case (low or high level)
            await CaseAlerts.destroy({
                where: {
                record_id: caseId,
                alert_type,
                alert_level: { [Op.in]: ["low", "high"] },
                },
            });

            // Insert new high priority alert
            await CaseAlerts.create({
                module,
                main_table,
                record_id: caseId,
                alert_type,
                alert_level: "high",
                alert_message: `Case ID ${caseId} is overdue for action plan submission.`,
                due_date: today.toDate(),
                triggered_on: new Date(),
                status: "Pending",
                created_by,
                created_at: new Date(),
            });
        }

        for (const caseId of approval) {
            // Delete any existing low-level alert for this case
            await CaseAlerts.destroy({
                where: {
                record_id: caseId,
                alert_type,
                alert_level: "low",
                },
            });

            // Insert new low priority alert
            await CaseAlerts.create({
                module,
                main_table,
                record_id: caseId,
                alert_type,
                alert_level: "low",
                alert_message: `Case ID ${caseId} is pending action plan submission.`,
                due_date: today.toDate(),
                triggered_on: new Date(),
                status: "Pending",
                created_by,
                created_at: new Date(),
            });
        }
  
        console.log("Monthly Alert Cron completed for Action Plan.");
        // console.log("Overdue Cases:", over_due);
        // console.log("Approval Pending Cases:", approval);
    } catch (error) {
      console.error("Error running Monthly Alert Cron for Action Plan:", error);
    } finally {
      await sequelize.close();
      console.log("🔌 Database connection closed.");
    }
  };
