const { UiCaseApproval, ApprovalItem  , Designation} = require("../models");
const fs = require("fs");
const path = require("path");
const dbConfig = require("../config/dbConfig");

exports.create_ui_case_approval = async (req, res) => {
  const {
    approval_item,
    approved_by,
    approval_date,
    remarks,
    ui_case_id,
    transaction_id,
  } = req.body;

  // Transaction ID validation
  if (!transaction_id || transaction_id === "") {
    return res.status(400).json({ success: false, message: "Transaction Id is required!" });
  }

  const dirPath = path.join(__dirname, `../data/ui_case_approval_unique/${transaction_id}`);

  // Check if directory exists
  if (fs.existsSync(dirPath)) {
    return res.status(400).json({
      success: false,
      message: "Duplicate transaction detected.",
    });
  }
  // Create directory
  fs.mkdirSync(dirPath, { recursive: true });

  const t = await dbConfig.sequelize.transaction();

  try {
    // Validate approval_item
    const existingApprovalItem = await ApprovalItem.findByPk(approval_item);
    if (!existingApprovalItem) {
      await t.rollback();
      return res.status(400).json({ message: "Invalid approval item ID" });
    }


    // Create UiCaseApproval
    const newApproval = await UiCaseApproval.create(
      {
        approval_item,
        approved_by,
        approval_date: approval_date || new Date(), // Use current date if not provided
        remarks,
        ui_case_id,
      },
      { transaction: t }
    );

    await t.commit();
    return res.status(201).json({ success: true, message: "UiCaseApproval created successfully", data: newApproval });
  } catch (error) {
    if (t.finished !== "rollback") {
      await t.rollback();
    }
    console.error("Error creating UiCaseApproval:", error);
    return res.status(500).json({ message: "Failed to create UiCaseApproval", error: error.message });
  } finally {
    if (fs.existsSync(dirPath)) {
      fs.rmdirSync(dirPath, { recursive: true });
    }
  }
};

// Function to view all approvals
exports.get_ui_case_approvals = async (req, res) => {
  try {
     const {
      ui_case_id,
    } = req.body;


    const approvals = await UiCaseApproval.findAll({
        include: [
            {
                model: ApprovalItem,
                as: "approvalItem",
                attributes: ["name"],
            },
            {
                model: Designation,
                as: "approvedBy",
                attributes: ["designation_name"],
            },
        ],
        where: { ui_case_id: ui_case_id },
        attributes: ["approval_id", "approval_item", "approved_by", "approval_date", "remarks"],
    });

    const formattedApprovals = approvals.map(approval => ({
        approval_id: approval.approval_id,
        approval_item: approval.approval_item,
        approved_by: approval.approved_by,
        approval_date: approval.approval_date,
        remarks: approval.remarks,
        approvalItem: approval.approvalItem?.name || null,  // Extract the name directly
        approvedBy: approval.approvedBy?.designation_name || null, // Extract the designation_name directly
    }));

    const approval_item = await ApprovalItem.findAll();
    
    const designation = await Designation.findAll();

    return res.status(200).json({ success: true, data: {"approvals":formattedApprovals , 'approval_item' : approval_item , 'designation' :designation}});
  } catch (error) {
    console.error("Error fetching UiCaseApprovals:", error);
    return res.status(500).json({ message: "Failed to fetch UiCaseApprovals", error: error.message });
  }
};