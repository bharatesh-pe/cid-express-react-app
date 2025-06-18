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
    Template,
    UiMergedCases
} = db;
const dayjs = require('dayjs');
//cron for Progress Report
exports.runMonthlyAlertCronPR = async () => {
    try {
        const today = moment();
        const currentDate = today.date();
        const monthStart = today.clone().startOf("month").toDate();
        const monthEnd = today.clone().endOf("month").toDate();

        console.log(" Fetching template");
        const ui_template = await Template.findOne({ where: { table_name: "cid_under_investigation" } });

        if (!ui_template) {
            console.error("UI Template not found.");
            return;
        }

        const eq_template = await Template.findOne({ where: { table_name: "cid_enquiry" } });

        if (!eq_template) {
            console.error("Enquiry Template not found.");
            return;
        }

        const uiTableName = ui_template.table_name;
        console.log(`Using table: ${uiTableName}`);

        const eqTableName = ui_template.table_name;
        console.log(`Using table: ${eqTableName}`);

        // Get all child cases from the merged cases table
        const mergedCases = await UiMergedCases.findAll({
            where: {
                merged_status: "child",
            },
            attributes: ["case_id"],
            raw: true,
        });

        const childCaseIds = mergedCases.map(row => row.case_id);

        // Run raw SQL query to fetch cases that are not in the list of childCaseIds
        const uiAllCases = await sequelize.query(
            `SELECT id FROM ${uiTableName} WHERE id IS NOT NULL AND id NOT IN (:childCaseIds)`,
            {
                replacements: { childCaseIds },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        // Run raw SQL query to fetch cases that are not in the list of childCaseIds
        const eqAllCases = await sequelize.query(`SELECT id, created_at FROM ${eqTableName} WHERE id IS NOT NULL`);



        console.log(`Found ${uiAllCases.length} UI cases.`);
        console.log(`Found ${eqAllCases.length} EQ cases.`);

        for (const caseEntry of uiAllCases) {
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
                            module: "ui_case",
                            record_id: ui_case_id,
                            alert_type: "PROGRESS_REPORT",
                            alert_level: "low",
                            status: {
                                [Op.iLike]: "%pending%" 
                            },
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
                        module: "ui_case",
                        record_id: ui_case_id,
                        alert_type: "PROGRESS_REPORT",
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
                        module: "ui_case",
                        main_table: "ui_progress_report_month",
                        record_id: ui_case_id,
                        alert_type: "PROGRESS_REPORT",
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
                        module: "ui_case",
                        record_id: ui_case_id,
                        alert_type: "PROGRESS_REPORT",
                        alert_level: "low",
                        status: {
                            [Op.iLike]: "%pending%" 
                        },
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
                        module: "ui_case",
                        main_table: "ui_progress_report_month",
                        record_id: ui_case_id,
                        alert_type: "PROGRESS_REPORT",
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

        for (const caseEntry of eqAllCases) {
            const eq_case_id = caseEntry.id;
            console.log(`Processing case ID: ${eq_case_id}`);

            const recordThisMonth = await UiProgressReportMonthWise.findOne({
                where: {
                    eq_case_id,
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
                            module: "eq_case",
                            record_id: eq_case_id,
                            alert_type: "PROGRESS_REPORT",
                            alert_level: "low",
                            status: {
                                [Op.iLike]: "%pending%" 
                            },
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
                        module: "eq_case",
                        record_id: eq_case_id,
                        alert_type: "PROGRESS_REPORT",
                        alert_level: "low",
                        due_date: today.clone().startOf("day").toDate(),
                    },
                });

                if (existingAlert) {
                    console.log(`Updating alert for case ${eq_case_id}`);
                    await existingAlert.update({ alert_message: alertMessage });
                } else {
                    console.log(`Creating new alert for case ${eq_case_id}`);
                    await CaseAlerts.create({
                        module: "eq_case",
                        main_table: "ui_progress_report_month",
                        record_id: eq_case_id,
                        alert_type: "PROGRESS_REPORT",
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
                        module: "eq_case",
                        record_id: eq_case_id,
                        alert_type: "PROGRESS_REPORT",
                        alert_level: "low",
                        status: {
                            [Op.iLike]: "%pending%" 
                        },
                        due_date: {
                            [Op.between]: [
                                today.clone().startOf("month").toDate(),
                                today.clone().date(5).endOf("day").toDate(),
                            ],
                        },
                    },
                });

                for (const alert of pendingLowAlerts) {
                    console.log(`Escalating missed alert for case ${eq_case_id}`);
                    await alert.update({ status: "Not Completed" });

                    await CaseAlerts.create({
                        module: "eq_case",
                        main_table: "ui_progress_report_month",
                        record_id: eq_case_id,
                        alert_type: "PROGRESS_REPORT",
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
    } 
};

//cron for Investigation Officer Allocation
exports.runDailyAlertCronIO = async () => {
    try {
        const today = moment().startOf("day");
        const case_modules = ["ui_case", "pt_case", "eq_case"];

        const ioAlertsData = await CaseAlerts.findAll({
            where: { 
                alert_type: "IO_ALLOCATION",
                module: { [Op.in]: ["ui_case", "pt_case"] },
                status: {
                    [Op.iLike]: "%pending%" 
                }
            },
            order: [["created_at", "DESC"]],
        });

        const eoAlertsData = await CaseAlerts.findAll({
            where: { 
                alert_type: "EO_ALLOCATION",
                module: { [Op.in]: ["eq_case"] },
                status: {
                    [Op.iLike]: "%pending%" 
                }
            },
            order: [["created_at", "DESC"]],
        });

        let updatedCount = 0;

        for (const ioCaseEntry of ioAlertsData) {
            const alert_record_id = ioCaseEntry.record_id;
            const ioDueDate = moment(ioCaseEntry.due_date).startOf("day");

            if (ioDueDate.isBefore(today)) {
                await CaseAlerts.update(
                    { alert_level: "high" },
                    {
                        where: {
                            alert_type: "IO_ALLOCATION",
                            record_id: alert_record_id,
                        },
                    }
                );
            }
        }

        for (const eoCaseEntry of eoAlertsData) {
            const alert_record_id = eoCaseEntry.record_id;
            const ioDueDate = moment(eoCaseEntry.due_date).startOf("day");

            if (ioDueDate.isBefore(today)) {
                await CaseAlerts.update(
                    { alert_level: "high" },
                    {
                        where: {
                            alert_type: "EO_ALLOCATION",
                            record_id: alert_record_id,
                        },
                    }
                );
            }
        }

        const ui_template = await Template.findOne({ where: { table_name: "cid_under_investigation" } });
        const eq_template = await Template.findOne({ where: { table_name: "cid_enquiry" } });
    
        if (!ui_template) {
            console.error("UI Template not found.");
            return;
        }

        if (!eq_template) {
            console.error("Enquiry Template not found.");
            return;
        }
  
        const uiTableName = ui_template.table_name;
        console.log(`Using table: ${uiTableName}`);

        const eqTableName = eq_template.table_name;
        console.log(`Using table: ${eqTableName}`);

         // Get all child cases from the merged cases table
         const mergedCases = await UiMergedCases.findAll({
            where: {
                merged_status: "child",
            },
            attributes: ["case_id"],
            raw: true,
        });

        const childCaseIds = mergedCases.map(row => row.case_id);

        // Run raw SQL query to fetch cases that are not in the list of childCaseIds
        const uiAllCases = await sequelize.query(
            `SELECT id, created_at, field_io_name FROM ${uiTableName} WHERE id IS NOT NULL AND id NOT IN (:childCaseIds)`,
            {
                replacements: { childCaseIds },
                type: sequelize.QueryTypes.SELECT,
            }
        );


        // Run raw SQL query to fetch cases that are not in the list of childCaseIds
        const eqAllCases = await sequelize.query( `SELECT id, created_at , field_io_name FROM ${eqTableName} WHERE id IS NOT NULL`);


        const uiAllIds = uiAllCases.map(row => row.id);
        const eqAllIds = eqAllCases.map(row => row.id);

      
        for (const uiCaseEntry of uiAllCases) {
            const ui_case_id = uiCaseEntry.id;
            const field_io = uiCaseEntry.field_io_name;
            const createdAt = moment(uiCaseEntry.created_at);
            const isOlderThan1Days = today.diff(createdAt, "days") > 1;
            const isEqualToToday = today.isSame(createdAt, "day");
            var alertLevel = "low";
            var alertMessage = "Please assign an IO to this case";
            if(isOlderThan1Days)
            {
                alertLevel = "high";
                alertMessage = "Please assign an IO to this case, it is overdue";
            }
            if(field_io === null || field_io === "")
            {
                try{
                    
                    const existingAlert = await CaseAlerts.findOne({
                        where: {
                            module: "ui_case",
                            main_table: uiTableName,
                            record_id: ui_case_id,
                            alert_type: "IO_ALLOCATION",
                            alert_level: alertLevel,
                            alert_message: alertMessage,
                            status: {
                                [Op.iLike]: "%pending%" 
                            }
                        },
                    });
    
                    if (existingAlert) {
                        console.log(`Updating existing alert for case ${ui_case_id}`);
                        await existingAlert.update({ alert_message: alertMessage , alert_level: alertLevel });
                    } else {
                        console.log(`Creating new alert for case ${ui_case_id}`);
                        await CaseAlerts.create({
                            module: "ui_case",
                            main_table: uiTableName,
                            record_id: ui_case_id,
                            alert_type: "IO_ALLOCATION",
                            alert_level: alertLevel,
                            alert_message: alertMessage,
                            triggered_on: new Date(),
                            status: "Pending",
                            created_by: 0,
                            created_at: new Date(),
                        });
                    }
                }
                catch (error) {
                    console.error(`Error processing case ID ${ui_case_id}:`, error);
                    continue;
                }
            }
        }

        for (const eqCaseEntry of eqAllCases) {
            const eq_case_id = eqCaseEntry.id;
            const field_io = eqCaseEntry.field_io_name;
            const createdAt = moment(eqCaseEntry.created_at);
            const isOlderThan1Days = today.diff(createdAt, "days") > 1;
            const isEqualToToday = today.isSame(createdAt, "day");
            var alertLevel = "low";
            var alertMessage = "Please assign an EO to this case";
            if(isOlderThan1Days)
            {
                alertLevel = "high";
                alertMessage = "Please assign an EO to this case, it is overdue";
            }

            if(field_io === null || field_io === "")
            {
                try{
                    const existingAlert = await CaseAlerts.findOne({
                        where: {
                            module: "eq_case",
                            main_table: uiTableName,
                            record_id: eq_case_id,
                            alert_type: "EO_ALLOCATION",
                            alert_level: alertLevel,
                            alert_message: alertMessage,
                            status: {
                                [Op.iLike]: "%pending%" 
                            }
                        },
                    });
    
                    if (existingAlert) {
                        console.log(`Updating existing alert for case ${eq_case_id}`);
                        await existingAlert.update({ alert_message: alertMessage , alert_level: alertLevel });
                    } else {
                        console.log(`Creating new alert for case ${eq_case_id}`);
                        await CaseAlerts.create({
                            module: "eq_case",
                            main_table: uiTableName,
                            record_id: eq_case_id,
                            alert_type: "IO_ALLOCATION",
                            alert_level: alertLevel,
                            alert_message: alertMessage,
                            triggered_on: new Date(),
                            status: "Pending",
                            created_by: 0,
                            created_at: new Date(),
                        });
                    }
                }
                catch (error) {
                    console.error(`Error processing case ID ${eq_case_id}:`, error);
                    continue;
                }
            }
        }

        console.log(`Daily Alert Cron completed for IO Assign and EO Assign. ${updatedCount} alerts updated.`);
    } catch (error) {
        console.error("Error running Daily Alert Cron for IO Assign:", error);
    }
};

//cron for Action Plan
exports.runDailyAlertCronAP = async () => {
    try {
        const today = moment();
    
        console.log("Fetching CID Under Investigation template...");
        const ui_template = await Template.findOne({ where: { table_name: "cid_under_investigation" } });

        const eq_template = await Template.findOne({ where: { table_name: "cid_enquiry" } });

    
        if (!ui_template) {
            console.error("UI Template not found.");
            return;
        }

        if (!eq_template) {
            console.error("Enquiry Template not found.");
            return;
        }
  
        const uiTableName = ui_template.table_name;
        console.log(`Using table: ${uiTableName}`);

        const eqTableName = eq_template.table_name;
        console.log(`Using table: ${eqTableName}`);
    
        // const [allCases] = await sequelize.query(`SELECT id, created_at FROM ${tableName} WHERE id IS NOT NULL`);

        // Get all child cases from the merged cases table
        const mergedCases = await UiMergedCases.findAll({
            where: {
                merged_status: "child",
            },
            attributes: ["case_id"],
            raw: true,
        });

        const childCaseIds = mergedCases.map(row => row.case_id);

        // Run raw SQL query to fetch cases that are not in the list of childCaseIds
        const uiAllCases = await sequelize.query(
            `SELECT id, created_at FROM ${uiTableName} WHERE id IS NOT NULL AND id NOT IN (:childCaseIds)`,
            {
                replacements: { childCaseIds },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        // Run raw SQL query to fetch cases that are not in the list of childCaseIds
        const eqAllCases = await sequelize.query(`SELECT id, created_at FROM ${eqTableName} WHERE id IS NOT NULL`);


        const uiAllIds = uiAllCases.map(row => row.id);
        console.log(`Found ${uiAllIds.length} cases.`);

        const eqAllIds = eqAllCases.map(row => row.id);
        console.log(`Found ${eqAllIds.length} cases.`);

        // Fetch Action Plan template metadata
        const UIAPtableData = await Template.findOne({ where: { table_name: "cid_ui_case_action_plan" } });
    
        if (!UIAPtableData) {
            console.error(`Table UI Action Plan does not exist.`);
            return;
        }

         // Fetch Action Plan template metadata
         const EQAPtableData = await Template.findOne({ where: { table_name: "cid_eq_case_action_plan" } });
    
         if (!EQAPtableData) {
             console.error(`Table Enquiry Action Plan does not exist.`);
             return;
         }
    
        // Parse schema and build model
        const uiSchema = typeof UIAPtableData.fields === "string" ? JSON.parse(UIAPtableData.fields) : UIAPtableData.fields;
        uiSchema.push({ name: "sys_status", data_type: "TEXT", not_null: false });

        // Parse schema and build model
        const eqSchema = typeof EQAPtableData.fields === "string" ? JSON.parse(EQAPtableData.fields) : EQAPtableData.fields;
        eqSchema.push({ name: "sys_status", data_type: "TEXT", not_null: false });
  
        const UIAPmodelAttributes = {
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

        const EQAPmodelAttributes = {
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
  
        for (const field of uiSchema) {
            const { name, data_type, not_null, default_value } = field;
            const sequelizeType = typeMapping[data_type?.toUpperCase()] || Sequelize.DataTypes.STRING;
    
            UIAPmodelAttributes[name] = {
            type: sequelizeType,
            allowNull: !not_null,
            defaultValue: default_value || null,
            };
        }

        for (const field of eqSchema) {
            const { name, data_type, not_null, default_value } = field;
            const sequelizeType = typeMapping[data_type?.toUpperCase()] || Sequelize.DataTypes.STRING;
    
            UIAPmodelAttributes[name] = {
            type: sequelizeType,
            allowNull: !not_null,
            defaultValue: default_value || null,
            };
        }
  
        const UIAPModel = sequelize.define(UIAPtableData.table_name, UIAPmodelAttributes, {
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        });
    
        await UIAPModel.sync();

        const EQAPModel = sequelize.define(EQAPtableData.table_name, EQAPmodelAttributes, {
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        });
    
        await EQAPModel.sync();
    
        const uiapproval = [];
        const uiover_due = [];
        const eqapproval = [];
        const eqover_due = [];
    
        for (const caseEntry of uiAllCases) {
            const ui_case_id = caseEntry.id;
            const createdAt = moment(caseEntry.created_at);
            const isOlderThan7Days = today.diff(createdAt, "days") > 7;
    
            const actionPlanRecord = await APModel.findOne({
            where: { ui_case_id },
            order: [["created_at", "DESC"]],
            });
    
            if (actionPlanRecord) {
            if (String(actionPlanRecord.field_submit_status).toLowerCase() !== "submit") {
                if (isOlderThan7Days) {
                uiover_due.push(ui_case_id);
                } else {
                uiapproval.push(ui_case_id);
                }
            }
            } else {
            if (isOlderThan7Days) {
                uiover_due.push(ui_case_id);
            } else {
                uiapproval.push(ui_case_id);
            }
            }
        }

        
        for (const caseEntry of eqAllCases) {
            const eq_case_id = caseEntry.id;
            const createdAt = moment(caseEntry.created_at);
            const isOlderThan7Days = today.diff(createdAt, "days") > 7;
    
            const actionPlanRecord = await EQAPModel.findOne({
            where: { eq_case_id },
            order: [["created_at", "DESC"]],
            });
    
            if (actionPlanRecord) {
            if (String(actionPlanRecord.field_submit_status).toLowerCase() !== "submit") {
                if (isOlderThan7Days) {
                eqover_due.push(eq_case_id);
                } else {
                eqapproval.push(eq_case_id);
                }
            }
            } else {
            if (isOlderThan7Days) {
                eqover_due.push(eq_case_id);
            } else {
                eqapproval.push(eq_case_id);
            }
            }
        }

        // Common alert fields
        const alert_type = "ACTION_PLAN";
        const created_by = 0;

        for (const caseId of uiover_due) {
            // Delete any existing alerts for this case (low or high level)
            await CaseAlerts.destroy({
                where: {
                record_id: caseId,
                alert_type,
                module:"ui_case",
                alert_level: { [Op.in]: ["low", "high"] },
                status: {
                    [Op.iLike]: "%pending%" 
                }
                },
            });

            // Insert new high priority alert
            await CaseAlerts.create({
                module :"ui_case",
                main_table:"cid_ui_case_action_plan",
                record_id: caseId,
                alert_type,
                alert_level: "high",
                alert_message: `Case ID ${caseId} is overdue for action plan submission.`,
                triggered_on: new Date(),
                status: "Pending", 
                created_by,
                created_at: new Date(),
            });
        }

        for (const caseId of uiapproval) {
            // Delete any existing low-level alert for this case
            await CaseAlerts.destroy({
                where: {
                    record_id: caseId,
                    alert_type,
                    alert_level: "low",
                    status: {
                        [Op.iLike]: "%pending%" 
                    }
                },
            });

            // Insert new low priority alert
            await CaseAlerts.create({
                module :"ui_case",
                main_table:"cid_ui_case_action_plan",
                record_id: caseId,
                alert_type,
                alert_level: "low",
                alert_message: `Case ID ${caseId} is pending action plan submission.`,
                triggered_on: new Date(),
                status: "Pending",
                created_by,
                created_at: new Date(),
            });
        }

        for (const caseId of eqover_due) {
            // Delete any existing alerts for this case (low or high level)
            await CaseAlerts.destroy({
                where: {
                record_id: caseId,
                alert_type,
                module:"eq_case",
                alert_level: { [Op.in]: ["low", "high"] },
                status: {
                    [Op.iLike]: "%pending%" 
                }
                },
            });

            // Insert new high priority alert
            await CaseAlerts.create({
                module :"eq_case",
                main_table:"cid_eq_case_action_plan",
                record_id: caseId,
                alert_type,
                alert_level: "high",
                alert_message: `Case ID ${caseId} is overdue for action plan submission.`,
                triggered_on: new Date(),
                status: "Pending", 
                created_by,
                created_at: new Date(),
            });
        }

        for (const caseId of eqapproval) {
            // Delete any existing low-level alert for this case
            await CaseAlerts.destroy({
                where: {
                    record_id: caseId,
                    alert_type,
                    alert_level: "low",
                    status: {
                        [Op.iLike]: "%pending%" 
                    }
                },
            });

            // Insert new low priority alert
            await CaseAlerts.create({
                module :"eq_case",
                main_table:"cid_eq_case_action_plan",
                record_id: caseId,
                alert_type,
                alert_level: "low",
                alert_message: `Case ID ${caseId} is pending action plan submission.`,
                triggered_on: new Date(),
                status: "Pending",
                created_by,
                created_at: new Date(),
            });
        }
  
        console.log("Daily Alert Cron completed for Action Plan.");
    } catch (error) {
      console.error("Error running Daily Alert Cron for Action Plan:", error);
    } 
};

//cron for FSL_PF
exports.runDailyAlertCronFSL_PF = async () => {
    try {
        const today = moment();
        console.log("Fetching CID Under Investigation template...");
        
        const template = await Template.findOne({ where: { table_name: "cid_under_investigation" } });
        if (!template) return console.error("Template not found.");
        const tableName = template.table_name;

        // const [allCases] = await sequelize.query(`SELECT id FROM ${tableName} WHERE id IS NOT NULL`);
        // Get all child cases from the merged cases table
        const mergedCases = await UiMergedCases.findAll({
            where: {
                merged_status: "child",
            },
            attributes: ["case_id"],
            raw: true,
        });

        const childCaseIds = mergedCases.map(row => row.case_id);

        // Run raw SQL query to fetch cases that are not in the list of childCaseIds
        const allCases = await sequelize.query(
            `SELECT id FROM ${tableName} WHERE id IS NOT NULL AND id NOT IN (:childCaseIds)`,
            {
                replacements: { childCaseIds },
                type: sequelize.QueryTypes.SELECT,
            }
        );
        
        const allIds = allCases.map(row => row.id);
        console.log(`Found ${allIds.length} cases.`);
        const FSLtableData = await Template.findOne({ where: { table_name: "cid_ui_case_forensic_science_laboratory" } });
        if (!FSLtableData) return console.error(`Table FSL does not exist.`);

        const schema = typeof FSLtableData.fields === "string" ? JSON.parse(FSLtableData.fields) : FSLtableData.fields;
        schema.push({ name: "sys_status", data_type: "TEXT", not_null: false });
        schema.push({ name: "ui_case_id", data_type: "INTEGER", not_null: false });

        const FSLmodelAttributes = {
            id: { type: Sequelize.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            created_at: { type: Sequelize.DataTypes.DATE, allowNull: false },
            updated_at: { type: Sequelize.DataTypes.DATE, allowNull: false },
            created_by: { type: Sequelize.DataTypes.STRING, allowNull: true },
        };

        for (const field of schema) {
            const { name, data_type, not_null, default_value } = field;
            const sequelizeType = typeMapping[data_type?.toUpperCase()] || Sequelize.DataTypes.STRING;
            FSLmodelAttributes[name] = {
                type: sequelizeType,
                allowNull: !not_null,
                defaultValue: default_value || null,
            };
        }

        const FSLModel = sequelize.define(FSLtableData.table_name, FSLmodelAttributes, {
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        });

        await FSLModel.sync();

        const FSLRecords = await FSLModel.findAll({
            where: { ui_case_id: { [Op.in]: allIds } },
        });

        const alert_type = "FSL_PF";
        const created_by = 0;
        const module = "ui_case";
        const main_table = "cid_ui_case_forensic_science_laboratory";
        
        if(FSLRecords && FSLRecords.length > 0)
        {
            // Delete all alerts of this type and level regardless of case
            // await CaseAlerts.destroy({
            //     where: {
            //         alert_type,
            //         alert_level: { [Op.in]: ["low", "medium", "high"] },
            //         status: "Pending",
            //     },
            // });

       
        for (const FSLEntry of FSLRecords) {

            const fsl_id = FSLEntry.id;
            const case_id = FSLEntry.ui_case_id;
            const sent_to_fsl = FSLEntry.field_sent_to_fsl;
            const fsl_seizure_date = FSLEntry.field_seizure_date;
            const FSL_report_number = FSLEntry.field_fsl_report_number;

            const isSentToFSL = String(sent_to_fsl).toLowerCase() === "yes";

            if (!isSentToFSL && fsl_seizure_date) {
                const seizureDate = moment(fsl_seizure_date);
                const daysDiff = today.diff(seizureDate, "days");

                let alert_level = "";
                if (daysDiff >= 30) alert_level = "high";
                else if (daysDiff >=20 && daysDiff <30) alert_level = "medium";
                else if (daysDiff >= 10 && daysDiff <20) alert_level = "low";

                if (!alert_level) continue;
                const alert_message = `FSL Report number ${FSL_report_number} (FSL ID: ${fsl_id}) is not yet sent to FSL.`;
                const existingAlert = await CaseAlerts.findOne({
                    where: {
                        module,
                        main_table,
                        record_id: case_id,
                        alert_type,
                        alert_message,
                        status: "Pending",
                    },
                });

                if (!existingAlert) {
                    await CaseAlerts.create({
                        module,
                        main_table,
                        record_id: case_id,
                        alert_type,
                        alert_level,
                        alert_message,
                        triggered_on: new Date(),
                        status: "Pending",
                        created_by,
                        created_at: new Date(),
                    });
                } else {
                    const levelPriority = { low: 1, medium: 2, high: 3 };
                    
                    if (
                        levelPriority[alert_level] > levelPriority[existingAlert.alert_level]
                    ) {
                        await CaseAlerts.update(
                            { alert_level },
                            {
                                where: { id: existingAlert.id },
                            }
                        );
                        console.log(`Updated alert level for case ${case_id} to ${alert_level}`);
                    }
                }
            }

            if (isSentToFSL) {
                const alert_message = `FSL Report number ${FSL_report_number} (FSL ID: ${fsl_id}) is not yet sent to FSL.`;

                await CaseAlerts.update(
                    { status: "Completed" },
                    {
                        where: {
                            module,
                            main_table,
                            record_id: case_id,
                            alert_type,
                            alert_message, 
                            status: "Pending",
                        },
                    }
                );
            }
        }
    }

        console.log("Daily Alert Cron completed for PF sent to FSL.");
    } catch (error) {
        console.error("Error running Daily Alert Cron for PF sent to FSL:", error);
    } 
};

//cron for NATURE_OF_DISPOSAL
exports.runDailyAlertCronNATURE_OF_DISPOSAL = async () => {
  console.log('Fetching CID Under Investigation template...');
  const template = await Template.findOne({
    where: { table_name: 'cid_under_investigation' },
  });

  if (!template) {
    console.log('Template not found for cid_under_investigation, exiting cron.');
    return;
  }

  const table_name = template.table_name;

  // Get merged child cases to exclude from alerting
  const mergedCases = await UiMergedCases.findAll({
    where: { merged_status: 'child' },
    attributes: ['case_id'],
  });
  const mergedCaseIds = mergedCases.map((caseObj) => caseObj.case_id);

  // Fetch records except merged cases
  const records = await sequelize.query(
    `SELECT id, field_nature_of_disposal, field_extension_date, created_at
     FROM ${table_name}
     WHERE id IS NOT NULL
     AND id NOT IN (:mergedCaseIds)`,
    {
      replacements: { mergedCaseIds },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  console.log(`Fetched ${records.length} records to process.`);

  const alerts = [];
  const today = dayjs();

  function isBetweenDaysFromDate(baseDate, fromDays, toDays) {
    const fromDate = baseDate.add(fromDays, 'day');
    const toDate = baseDate.add(toDays, 'day');
    return today.isAfter(fromDate) && today.isBefore(toDate);
  }

for (const record of records) {
  const { id: record_id, field_nature_of_disposal, field_extension_date, created_at } = record;

  if (!created_at) {
    console.log(`Skipping case ${record_id}: missing created_at.`);
    continue;
  }

  const today = dayjs();
  const baseDate = field_extension_date ? dayjs(field_extension_date) : dayjs(created_at);

  const daysSinceCreatedAt = today.diff(dayjs(created_at), 'day');
  const extensionDate = field_extension_date ? dayjs(field_extension_date) : null;

  let alert_level = null;
  let alert_message = null;
  let newStatus = null;

  const existingAlert = await CaseAlerts.findOne({
    where: {
      main_table: table_name,
      record_id,
      alert_type: 'NATURE_OF_DISPOSAL',
      status: { [Op.notILike]: '%completed%' },
    },
  });

  if (field_nature_of_disposal) {
    if (existingAlert && existingAlert.status !== 'Completed') {
      await existingAlert.update({ status: 'Completed' });
      console.log(`Marked alert as completed for case ${record_id}`);
    }
    continue;
  }

  if (extensionDate && extensionDate.isAfter(today)) {
    alert_message = 'Case Extension Active';
    newStatus = 'extended';
    alert_level = 'Extension';
  } else { 
    if (daysSinceCreatedAt >60 && daysSinceCreatedAt <= 90) {
        alert_message = 'Alert for IO';
        alert_level = 'low';
        newStatus = 'Pending';
    }
    else if (daysSinceCreatedAt > 90 && daysSinceCreatedAt <= 180) {
      alert_message = 'Alert for DIG';
      alert_level = 'low';
      newStatus = 'Pending';
    }else if (daysSinceCreatedAt > 150 && daysSinceCreatedAt <= 180) { 
        alert_message = 'Alert for IO';
        alert_level = 'high';
        newStatus = 'Pending';
    }
    else if (daysSinceCreatedAt > 180 && daysSinceCreatedAt <= 360) {
      alert_message = 'Alert for ADGP';
      alert_level = 'low';
      newStatus = 'Pending';
    } else if (daysSinceCreatedAt > 360) {
      alert_message = 'Alert for DGP';
      alert_level = 'high';
      newStatus = 'Pending';
    } else {
      if (existingAlert && existingAlert.status !== 'Completed') {
        await existingAlert.update({ status: 'Completed' });
        console.log(`Marked alert as completed for case ${record_id} (no alert condition)`);
      }
      continue;
    }
  }

  if (existingAlert) {
    if (existingAlert.status !== newStatus) {
      await existingAlert.update({ status: newStatus, alert_message, alert_level });
      console.log(`Updated alert status for case ${record_id} to ${newStatus}`);
    } else {
      console.log(`Alert for case ${record_id} already up-to-date with status ${newStatus}`);
    }
  } else {
    // Create new alert record
    await CaseAlerts.create({
      module: 'ui_case',
      main_table: table_name,
      record_id,
      alert_type: 'NATURE_OF_DISPOSAL',
      alert_message,
      alert_level,
      status: newStatus,
    });
    console.log(`Created new alert for case ${record_id} with status ${newStatus}`);
  }
}

  console.log(`Total alerts to process: ${alerts.length}`);

  for (const alert of alerts) {
    try {
      const existingAlert = await CaseAlerts.findOne({
        where: {
          module: alert.module,
          main_table: alert.main_table,
          record_id: alert.record_id,
          alert_type: alert.alert_type,
          status: { [Op.iLike]: '%pending%' },
        },
      });

      if (existingAlert) {
        console.log(`Skipped alert for case ${alert.record_id} (already exists): ${alert.alert_message}`);
      } else {
        await CaseAlerts.create(alert);
        console.log(`Created alert for case ${alert.record_id}: ${alert.alert_message}`);
      }
    } catch (err) {
      console.error(`Error processing alert for case ${alert.record_id}:`, err);
    }
  }

  console.log('Daily Alert Cron completed for Nature Of Disposal.');
};


//cron for Accused
exports.runDailyAlertCronAccused = async () => {
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
    
        // const [allCases] = await sequelize.query(`SELECT id, created_at FROM ${tableName} WHERE id IS NOT NULL`);

        // Get all child cases from the merged cases table
        const mergedCases = await UiMergedCases.findAll({
            where: {
                merged_status: "child",
            },
            attributes: ["case_id"],
            raw: true,
        });

        const childCaseIds = mergedCases.map(row => row.case_id);

        // Run raw SQL query to fetch cases that are not in the list of childCaseIds
        const allCases = await sequelize.query(
            `SELECT id FROM ${tableName} WHERE id IS NOT NULL AND id NOT IN (:childCaseIds)`,
            {
                replacements: { childCaseIds },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        const allIds = allCases.map(row => row.id);
        console.log(`Found ${allIds.length} cases.`);
    
        // Fetch Action Plan template metadata
        const AccusedtableData = await Template.findOne({ where: { table_name: "cid_ui_case_accused" } });
    
        if (!AccusedtableData) {
            console.error(`Table Action Plan does not exist.`);
            return;
        }
    
        // Parse schema and build model
        const schema = typeof AccusedtableData.fields === "string" ? JSON.parse(AccusedtableData.fields) : AccusedtableData.fields;
        schema.push({ name: "sys_status", data_type: "TEXT", not_null: false });
  
        const AccusedmodelAttributes = {
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
    
            AccusedmodelAttributes[name] = {
            type: sequelizeType,
            allowNull: !not_null,
            defaultValue: default_value || null,
            };
        }
  
        const AccusedModel = sequelize.define(AccusedtableData.table_name, AccusedmodelAttributes, {
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        });
    
        await AccusedModel.sync();
    
        const approval = [];
        const over_due = [];
    
        for (const caseEntry of allCases) {
            const case_id = caseEntry.id;
            const createdAt = moment(caseEntry.created_at);

    
            const actionPlanRecord = await AccusedModel.findOne({
                where: { [Op.or] : { ui_case_id : case_id , pt_case_id : case_id}  },
                order: [["created_at", "DESC"]],
            });
    
            if (actionPlanRecord) {
            if (String(actionPlanRecord.field_submit_status).toLowerCase() !== "submit") {
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
        const module = "ui_case";
        const main_table = "cid_ui_case_action_plan";

        for (const caseId of over_due) {
            // Delete any existing alerts for this case (low or high level)
            await CaseAlerts.destroy({
                where: {
                record_id: caseId,
                alert_type,
                alert_level: { [Op.in]: ["low", "high"] },
                status: {
                    [Op.iLike]: "%pending%" 
                }
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
                    status: {
                        [Op.iLike]: "%pending%" 
                    }
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
                triggered_on: new Date(),
                status: "Pending",
                created_by,
                created_at: new Date(),
            });
        }
  
        console.log("Daily Alert Cron completed for Action Plan.");
        // console.log("Overdue Cases:", over_due);
        // console.log("Approval Pending Cases:", approval);
    } catch (error) {
      console.error("Error running Daily Alert Cron for Action Plan:", error);
    } 
};


