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
exports.runDailyAlertCronIO = async () => {
    try {
        const today = moment().startOf("day");
        const case_modules = ["ui_case", "pt_case", "eq_case"];

        const ioAlertsData = await CaseAlerts.findAll({
            where: { 
                alert_type: "IO_ALLOCATION",
                module: { [Op.in]: case_modules },
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
                updatedCount++;
            }
        }

        console.log(`Daily Alert Cron completed for IO Assign. ${updatedCount} alerts updated.`);
    } catch (error) {
        console.error("Error running Daily Alert Cron for IO Assign:", error);
    }
};


//cron for Action Plan
exports.runDailyAlertCronAP = async () => {
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
            console.error(`Table Action Plan does not exist.`);
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

//cron for FSL_PF
exports.runDailyAlertCronFSL_PF = async () => {
    try {
        const today = moment();
        console.log("Fetching CID Under Investigation template...");
        
        const template = await Template.findOne({ where: { table_name: "cid_under_investigation" } });
        if (!template) return console.error("Template not found.");
        const tableName = template.table_name;

        const [allCases] = await sequelize.query(`SELECT id FROM ${tableName} WHERE id IS NOT NULL`);
        const allIds = allCases.map(row => row.id);
        console.log(`Found ${allIds.length} cases.`);

        const FSLtableData = await Template.findOne({ where: { table_name: "cid_ui_case_forensic_science_laboratory" } });
        if (!FSLtableData) return console.error(`Table FSL does not exist.`);

        const schema = typeof FSLtableData.fields === "string" ? JSON.parse(FSLtableData.fields) : FSLtableData.fields;
        schema.push({ name: "sys_status", data_type: "TEXT", not_null: false });

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
            await CaseAlerts.destroy({
                where: {
                    alert_type,
                    alert_level: { [Op.in]: ["low", "medium", "high"] },
                },
            });
       
            for (const FSLEntry of FSLRecords) {
                const case_id = FSLEntry.ui_case_id;
                const sent_to_fsl = FSLEntry.field_sent_to_fsl;
                const fsl_seizure_date = FSLEntry.field_seizure_date;
                const FSL_report_number = FSLEntry.field_fsl_report_number;
    
                if (String(sent_to_fsl).toLowerCase() === "no" && fsl_seizure_date) {
                    const seizureDate = moment(fsl_seizure_date);
                    const daysDiff = today.diff(seizureDate, "days");
    
                    let alert_level = "low";
                    if (daysDiff > 30) alert_level = "high";
                    else if (daysDiff > 20) alert_level = "medium";
    
                    // Insert updated alert
                    await CaseAlerts.create({
                        module,
                        main_table,
                        record_id: case_id,
                        alert_type,
                        alert_level,
                        alert_message: `FSL Report number ${FSL_report_number} is not yet sent to FSL.`,
                        triggered_on: new Date(),
                        status: "Pending",
                        created_by,
                        created_at: new Date(),
                    });
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
    try {
        const today = moment();
        console.log("Fetching CID Under Investigation template...");
        
        const template = await Template.findOne({ where: { table_name: "cid_under_investigation" } });
        if (!template) return console.error("Template not found.");
        const tableName = template.table_name;

        const [allCases] = await sequelize.query(`SELECT id, field_nature_of_disposal, field_extension_date, created_at FROM ${tableName} WHERE id IS NOT NULL`);

        const allIds = allCases.map(row => row.id);

        const alert_type = "NATURE_OF_DISPOSAL";
        const created_by = 0;
        const module = "ui_case";
        const main_table = "cid_under_investigation";
        
        for (const caseEntry of allCases) {
            const ui_case_id = caseEntry.id;
            const record_id = ui_case_id;
            const createdAt = moment(caseEntry.created_at);
            const field_nature_of_disposal = caseEntry.field_nature_of_disposal;
            const field_extension_date = (caseEntry.field_extension_date && caseEntry.field_extension_date !== "")  ? moment(caseEntry.field_extension_date)  : null;
            
            if ((field_nature_of_disposal == "" || field_nature_of_disposal == null) && !field_extension_date)
            {
                const daysSinceCreated = today.diff(createdAt, "days");
            
                const isBetween60to90Days = daysSinceCreated >= 60 && daysSinceCreated < 90;
                const isBetween90to180Days = daysSinceCreated >= 90 && daysSinceCreated < 180;
                const isBetween180to360Days = daysSinceCreated >= 180 && daysSinceCreated < 360;
                const isAbove360Days = daysSinceCreated >= 360;
                var alert_level = "low";

                if(isBetween60to90Days)
                {
                    const nature_of_disposal_io_alert = await CaseAlerts.findOne({
                        where: { 
                            module ,
                            alert_type,
                            main_table , 
                            record_id ,
                            alert_message : "Alert for IO",
                            status: {
                                [Op.iLike]: "%pending%" 
                            }
                        },
                    });

                    const io_alert_record_Id = nature_of_disposal_io_alert ? nature_of_disposal_io_alert.record_id : null;

                    if (!io_alert_record_Id)
                    {
                        await CaseAlerts.create({
                            module,
                            main_table,
                            record_id,
                            alert_type:"NATURE_OF_DISPOSAL",
                            alert_level:"low",
                            alert_message : "Alert for IO",
                            due_date : createdAt.clone().add(60, 'days').toDate(),
                            triggered_on : new Date(),
                            resolved_on: null,
                            status:"Pending",
                            created_by,
                            created_at: caseEntry.created_at,
                        });
                    }
                }
                else if(isBetween90to180Days)
                {
                    await CaseAlerts.update(
                        { status: "Not Completed" },
                        {
                            where: { 
                                module ,
                                alert_type,
                                main_table , 
                                record_id ,
                                alert_message : "Alert for IO",
                                alert_level: {
                                    [Op.in]: ["low", "high"]
                                },
                                status: {
                                    [Op.iLike]: "%pending%" 
                                }
                            },
                        }
                    );

                    const isBetween150to180Days = daysSinceCreated >= 150 && daysSinceCreated < 180;
                    var due_date =  createdAt.clone().add(150, 'days').toDate();
                    if(isBetween150to180Days)
                    {
                        alert_level = "high"
                        due_date =  createdAt.clone().add(180, 'days').toDate();
                    }

                    if(alert_level == "high")
                    {
                        await CaseAlerts.update(
                            { status: "Not Completed" },
                            {
                                where: { 
                                    module ,
                                    alert_type,
                                    main_table , 
                                    record_id  ,
                                    alert_message : "Alert for DIG",
                                    alert_level: {
                                        [Op.in]: ["low", "high"]
                                    },
                                    status: {
                                        [Op.iLike]: "%pending%" 
                                    }
                                },
                            }
                        );
                    }

                    const nature_of_disposal_dig_alert = await CaseAlerts.findOne({
                        where: { 
                            module ,
                            alert_type,
                            main_table , 
                            record_id ,
                            alert_message : "Alert for DIG",
                            alert_level,
                            status: {
                                [Op.iLike]: "%pending%" 
                            }
                        },
                    });

                    const dig_alert_record_Id = nature_of_disposal_dig_alert ? nature_of_disposal_dig_alert.record_id : null;

                    if (!dig_alert_record_Id)
                    {
                        await CaseAlerts.create({
                            module,
                            main_table,
                            record_id,
                            alert_type:"NATURE_OF_DISPOSAL",
                            alert_level,
                            alert_message : "Alert for DIG",
                            due_date,
                            triggered_on : new Date(),
                            resolved_on: null,
                            status:"Pending",
                            created_by,
                            created_at: caseEntry.created_at,
                        });
                    }
                }
                else if(isBetween180to360Days)
                {
                    await CaseAlerts.update(
                        { status: "Not Completed" },
                        {
                            where: { 
                                module ,
                                alert_type,
                                main_table , 
                                record_id ,
                                alert_message : "Alert for DIG",
                                alert_level : "low",
                                status: {
                                    [Op.iLike]: "%pending%" 
                                }
                            },
                        }
                    );

                    const isBetween240to360Days = daysSinceCreated >= 240 && daysSinceCreated < 360;
                    var due_date =  createdAt.clone().add(240, 'days').toDate();
                    if(isBetween240to360Days)
                    {
                        alert_level = "high"
                        due_date =  createdAt.clone().add(360, 'days').toDate();
                    }

                    if(alert_level == "high")
                    {
                        await CaseAlerts.update(
                            { status: "Not Completed" },
                            {
                                where: { 
                                    module ,
                                    alert_type,
                                    main_table , 
                                    record_id ,
                                    alert_message : "Alert for ADGP",
                                    alert_level : "low",
                                    status: {
                                        [Op.iLike]: "%pending%" 
                                    }
                                },
                            }
                        );
                    }

                    const nature_of_disposal_adgp_alert = await CaseAlerts.findOne({
                        where: { 
                            module ,
                            alert_type,
                            main_table , 
                            record_id  ,
                            alert_message : "Alert for ADGP",
                            alert_level,
                            status: {
                                [Op.iLike]: "%pending%" 
                            }
                        },
                    });

                    const adgp_alert_record_Id = nature_of_disposal_adgp_alert ? nature_of_disposal_adgp_alert.record_id : null;

                    if(!adgp_alert_record_Id)
                    {
                        await CaseAlerts.create({
                            module,
                            main_table,
                            record_id,
                            alert_type:"NATURE_OF_DISPOSAL",
                            alert_level,
                            alert_message : "Alert for ADGP",
                            due_date,
                            triggered_on : new Date(),
                            resolved_on: null,
                            status:"Pending",
                            created_by,
                            created_at: caseEntry.created_at,
                        });
                    }
                }
                else if(isAbove360Days){
                    await CaseAlerts.update(
                        { status: "Not Completed" },
                        {
                            where: { 
                                module ,
                                alert_type,
                                main_table , 
                                record_id  ,
                                alert_message : "Alert for ADGP",
                                alert_level: {
                                    [Op.in]: ["low", "high"]
                                },
                                status: {
                                    [Op.iLike]: "%pending%" 
                                }
                            },
                        }
                    );

                    const nature_of_disposal_dgp_alert = await CaseAlerts.findOne({
                        where: { 
                            module ,
                            alert_type,
                            main_table , 
                            record_id ,
                            alert_message : "Alert for DGP",
                            alert_level : "high",
                            status: {
                                [Op.iLike]: "%pending%" 
                            }
                        },
                    });

                    const dgp_alert_record_Id = nature_of_disposal_dgp_alert ? nature_of_disposal_dgp_alert.record_id : null;

                    if(!dgp_alert_record_Id)
                    {
                        await CaseAlerts.create({
                            module,
                            main_table,
                            record_id,
                            alert_type:"NATURE_OF_DISPOSAL",
                            alert_level : "high",
                            alert_message : "Alert for DGP",
                            triggered_on : new Date(),
                            resolved_on: null,
                            status:"Pending",
                            created_by,
                            created_at: caseEntry.created_at,
                        });
                    }
                }
            }
            else if ((field_nature_of_disposal == "" || field_nature_of_disposal == null) && field_extension_date) {
                const daysSinceExtension = today.diff(field_extension_date, "days");
            
                const isBetween60to90Days = daysSinceExtension >= 60 && daysSinceExtension < 90;
                const isBetween90to180Days = daysSinceExtension >= 90 && daysSinceExtension < 180;
                const isBetween180to360Days = daysSinceExtension >= 180 && daysSinceExtension < 360;
                const isAbove360Days = daysSinceExtension >= 360;
                var alert_level = "low";
            
                if (isBetween60to90Days) {
                    const nature_of_disposal_io_alert = await CaseAlerts.findOne({
                        where: {
                            module,
                            alert_type,
                            main_table,
                            record_id,
                            alert_message: "Alert for IO",
                            status: { [Op.iLike]: "%pending%" }
                        },
                    });
            
                    const io_alert_record_Id = nature_of_disposal_io_alert ? nature_of_disposal_io_alert.record_id : null;
            
                    if (!io_alert_record_Id) {
                        await CaseAlerts.create({
                            module,
                            main_table,
                            record_id,
                            alert_type: "NATURE_OF_DISPOSAL",
                            alert_level: "low",
                            alert_message: "Alert for IO",
                            due_date: field_extension_date.clone().add(60, 'days').toDate(),
                            triggered_on: new Date(),
                            resolved_on: null,
                            status: "Pending",
                            created_by,
                            created_at: caseEntry.created_at,
                        });
                    }
                }
                else if (isBetween90to180Days) {
                    await CaseAlerts.update(
                        { status: "Not Completed" },
                        {
                            where: {
                                module,
                                alert_type,
                                main_table,
                                record_id,
                                alert_message: "Alert for IO",
                                alert_level: { [Op.in]: ["low", "high"] },
                                status: { [Op.iLike]: "%pending%" }
                            },
                        }
                    );
            
                    const isBetween150to180Days = daysSinceExtension >= 150 && daysSinceExtension < 180;
                    var due_date = field_extension_date.clone().add(150, 'days').toDate();
                    if (isBetween150to180Days) {
                        alert_level = "high";
                        due_date = field_extension_date.clone().add(180, 'days').toDate();
                    }
            
                    if (alert_level == "high") {
                        await CaseAlerts.update(
                            { status: "Not Completed" },
                            {
                                where: {
                                    module,
                                    alert_type,
                                    main_table,
                                    record_id,
                                    alert_message: "Alert for DIG",
                                    alert_level: { [Op.in]: ["low", "high"] },
                                    status: { [Op.iLike]: "%pending%" }
                                },
                            }
                        );
                    }
            
                    const nature_of_disposal_dig_alert = await CaseAlerts.findOne({
                        where: {
                            module,
                            alert_type,
                            main_table,
                            record_id,
                            alert_message: "Alert for DIG",
                            alert_level,
                            status: { [Op.iLike]: "%pending%" }
                        },
                    });
            
                    const dig_alert_record_Id = nature_of_disposal_dig_alert ? nature_of_disposal_dig_alert.record_id : null;
            
                    if (!dig_alert_record_Id) {
                        await CaseAlerts.create({
                            module,
                            main_table,
                            record_id,
                            alert_type: "NATURE_OF_DISPOSAL",
                            alert_level,
                            alert_message: "Alert for DIG",
                            due_date,
                            triggered_on: new Date(),
                            resolved_on: null,
                            status: "Pending",
                            created_by,
                            created_at: caseEntry.created_at,
                        });
                    }
                }
                else if (isBetween180to360Days) {
                    await CaseAlerts.update(
                        { status: "Not Completed" },
                        {
                            where: {
                                module,
                                alert_type,
                                main_table,
                                record_id,
                                alert_message: "Alert for DIG",
                                alert_level: "low",
                                status: { [Op.iLike]: "%pending%" }
                            },
                        }
                    );
            
                    const isBetween240to360Days = daysSinceExtension >= 240 && daysSinceExtension < 360;
                    var due_date = field_extension_date.clone().add(240, 'days').toDate();
                    if (isBetween240to360Days) {
                        alert_level = "high";
                        due_date = field_extension_date.clone().add(360, 'days').toDate();
                    }
            
                    if (alert_level == "high") {
                        await CaseAlerts.update(
                            { status: "Not Completed" },
                            {
                                where: {
                                    module,
                                    alert_type,
                                    main_table,
                                    record_id,
                                    alert_message: "Alert for ADGP",
                                    alert_level: "low",
                                    status: { [Op.iLike]: "%pending%" }
                                },
                            }
                        );
                    }
            
                    const nature_of_disposal_adgp_alert = await CaseAlerts.findOne({
                        where: {
                            module,
                            alert_type,
                            main_table,
                            record_id,
                            alert_message: "Alert for ADGP",
                            alert_level,
                            status: { [Op.iLike]: "%pending%" }
                        },
                    });
            
                    const adgp_alert_record_Id = nature_of_disposal_adgp_alert ? nature_of_disposal_adgp_alert.record_id : null;
            
                    if (!adgp_alert_record_Id) {
                        await CaseAlerts.create({
                            module,
                            main_table,
                            record_id,
                            alert_type: "NATURE_OF_DISPOSAL",
                            alert_level,
                            alert_message: "Alert for ADGP",
                            due_date,
                            triggered_on: new Date(),
                            resolved_on: null,
                            status: "Pending",
                            created_by,
                            created_at: caseEntry.created_at,
                        });
                    }
                }
                else if(isAbove360Days) {
                    await CaseAlerts.update(
                        { status: "Not Completed" },
                        {
                            where: {
                                module,
                                alert_type,
                                main_table,
                                record_id,
                                alert_message: "Alert for ADGP",
                                alert_level: { [Op.in]: ["low", "high"] },
                                status: { [Op.iLike]: "%pending%" }
                            },
                        }
                    );
            
                    const nature_of_disposal_dgp_alert = await CaseAlerts.findOne({
                        where: {
                            module,
                            alert_type,
                            main_table,
                            record_id,
                            alert_message: "Alert for DGP",
                            alert_level: "high",
                            status: { [Op.iLike]: "%pending%" }
                        },
                    });
            
                    const dgp_alert_record_Id = nature_of_disposal_dgp_alert ? nature_of_disposal_dgp_alert.record_id : null;
            
                    if (!dgp_alert_record_Id) {
                        await CaseAlerts.create({
                            module,
                            main_table,
                            record_id,
                            alert_type: "NATURE_OF_DISPOSAL",
                            alert_level: "high",
                            alert_message: "Alert for DGP",
                            triggered_on: new Date(),
                            resolved_on: null,
                            status: "Pending",
                            created_by,
                            created_at: caseEntry.created_at,
                        });
                    }
                }
            }            
        }

        console.log("Daily Alert Cron completed for Nature Of Disposal.");
    } catch (error) {
        console.error("Error running Daily Alert Cron for Nature Of Disposal:", error);
    } 
};

