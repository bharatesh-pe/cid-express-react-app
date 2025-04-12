const {
  UiCaseApproval,
  ApprovalItem,
  Designation,
  System_Alerts,
  UsersHierarchy,
  AlertViewStatus,
  KGID,
  Users,
} = require("../models");
const fs = require("fs");
const path = require("path");
const dbConfig = require("../config/dbConfig");
const { Op } = require("sequelize");
const { where } = require("sequelize");

exports.create_ui_case_approval = async (req, res) => {
  const { user_id } = req.user;
  const {
    approval_item,
    approved_by,
    approval_date,
    remarks,
    case_id,
    case_type,
    module,
    action,
    transaction_id,
    created_by_designation_id,
    created_by_division_id,
    info,
  } = req.body;

  // Transaction ID validation
  if (!transaction_id || transaction_id === "") {
    return res
      .status(400)
      .json({ success: false, message: "Transaction Id is required!" });
  }

  const dirPath = path.join(
    __dirname,
    `../data/ui_case_approval_unique/${transaction_id}`
  );

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
        reference_id: case_id,
        approval_type: case_type,
        module,
        action,
        created_by: user_id || null,
      },
      { transaction: t }
    );

    let reference_id = case_id || null;
    if (!reference_id) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message:
          "At least one of ui_case_id, pt_case_id, or eq_case_id is required.",
      });
    }

    // Create System_Alerts entry
    const systemAlert = await System_Alerts.create(
      {
        approval_id: newApproval.approval_id,
        reference_id: reference_id,
        alert_type: "Approval",
        alert_message: newApproval.remarks,
        created_by: user_id || null,
        created_by_designation_id: created_by_designation_id || null,
        created_by_division_id: created_by_division_id || null,
      },
      { transaction: t }
    );

    await t.commit();
    return res.status(201).json({
      success: true,
      message: "UiCaseApproval created successfully",
      data: newApproval,
      alert_data: systemAlert,
    });
  } catch (error) {
    if (t.finished !== "rollback") {
      await t.rollback();
    }
    console.error("Error creating Approval:", error);
    return res.status(500).json({
      message: "Failed to create Approval",
      error: error.message,
    });
  } finally {
    if (fs.existsSync(dirPath)) {
      fs.rmdirSync(dirPath, { recursive: true });
    }
  }
};

// Function to view all approvals
exports.get_ui_case_approvals = async (req, res) => {
  try {
    const { case_id } = req.body;
    let whereCondition = {};

    // Dynamically add conditions
    if (case_id) {
      whereCondition.reference_id = case_id;
    }

    let formattedApprovals = [];
    let approvals = [];
    if (whereCondition && Object.keys(whereCondition).length > 0) {
      approvals = await UiCaseApproval.findAll({
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
        where: whereCondition,
      });

      formattedApprovals = approvals.map((approval) => ({
        approval_id: approval.approval_id,
        approval_item: approval.approval_item,
        approved_by: approval.approved_by,
        approval_date: approval.approval_date,
        remarks: approval.remarks,
        approvalItem: approval.approvalItem?.name || null, // Extract the name directly
        approvedBy: approval.approvedBy?.designation_name || null, // Extract the designation_name directly
      }));
    }

    const approval_item = await ApprovalItem.findAll();

    const designation = await Designation.findAll();

    return res.status(200).json({
      success: true,
      data: {
        approvals: formattedApprovals,
        approval_item: approval_item,
        designation: designation,
      },
    });
  } catch (error) {
    console.error("Error fetching Approvals:", error);
    return res.status(500).json({
      message: "Failed to fetch Approvals",
      error: error.message,
    });
  }
};

