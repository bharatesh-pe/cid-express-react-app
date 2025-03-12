
const { UiCaseApprovalLog } = require("../models")
const { adminSendResponse } = require("../services/adminSendResponse")


const getApprovalLogs = async (req, res) => {

    const { ui_case_id, approval_item_id, approved_by, date_of_approval, comments, transaction_id } = req.body

    try {
        const existingLogs = await UiCaseApprovalLog.findOne({
            where: { transaction_id }
        })

        if (existingLogs) {
            const errors = { Approval_logs: "Duplicate transaction detected. Approval log entry already exists." }
            adminSendResponse(res, 400, false, "Validation Error", null, errors)
        }

        const createNewApprovalLogs = await UiCaseApprovalLog.create({
            ui_case_id,
            approval_item_id,
            approved_by,
            date_of_approval,
            comments,
            transaction_id
        })
        adminSendResponse(res, 200, true, "Approval log entry added successfully.", createNewApprovalLogs)
    } catch (error) {
        return adminSendResponse(res, 500, false, error.message)
    }

}

module.exports = { getApprovalLogs }