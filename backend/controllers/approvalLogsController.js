const { UiCaseApprovalLog } = require("../models")
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

module.exports = { getApprovalLogs }