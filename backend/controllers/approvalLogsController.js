const { UiCaseApprovalLog, System_Alerts } = require("../models")
const fs = require('fs');
const path = require('path');
const { userSendResponse } = require("../services/userSendResponse");

const getApprovalLogs = async (req, res) => {

    const { data, transaction_id } = req.body

    try {

        if (!Array.isArray(data)) {
            return userSendResponse(res, 400, false, "Data must be an array");
        }
        // Check for duplicate transaction
        if (fs.existsSync(path.join('data/approval_unique/', transaction_id))) {
            return userSendResponse(res, 400, false, "Duplicate transaction");
        }

        //create empty file for uniq transaction
        fs.writeFileSync(path.join('data/approval_unique/', transaction_id), '');

        // Begin transaction
        const transaction = await UiCaseApprovalLog.transaction();

        // Add multiple approval log entries
        const approvalLogs = data.map(item => ({
            ui_case_id: item.ui_case_id,
            approval_item_id: item.approval_item_id,
            approved_by: item.approved_by,
            date_of_approval: item.date_of_approval,
            comments: item.comments,
        }))
        console.log(approvalLogs)
        await UiCaseApprovalLog.bulkCreate(approvalLogs, { transaction: transaction });
        // Commit transaction
        await transaction.commit();
        // Delete the file created for uniq transaction
        fs.unlinkSync(path.join('data/approval_unique/', transaction_id));
        return userSendResponse(res, 200, true, "Approval logs created successfully");
    } catch (error) {
        // Rollback transaction
        await transaction.rollback();
        return userSendResponse(res, 500, false, "Error creating approval logs");
    }

}


const getAddAlertAfterApproval = async (req, res) => {
    const { ui_case_id, approval_log_id, alert_message, alert_type, transaction_id } = req.body

    try {
        if (
            !ui_case_id ||
            !approval_log_id ||
            !alert_message ||
            !alert_type ||    
            !transaction_id
        ) {
            return userSendResponse(res, 400, false, "All fields are required"); 
        }
        if (fs.existsSync(path.join('data/approval_unique/', transaction_id))) {
            return userSendResponse(res, 400, false, "Duplicate transaction");
        }

        //create empty file for uniq transaction
        fs.writeFileSync(path.join('data/approval_unique/', transaction_id), '');

        // Begin transaction
        const transaction = await System_Alerts.transaction();
        //create alert
        const newAlert = await System_Alerts.create({
            ui_case_id: ui_case_id,
            alert_message,
            alert_type,
            alert_status: "pending",  // Default status is pending
            created_at: new Date(),
            transaction_id,
        })
        const alert = await System_Alerts.create(newAlert, { transaction });
        // Commit the transaction
        await transaction.commit();

        // Delete the file created for the unique transaction
        fs.unlinkSync(path.join("data/approval_unique/", transaction_id));

        return userSendResponse(res, 200, true, "Alert added successfully", {
            alert_id: alert.system_alert_id, // Return the generated alert ID
        });
    } catch (error) {

        return userSendResponse(res, 500, false, "Error adding alert");
    }
}


module.exports = { getApprovalLogs, getAddAlertAfterApproval }