exports.get_alert_notification = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { user_designation_id, user_division_id } = req.body;

    // Step 1: Get subordinate designation IDs
    const subordinates = await UsersHierarchy.findAll({
      where: { supervisor_designation_id: user_designation_id },
      attributes: ["officer_designation_id"],
      raw: true,
    });

    const officer_designation_ids = subordinates.map(
      (d) => d.officer_designation_id
    );

    // Step 2: Get alerts created by those designations within the same division
    const alertNotifications = await System_Alerts.findAll({
      where: {
        created_by_designation_id: { [Op.in]: officer_designation_ids },
        created_by_division_id: user_division_id,
      },
      order: [["created_at", "DESC"]],
    });

    // Step 3: Enrich alerts with read status
    let complete_data = await Promise.all(
      alertNotifications.map(async (notification) => {
        const alertViewStatus = await AlertViewStatus.findOne({
          where: {
            system_alert_id: notification.system_alert_id,
            viewed_by: user_id,
            viewed_by_designation_id: user_designation_id,
            viewed_by_division_id: user_division_id,
          },
        });

        return {
          ...notification.toJSON(),
          read_status: alertViewStatus ? alertViewStatus.view_status : false,
        };
      })
    );

    // Step 4: Fetch names via created_by → Users → KGID
    const userIds = [...new Set(complete_data.map((n) => n.created_by))];

    const users = await Users.findAll({
      where: { user_id: { [Op.in]: userIds } },
      attributes: ["user_id", "kgid_id"],
      raw: true,
    });

    const kgidIds = users.map((u) => u.kgid_id);
    const userMap = users.reduce((acc, user) => {
      acc[user.user_id] = user.kgid_id;
      return acc;
    }, {});

    const kgids = await KGID.findAll({
      where: { id: { [Op.in]: kgidIds } },
      attributes: ["id", "name"],
      raw: true,
    });

    const kgidMap = kgids.reduce((acc, k) => {
      acc[k.id] = k.name;
      return acc;
    }, {});

    // Step 5: Attach names to alerts
    complete_data = complete_data.map((notification) => ({
      ...notification,
      created_by_name: kgidMap[userMap[notification.created_by]] || null,
    }));

    const designationsIds = [...new Set(complete_data.map((n) => n.created_by_designation_id))];

    const designations = await Designation.findAll({
      where: { designation_id: { [Op.in]: designationsIds } },
      attributes: ["designation_id", "designation_name"],
      raw: true,
    });

    const designationMap = designations.reduce((acc, k) => {
      acc[k.designation_id] = k.designation_name;
      return acc;
    }, {});

    complete_data = complete_data.map((notification) => ({
      ...notification,
      created_by_designation_id: designationMap[notification.created_by_designation_id] || null,
    }));

    const unreadCount = complete_data.filter((n) => !n.read_status).length;

    return res.status(200).json({
      success: true,
      unreadCount,
      data: complete_data,
    });
  } catch (error) {
    console.error("Error fetching alert notifications:", error);
    return res.status(500).json({
      message: "Failed to fetch alert notifications",
      error: error.message,
    });
  }
};

exports.get_case_approval_by_id = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { approval_id, user_designation_id, user_division_id } = req.body;

    // Get approval details
    const approvalDetails = await UiCaseApproval.findOne({
      where: { approval_id },
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
      raw: true,
      nest: true,
    });

    if (!approvalDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Approval not found" });
    }

    // Fetch the created_by user's KGID ID
    const user = await Users.findOne({
      where: { user_id: approvalDetails.created_by },
      attributes: ["kgid_id"],
      raw: true,
    });

    // Fetch the name from KGID table using kgid_id
    let creatorName = null;
    if (user && user.kgid_id) {
      const kgid = await KGID.findOne({
        where: { id: user.kgid_id },
        attributes: ["name"],
        raw: true,
      });

      if (kgid) {
        creatorName = kgid.name;
      }
    }

    // Final response formatting
    const formattedDetails = {
      ...approvalDetails,
      approvalItem: approvalDetails.approvalItem?.name || null,
      approvedBy: approvalDetails.approvedBy?.designation_name || null,
      created_by: creatorName,
    };

    // Fetch associated alert
    const alertNotification = await System_Alerts.findOne({
      where: { approval_id },
      raw: true,
    });

    if (alertNotification) {
      // Update view status if not already viewed
      const existingView = await AlertViewStatus.findOne({
        where: {
          system_alert_id: alertNotification.system_alert_id,
          viewed_by: user_id,
          viewed_by_designation_id: user_designation_id,
          viewed_by_division_id: user_division_id,
        },
        raw: true,
      });

      if (!existingView) {
        await AlertViewStatus.create({
          system_alert_id: alertNotification.system_alert_id,
          viewed_by: user_id,
          viewed_by_designation_id: user_designation_id,
          viewed_by_division_id: user_division_id,
          view_status: true,
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: formattedDetails,
    });
  } catch (error) {
    console.error("Error fetching approval by ID:", error);
    return res.status(500).json({
      message: "Failed to fetch approval",
      error: error.message,
    });
  }
};
